import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Mail, Calendar, Loader2, X, Save } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const [userData, setUserData] = useState({
    id: 0,
    name: "",
    title: "",
    location: "",
    company: "",
    graduation: "",
    email: "",
    bio: "",
    initials: ""
  });

  const [stats, setStats] = useState({ completedTasks: 0, totalProjects: 1, teamMembers: 0 });
  const [loading, setLoading] = useState(true);
  
  // YENİ: Düzenleme Modalı State'leri
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "", title: "", location: "", company: "", bio: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchDynamicStats();
  }, []);

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const names = (user.full_name || 'U').split(' ');
      const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();

      setUserData({
        id: user.id,
        name: user.full_name || "Unknown User",
        title: user.title || "",
        location: user.location || "",
        company: user.company || "",
        graduation: user.graduation || "Class of 2026",
        email: user.email || "",
        bio: user.bio || "",
        initials: initials
      });

      // Formu mevcut verilerle doldur
      setEditForm({
        full_name: user.full_name || "",
        title: user.title || "",
        location: user.location || "",
        company: user.company || "",
        bio: user.bio || ""
      });
    }
  };

  const fetchDynamicStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`);
      const tasks = response.data || [];
      const completed = tasks.filter((t: any) => t.status === 'Done').length;
      const uniqueUsers = new Set();
      tasks.forEach((t: any) => {
        if (t.assignees) t.assignees.forEach((user: any) => uniqueUsers.add(user.id));
      });
      setStats({ completedTasks: completed, totalProjects: 1, teamMembers: uniqueUsers.size > 0 ? uniqueUsers.size : 1 });
    } catch (error) {
      console.error("İstatistikler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Profili Kaydetme Fonksiyonu
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Go API'sine Güncelleme İsteği At
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userData.id}`, editForm);
      
      // 2. LocalStorage'ı Güncelle (Header'ın da güncellenmesi için)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // 3. Ekrani Yenile ve Modalı Kapat
      loadUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" /><span>Profil yükleniyor...</span>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-8 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-surface border border-border-main rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900"></div>
          <div className="px-8 pb-8 relative">
            <div className="w-24 h-24 rounded-full bg-primary border-4 border-surface flex items-center justify-center text-white text-3xl font-bold -mt-12 mb-4 transition-colors">
              {userData.initials}
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-text-main mb-1 transition-colors">{userData.name}</h1>
                <p className="text-text-muted mb-6 transition-colors">{userData.title || "No Title Provided"}</p>
              </div>
              {/* EDIT BUTONU AKTİFLEŞTİRİLDİ */}
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-background border border-border-main text-text-main text-sm font-medium rounded-md hover:bg-border-main transition-colors"
              >
                Edit Profile
              </button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-text-muted mb-8 transition-colors">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {userData.location || "Location not set"}</div>
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4"/> {userData.company || "Personal Workspace"}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {userData.graduation}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> {userData.email}</div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-text-main mb-3 transition-colors">About Me</h2>
              <p className="text-sm text-text-muted leading-relaxed bg-background p-4 rounded-lg border border-border-main transition-colors whitespace-pre-wrap">
                {userData.bio || "This user hasn't written a bio yet."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border-main pt-6 transition-colors">
              <div className="text-center">
                <span className="block text-2xl font-bold text-text-main mb-1">{stats.completedTasks}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">Tasks Completed</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-text-main mb-1">{stats.totalProjects}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">Projects</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-text-main mb-1">{stats.teamMembers}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">Team Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YENİ: Profili Düzenleme Modalı */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
          <div className="bg-surface border border-border-main rounded-xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-main">
              <h2 className="text-lg font-semibold text-text-main">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-main transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col p-6 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                <input required type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Job Title</label>
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Location</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Company</label>
                <input type="text" value={editForm.company} onChange={(e) => setEditForm({...editForm, company: e.target.value})} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all"/>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Bio</label>
                <textarea rows={4} value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all resize-none"/>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background rounded-md transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors shadow-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}