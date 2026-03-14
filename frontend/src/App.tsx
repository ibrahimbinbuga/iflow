import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // --- AUTH STATE (KİMLİK DOĞRULAMA) ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  // --- TEMA VE ARAYÜZ STATE'LERİ ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // --- KORUMALI SAYFALAR (Giriş yapılmışsa ana iskeleti gösterir) ---
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Register />} />
        {/* İzinsiz tüm girişleri Login'e şutla */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // EĞER KULLANICI GİRİŞ YAPMIŞSA STANDART IFLOW ARAYÜZÜ AÇILIR
  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans relative transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenCreateModal={() => setIsModalOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterHighPriority={filterHighPriority}
          setFilterHighPriority={setFilterHighPriority}
          sortByPriority={sortByPriority}
          setSortByPriority={setSortByPriority}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogout={() => {
            // YENİ: Çıkış yaparken hayalet verileri de (aktif takım) temizle!
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('activeWorkspaceId'); // <-- HAYALET AVCISI SATIR
            setIsAuthenticated(false);
            navigate('/login');
          }}
        />

        <div className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<KanbanBoard refreshTrigger={refreshKey} searchQuery={searchQuery} filterHighPriority={filterHighPriority} sortByPriority={sortByPriority} />} />
            <Route path="/profile" element={<Profile />} />
            {/* Yanlış URL girilirse Board'a yönlendir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => setRefreshKey(prev => prev + 1)} />
    </div>
  );
}

export default App;