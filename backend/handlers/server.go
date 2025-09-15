package handlers

import (
	"ControlSystem/storage"

	"gorm.io/gorm"
)

type Server struct {
	db     *gorm.DB
	MiniIo *storage.MinioClient
}

func NewServer(db *gorm.DB, minio *storage.MinioClient) *Server {
	return &Server{db: db, MiniIo: minio}
}
