package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func (s *Server) UploadAttachment(c *gin.Context) {

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	if roleId.(uint) != 1 {
		c.JSON(403, gin.H{"error": "forbidden: only engineers can attach files"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer f.Close()

	ext := filepath.Ext(file.Filename)
	var bucketName string

	switch ext {
	case ".png", ".jpg", ".jpeg":
		bucketName = "images"
	case ".pdf", ".docx":
		bucketName = "files"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported file type"})
		return
	}

	fileName := fmt.Sprintf("%s%s", generateUniqueName(), ext)

	_, err = s.MinIo.Client.PutObject(c, bucketName, fileName, f, file.Size, minio.PutObjectOptions{
		ContentType: file.Header.Get("Content-Type"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload file: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "File uploaded successfully",
		"fileName": fileName,
		"bucket":   bucketName,
	})
}

func generateUniqueName() string {
	return fmt.Sprintf("file-%d", time.Now().UnixNano())
}
