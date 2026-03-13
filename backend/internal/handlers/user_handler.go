package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kullanıcı oluşturulamadı. E-posta adresi zaten kullanılıyor olabilir."})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kullanıcılar getirilemedi"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// YENİ EKLENEN KISIM: Profil Güncelleme (Edit Profile) İşlemi
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	// 1. Veritabanında bu kullanıcıyı bul
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kullanıcı bulunamadı"})
		return
	}

	// 2. React'ten gelecek olan (güncellenmiş) verileri karşılayacak yapı
	var input struct {
		FullName string `json:"full_name"`
		Title    string `json:"title"`
		Location string `json:"location"`
		Company  string `json:"company"`
		Bio      string `json:"bio"`
	}

	// 3. Gelen JSON verisini input değişkenine aktar
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	// 4. Kullanıcının bilgilerini veritabanında güncelle
	database.DB.Model(&user).Updates(models.User{
		FullName: input.FullName,
		Title:    input.Title,
		Location: input.Location,
		Company:  input.Company,
		Bio:      input.Bio,
	})

	// 5. Güncellenmiş kullanıcıyı React'e geri gönder
	c.JSON(http.StatusOK, user)
}
