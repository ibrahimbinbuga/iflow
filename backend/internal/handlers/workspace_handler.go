package handlers

import (
	"net/http"

	"iflow-backend/internal/database"
	"iflow-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// 1. Yeni Bir Takım / Çalışma Alanı Oluşturma (GÜNCELLENDİ)
func CreateWorkspace(c *gin.Context) {
	var input struct {
		Name    string `json:"name"`
		Type    string `json:"type"` // "personal" veya "team"
		OwnerID uint   `json:"owner_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz veri formatı"})
		return
	}

	workspace := models.Workspace{
		Name:    input.Name,
		Type:    input.Type,
		OwnerID: input.OwnerID,
	}

	if err := database.DB.Create(&workspace).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Workspace oluşturulamadı"})
		return
	}

	// YENİ: Oluşturan kişiyi otomatik olarak bu takımın "Members" (Üyeler) listesine ekle
	var user models.User
	if err := database.DB.First(&user, input.OwnerID).Error; err == nil {
		database.DB.Model(&workspace).Association("Members").Append(&user)
	}

	c.JSON(http.StatusCreated, workspace)
}

// 2. Bir Kullanıcının Üye Olduğu Tüm Takımları Getirme (Eski GetWorkspaces yerine)
func GetUserWorkspaces(c *gin.Context) {
	userID := c.Param("userId")

	var user models.User
	// Kullanıcıyı bulurken, üyesi olduğu Workspaces listesini de Preload ile çekiyoruz
	if err := database.DB.Preload("Workspaces").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kullanıcı bulunamadı"})
		return
	}

	c.JSON(http.StatusOK, user.Workspaces)
}

// 3. Takıma E-posta ile Yeni Üye Ekleme
func AddMemberByEmail(c *gin.Context) {
	workspaceID := c.Param("id")
	var input struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz e-posta formatı"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı"})
		return
	}

	var workspace models.Workspace
	if err := database.DB.First(&workspace, workspaceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Çalışma alanı bulunamadı"})
		return
	}

	// Kullanıcıyı Workspace'in üyelerine ekle (Çoka-Çok ilişki)
	database.DB.Model(&workspace).Association("Members").Append(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Kullanıcı takıma başarıyla eklendi", "user": user})
}

// 4. SADECE Belirli Bir Takıma/Workspace'e Ait Görevleri Getirme
func GetTasksByWorkspace(c *gin.Context) {
	workspaceID := c.Param("id")

	// Önce bu Workspace'e ait tüm projeleri buluyoruz
	var projects []models.Project
	database.DB.Where("workspace_id = ?", workspaceID).Find(&projects)

	// Projelerin ID'lerini bir listeye alıyoruz
	var projectIDs []uint
	for _, p := range projects {
		projectIDs = append(projectIDs, p.ID)
	}

	var tasks []models.Task
	if len(projectIDs) > 0 {
		// Sadece o projelere (dolayısıyla o takıma) ait görevleri ilişkileriyle birlikte çekiyoruz
		database.DB.Preload("Assignees").Preload("Tags").Preload("Comments").
			Where("project_id IN ?", projectIDs).Find(&tasks)
	}

	c.JSON(http.StatusOK, tasks)
}
