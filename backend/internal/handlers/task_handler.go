package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateTask - Yeni bir görev oluşturur
func CreateTask(c *gin.Context) {
	var task models.Task

	// Gelen JSON verisini Task struct'ına bağla (bind)
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı: " + err.Error()})
		return
	}

	// Veritabanına kaydet
	if err := database.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Görev oluşturulamadı"})
		return
	}

	// Başarılıysa oluşturulan görevi geri dön
	c.JSON(http.StatusCreated, task)
}

// GetTasks - Tüm görevleri listeler
func GetTasks(c *gin.Context) {
	var tasks []models.Task

	// Preload ile göreve bağlı Etiketleri (Tags) ve Atanan Kişileri (Assignees) de getiriyoruz
	if err := database.DB.Preload("Tags").Preload("Assignees").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Görevler getirilemedi"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}
