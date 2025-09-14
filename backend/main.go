package main

import (
	"ControlSystem/handlers"
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

	return r
}

func main() {
	r := SetupRouter()

	r.Run(":8080")
}
