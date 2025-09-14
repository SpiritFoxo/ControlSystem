package handlers

import (
	"ControlSystem/models"
	"ControlSystem/utils"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-mail/mail"
	"gorm.io/gorm"
)

func (s *Server) RegisterNewUser(c *gin.Context) {

	type RegisterInput struct {
		FirstName  string `json:"first_name" binding:"required"`
		MiddleName string `json:"middle_name" binding:"required"`
		LastName   string `json:"last_name" binding:"required"`
		OrigEmail  string `json:"email" binding:"required,email"`
		Role       uint   `json:"role" binding:"required"`
	}

	var input RegisterInput

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	roleId := c.GetUint("role")
	if roleId < 4 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	var currentUser models.User
	if err := s.db.First(&currentUser, userID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	corporateEmail := generateCorporateEmail(input.FirstName, input.LastName, s.db)
	if corporateEmail == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate unique corporate email"})
		return
	}

	password, err := generatePassword(12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate password"})
		return
	}

	if input.Role >= roleId {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions to assign this role"})
		return
	}

	newUser := models.User{
		FirstName:  input.FirstName,
		MiddleName: input.MiddleName,
		LastName:   input.LastName,
		Email:      corporateEmail,
		Password:   password,
		Role:       input.Role,
	}

	newUser.HashPassword()

	if err := s.db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	err = s.sendRegistrationEmail(input.OrigEmail, corporateEmail, password)
	if err != nil {
		s.db.Delete(&newUser)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"corporate_email": corporateEmail})

}

func generateCorporateEmail(firstName, lastName string, db *gorm.DB) string {
	firstName = utils.Transliterate(firstName)
	lastName = utils.Transliterate(lastName)
	base := fmt.Sprintf("%s.%s@controlsystem.ru", strings.ToLower(firstName), strings.ToLower(lastName))
	email := base
	suffix := 1
	for {
		var user models.User
		if db.Where("email = ?", email).First(&user).Error != nil {
			return email
		}
		email = fmt.Sprintf("%s.%s%d@controlsystem.ru", strings.ToLower(firstName), strings.ToLower(lastName), suffix)
		suffix++
	}
}

func generatePassword(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes)[:length], nil
}

func (s *Server) sendRegistrationEmail(personalEmail, corporateEmail, password string) error {
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
