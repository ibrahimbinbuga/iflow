package routes

import (
	"net/http"
	"time"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// İleride bu anahtarı .env dosyasına taşıyacağız, şimdilik burada kalsın
var jwtSecretKey = []byte("iflow_super_secret_key_2026")

func AuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", registerUser)
		authGroup.POST("/login", loginUser)
	}
}

// KAYIT OL (REGISTER)
func registerUser(c *gin.Context) {
	var input struct {
		FullName string `json:"full_name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Title    string `json:"title"`
		Location string `json:"location"`
		Company  string `json:"company"`
		Bio      string `json:"bio"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veya eksik veri"})
		return
	}

	// Şifreyi Bcrypt ile hash'le (Güvenlik)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Şifre oluşturulamadı"})
		return
	}

	user := models.User{
		FullName: input.FullName,
		Email:    input.Email,
		Password: string(hashedPassword),
		Title:    input.Title,
		Location: input.Location,
		Company:  input.Company,
		Bio:      input.Bio,
	}

	// Veritabanına kaydet
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Bu email adresi zaten kullanılıyor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Kayıt başarılı! Lütfen giriş yapın."})
}

// GİRİŞ YAP (LOGIN)
func loginUser(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email ve şifre gerekli"})
		return
	}

	// Kullanıcıyı veritabanında bul
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Geçersiz email veya şifre"})
		return
	}

	// Şifreyi doğrula
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Geçersiz email veya şifre"})
		return
	}

	// JWT Token oluştur
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // 3 gün geçerli
	})

	tokenString, err := token.SignedString(jwtSecretKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token oluşturulamadı"})
		return
	}

	// Başarılı girişte Token ve Kullanıcı bilgilerini dön
	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":        user.ID,
			"full_name": user.FullName,
			"email":     user.Email,
			"title":     user.Title,
			"location":  user.Location,
			"company":   user.Company,
			"bio":       user.Bio,
		},
	})
}
