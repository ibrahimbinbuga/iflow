package routes

import (
	"iflow-backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Task Rotaları
		api.POST("/tasks", handlers.CreateTask)
		api.GET("/tasks", handlers.GetTasks)
		api.PUT("/tasks/:id", handlers.UpdateTask)

		// User Rotaları
		api.POST("/users", handlers.CreateUser)
		api.GET("/users", handlers.GetUsers)

		// Workspace Rotaları
		api.POST("/workspaces", handlers.CreateWorkspace)
		api.GET("/workspaces", handlers.GetWorkspaces)

		// Project Rotaları (YENİ)
		api.POST("/projects", handlers.CreateProject)
		api.GET("/projects", handlers.GetProjects)
	}
}
