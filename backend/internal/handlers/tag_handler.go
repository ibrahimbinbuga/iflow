package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateTag(c *gin.Context) {
	var tag models.Tag

	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	if err := database.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Etiket oluşturulamadı"})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

func GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := database.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Etiketler getirilemedi"})
		return
	}
	c.JSON(http.StatusOK, tags)
}
