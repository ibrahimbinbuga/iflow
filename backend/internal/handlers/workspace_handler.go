package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateWorkspace(c *gin.Context) {
	var workspace models.Workspace

	if err := c.ShouldBindJSON(&workspace); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	if err := database.DB.Create(&workspace).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Çalışma alanı oluşturulamadı"})
		return
	}

	c.JSON(http.StatusCreated, workspace)
}

func GetWorkspaces(c *gin.Context) {
	var workspaces []models.Workspace
	if err := database.DB.Find(&workspaces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Çalışma alanları getirilemedi"})
		return
	}
	c.JSON(http.StatusOK, workspaces)
}
