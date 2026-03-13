import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // YENİ: Filtre ve Sıralama durumlarını tutan state'ler
  const [filterHighPriority, setFilterHighPriority] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);

  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans relative">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenCreateModal={() => setIsModalOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          // YENİ: State'leri Header'a gönderiyoruz (Butonları değiştirebilmek için)
          filterHighPriority={filterHighPriority}
          setFilterHighPriority={setFilterHighPriority}
          sortByPriority={sortByPriority}
          setSortByPriority={setSortByPriority}
        />

        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard 
            refreshTrigger={refreshKey} 
            searchQuery={searchQuery} 
            // YENİ: Verileri işleyebilmek için Board'a gönderiyoruz
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