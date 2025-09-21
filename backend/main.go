package main

import (
	"ControlSystem/handlers"
	"ControlSystem/models"
	"ControlSystem/routers"
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
	minioClient := storage.NewMinioClient(os.Getenv("MINIO_PORT"), os.Getenv("MINIO_ROOT_USER"), os.Getenv("MINIO_ROOT_PASSWORD"), []string{"images", "files"}, false)
	server := handlers.NewServer(db, minioClient)

	api := r.Group("api/v1")
	auth := api.Group("/auth")
	routers.RegisterAuthRoutes(auth, server)

	projects := api.Group("/projects")
	routers.RegisterProjectsRoutes(projects, server)

	defects := api.Group("/defects")
	routers.RegisterDefectsRoutes(defects, server)

	attachments := api.Group("/attachments")
	routers.RegisterAttachmentsRoutes(attachments, server)

	admin := api.Group("/admin")
	routers.RegisterAdminRoutes(admin, server)

	return r
}

func main() {
	r := SetupRouter()

	r.Run(":8080")
}
