import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'; // <-- 'type' eklendi
import TaskCard, { type TaskType } from './TaskCard';

const columns = [
  { title: 'To Do', status: 'To Do', dotColor: 'bg-gray-400' },
  { title: 'In Progress', status: 'In Progress', dotColor: 'bg-blue-500' },
  { title: 'Review', status: 'Review', dotColor: 'bg-purple-500' },
  { title: 'Done', status: 'Done', dotColor: 'bg-emerald-500' },
];

interface KanbanBoardProps {
  refreshTrigger: number;
}

export default function KanbanBoard({ refreshTrigger }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Sürükleme işlemi bittiğinde tetiklenen fonksiyon
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Eğer kart boşluğa veya aynı yere bırakıldıysa hiçbir şey yapma
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Frontend (State) Güncellemesi - Anında tepki için (Optimistic UI)
    const draggedTaskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    // Geçici olarak React state'ini güncelliyoruz (Kart anında yeni yerine geçer)
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );

    // 2. Backend Güncellemesi - Arka planda sessizce Go API'sine bildir
    try {
      await axios.put(`http://localhost:8080/api/tasks/${draggedTaskId}`, {
        status: newStatus
      });
      // Go'daki UpdateTask fonksiyonumuz, sadece gönderdiğimiz alanları (status) günceller, diğerlerini bozmaz.
    } catch (error) {
      console.error("Görev durumu güncellenirken hata:", error);
      // Eğer backend hata verirse, eski verileri geri getirmek için listeyi tekrar çekiyoruz
      fetchTasks();
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
    // Tüm Board'u DragDropContext ile sarmalıyoruz
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status);

          return (
            <div key={column.title} className="flex-shrink-0 w-[320px] flex flex-col">
              {/* Kolon Başlığı (Sabit) */}
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

              {/* Sürükleme Alanı (Droppable) */}
              <Droppable droppableId={column.status}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar transition-colors rounded-xl ${
                      snapshot.isDraggingOver ? 'bg-[#27272A]/30' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      // Sürüklenebilir Kart (Draggable)
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'} transition-transform duration-200`}
                          >
                            <TaskCard task={task} />
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
  );
}