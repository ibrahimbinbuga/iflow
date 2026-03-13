import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Board'un yenilenmesini tetikleyecek basit bir sayaç
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = () => {
    // Sayaç artınca KanbanBoard'daki useEffect çalışacak ve verileri yeniden çekecek
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans relative">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreateModal={() => setIsModalOpen(true)} />

        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard refreshTrigger={refreshKey} />
        </div>
      </main>

      {/* Modal Bileşenimiz (Açıkken ekranın üzerine biner) */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleTaskCreated} 
      />
    </div>
  );
}

export default App;