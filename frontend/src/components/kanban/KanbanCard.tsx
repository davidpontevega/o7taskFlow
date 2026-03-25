import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';

const PRIORITY_STYLES: Record<string, string> = {
  LOW:      'bg-green-900/50 text-green-400 border-green-800',
  MEDIUM:   'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  HIGH:     'bg-red-900/50 text-red-400 border-red-800',
  CRITICAL: 'bg-purple-900/50 text-purple-400 border-purple-800',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica'
};

interface Props {
  task:        Task;
  isDragging?: boolean;
  onClick?:    () => void;
}

export default function KanbanCard({ task, isDragging, onClick }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSorting
  } = useSortable({ id: task.id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isSorting ? 0.4 : 1,
  };

  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = task.dueDate
    && new Date(task.dueDate) < today
    && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-gray-800 border rounded-xl p-3 cursor-grab
                  active:cursor-grabbing select-none transition-all
                  hover:border-indigo-500/50 hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-black/30
                  ${isDragging
                    ? 'shadow-2xl ring-2 ring-indigo-500 border-indigo-500'
                    : 'border-gray-700'}`}
    >
      {/* Prioridad */}
      {task.priority && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          border mb-2 inline-block
                          ${PRIORITY_STYLES[task.priority] ?? ''}`}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
      )}

      {/* Título */}
      <p className="text-white text-sm font-medium leading-snug mb-2">
        {task.title}
      </p>

      {/* Descripción */}
      {task.description && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2
                      border-t border-gray-700/50">
        {task.assignedName ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center
                            justify-center text-white text-xs font-bold">
              {task.assignedName.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-400 text-xs truncate max-w-[100px]">
              {task.assignedName}
            </span>
          </div>
        ) : (
          <span className="text-gray-600 text-xs">Sin asignar</span>
        )}

        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1
            ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            {isOverdue ? '⚠️' : '📅'}
            {new Date(task.dueDate).toLocaleDateString('es-PE', {
              day: '2-digit', month: 'short'
            })}
          </span>
        )}
      </div>
    </div>
  );
}