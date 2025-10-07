package handlers

import (
	"ControlSystem/repositories"
	"ControlSystem/services"
	"ControlSystem/storage"

	"gorm.io/gorm"
)

type Server struct {
	db    *gorm.DB
	MinIo *storage.MinioClient

	projectService *services.ProjectService

	ProjectHandler *ProjectHandler
}

func NewServer(db *gorm.DB, minio *storage.MinioClient) *Server {
	projectRepo := repositories.NewProjectRepository(db)
	userRepo := repositories.NewUserRepository(db)
	defectRepo := repositories.NewDefectRepository(db)
	attachRepo := repositories.NewAttachmentRepository(db)

	projectService := services.NewProjectService(
		projectRepo,
		userRepo,
		defectRepo,
		attachRepo,
		minio,
	)

	projectHandler := NewProjectHandler(projectService)

	return &Server{
		db:             db,
		MinIo:          minio,
		projectService: projectService,
		ProjectHandler: projectHandler,
	}
}
