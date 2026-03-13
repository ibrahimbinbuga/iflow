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

    try {
      // Go API'sine yeni görevi POST et
      await axios.post('http://localhost:8080/api/tasks', {
        title,
        description,
        status,
        priority,
        project_id: 1 // Şimdilik 1 numaralı Projeye (Website Redesign) sabitliyoruz
      });

      // Formu temizle
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setPriority('Medium');

      onSuccess(); // App.tsx'e başarılı olduğunu bildir (Board'u yenilemesi için)
      onClose(); // Modalı kapat
    } catch (error) {
      console.error("Görev oluşturulurken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-[#27272A] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <h2 className="text-lg font-semibold text-white">Create New Task</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Formu */}
        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Title</label>
            <input 
              required
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Update user profile page"
              className="w-full bg-[#121212] border border-[#3F3F46] rounded-md px-3 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
            <textarea 
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="w-full bg-[#121212] border border-[#3F3F46] rounded-md px-3 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#121212] border border-[#3F3F46] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#121212] border border-[#3F3F46] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Modal Butonları */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#27272A]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white hover:bg-[#27272A] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}