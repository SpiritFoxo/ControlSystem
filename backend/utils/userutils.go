package utils

import (
	"ControlSystem/models"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"

	"gorm.io/gorm"

	"github.com/go-mail/mail"
)

func GenerateCorporateEmail(firstName, lastName string, db *gorm.DB) (string, error) {
	firstName = Transliterate(firstName)
	lastName = Transliterate(lastName)
	base := fmt.Sprintf("%s.%s@controlsystem.ru", strings.ToLower(firstName), strings.ToLower(lastName))
	email := base
	suffix := 1
	for {
		var user models.User
		if db.Where("email = ?", email).First(&user).Error != nil {
			return email, nil
		}
		email = fmt.Sprintf("%s.%s%d@controlsystem.ru", strings.ToLower(firstName), strings.ToLower(lastName), suffix)
		suffix++
	}
}

func GeneratePassword(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate password: %v", err)
	}
	return base64.URLEncoding.EncodeToString(bytes)[:length], nil
}

func SendRegistrationEmail(personalEmail, corporateEmail, password string) error {
	m := mail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_USER"))
	m.SetHeader("To", personalEmail)
	m.SetHeader("Subject", "Ваши учетные данные")
	m.SetBody("text/plain", fmt.Sprintf("Ваш email: %s\nПароль: %s", corporateEmail, password))

	port, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		return fmt.Errorf("invalid SMTP_PORT: %v", err)
	}
	d := mail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("SMTP_USER"), os.Getenv("SMTP_PASS"))
	return d.DialAndSend(m)
}
