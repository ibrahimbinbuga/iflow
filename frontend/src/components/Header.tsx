import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Bell, LayoutGrid, List, Filter, ArrowUpDown, Plus, LogOut, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface HeaderProps {
  onOpenCreateModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterHighPriority: boolean;
  setFilterHighPriority: (val: boolean) => void;
  sortByPriority: boolean;
  setSortByPriority: (val: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

interface NotificationType {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  task_id?: number; // YENİ: Bildirimin ait olduğu Task'ın ID'si
}

export default function Header({ 
  onOpenCreateModal, searchQuery, setSearchQuery, filterHighPriority, setFilterHighPriority, sortByPriority, setSortByPriority, isDarkMode, setIsDarkMode, onLogout
}: HeaderProps) {
  
  const location = useLocation();
  const navigate = useNavigate();
  const isBoardPage = location.pathname === '/';

  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      const names = (parsedUser.full_name || 'U').split(' ');
      const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
      
      setUser({ ...parsedUser, initials });
      fetchNotifications(parsedUser.id);
    }
  }, []);

  const fetchNotifications = async (userId: number) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/notifications`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Bildirimler çekilemedi:", error);
    }
  };

  const markAsRead = async (notifId: number) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Bildirim güncellenemedi:", error);
    }
  };

  // YENİ: Bildirime tıklandığında çalışacak fonksiyon
  const handleNotificationClick = (notif: NotificationType) => {
    // 1. Önce okunmadıysa okundu olarak işaretle
    if (!notif.is_read) markAsRead(notif.id);

    // 2. Eğer bildirimin içinde bir Task ID'si varsa, KanbanBoard'a bunu açması için sinyal fırlat
    if (notif.task_id && notif.task_id !== 0) {
      window.dispatchEvent(new CustomEvent('openTaskFromNotification', { detail: notif.task_id }));
      setIsNotifOpen(false); // Dropdown penceresini kapat
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="flex flex-col bg-background shrink-0 transition-colors duration-300 relative z-30">
      <div className="h-16 flex items-center justify-between px-6 border-b border-border-main">
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks, descriptions, or tags..." className="w-full bg-surface border border-border-main rounded-md pl-10 pr-4 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"/>
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0 relative">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-text-muted hover:text-text-main transition-colors p-1">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="relative">
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`p-1 transition-colors rounded-full ${isNotifOpen ? 'bg-surface text-text-main' : 'text-text-muted hover:text-text-main'}`}>
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 border-2 border-background rounded-full animate-pulse"></span>}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                <div className="absolute right-0 top-10 mt-2 w-80 bg-surface border border-border-main rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-main bg-background/50">
                    <h3 className="font-semibold text-text-main text-sm">Notifications</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-text-muted italic">You have no notifications yet.</div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)} 
                            className={`flex gap-3 p-4 border-b border-border-main last:border-0 transition-colors cursor-pointer hover:bg-background/50 ${!notif.is_read ? 'bg-primary/5' : 'opacity-70'}`}
                          >
                            <div className="mt-0.5">
                              {notif.is_read ? <CheckCheck className="w-4 h-4 text-text-muted" /> : <div className="w-2 h-2 mt-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${notif.is_read ? 'text-text-muted' : 'text-text-main font-medium'}`}>{notif.message}</p>
                              <p className="text-xs text-text-muted mt-1.5">
                                {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-border-main mx-2"></div>
          
          <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-text-main">{user?.full_name || 'User'}</p>
              <p className="text-xs text-text-muted">{user?.title || 'Member'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-background">
              {user?.initials || 'U'}
            </div>
          </div>

          <button onClick={onLogout} className="flex items-center justify-center p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all ml-1" title="Log Out"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="h-16 flex items-center justify-between px-6 border-b border-border-main">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-text-main tracking-tight">{isBoardPage ? 'Team Workspace' : 'User Profile'}</h1>
          {isBoardPage && <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/10">Active</span>}
        </div>

        {isBoardPage && (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface rounded-md p-1 border border-border-main shadow-sm">
              <button className="p-1.5 rounded bg-background text-text-main shadow-sm border border-border-main transition-all"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-1.5 rounded text-text-muted hover:text-text-main transition-all"><List className="w-4 h-4" /></button>
            </div>
            <div className="w-px h-6 bg-border-main mx-1"></div>
            <button onClick={() => setFilterHighPriority(!filterHighPriority)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all border ${filterHighPriority ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'text-text-muted hover:text-text-main border-border-main hover:bg-surface'}`}><Filter className="w-4 h-4" /><span>{filterHighPriority ? 'High Priority' : 'Filter'}</span></button>
            <button onClick={() => setSortByPriority(!sortByPriority)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all border ${sortByPriority ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'text-text-muted hover:text-text-main border-border-main hover:bg-surface'}`}><ArrowUpDown className="w-4 h-4" /><span>{sortByPriority ? 'Priority Sort' : 'Sort'}</span></button>
            <button onClick={onOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm ml-2"><Plus className="w-4 h-4" /><span>Create Task</span></button>
          </div>
        )}
      </div>
    </header>
  );
}