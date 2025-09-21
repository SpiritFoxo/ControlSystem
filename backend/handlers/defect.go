package handlers

import (
	"ControlSystem/models"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (s *Server) CreateDefect(c *gin.Context) {
	type CreateDefectInput struct {
		Title       string `json:"title" binding:"required,min=3"`
		Description string `json:"description" binding:"required"`
		ProjectID   uint   `json:"projectId" binding:"required"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) != 1 {
		c.JSON(403, gin.H{"error": "forbidden: only engineers can create defects"})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(401, gin.H{"error": "user not identified"})
		return
	}

	var input CreateDefectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var project models.Project
	if err := s.db.First(&project, input.ProjectID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "project not found"})
		} else {
			c.JSON(500, gin.H{"error": "database error"})
		}
		return
	}

	var user models.User
	if err := s.db.Preload("Projects", "id = ?", input.ProjectID).First(&user, userId.(uint)).Error; err != nil {
		c.JSON(500, gin.H{"error": "database error"})
		return
	}

	if len(user.Projects) == 0 {
		c.JSON(403, gin.H{"error": "user not assigned to this project"})
		return
	}

	defect := models.Defect{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		CreatedBy:   userId.(uint),
		Status:      1,
	}

	if err := s.db.Create(&defect).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to create defect"})
		return
	}

	c.JSON(201, gin.H{
		"message": "defect created successfully",
		"defect":  defect,
	})
}

func (s *Server) GetDefects(c *gin.Context) {
	type GetDefectsInput struct {
		ProjectID uint `json:"projectId" binding:"required"`
	}

	type UserResponse struct {
		ID        uint   `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}

	type DefectResponse struct {
		ID        uint          `json:"id"`
		Title     string        `json:"title"`
		Priority  uint          `json:"priority"`
		CreatedBy uint          `json:"createdBy"`
		Creator   *UserResponse `json:"creator,omitempty"`
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "4")

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

	var input GetDefectsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var defects []models.Defect
	var total int64

	offset := (page - 1) * limit

	if err := s.db.Model(&models.Defect{}).
		Where("project_id = ?", input.ProjectID).
		Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := s.db.Preload("Creator").Preload("Assignee").Model(&models.Defect{}).
		Where("project_id = ?", input.ProjectID).
		Offset(offset).
		Limit(limit).
		Find(&defects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)
	var response []DefectResponse
	for _, d := range defects {
		creator := &UserResponse{
			ID:        d.Creator.ID,
			FirstName: d.Creator.FirstName,
			LastName:  d.Creator.LastName,
			Email:     d.Creator.Email,
		}

		response = append(response, DefectResponse{
			ID:        d.ID,
			Title:     d.Title,
			Priority:  d.Priority,
			CreatedBy: d.CreatedBy,
			Creator:   creator,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"defects": response,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"totalPages":  totalPages,
			"hasNextPage": page < int(totalPages),
			"hasPrevPage": page > 1,
		},
	})
}

func (s *Server) LeaveComment(c *gin.Context) {

	type CommentInput struct {
		Content string `json:"content" binding:"required,max=255"`
	}

	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	roleId, exists := c.Get("role")
	if !exists || (roleId.(uint) != 1 && roleId.(uint) != 2) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: only engineers and managers can leave comments"})
		return
	}

	defectId, exists := c.Params.Get("defectId")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "defectId is required"})
		return
	}

	var input CommentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	defectIDUint, err := strconv.ParseUint(defectId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid defectId: " + err.Error()})
		return
	}

	var user models.User
	if err := s.db.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user"})
		return
	}

	if roleId.(uint) < 2 {
		var count int64
		s.db.Table("defect").Where("id = ? AND assigned_to = ?", defectIDUint, user.ID).Count(&count)
		if count == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have access to comment on this defect"})
			return
		}
	}

	var comment models.Comment
	comment.Content = input.Content
	comment.DefectID = uint(defectIDUint)
	comment.CreatedBy = userId.(uint)

	if err := s.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save comment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Comment added successfully", "comment": comment})

}
