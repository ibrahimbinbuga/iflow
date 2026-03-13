import { MessageSquare, Paperclip, Calendar, AlertCircle } from 'lucide-react';

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

const priorityColors = {
  Urgent: 'text-red-600 bg-red-100/70 dark:text-red-400 dark:bg-red-400/10 border-red-200 dark:border-red-400/20',
  High: 'text-orange-600 bg-orange-100/70 dark:text-orange-400 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20',
  Medium: 'text-yellow-700 bg-yellow-100/70 dark:text-yellow-400 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20',
  Low: 'text-sky-600 bg-sky-100/70 dark:text-sky-400 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20',
};

interface TaskCardProps {
  task: TaskType;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-surface border border-border-main rounded-xl p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {(task.priority === 'Urgent' || task.priority === 'High') && <AlertCircle className="w-4 h-4 text-orange-500/70" />}
      </div>

      <h3 className="text-text-main font-medium text-sm mb-1.5 leading-snug group-hover:text-primary transition-colors">
        {task.title}
      </h3>
      <p className="text-text-muted text-xs line-clamp-2 mb-4 leading-relaxed transition-colors">
        {task.description}
      </p>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-background text-text-muted rounded-md text-[10px] tracking-wide uppercase font-semibold border border-border-main transition-colors">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-main/50 transition-colors">
        <div className="flex -space-x-2">
          {task.assignees.map((user) => (
            <div key={user.id} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-surface ${user.bgColor}`}>
              {user.initials}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-text-muted text-xs transition-colors">
          <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /><span>{task.comments}</span></div>
          <div className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /><span>{task.attachments}</span></div>
          <div className="flex items-center gap-1 ml-1"><Calendar className="w-3.5 h-3.5" /><span>{task.dueDate}</span></div>
        </div>
      </div>
    </div>
  );
}