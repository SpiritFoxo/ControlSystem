package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"

	"github.com/gin-gonic/gin"
)

func RegisterDefectsRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/", s.CreateDefect)
	r.POST("/:defectId/comments", s.LeaveComment)
	r.GET("/:defectId/comments", s.GetComments)
	r.GET("/", s.GetDefects)
	r.GET("/:defectId", s.GetDefectById)
	r.PATCH("/:defectId", s.UpdateDefect)
}
