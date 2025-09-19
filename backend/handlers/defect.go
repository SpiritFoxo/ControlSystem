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

	var userProject models.UserProject
	if err := s.db.Where("user_id = ? AND project_id = ?", userId.(uint), input.ProjectID).First(&userProject).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(403, gin.H{"error": "user not assigned to this project"})
		} else {
			c.JSON(500, gin.H{"error": "database error"})
		}
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

func (s *Server) LeaveComment(c *gin.Context) {

	type CommentInput struct {
		Content string `json:"content" binding:"required,max=255"`
	}

	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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
