package handlers

import (
	"ControlSystem/models"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (s *Server) CreateProject(c *gin.Context) {

	type CreateProjectInput struct {
		Name        string `json:"name" binding:"required,min=3"`
		Description string `json:"description"`
	}

	var input CreateProjectInput

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) != 2 && roleId.(uint) != 4 && roleId.(uint) != 5 {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	project := models.Project{
		Name:        input.Name,
		Description: input.Description,
		Status:      1,
	}

	if err := s.db.Create(&project).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"project_id": project.ID})
}

func (s *Server) EditProjectInfo(c *gin.Context) {

	type EditProjectInfoInput struct {
		Name        string `json:"name" binding:"omitempty"`
		Description string `json:"description" binding:"omitempty"`
		Status      uint   `json:"status" binding:"omitempty"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) < 2 {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	var input EditProjectInfoInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	projectId, err := strconv.Atoi(c.Param("projectId"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid project id"})
		return
	}

	var project models.Project
	if err := s.db.First(&project, projectId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "project not found"})
		} else {
			c.JSON(500, gin.H{"error": "database error"})
		}
		return
	}

	updates := map[string]interface{}{}
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.Status > 0 {
		updates["status"] = input.Status
	}
	if len(updates) == 0 {
		c.JSON(200, gin.H{"message": "no changes"})
		return
	}

	if err := s.db.Model(&project).Updates(updates).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to update project"})
		return
	}

	c.JSON(200, gin.H{"message": "project updated", "project": project})
}

func (s *Server) AssignEngineer(c *gin.Context) {

	type AssignEngineerInput struct {
		EngineerId uint `json:"engineer_id" binding:"required"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) < 2 {
		c.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	var input AssignEngineerInput

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	projectId, err := strconv.Atoi(c.Param("projectId"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid project id"})
		return
	}

	var project models.Project
	if err := s.db.First(&project, projectId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "project not found"})
		} else {
			c.JSON(500, gin.H{"error": "database error"})
		}
		return
	}

	var user models.User
	if err := s.db.First(&user, input.EngineerId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": fmt.Sprintf("engineer with ID %d not found", input.EngineerId)})
		} else {
			c.JSON(500, gin.H{"error": "database error"})
		}
		return
	}
	if user.Role != 1 {
		c.JSON(400, gin.H{"error": fmt.Sprintf("user with ID %d is not an engineer", input.EngineerId)})
		return
	}

	var existingUser models.User
	if err := s.db.Model(&project).Association("Users").Find(&existingUser, input.EngineerId); err == nil && existingUser.ID != 0 {
		c.JSON(400, gin.H{"error": fmt.Sprintf("engineer with ID %d is already assigned to project %d", input.EngineerId, projectId)})
		return
	}

	if err := s.db.Model(&project).Association("Users").Append(&user); err != nil {
		c.JSON(500, gin.H{"error": "failed to assign engineer"})
		return
	}

	c.JSON(200, gin.H{
		"message":     "engineer assigned successfully",
		"project_id":  projectId,
		"engineer_id": input.EngineerId,
	})

}

func (s *Server) GetProjects(c *gin.Context) {
	type ProjectResponse struct {
		ID       uint   `json:"id"`
		Name     string `json:"name"`
		PhotoURL string `json:"photoUrl,omitempty"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.DefaultQuery("search", "")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page number"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit value"})
		return
	}

	offset := (page - 1) * limit
	var projects []ProjectResponse
	var total int64

	likeSearch := "%" + search + "%"

	switch roleId.(uint) {
	case 1:
		query := s.db.Model(&models.Project{}).
			Joins("JOIN user_project ON user_project.project_id = projects.id").
			Where("user_project.user_id = ?", userId.(uint))

		if search != "" {
			query = query.Where("projects.name LIKE ?", likeSearch)
		}

		if err := query.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := query.Select("projects.id, projects.name").
			Offset(offset).Limit(limit).
			Scan(&projects).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	default:
		query := s.db.Model(&models.Project{})
		if search != "" {
			query = query.Where("name LIKE ?", likeSearch)
		}

		if err := query.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := query.Select("id, name").
			Offset(offset).Limit(limit).
			Scan(&projects).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	var attachments []models.Attachment
	projectIDs := make([]uint, len(projects))
	for i, p := range projects {
		projectIDs[i] = p.ID
	}

	if err := s.db.Where("project_id IN ?", projectIDs).Find(&attachments).Error; err == nil {
		attMap := make(map[uint]models.Attachment)
		for _, a := range attachments {
			if a.ProjectID != nil {
				attMap[*a.ProjectID] = a
			}
		}
		for i := range projects {
			if att, ok := attMap[projects[i].ID]; ok {
				if url, err := s.MinIo.GetFileURL(att.FilePath, att.FileName, 24*time.Hour); err == nil {
					projects[i].PhotoURL = url
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"projects": projects,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (s *Server) GetProject(c *gin.Context) {
	projectIdStr := c.Param("projectId")
	if projectIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "projectId is required"})
		return
	}

	projectID, err := strconv.ParseUint(projectIdStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid projectId: " + err.Error()})
		return
	}

	var project models.Project
	if err := s.db.First(&project, uint(projectID)).Error; err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve project"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"project_name":        project.Name,
		"project_description": project.Description,
	})
}
