import { X } from 'lucide-react';

interface TeamMembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  members: any[];
}

export default function TeamMembersPanel({ isOpen, onClose, members }: TeamMembersPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Arka plan bulanıklığı ve dışarı tıklayınca kapatma */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose}/>
      
      {/* Sağdan kayarak açılan panel */}
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
      </div>
    </>
  );
}