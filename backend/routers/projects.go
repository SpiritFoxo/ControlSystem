package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"

	"github.com/gin-gonic/gin"
)

func RegisterProjectsRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/", s.CreateProject)
	r.PATCH("/:projectId", s.EditProjectInfo)
	r.GET("/", s.GetProjects)
	r.POST("/:projectId/assign", s.AssignEngineer)
	r.GET("/:projectId", s.GetProject)
}
