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

	projectService    *services.ProjectService
	attachmentService *services.AttachmentService

	ProjectHandler    *ProjectHandler
	AttachmentHandler *AttachmentHandler
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
	attachmentService := services.NewAttachmentService(
		attachRepo,
		projectRepo,
		defectRepo,
		userRepo,
		minio,
	)

	projectHandler := NewProjectHandler(projectService)
	attachmentHandler := NewAttachmentHandler(attachmentService)

	return &Server{
		db:                db,
		MinIo:             minio,
		projectService:    projectService,
		ProjectHandler:    projectHandler,
		AttachmentHandler: attachmentHandler,
		attachmentService: attachmentService,
	}
}
