package routers

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"
	"ControlSystem/models"

	"github.com/gin-gonic/gin"
)

func RegisterAdminRoutes(r *gin.RouterGroup, s *handlers.Server) {
	r.Use(midlleware.JWTMiddleware())
	r.POST("/register", midlleware.RoleMiddleware(), s.RegisterNewUser)
	r.PATCH("/edit-user/:userId", midlleware.RoleMiddleware(), s.EditUserInfo)
	r.GET("/get-users", midlleware.RoleMiddleware(models.RoleManager), s.GetUsers)
}
