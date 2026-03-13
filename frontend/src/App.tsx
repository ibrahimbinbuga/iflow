import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // YENİ: Arama metnini tutan state
  const [searchQuery, setSearchQuery] = useState('');

  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans relative">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Search state'lerini Header'a gönderiyoruz */}
        <Header 
          onOpenCreateModal={() => setIsModalOpen(true)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-hidden p-6">
          {/* Search verisini Board'a gönderiyoruz */}
          <KanbanBoard 
            refreshTrigger={refreshKey} 
            searchQuery={searchQuery} 
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