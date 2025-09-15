package handlers

import (
	"ControlSystem/models"
	"errors"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (s *Server) CreateProject(c *gin.Context) {

	type CreateProjectInput struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}

	var input CreateProjectInput

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	log.Println(roleId.(uint))

	if roleId.(uint) < 2 || roleId.(uint) >= 4 {
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

	c.JSON(201, project.ID)
}

func (s *Server) EditProjectInfo(c *gin.Context) {

	type EditProjectInfoInput struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      uint   `json:"status"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) < 2 || roleId.(uint) >= 4 {
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
