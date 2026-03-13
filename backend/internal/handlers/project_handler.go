package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func CreateProject(c *gin.Context) {
	var project models.Project

	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	if err := database.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Proje oluşturulamadı"})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func GetProjects(c *gin.Context) {
	var projects []models.Project

	// Preload kullanmasak da olur ama ileride projeye ait görevleri getirmek istersen
	// burayı database.DB.Preload("Tasks").Find(&projects) şeklinde güncelleyebiliriz.
	if err := database.DB.Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Projeler getirilemedi"})
		return
	}

	c.JSON(http.StatusOK, projects)
}
