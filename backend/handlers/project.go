package handlers

import (
	"ControlSystem/models"
	"log"

	"github.com/gin-gonic/gin"
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
