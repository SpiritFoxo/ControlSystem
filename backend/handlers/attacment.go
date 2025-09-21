package handlers

import (
	"ControlSystem/models"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func (s *Server) UploadAttachment(c *gin.Context) {
	type UploadAttachmentInput struct {
		DefectID  uint `form:"defectId"`
		ProjectID uint `form:"projectId"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	if roleId.(uint) != 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: only engineers can attach files"})
		return
	}

	var input UploadAttachmentInput
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.DefectID == 0 && input.ProjectID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "either defectId or projectId must be provided"})
		return
	}

	if input.ProjectID != 0 {
		var project models.Project
		if err := s.db.First(&project, input.ProjectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
			return
		}
	}
	if input.DefectID != 0 {
		var defect models.Defect
		if err := s.db.First(&defect, input.DefectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "defect not found"})
			return
		}
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer f.Close()

	ext := strings.ToLower(filepath.Ext(file.Filename))
	var bucketName string
	switch ext {
	case ".png", ".jpg", ".jpeg":
		bucketName = "images"
	case ".pdf", ".docx":
		bucketName = "files"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported file type"})
		return
	}

	fileName := fmt.Sprintf("%s%s", generateUniqueName(), ext)

	_, err = s.MinIo.Client.PutObject(c, bucketName, fileName, f, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to upload file: %v", err)})
		return
	}

	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not identified"})
		return
	}

	attachment := models.Attachment{
		DefectID:   input.DefectID,
		ProjectID:  input.ProjectID,
		FileName:   fileName,
		FilePath:   bucketName,
		FileType:   ext,
		UploadedBy: userId.(uint),
	}
	if err := s.db.Create(&attachment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save attachment to database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "file uploaded successfully",
		"attachment": attachment,
	})
}

func generateUniqueName() string {
	return fmt.Sprintf("file-%d", time.Now().UnixNano())
}
