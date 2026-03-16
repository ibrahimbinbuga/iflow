package routes

import (
	"iflow-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Auth rotalarını (Login/Register) ana motora bağlıyoruz.
	// Bu fonksiyon kendi içinde /api/auth grubunu oluşturacak.
	AuthRoutes(r)

	// Diğer standart API rotaları
	api := r.Group("/api")
	{
		// Task Rotaları
		api.POST("/tasks", handlers.CreateTask)
		api.GET("/tasks", handlers.GetTasks)
		api.PUT("/tasks/:id", handlers.UpdateTask)
		api.DELETE("/tasks/:id", handlers.DeleteTask)

		// User Rotaları
		api.POST("/users", handlers.CreateUser)
		api.GET("/users", handlers.GetUsers)
		api.PUT("/users/:id", handlers.UpdateUser) // YENİ EKLENEN SATIR

		// Workspace Rotaları
		api.POST("/workspaces", handlers.CreateWorkspace)
		api.GET("/users/:userId/workspaces", handlers.GetUserWorkspaces)
		api.POST("/workspaces/:id/members", handlers.AddMemberByEmail)
		api.GET("/workspaces/:id/tasks", handlers.GetTasksByWorkspace)

		// Project Rotaları
		api.POST("/projects", handlers.CreateProject)
		api.GET("/projects", handlers.GetProjects)

		// Tag Rotaları
		api.POST("/tags", handlers.CreateTag)
		api.GET("/tags", handlers.GetTags)

		// Comment Rotaları
		api.POST("/comments", handlers.CreateComment)
		api.GET("/tasks/:taskId/comments", handlers.GetCommentsByTask)

		// Bildirim Rotaları
		api.GET("/users/:userId/notifications", handlers.GetUserNotifications)
		api.PUT("/notifications/:id/read", handlers.MarkNotificationRead)
	}
}
