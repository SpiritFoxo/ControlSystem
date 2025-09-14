package models

import "gorm.io/gorm"

type Project struct {
	gorm.Model
	Name        string `gorm:"not null; unique"`
	Description string
	Status      uint `gorm:"not null;default:1"` // 1 - active, 2 - completed, 3 - archived
}

type UserProject struct {
	gorm.Model
	UserID    uint `gorm:"not null"`
	ProjectID uint `gorm:"not null"`
}

type Report struct {
	gorm.Model
	ProjectID   uint   `gorm:"not null"`
	GeneratedBy uint   `gorm:"not null"`
	Title       string `gorm:"not null"`
}
