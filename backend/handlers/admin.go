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
		FirstName  string `json:"first_name" binding:"required,min=1"`
		MiddleName string `json:"middle_name" binding:"required,min=1"`
		LastName   string `json:"last_name" binding:"required,min=1"`
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

func (s *Server) EditUserInfo(c *gin.Context) {
	type EdituserInfoInput struct {
		FirstName  string `json:"first_name" binding:"omitempty,min=1"`
		MiddleName string `json:"middle_name" binding:"omitempty,min=1"`
		LastName   string `json:"last_name" binding:"omitempty,min=1"`
		Role       uint   `json:"role" binding:"omitempty"`
		IsEnabled  bool   `json:"is_enabled" binding:"omitempty"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if roleId.(uint) < 4 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	userId, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var input EdituserInfoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	if input.Role >= roleId.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions to assign this role"})
		return
	}

	var user models.User
	if err := s.db.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Role >= roleId.(uint) || user.ID != uint(userId) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions to edit this user"})
		return
	}

	updates := make(map[string]interface{})
	if input.FirstName != "" {
		updates["first_name"] = input.FirstName
	}
	if input.MiddleName != "" {
		updates["middle_name"] = input.MiddleName
	}
	if input.LastName != "" {
		updates["last_name"] = input.LastName
	}
	if input.Role != 0 {
		updates["role"] = input.Role
	}
	updates["is_enabled"] = input.IsEnabled

	if len(updates) > 0 {
		if err := s.db.Model(&user).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, user)

}

func (s *Server) GetUsers(c *gin.Context) {
	type UserResponse struct {
		ID         uint   `json:"id"`
		FirstName  string `json:"first_name"`
		MiddleName string `json:"middle_name"`
		LastName   string `json:"last_name"`
		Email      string `json:"email"`
		Role       uint   `json:"role"`
		IsEnabled  bool   `json:"is_enabled"`
	}

	roleId, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if roleId.(uint) < 4 && roleId.(uint) != 2 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid page number"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit value"})
		return
	}

	offset := (page - 1) * limit

	emailFilter := c.Query("email")
	roleFilter := c.Query("role")
	statusFilter := c.Query("is_enabled")

	query := s.db.Model(&models.User{}).Where("id <> ?", userId.(uint))

	if emailFilter != "" {
		query = query.Where("LOWER(email) LIKE ?", "%"+strings.ToLower(emailFilter)+"%")
	}

	if roleFilter != "" {
		if roleValue, err := strconv.Atoi(roleFilter); err == nil {
			query = query.Where("role = ?", roleValue)
		}
	}

	if statusFilter != "" {
		if status, err := strconv.ParseBool(statusFilter); err == nil {
			query = query.Where("is_enabled = ?", status)
		}
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count users"})
		return
	}

	var users []models.User
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch users"})
		return
	}

	response := make([]UserResponse, 0, len(users))
	for _, u := range users {
		response = append(response, UserResponse{
			ID:         u.ID,
			FirstName:  u.FirstName,
			MiddleName: u.MiddleName,
			LastName:   u.LastName,
			Email:      u.Email,
			Role:       u.Role,
			IsEnabled:  u.IsEnabled,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"users": response,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
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
