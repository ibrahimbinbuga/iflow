package models

import (
	"time"
)

// User (Kullanıcı) Modeli
type User struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	FullName  string `json:"full_name"`
	Email     string `json:"email" gorm:"unique;not null"`
	AvatarURL string `json:"avatar_url"`

	// YENİ: Auth ve Profil Bilgileri
	Password   string `json:"-"` // JSON yanıtlarında şifreyi gizler (Güvenlik için çok kritik!)
	Title      string `json:"title"`
	Location   string `json:"location"`
	Company    string `json:"company"`
	Bio        string `json:"bio"`
	Graduation string `json:"graduation"`

	Workspaces []Workspace `json:"workspaces" gorm:"many2many:workspace_members;"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Workspace (Çalışma Alanı - Örn: Company, Personal)
type Workspace struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Type      string    `json:"type"`
	OwnerID   uint      `json:"owner_id"`
	Members   []User    `json:"members" gorm:"many2many:workspace_members;"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Project (Proje - Örn: Website Redesign)
type Project struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	WorkspaceID uint      `json:"workspace_id"`
	Name        string    `json:"name" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Tag (Etiket - Örn: design, backend, ui/ux)
type Tag struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name" gorm:"not null"`
	Color string `json:"color"` // Frontend'de rengi göstermek için (opsiyonel)
}

// Task (Görev - Board'daki kartlar)
type Task struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ProjectID   uint      `json:"project_id"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Status      string    `json:"status"`   // To Do, In Progress, Review, Done
	Priority    string    `json:"priority"` // Low, Medium, High, Urgent
	DueDate     time.Time `json:"due_date"`

	// İlişkiler (GORM bu tabloları otomatik bağlayacak)
	Assignees []User    `json:"assignees" gorm:"many2many:task_assignees;"`
	Tags      []Tag     `json:"tags" gorm:"many2many:task_tags;"`
	Comments  []Comment `json:"comments"` // Bir görevin birden fazla yorumu olabilir

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Comment (Görev Detayındaki Yorumlar)
type Comment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	TaskID    uint      `json:"task_id"`
	UserID    uint      `json:"user_id"`
	Content   string    `json:"content" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

// Bildirimler (Notifications) Modeli
type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"` // Bildirimin gideceği kişi
	Message   string    `json:"message"`
	TaskID    uint      `json:"task_id"`
	IsRead    bool      `json:"is_read" gorm:"default:false"` // Okundu mu?
	CreatedAt time.Time `json:"created_at"`
}
