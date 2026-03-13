import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';
import Profile from './pages/Profile';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

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
        />

        <div className="flex-1 overflow-auto p-6">
          {/* YENİ: React Router ile Sayfalar Arası Geçiş */}
          <Routes>
            <Route path="/" element={
              <KanbanBoard 
                refreshTrigger={refreshKey} 
                searchQuery={searchQuery} 
                filterHighPriority={filterHighPriority}
                sortByPriority={sortByPriority}
              />
            } />
            
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleTaskCreated} 
      />
    </div>
  );
}

export default App;