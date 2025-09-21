package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"

	"github.com/gin-gonic/gin"
)

func RegisterAttachmentsRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/", s.UploadAttachment)
}
