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

// Gelen JSON isteğini karşılayacak özel yapı
type UpdateTaskInput struct {
	ProjectID   uint   `json:"project_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	AssigneeIDs []uint `json:"assignee_ids"` // Sadece kullanıcı ID'lerini alacağız
}

// UpdateTask - Mevcut bir görevi günceller ve kişileri atar
func UpdateTask(c *gin.Context) {
	taskID := c.Param("id") // URL'den gelen ID'yi al (örn: /api/tasks/1)
	var task models.Task

	// 1. Önce görevi veritabanında bul
	if err := database.DB.First(&task, taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Görev bulunamadı"})
		return
	}

	// 2. Gelen JSON verisini input yapımıza bağla
	var input UpdateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	// 3. Temel alanları güncelle
	// GORM Updates metodu, boş olmayan alanları otomatik günceller
	database.DB.Model(&task).Updates(models.Task{
		ProjectID:   input.ProjectID,
		Title:       input.Title,
		Description: input.Description,
		Status:      input.Status,
		Priority:    input.Priority,
	})

	// 4. Many-to-Many İlişkiyi Güncelle (Sihirli Kısım ✨)
	// Eğer array içinde ID'ler gönderildiyse, bu kullanıcıları bul ve göreve ata
	if len(input.AssigneeIDs) > 0 {
		var users []models.User
		database.DB.Find(&users, input.AssigneeIDs)

		// Replace metodu, eski atamaları silip sadece yeni verdiklerimizi ekler (task_assignees tablosunu yönetir)
		database.DB.Model(&task).Association("Assignees").Replace(&users)
	}

	// 5. Görevin en güncel halini, ilişkileriyle birlikte geri dön
	database.DB.Preload("Assignees").Preload("Tags").First(&task, taskID)

	c.JSON(http.StatusOK, task)
}
