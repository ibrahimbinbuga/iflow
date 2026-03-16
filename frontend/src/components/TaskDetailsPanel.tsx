import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageSquare, Trash2, Pencil, Save } from 'lucide-react';
import axios from 'axios';
import { type TaskType } from './TaskCard';

interface TaskDetailsPanelProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

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

  // Düzenleme (Edit) Modu State'leri
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [usersMap, setUsersMap] = useState<Record<number, { name: string, initials: string }>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (commentsEndRef.current && !isEditing) {
        commentsEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [comments, isEditing]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    if (task && isOpen) {
      fetchComments();
      fetchUsers(); 
      // Modal her açıldığında düzenleme modunu sıfırla ve verileri hazırla
      setIsEditing(false);
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditPriority(task.priority);
      setEditStatus(task.status);
    }
  }, [task, isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
      const map: Record<number, { name: string, initials: string }> = {};

      response.data.forEach((u: any) => {
        const names = (u.full_name || 'User').split(' ');
        const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
        map[u.id] = { name: u.full_name || `User ${u.id}`, initials };
      });

      setUsersMap(map);
    } catch (error) {
      console.error("Kullanıcılar çekilemedi:", error);
    }
  };

  const fetchComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/comments`);
      setComments(response.data || []);
    } catch (error) {
      console.error("Yorumlar çekilemedi:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task || !currentUser) return;
    
    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/comments`, { 
        task_id: task.id, 
        user_id: currentUser.id, 
        content: newComment 
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error("Yorum gönderilemedi:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this task? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${task.id}`);
      onClose();
      window.dispatchEvent(new Event('workspaceChanged'));
    } catch (error) {
      console.error("Görev silinemedi:", error);
      alert("Failed to delete task. Please check the console.");
    }
  };

  const handleSaveEdit = async () => {
    if (!task) return;
    setSavingEdit(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${task.id}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        project_id: 0 
      });
      
      setIsEditing(false);
      window.dispatchEvent(new Event('workspaceChanged'));
      onClose(); 
    } catch (error) {
      console.error("Görev güncellenemedi:", error);
      alert("Failed to update task.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose}/>
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface border-l border-border-main shadow-2xl z-50 flex flex-col animate-slide-in-right transition-colors duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main transition-colors shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm font-medium">Task-#{task.id}</span>
            {!isEditing ? (
              <span className="px-2.5 py-1 rounded bg-background text-xs font-medium text-text-main border border-border-main transition-colors">
                {task.status}
              </span>
            ) : (
              <select 
                value={editStatus} 
                onChange={(e) => setEditStatus(e.target.value)} 
                className="px-2.5 py-1 rounded bg-background text-xs font-medium text-text-main border border-primary focus:outline-none transition-colors"
              >
                <option>To Do</option><option>In Progress</option><option>Review</option><option>Done</option>
              </select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={handleSaveEdit} 
                disabled={savingEdit} 
                className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-all" 
                title="Edit Task"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={handleDeleteTask} 
              className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
              title="Delete Task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-border-main mx-1"></div>
            <button 
              onClick={onClose} 
              className="p-2 text-text-muted hover:text-text-main hover:bg-background rounded-md transition-all"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* BODY - SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar transition-colors">
          <div className="mb-8">
            {isEditing ? (
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="w-full text-2xl font-bold text-text-main mb-4 bg-background border border-primary rounded-md px-3 py-2 focus:outline-none" 
                placeholder="Task Title" 
              />
            ) : (
              <h2 className="text-2xl font-bold text-text-main mb-4 leading-tight transition-colors">{task.title}</h2>
            )}

            <div className="flex gap-4 mb-6">
              <div className="flex-1 border border-border-main rounded-lg p-3 bg-background/50 transition-colors">
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Priority</span>
                {isEditing ? (
                  <select 
                    value={editPriority} 
                    onChange={(e) => setEditPriority(e.target.value)} 
                    className="w-full bg-surface border border-primary rounded-md px-2 py-1 text-sm text-text-main focus:outline-none mt-1"
                  >
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                ) : (
                  <span className="text-sm font-medium text-text-main">{task.priority}</span>
                )}
              </div>
              <div className="flex-1 border border-border-main rounded-lg p-3 bg-background/50 transition-colors">
                <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Due Date</span>
                <span className="text-sm font-medium text-text-main">{task.dueDate}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-main mb-2">Description</h3>
              {isEditing ? (
                <textarea 
                  rows={5} 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  className="w-full bg-background border border-primary rounded-md px-3 py-2 text-sm text-text-main focus:outline-none resize-y" 
                  placeholder="Task description..." 
                />
              ) : (
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap transition-colors">{task.description}</p>
              )}
            </div>
          </div>
          
          <hr className="border-border-main mb-8 transition-colors" />
          
          {/* ACTIVITY & COMMENTS (Sadece Okuma Modunda Görünür) */}
          {!isEditing && (
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-text-main" />
                <h3 className="text-lg font-semibold text-text-main transition-colors">Activity</h3>
              </div>
              
              {loadingComments ? (
                <div className="flex items-center justify-center py-8 text-text-muted">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map(comment => {
                    const commenter = usersMap[comment.user_id] || { name: `User ${comment.user_id}`, initials: 'U' };
                    
                    return (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
                          {commenter.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-text-main transition-colors">{commenter.name}</span>
                            <span className="text-xs text-text-muted">
                              {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="text-sm text-text-muted bg-background p-3 rounded-md border border-border-main leading-relaxed transition-colors break-words">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-text-muted bg-background rounded-lg border border-dashed border-border-main transition-colors">
                  No comments yet.
                </div>
              )}
              
              <div ref={commentsEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* FOOTER - COMMENT INPUT (Sadece Okuma Modunda Görünür) */}
        {!isEditing && (
          <div className="p-4 border-t border-border-main bg-surface transition-colors shrink-0">
            <form onSubmit={handleSendComment} className="relative">
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Ask a question or post an update..." 
                className="w-full bg-background border border-border-main rounded-lg pl-4 pr-12 py-3 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit" 
                disabled={sending || !newComment.trim()} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-blue-600 disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}