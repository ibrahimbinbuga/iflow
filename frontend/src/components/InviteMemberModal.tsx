import { useState } from 'react';
import { X, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number | null;
}

export default function InviteMemberModal({ isOpen, onClose, workspaceId }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen || !workspaceId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Backend'deki "Takıma Üye Ekleme" rotamıza istek atıyoruz
      await axios.post(`${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/members`, { email });
      
      setMessage({ type: 'success', text: 'Teammate added successfully!' });
      
      // 2 saniye sonra başarılı mesajını kapat ve modalı gizle
      setTimeout(() => {
        setEmail('');
        setMessage({ type: '', text: '' });
        onClose();
      }, 2000);
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Could not add user. Make sure they are registered.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-surface border border-border-main rounded-xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main">
          <div className="flex items-center gap-2 text-text-main font-semibold">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2>Invite Teammate</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {message.text}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">User Email Address</label>
            <input required autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@example.com" className="w-full bg-background border border-border-main rounded-md px-3 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-all"/>
            <p className="text-xs text-text-muted mt-2">The user must be already registered to iFlow to be added.</p>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main hover:bg-background rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-md shadow-sm">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}