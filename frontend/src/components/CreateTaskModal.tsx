import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Hangi takımın ekranındayız? Onu bul.
    const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
    if (!activeWorkspaceId) {
      alert("Please select a team from the sidebar first.");
      setLoading(false);
      return;
    }

    try {
      let targetProjectId = null;

      // 2. Sistemdeki projeleri çek ve bu takıma ait olanı bul
      const projectsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`);
      const teamProjects = projectsRes.data.filter((p: any) => p.workspace_id === Number(activeWorkspaceId));

      if (teamProjects.length > 0) {
        // Takımın zaten bir projesi varsa onu kullan
        targetProjectId = teamProjects[0].id;
      } else {
        // 3. YENİ TAKIM: Eğer takımın hiç projesi yoksa, otomatik bir "General Board" projesi yarat!
        const newProjectRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, {
          name: "General Board",
          workspace_id: Number(activeWorkspaceId)
        });
        targetProjectId = newProjectRes.data.id;
      }

      // 4. Sabit 1 yerine, bulduğumuz/oluşturduğumuz dinamik Proje ID'si ile görevi kaydet!
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, { 
        title, 
        description, 
        status, 
        priority, 
        project_id: targetProjectId 
      });

      // Formu temizle ve kapat
      setTitle(''); 
      setDescription(''); 
      setStatus('To Do'); 
      setPriority('Medium');
      onSuccess(); 
      onClose();

    } catch (error) {
      console.error("Görev oluşturulurken hata:", error);
      alert("Failed to create task. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-surface border border-border-main rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main transition-colors">
          <h2 className="text-lg font-semibold text-text-main transition-colors">Create New Task</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider transition-colors">Title</label>
            <input required autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update profile page" className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-all"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider transition-colors">Description</label>
            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-all resize-none"/>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider transition-colors">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all appearance-none"><option>To Do</option><option>In Progress</option><option>Review</option><option>Done</option></select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider transition-colors">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-primary transition-all appearance-none"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main transition-colors">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors shadow-sm">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}