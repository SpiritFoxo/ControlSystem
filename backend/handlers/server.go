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
	adminService      *services.AdminService
	defectService     *services.DefectService

	AdminHandler      *AdminHandler
	ProjectHandler    *ProjectHandler
	AttachmentHandler *AttachmentHandler
	DefectHandler     *DefectHandler
}

func NewServer(db *gorm.DB, minio *storage.MinioClient) *Server {
	projectRepo := repositories.NewProjectRepository(db)
	userRepo := repositories.NewUserRepository(db)
	defectRepo := repositories.NewDefectRepository(db)
	attachRepo := repositories.NewAttachmentRepository(db)
	adminRepo := repositories.NewAdminRepository(db)

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

	adminService := services.NewAdminService(db, userRepo, adminRepo)
	defectService := services.NewDefectService(
		db,
		projectRepo,
		userRepo,
		defectRepo,
		attachRepo,
		minio,
	)

	adminHandler := NewAdminHandler(adminService)
	projectHandler := NewProjectHandler(projectService)
	attachmentHandler := NewAttachmentHandler(attachmentService)
	defectHandler := NewDefectHandler(defectService)

	return &Server{
		db:                db,
		MinIo:             minio,
		AdminHandler:      adminHandler,
		adminService:      adminService,
		projectService:    projectService,
		ProjectHandler:    projectHandler,
		AttachmentHandler: attachmentHandler,
		attachmentService: attachmentService,
		defectService:     defectService,
		DefectHandler:     defectHandler,
	}
}
