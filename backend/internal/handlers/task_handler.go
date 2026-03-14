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

	// --- YENİ EKLENEN BİLDİRİM (FAN-OUT) MANTIĞI ---
	// 1. Görevin hangi projeye ait olduğunu buluyoruz
	var project models.Project
	if err := database.DB.First(&project, task.ProjectID).Error; err == nil {

		// 2. O projenin hangi takıma (Workspace) ait olduğunu ve o takımın üyelerini buluyoruz
		var workspace models.Workspace
		if err := database.DB.Preload("Members").First(&workspace, project.WorkspaceID).Error; err == nil {

			// 3. Takımdaki her bir üyeye bildirim oluşturuyoruz
			for _, member := range workspace.Members {
				notification := models.Notification{
					UserID:  member.ID,
					Message: "A new task was added to " + workspace.Name + ": " + task.Title,
				}
				database.DB.Create(&notification)
			}
		}
	}
	// ----------------------------------------------

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

// Gelen JSON isteğini karşılayacak özel yapı (DTO)
type UpdateTaskInput struct {
	ProjectID   uint   `json:"project_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	AssigneeIDs []uint `json:"assignee_ids"` // Kullanıcı ID'leri
	TagIDs      []uint `json:"tag_ids"`      // Etiket ID'leri
}

// UpdateTask - Mevcut bir görevi günceller, kişileri ve etiketleri atar
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

	// 3. Temel alanları güncelle (Boş olmayanları günceller)
	database.DB.Model(&task).Updates(models.Task{
		ProjectID:   input.ProjectID,
		Title:       input.Title,
		Description: input.Description,
		Status:      input.Status,
		Priority:    input.Priority,
	})

	// 4. Many-to-Many İlişkiyi Güncelle: Assignees (Kişiler)
	if len(input.AssigneeIDs) > 0 {
		var users []models.User
		database.DB.Find(&users, input.AssigneeIDs)

		// Replace metodu, eski atamaları silip sadece yeni verdiklerimizi ekler
		database.DB.Model(&task).Association("Assignees").Replace(&users)
	}

	// 5. Many-to-Many İlişkiyi Güncelle: Tags (Etiketler)
	if len(input.TagIDs) > 0 {
		var tags []models.Tag
		database.DB.Find(&tags, input.TagIDs)

		// Etiketleri göreve bağla
		database.DB.Model(&task).Association("Tags").Replace(&tags)
	}

	// 6. Görevin en güncel halini, ilişkileriyle birlikte geri dön
	database.DB.Preload("Assignees").Preload("Tags").First(&task, taskID)

	c.JSON(http.StatusOK, task)
}
