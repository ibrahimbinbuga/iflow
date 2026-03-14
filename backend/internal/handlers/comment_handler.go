package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// CreateComment - Bir göreve yeni yorum ekler
func CreateComment(c *gin.Context) {
	var comment models.Comment

	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Yorum eklenemedi"})
		return
	}

	// --- YENİ EKLENEN BİLDİRİM (FAN-OUT) MANTIĞI ---
	// 1. Yorumun yapıldığı görevi (Task) buluyoruz
	var task models.Task
	if err := database.DB.First(&task, comment.TaskID).Error; err == nil {

		// 2. O görevin bağlı olduğu projeyi (Project) buluyoruz
		var project models.Project
		if err := database.DB.First(&project, task.ProjectID).Error; err == nil {

			// 3. O projenin bağlı olduğu takımı (Workspace) ve Üyelerini buluyoruz
			var workspace models.Workspace
			if err := database.DB.Preload("Members").First(&workspace, project.WorkspaceID).Error; err == nil {

				// 4. Yorumu yazan kişinin adını alalım (Bildirimde şık dursun diye)
				var author models.User
				authorName := "Someone"
				if err := database.DB.First(&author, comment.UserID).Error; err == nil {
					authorName = author.FullName
				}

				// 5. Takımdaki herkese bildirim oluştur (YORUMU YAZAN HARİÇ!)
				for _, member := range workspace.Members {
					// Eğer üyenin ID'si, yorumu yazan kişinin ID'sine EŞİT DEĞİLSE bildirim at
					if member.ID != comment.UserID {
						notification := models.Notification{
							UserID:  member.ID,
							Message: authorName + " commented on task: " + task.Title,
							TaskID:  task.ID,
						}
						database.DB.Create(&notification)
					}
				}
			}
		}
	}
	// ----------------------------------------------

	c.JSON(http.StatusCreated, comment)
}

// GetCommentsByTask - Belirli bir görevin yorumlarını listeler
func GetCommentsByTask(c *gin.Context) {
	taskID := c.Param("taskId") // URL'den (örn: /api/tasks/1/comments) taskId'yi al
	var comments []models.Comment

	// Sadece bu göreve ait olan yorumları getir
	if err := database.DB.Where("task_id = ?", taskID).Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Yorumlar getirilemedi"})
		return
	}

	c.JSON(http.StatusOK, comments)
}
