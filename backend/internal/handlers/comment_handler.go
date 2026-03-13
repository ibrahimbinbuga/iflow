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
