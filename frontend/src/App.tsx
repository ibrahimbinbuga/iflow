import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';

function App() {
  // YENİ: Tema state'i (Varsayılan olarak karanlık başlatıyoruz)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);

  // Tema değiştiğinde HTML etiketine 'dark' class'ını ekle/çıkar
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
          // Tema verisini Header'a gönderiyoruz
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard 
            refreshTrigger={refreshKey} 
            searchQuery={searchQuery} 
            filterHighPriority={filterHighPriority}
            sortByPriority={sortByPriority}
          />
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