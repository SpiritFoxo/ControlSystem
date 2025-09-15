package main

import (
	"ControlSystem/handlers"
	"ControlSystem/midlleware"
	"ControlSystem/models"
	"ControlSystem/storage"
	"log"
	"os"

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
	minioClient := storage.NewMinioClient(os.Getenv("MINIO_PORT"), os.Getenv("MINIO_ROOT_USER"), os.Getenv("MINIO_ROOT_PASSWORD"), []string{"defect-images", "defect-files"}, false)
	server := handlers.NewServer(db, minioClient)

	auth := r.Group("api/auth")
	auth.POST("/login", server.Login)
	auth.POST("/refresh", server.RefreshTokenHandler)

	projects := r.Group("api/projects")
	projects.Use(midlleware.JWTMiddleware())
	projects.POST("/", server.CreateProject)
	projects.PATCH("/:projectId", server.EditProjectInfo)

	defects := r.Group("api/defects")
	defects.Use(midlleware.JWTMiddleware())
	defects.POST("/", server.CreateDefect)

	attachments := r.Group("api/attachments")
	attachments.Use(midlleware.JWTMiddleware())
	attachments.POST("/", server.UploadAttachment)

	admin := r.Group("api/admin")
	admin.Use(midlleware.JWTMiddleware())
	admin.POST("/register", server.RegisterNewUser)

	return r
}

func main() {
	r := SetupRouter()

	r.Run(":8080")
}
