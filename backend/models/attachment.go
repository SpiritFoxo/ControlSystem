package models

import "gorm.io/gorm"

type Attachment struct {
	gorm.Model
	DefectID   uint `gorm:"not null, index"`
	Defect     Defect
	FileName   string `gorm:"not null"`
	FilePath   string `gorm:"not null"`
	FileType   string `gorm:"not null"`
	UploadedBy uint   `gorm:"not null"`
	Uploader   User   `gorm:"foreignKey:UploadedBy"`
}
