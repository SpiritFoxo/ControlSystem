package main

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"
	"ControlSystem/models"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DbInit() *gorm.DB {
	db, err := models.Setup()
	if err != nil {
		log.Println("Connection error")
	}
	return db
}

func SetupRouter() *gin.Engine {
	r := gin.Default()
	db := DbInit()
	server := handlers.NewServer(db)

	auth := r.Group("api/auth")
	auth.POST("/login", server.Login)
	auth.POST("/refresh", server.RefreshTokenHandler)

	projects := r.Group("api/projects")
	projects.Use(midlleware.JWTMiddleware())
	projects.POST("/", server.CreateProject)
	projects.PATCH("/:projectId", server.EditProjectInfo)

	admnin := r.Group("api/admin")
	admnin.Use(midlleware.JWTMiddleware())
	admnin.POST("/register", server.RegisterNewUser)

	return r
}

func main() {
	r := SetupRouter()

	r.Run(":8080")
}
