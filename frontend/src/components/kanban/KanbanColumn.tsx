import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import type { BoardColumn, Task } from '../../types';

interface Props {
  column:    BoardColumn;
  tasks:     Task[];
  onAddTask: (columnId: number) => void;
  onEditTask:(task: Task) => void;
}

export default function KanbanColumn({
  column, tasks, onAddTask, onEditTask
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className={`rounded-t-xl border px-3 py-2.5 flex items-center
                       justify-between transition-colors
                       ${isOver
                         ? 'border-indigo-500 bg-indigo-950/30'
                         : 'border-gray-700 bg-gray-900'}`}>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: column.color }}
          />
          <h3 className="text-white text-sm font-bold">{column.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5
                           rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 space-y-2 border-x
                    rounded-b-xl transition-colors min-h-[80px]
                    ${isOver
                      ? 'border-indigo-500 bg-indigo-950/10'
                      : 'border-gray-700 bg-gray-900/50'}`}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-gray-600 text-xs py-6">
              Sin tarjetas
            </div>
          ) : (
            tasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onEditTask(task)}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddTask(column.id)}
        className="mt-1 w-full border border-dashed border-gray-700
                   hover:border-indigo-500 text-gray-500 hover:text-indigo-400
                   rounded-xl py-2 text-sm transition-all
                   hover:bg-indigo-950/20 flex items-center justify-center gap-1"
      >
        + Agregar tarjeta
      </button>
    </div>
  );
}