package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"
	"ControlSystem/models"

	"github.com/gin-gonic/gin"
)

func RegisterAttachmentsRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/", midlleware.RoleMiddleware(models.RoleEngineer, models.RoleManager), s.UploadAttachment)
}
