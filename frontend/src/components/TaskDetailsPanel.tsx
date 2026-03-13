import { useState, useEffect } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { type TaskType } from './TaskCard';

interface TaskDetailsPanelProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

// Backend'den gelecek yorum yapısı
interface CommentType {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
}

export default function TaskDetailsPanel({ task, isOpen, onClose }: TaskDetailsPanelProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);

  // Görev değiştiğinde (veya panel açıldığında) o göreve ait yorumları çek
  useEffect(() => {
    if (task && isOpen) {
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/tasks/${task.id}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error("Yorumlar çekilemedi:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setSending(true);
    try {
      // Yorum gönderiyoruz (Şimdilik user_id: 1 olarak sabitliyoruz)
      await axios.post('http://localhost:8080/api/comments', {
        task_id: task.id,
        user_id: 1, 
        content: newComment
      });
      setNewComment('');
      fetchComments(); // Yorumları yenile
    } catch (error) {
      console.error("Yorum gönderilemedi:", error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Arkaplan Karartması */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Sağdan Açılan Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface border-l border-[#27272A] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Panel Üst Bar (Header) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm font-medium">Task-#{task.id}</span>
            <span className="px-2.5 py-1 rounded bg-[#27272A] text-xs font-medium text-white">
              {task.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-[#27272A] rounded-md transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel İçeriği (Kaydırılabilir alan) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* Görev Temel Bilgileri */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{task.title}</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1 border border-[#27272A] rounded-lg p-3">
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Priority</span>
                <span className="text-sm font-medium text-white">{task.priority}</span>
              </div>
              <div className="flex-1 border border-[#27272A] rounded-lg p-3">
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Due Date</span>
                <span className="text-sm font-medium text-white">{task.dueDate}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>

          <hr className="border-[#27272A] mb-8" />

          {/* Yorumlar (Activity Stream) Alanı */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Activity</h3>
            </div>

            {loadingComments ? (
              <div className="flex items-center justify-center py-8 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-6 mb-8">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      IB {/* Şimdilik kullanıcı adını sabit harfle gösteriyoruz */}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">İbrahim</span>
                        <span className="text-xs text-text-muted">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted bg-[#121212] p-3 rounded-md border border-[#27272A]">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-text-muted bg-[#121212] rounded-lg border border-dashed border-[#27272A] mb-8">
                No comments yet. Be the first to share an update!
              </div>
            )}
          </div>
        </div>

        {/* Alt Kısım: Yorum Yazma Formu */}
        <div className="p-4 border-t border-[#27272A] bg-surface">
          <form onSubmit={handleSendComment} className="relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or post an update..."
              className="w-full bg-[#121212] border border-[#3F3F46] rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit"
              disabled={sending || !newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-blue-400 disabled:opacity-50 disabled:hover:text-primary transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}