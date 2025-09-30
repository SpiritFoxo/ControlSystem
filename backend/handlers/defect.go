package handlers

import (
	"ControlSystem/models"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (s *Server) CreateDefect(c *gin.Context) {
	type CreateDefectInput struct {
		Title       string `json:"title" binding:"required,min=3"`
		Description string `json:"description" binding:"required"`
		ProjectID   uint   `json:"project_id" binding:"required"`
	}

	roleId := c.GetUint("role")

	if roleId != 1 {
		c.JSON(403, gin.H{"error": "forbidden: only engineers can create defects"})
		return
	}

	userId, exists := c.Get("user_id")
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
		AssignedTo:  userId.(uint),
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
		ProjectID uint `form:"projectId" binding:"required"`
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
		Status    uint          `json:"status"`
		CreatedBy uint          `json:"createdBy"`
		Creator   *UserResponse `json:"creator,omitempty"`
		PhotoUrl  string        `json:"photoUrl,omitempty"`
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
	if err := c.ShouldBindQuery(&input); err != nil {
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

	if err := s.db.Preload("Creator").Model(&models.Defect{}).
		Where("project_id = ?", input.ProjectID).
		Offset(offset).
		Limit(limit).
		Find(&defects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	defectIDs := make([]uint, 0, len(defects))
	for _, d := range defects {
		defectIDs = append(defectIDs, d.ID)
	}

	var attachments []models.Attachment
	if len(defectIDs) > 0 {
		if err := s.db.Where("defect_id IN ?", defectIDs).Find(&attachments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	attachmentsMap := make(map[uint][]models.Attachment)
	for _, a := range attachments {
		if a.DefectID != nil {
			attachmentsMap[*a.DefectID] = append(attachmentsMap[*a.DefectID], a)
		}
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

		defResp := DefectResponse{
			ID:        d.ID,
			Title:     d.Title,
			Priority:  d.Priority,
			Status:    d.Status,
			CreatedBy: d.CreatedBy,
			Creator:   creator,
		}

		if atts, ok := attachmentsMap[d.ID]; ok && len(atts) > 0 {
			url, err := s.MinIo.GetFileURL(atts[0].FilePath, atts[0].FileName, 24*time.Hour)
			if err == nil {
				defResp.PhotoUrl = url
			}
		}

		response = append(response, defResp)
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

func (s *Server) GetdefectById(c *gin.Context) {
	type UserResponse struct {
		ID        uint   `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
	}

	type DefectResponse struct {
		ID          uint          `json:"id"`
		ProjectID   uint          `json:"projectId"`
		Title       string        `json:"title"`
		Description string        `json:"description"`
		Priority    uint          `json:"priority"`
		Status      uint          `json:"status"`
		AssignedTo  uint          `json:"assignedTo"`
		Assignee    *UserResponse `json:"assignee,omitempty"`
		CreatedBy   uint          `json:"createdBy"`
		Creator     *UserResponse `json:"creator,omitempty"`
		Deadline    *time.Time    `json:"deadline"`
		PhotoUrl    string        `json:"photoUrl,omitempty"`
	}

	defectId, exists := c.Params.Get("defectId")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "defectId is required"})
		return
	}

	defectIDUint, err := strconv.ParseUint(defectId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid defectId: " + err.Error()})
		return
	}

	var defect models.Defect
	if err := s.db.Preload("Creator").Preload("Assignee").First(&defect, defectIDUint).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Defect not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve defect"})
		}
		return
	}

	var response []DefectResponse
	var creator = &UserResponse{
		FirstName: defect.Creator.FirstName,
		LastName:  defect.Creator.LastName,
		Email:     defect.Creator.Email,
	}
	var assignee = &UserResponse{
		FirstName: defect.Assignee.FirstName,
		LastName:  defect.Assignee.LastName,
		Email:     defect.Assignee.Email,
	}
	var urlString string
	var attachment models.Attachment
	if err := s.db.Where("defect_id = ?", defectIDUint).First(&attachment).Error; err == nil {
		if url, err := s.MinIo.GetFileURL(attachment.FilePath, attachment.FileName, 24*time.Hour); err == nil {
			urlString = url
		}
	}

	response = append(response, DefectResponse{
		ID:          defect.ID,
		ProjectID:   defect.ProjectID,
		Title:       defect.Title,
		Description: defect.Description,
		Priority:    defect.Priority,
		Status:      defect.Status,
		AssignedTo:  defect.AssignedTo,
		CreatedBy:   defect.CreatedBy,
		Assignee:    assignee,
		Creator:     creator,
		Deadline:    defect.Deadline,
		PhotoUrl:    urlString,
	})

	c.JSON(http.StatusOK, gin.H{"defect": response})
}

func (s *Server) UpdateDefect(c *gin.Context) {

	type UpdateDefectInput struct {
		Title       string `json:"title" binding:"omitempty,min=3"`
		Description string `json:"description" binding:"omitempty"`
		Priority    uint   `json:"priority" binding:"omitempty,oneof=1 2 3"`
		Status      uint   `json:"status" binding:"omitempty,oneof=1 2 3 4"`
	}

	defectId, exists := c.Params.Get("defectId")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "defectId is required"})
		return
	}
	defectIDUint, err := strconv.ParseUint(defectId, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid defectId: " + err.Error()})
		return
	}

	var input UpdateDefectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	var defect models.Defect
	if err := s.db.First(&defect, defectIDUint).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Defect not found"})
			return
		}
	}

	updates := make(map[string]interface{})
	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.Priority != 0 {
		updates["priority"] = input.Priority
	}
	if input.Status != 0 {
		updates["status"] = input.Status
	}

	if len(updates) > 0 {
		if err := s.db.Model(&defect).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, defect.ID)

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
