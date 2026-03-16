import { X, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface TeamMembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  members: any[];
  workspaceId: number | null; // YENİ EKLENDİ
}

export default function TeamMembersPanel({ isOpen, onClose, members, workspaceId }: TeamMembersPanelProps) {
  if (!isOpen) return null;

  // YENİ: Takımı Silme Fonksiyonu
  const handleDeleteTeam = async () => {
    if (!workspaceId) return;
    
    // Kullanıcıya ciddi bir uyarı ver
    const confirmDelete = window.confirm(
      "Are you ABSOLUTELY sure you want to delete this team?\n\n" +
      "All projects, tasks, comments, and activities inside this team will be permanently deleted. This action CANNOT be undone!"
    );
    
    if (!confirmDelete) return;

    try {
      // Backend'i vur ve her şeyi temizle
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}`);
      
      // Tarayıcı hafızasından silinen takımın ID'sini kazı
      localStorage.removeItem('activeWorkspaceId');
      
      // Paneli kapat
      onClose();
      
      // Sidebar ve KanbanBoard'a "Takım Silindi, Ekranı Temizle!" sinyali gönder
      window.dispatchEvent(new Event('workspaceChanged'));
      
    } catch (error) {
      console.error("Takım silinemedi:", error);
      alert("Failed to delete the team. Please check the console.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose}/>
      
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-surface border-l border-border-main shadow-2xl z-50 flex flex-col animate-slide-in-right transition-colors duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main transition-colors shrink-0">
          <h2 className="text-lg font-semibold text-text-main transition-colors">Team Members ({members.length})</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-md transition-all" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* BODY - Üye Listesi */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar transition-colors">
          <div className="space-y-3">
            {members.map(member => {
              const names = (member.full_name || 'User').split(' ');
              const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
              
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-main bg-background/50 hover:bg-background transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-surface shadow-sm">
                    {initials}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium text-text-main truncate">{member.full_name}</p>
                    <p className="text-xs text-text-muted truncate">{member.email}</p>
                  </div>
                </div>
              );
            })}
            
            {members.length === 0 && (
              <p className="text-sm text-text-muted text-center italic mt-4">No members found.</p>
            )}
          </div>
        </div>

        {/* FOOTER - DANGER ZONE (Takım Silme Alanı) */}
        <div className="p-6 border-t border-border-main bg-red-500/5 transition-colors shrink-0">
          <div className="flex items-start gap-3 mb-4 text-red-500/80">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-500">Danger Zone</p>
              <p>Deleting this team will permanently remove all associated tasks, comments, and data.</p>
            </div>
          </div>
          <button 
            onClick={handleDeleteTeam}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 text-sm font-bold rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete Team
          </button>
        </div>

      </div>
    </>
  );
}