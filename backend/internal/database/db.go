package database

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// 1. Önce sistemde (Render.com üzerinde) bir DATABASE_URL var mı diye bak
	dsn := os.Getenv("DATABASE_URL")

	// 2. Eğer yoksa (yani sen kendi bilgisayarında çalıştırıyorsan), eski lokal adresini kullan
	if dsn == "" {
		// DİKKAT: Buradaki şifre ve dbname kısımlarını kendi eski lokal bilgilerine göre düzelt
		dsn = "host=localhost user=postgres password=postgres dbname=iflow port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Veritabanına bağlanılamadı: ", err)
	}

	log.Println("🚀 Veritabanı bağlantısı başarıyla kuruldu!")
}
