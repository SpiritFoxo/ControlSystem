package models

import "gorm.io/gorm"

type Defect struct {
	gorm.Model
	ProjectID   uint   `gorm:"not null"`
	Title       string `gorm:"not null"`
	Description string
	Priority    uint `gorm:"not null"`
	Status      uint `gorm:"not null"`
	AssignedTo  uint `gorm:"not null"`
	CreatedBy   uint `gorm:"not null"`
}

type Comment struct {
	gorm.Model
	DefectID  uint   `gorm:"not null"`
	Content   string `gorm:"not null"`
	CreatedBy uint   `gorm:"not null"`
}
