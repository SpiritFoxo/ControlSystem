package handlers

import (
	"ControlSystem/models"
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (s *Server) CreateDefect(c *gin.Context) {
	type CreateDefectInput struct {
		Title       string `json:"title" binding:"required"`
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
	if err := c.ShouldBind(&input); err != nil {
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
