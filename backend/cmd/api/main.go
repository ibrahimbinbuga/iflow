package main

import (
	"log"
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"
	"iflow-backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Veritabanına bağlan
	database.ConnectDB()

	// YENİ: &models.Notification{} buraya eklendi!
	err := database.DB.AutoMigrate(
		&models.User{},
		&models.Workspace{},
		&models.Project{},
		&models.Tag{},
		&models.Task{},
		&models.Comment{},
		&models.Notification{}, // <-- İşte bildirimleri kurtaracak kahramanımız!
	)
	if err != nil {
		log.Fatal("Tablolar oluşturulamadı: ", err)
	}
	log.Println("✅ Veritabanı tabloları başarıyla oluşturuldu/güncellendi!")

	r := gin.Default()

	// CORS Middleware (Tarayıcı engellemesini kaldırır)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "iFlow Backend ve Veritabanı ayakta! 🌊",
		})
	})

	// Rotaları ayarla
	routes.SetupRoutes(r)

	log.Println("Sunucu 8080 portunda başlatılıyor...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Sunucu başlatılamadı: ", err)
	}
}
