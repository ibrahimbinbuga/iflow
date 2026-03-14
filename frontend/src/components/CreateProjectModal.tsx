import { useState } from 'react';
import { X, Loader2, FolderPlus } from 'lucide-react';
import axios from 'axios';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Şimdilik varsayılan Workspace ID'sini 1 olarak gönderiyoruz
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, { name, workspace_id: 1 });
      setName('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Proje oluşturulamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-surface border border-border-main rounded-xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main">
          <div className="flex items-center gap-2 text-text-main font-semibold">
            <FolderPlus className="w-5 h-5 text-primary" />
            <h2>New Project</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Project Name</label>
            <input required autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mobile App Redesign" className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-all"/>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-md shadow-sm">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}