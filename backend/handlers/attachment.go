package handlers

import (
	"ControlSystem/models"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func (s *Server) UploadAttachment(c *gin.Context) {

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("FormFile error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open file"})
		return
	}
	defer f.Close()

	projectID, _ := strconv.Atoi(c.PostForm("projectId"))
	defectID, _ := strconv.Atoi(c.PostForm("defectId"))

	if defectID == 0 && projectID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "either defectId or projectId must be provided"})
		return
	}

	if projectID == 0 {
		if roleId.(uint) >= 2 {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: only engineers and managers can attach files"})
			return
		}
	}

	if defectID == 0 {
		if roleId.(uint) < 3 {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: only observers and admins can attach files"})
			return
		}
	}

	var projectIDPtr *uint
	if projectID != 0 {
		var project models.Project
		if err := s.db.First(&project, projectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
			return
		}
		tmp := uint(projectID)
		projectIDPtr = &tmp
	}

	var defectIDPtr *uint
	if defectID != 0 {
		var defect models.Defect
		if err := s.db.First(&defect, defectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "defect not found"})
			return
		}
		tmp := uint(defectID)
		defectIDPtr = &tmp
	}

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

	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not identified"})
		return
	}

	attachment := models.Attachment{
		DefectID:   defectIDPtr,
		ProjectID:  projectIDPtr,
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
		"attachment": attachment.ID,
	})
}

func generateUniqueName() string {
	return fmt.Sprintf("file-%d", time.Now().UnixNano())
}
