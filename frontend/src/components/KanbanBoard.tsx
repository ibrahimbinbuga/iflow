import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, UserPlus } from 'lucide-react'; // Plus butonunu importlardan sildik
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import TaskCard, { type TaskType } from './TaskCard';
import TaskDetailsPanel from './TaskDetailsPanel';
import InviteMemberModal from './InviteMemberModal';

const columns = [
  { title: 'To Do', status: 'To Do', dotColor: 'bg-zinc-400' },
  { title: 'In Progress', status: 'In Progress', dotColor: 'bg-primary' },
  { title: 'Review', status: 'Review', dotColor: 'bg-purple-500' },
  { title: 'Done', status: 'Done', dotColor: 'bg-emerald-500' },
];

interface KanbanBoardProps {
  refreshTrigger: number;
  searchQuery: string;
  filterHighPriority: boolean;
  sortByPriority: boolean;
}

const priorityWeight: Record<string, number> = {
  'Urgent': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1
};

export default function KanbanBoard({ 
  refreshTrigger, 
  searchQuery, 
  filterHighPriority, 
  sortByPriority 
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId') ? Number(localStorage.getItem('activeWorkspaceId')) : null;

  useEffect(() => {
    fetchTasks();

    const handleWorkspaceChange = () => {
      setLoading(true);
      fetchTasks();
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    return () => window.removeEventListener('workspaceChanged', handleWorkspaceChange);
  }, [refreshTrigger]);

  // YENİ: Akıllı Işınlanma (Takım uyuşmuyorsa kullanıcıyı uyar)
  useEffect(() => {
    const handleOpenTask = (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskIdToOpen = Number(customEvent.detail);
      
      if (!taskIdToOpen) return;

      const targetTask = tasks.find(t => t.id === taskIdToOpen);
      
      if (targetTask) {
        setSelectedTask(targetTask);
        setIsPanelOpen(true);
      } else {
        alert("This task belongs to another team's workspace! Please select the correct team from the sidebar first.");
      }
    };

    window.addEventListener('openTaskFromNotification', handleOpenTask);
    return () => window.removeEventListener('openTaskFromNotification', handleOpenTask);
  }, [tasks]);

  const fetchTasks = async () => {
    const workspaceId = localStorage.getItem('activeWorkspaceId');
    
    if (!workspaceId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/tasks`);
      
      const formattedTasks: TaskType[] = (response.data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        tags: t.tags ? t.tags.map((tag: any) => tag.name) : [],
        comments: t.comments ? t.comments.length : 0,
        attachments: 0,
        dueDate: 'No Date',
        assignees: (t.assignees || []).map((user: any) => {
          const names = (user.full_name || 'IB').split(' ');
          const initials = names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : names[0].substring(0, 2).toUpperCase();
          return { id: user.id, initials, bgColor: 'bg-primary' };
        })
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Görevler çekilirken hata:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const draggedTaskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    setTasks(prevTasks => prevTasks.map(task => task.id === draggedTaskId ? { ...task, status: newStatus } : task));

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${draggedTaskId}`, { status: newStatus });
    } catch (error) {
      console.error("Hata:", error);
      fetchTasks();
    }
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  let processedTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query) || task.tags.some(tag => tag.toLowerCase().includes(query));
    const matchesFilter = filterHighPriority ? (task.priority === 'Urgent' || task.priority === 'High') : true;
    return matchesSearch && matchesFilter;
  });

  if (sortByPriority) {
    processedTasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0 pr-2 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-text-main">Team Board</h1>
        {activeWorkspaceId && (
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Teammate
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-6 overflow-x-auto pb-4 transition-colors duration-300">
          {columns.map((column) => {
            const columnTasks = processedTasks.filter(task => task.status === column.status);
            return (
              <div key={column.title} className="flex-shrink-0 w-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${column.dotColor}`}></span>
                    <h2 className="text-text-main font-semibold text-sm transition-colors duration-300">{column.title}</h2>
                    <span className="text-text-muted text-xs bg-surface border border-border-main px-2 py-0.5 rounded-full transition-colors duration-300">
                      {columnTasks.length}
                    </span>
                  </div>
                  {/* + BUTONU BURADAN SİLİNDİ, ARAYÜZ ARTIK ÇOK DAHA TEMİZ! */}
                </div>

                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar transition-colors rounded-xl ${
                        snapshot.isDraggingOver ? 'bg-zinc-200/50 dark:bg-zinc-800/30' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'} transition-transform duration-200`}
                            >
                              <TaskCard task={task} onClick={() => handleTaskClick(task)} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDetailsPanel task={selectedTask} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      
      <InviteMemberModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        workspaceId={activeWorkspaceId} 
      />
    </div>
  );
}