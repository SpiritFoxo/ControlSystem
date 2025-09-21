package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"

	"github.com/gin-gonic/gin"
)

func RegisterAdminRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/register", s.RegisterNewUser)
	r.PATCH("/edit-user/:userId", s.EditUserInfo)
	r.GET("/get-users", s.GetUsers)
}
