package models

import "gorm.io/gorm"

type Attachment struct {
	gorm.Model
	DefectID   uint   `gorm:"not null"`
	FileName   string `gorm:"not null"`
	FilePath   string `gorm:"not null"`
	FileType   string `gorm:"not null"`
	UploadedBy uint   `gorm:"not null"`
}
