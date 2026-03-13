import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Mail, Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  // 1. Kullanıcı Verisi State'i (İleride Go backend'den GET /api/users/1 ile çekeceğiz)
  const [userData] = useState({
    name: "İbrahim",
    title: "Software Engineer",
    location: "Fethiye, Turkey",
    company: "iFlow Inc.",
    graduation: "Class of 2026",
    email: "ibrahim@example.com",
    bio: "Passionate Software Engineer focusing on backend architectures and mobile applications. Currently building scalable solutions with Go, React, and exploring the power of Flutter.\n\nWhen I'm not writing code or debugging, you can usually find me hanging out with my cats, Gomez and Fıstık!",
    initials: "IB"
  });

  // 2. Dinamik İstatistik State'i
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalProjects: 1, // Şimdilik tek projemiz var
    teamMembers: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Bileşen yüklendiğinde gerçek veritabanından istatistikleri hesapla
  useEffect(() => {
    const fetchDynamicStats = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tasks');
        const tasks = response.data || [];

        // 1. Tamamlanan ("Done" statüsündeki) görevleri say
        const completed = tasks.filter((t: any) => t.status === 'Done').length;

        // 2. Ekip üyesi sayısını hesapla (Benzersiz id'leri bir Set içinde toplayarak)
        const uniqueUsers = new Set();
        tasks.forEach((t: any) => {
          if (t.assignees) {
            t.assignees.forEach((user: any) => uniqueUsers.add(user.id));
          }
        });

        setStats({
          completedTasks: completed,
          totalProjects: 1,
          teamMembers: uniqueUsers.size > 0 ? uniqueUsers.size : 1
        });
      } catch (error) {
        console.error("İstatistikler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>Profil yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-surface border border-border-main rounded-2xl overflow-hidden shadow-sm transition-colors">
        
        {/* Kapak Fotoğrafı */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900"></div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary border-4 border-surface flex items-center justify-center text-white text-3xl font-bold -mt-12 mb-4 transition-colors">
            {userData.initials}
          </div>
          
          {/* İsim ve Unvan */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-text-main mb-1 transition-colors">{userData.name}</h1>
              <p className="text-text-muted mb-6 transition-colors">{userData.title}</p>
            </div>
            <button className="px-4 py-2 bg-background border border-border-main text-text-main text-sm font-medium rounded-md hover:bg-border-main transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Bilgi Etiketleri */}
          <div className="flex flex-wrap gap-6 text-sm text-text-muted mb-8 transition-colors">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {userData.location}</div>
            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4"/> {userData.company}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {userData.graduation}</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> {userData.email}</div>
          </div>

          {/* Hakkımda Bölümü */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-main mb-3 transition-colors">About Me</h2>
            <p className="text-sm text-text-muted leading-relaxed bg-background p-4 rounded-lg border border-border-main transition-colors whitespace-pre-wrap">
              {userData.bio}
            </p>
          </div>

          {/* Dinamik İstatistikler */}
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
  );
}