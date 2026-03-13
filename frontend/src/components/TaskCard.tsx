import { MessageSquare, Paperclip, Calendar, AlertCircle } from 'lucide-react';

// Görev verisinin tipi
export interface TaskType {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  tags: string[];
  comments: number;
  attachments: number;
  dueDate: string;
  assignees: { id: number; initials: string; bgColor: string }[];
}

// Öncelik seviyelerine göre renk atamaları
const priorityColors = {
  Urgent: 'text-red-400 bg-red-400/10 border-red-400/20',
  High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

export default function TaskCard({ task }: { task: TaskType }) {
  return (
    <div className="bg-surface border border-[#27272A] rounded-xl p-4 cursor-pointer hover:border-[#3F3F46] hover:shadow-lg transition-all group">
      
      {/* Üst Kısım: Öncelik ve Uyarı İkonu */}
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.priority === 'Urgent' || task.priority === 'High' ? (
          <AlertCircle className="w-4 h-4 text-orange-500/70" />
        ) : null}
      </div>

      {/* Başlık ve Açıklama */}
      <h3 className="text-white font-medium text-sm mb-1.5 leading-snug group-hover:text-primary transition-colors">
        {task.title}
      </h3>
      <p className="text-text-muted text-xs line-clamp-2 mb-4 leading-relaxed">
        {task.description}
      </p>

      {/* Etiketler (Tags) */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-[#27272A] text-text-muted rounded-md text-[10px] tracking-wide uppercase font-semibold">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Alt Kısım: Avatarlar ve Metrikler */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {/* Atanan Kişiler */}
        <div className="flex -space-x-2">
          {task.assignees.map((user) => (
            <div 
              key={user.id} 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-surface ${user.bgColor}`}
            >
              {user.initials}
            </div>
          ))}
        </div>

        {/* Metrikler (Yorum, Dosya, Tarih) */}
        <div className="flex items-center gap-3 text-text-muted text-xs">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{task.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{task.attachments}</span>
          </div>
          <div className="flex items-center gap-1 ml-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}