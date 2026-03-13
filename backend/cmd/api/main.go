package main

import (
	"log"
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"
	"iflow-backend/internal/routes" // Rotaları import ettik

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDB()

	err := database.DB.AutoMigrate(
		&models.User{},
		&models.Workspace{},
		&models.Project{},
		&models.Tag{},
		&models.Task{},
		&models.Comment{},
	)
	if err != nil {
		log.Fatal("Tablolar oluşturulamadı: ", err)
	}
	log.Println("✅ Veritabanı tabloları başarıyla oluşturuldu/güncellendi!")

	r := gin.Default()

	// Mevcut Health Check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "iFlow Backend ve Veritabanı ayakta! 🌊",
		})
	})

	// Rotaları sisteme entegre et
	routes.SetupRoutes(r)

	log.Println("Sunucu 8080 portunda başlatılıyor...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Sunucu başlatılamadı: ", err)
	}
}
