import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden font-sans">
      {/* Sol Menü */}
      <Sidebar />

      {/* Sağ Taraftaki Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Üst Bar */}
        <Header />

        {/* Board (Kanban) Alanı */}
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard />
        </div>

      </main>
    </div>
  );
}

export default App;