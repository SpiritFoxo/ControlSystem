package handlers

import (
	"ControlSystem/models"
	"ControlSystem/utils"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"gorm.io/gorm"
)

func (s *Server) LoginCheck(email, password string) (string, string, *models.User, error) {
	var user models.User

	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", "", nil, fmt.Errorf("invalid credentials")
		}
		return "", "", nil, fmt.Errorf("database error: %w", err)
	}

	if err := user.VerifyPassword(password); err != nil {
		return "", "", nil, fmt.Errorf("invalid credentials")
	}
	token, err := utils.GenerateToken(user)
	if err != nil {
		log.Println("failed to generate token: %w", err)
		return "", "", nil, fmt.Errorf("failed to generate token: %w", err)
	}

	refreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		log.Println("failed to generate refresh token: %w", err)
		return "", "", nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return token, refreshToken, &user, nil
}

func (s *Server) Login(c *gin.Context) {

	type LoginInput struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	var loginInput LoginInput

	if err := c.ShouldBind(&loginInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, refreshToken, user, err := s.LoginCheck(loginInput.Email, loginInput.Password)

	refreshTokenLifespanHours, _ := strconv.Atoi(os.Getenv("REFRESH_TOKEN_HOUR_LIFESPAN"))
	maxAge := refreshTokenLifespanHours * 3600

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}

	c.SetCookie("refresh_token", refreshToken, maxAge, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user.ID})
}

func (s *Server) RefreshTokenHandler(c *gin.Context) {
	refreshTokenString, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token not found in cookie"})
		return
	}

	refreshTokenSecret := os.Getenv("REFRESH_TOKEN_SECRET")
	token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(refreshTokenSecret), nil
	})

	if err != nil || !token.Valid {
		c.SetCookie("refresh_token", "", -1, "/", "localhost", false, true)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	userID, err := utils.ExtractUserIDFromToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token payload"})
		return
	}

	var user models.User
	result := s.db.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	newAccessToken, err := utils.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate new access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   newAccessToken,
		"user_id": user.ID,
	})
}
