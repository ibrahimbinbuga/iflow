import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';
import TaskCard, { type TaskType } from './TaskCard';

const columns = [
  { title: 'To Do', status: 'To Do', dotColor: 'bg-gray-400' },
  { title: 'In Progress', status: 'In Progress', dotColor: 'bg-blue-500' },
  { title: 'Review', status: 'Review', dotColor: 'bg-purple-500' },
  { title: 'Done', status: 'Done', dotColor: 'bg-emerald-500' },
];

// Dışarıdan gelen yenileme sinyali (refreshTrigger) eklendi
interface KanbanBoardProps {
  refreshTrigger: number;
}

export default function KanbanBoard({ refreshTrigger }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);

  // refreshTrigger her değiştiğinde (yeni görev eklendiğinde) API'ye tekrar istek atar
  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tasks');
      const backendTasks = response.data;

      const formattedTasks: TaskType[] = backendTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        tags: t.tags ? t.tags.map((tag: any) => tag.name) : [],
        comments: t.comments ? t.comments.length : 0,
        attachments: 0,
        dueDate: 'No Date',
        assignees: t.assignees ? t.assignees.map((user: any) => {
          const names = user.full_name.split(' ');
          const initials = names.length > 1 
            ? (names[0][0] + names[1][0]).toUpperCase() 
            : names[0].substring(0, 2).toUpperCase();
            
          return {
            id: user.id,
            initials: initials,
            bgColor: 'bg-primary'
          };
        }) : []
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Görevler çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Görevler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);

        return (
          <div key={column.title} className="flex-shrink-0 w-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.dotColor}`}></span>
                <h2 className="text-white font-semibold text-sm">{column.title}</h2>
                <span className="text-text-muted text-xs bg-[#27272A] px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <button className="text-text-muted hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {columnTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}