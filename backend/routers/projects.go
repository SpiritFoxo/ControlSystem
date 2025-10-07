package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"
	"ControlSystem/models"

	"github.com/gin-gonic/gin"
)

func RegisterProjectsRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/", midlleware.RoleMiddleware(models.RoleManager), s.CreateProject)
	r.PATCH("/:projectId", midlleware.RoleMiddleware(models.RoleManager), s.EditProjectInfo)
	r.GET("/", s.GetProjects)
	r.POST("/:projectId/assign", midlleware.RoleMiddleware(models.RoleManager), s.AssignEngineer)
	r.GET("/:projectId", s.GetProject)
	r.GET("/:projectId/export", midlleware.RoleMiddleware(models.RoleManager, models.RoleObserver), s.ExportDefectsCSV)
}
