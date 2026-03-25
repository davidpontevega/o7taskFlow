import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks.api";
import KanbanColumn from "../components/kanban/KanbanColumn";
import KanbanCard from "../components/kanban/KanbanCard";
import TaskModal from "../components/tasks/TaskModal";
import Navbar from "../components/ui/Navbar";
import type { Task, BoardColumn } from "../types";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numBoardId = Number(boardId);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [targetColId, setTargetColId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Cargar columnas del tablero
  const { data: boardDetail } = useQuery({
    queryKey: ["boardDetail", numBoardId],
    queryFn: () =>
      fetch(`http://localhost:5116/api/boards/detail/${numBoardId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("o7tf_token")}`,
        },
      }).then((r) => r.json()),
    enabled: !!numBoardId,
  });

  // Cargar tareas
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", numBoardId],
    queryFn: () => tasksApi.getByBoard(numBoardId),
    enabled: !!numBoardId,
  });

  const columns: BoardColumn[] = boardDetail?.columns ?? [];

  const getTasksByColumn = (colId: number) =>
    tasks
      .filter((t: Task) => t.columnId === colId)
      .sort((a: Task, b: Task) => a.sortOrder - b.sortOrder);

const getFilteredTasks = (colId: number) => {
  return getTasksByColumn(colId).filter(task => {
    const matchSearch = !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description ?? '').toLowerCase().includes(search.toLowerCase());

    const matchPriority = !filterPriority ||
      task.priority === filterPriority;

    const matchAssigned = !filterAssigned ||
      task.assignedTo === filterAssigned;

    return matchSearch && matchPriority && matchAssigned;
  });
};

  // Mutaciones
  const moveTask = useMutation({
    mutationFn: ({
      id,
      columnId,
      order,
    }: {
      id: number;
      columnId: number;
      order: number;
    }) => tasksApi.move(id, columnId, order),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", numBoardId] }),
  });

  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", numBoardId] });
      setShowModal(false);
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: any }) =>
      tasksApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", numBoardId] });
      setEditTask(null);
    },
  });

  const deleteTask = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", numBoardId] });
      setEditTask(null);
    },
  });

  // Mapa de columna → status automático
  const getStatusByColumnName = (colName: string): string => {
    const name = colName.toLowerCase();
    if (name.includes("progreso") || name.includes("progress"))
      return "IN_PROGRESS";
    if (
      name.includes("revisión") ||
      name.includes("revision") ||
      name.includes("review")
    )
      return "IN_REVIEW";
    if (
      name.includes("completado") ||
      name.includes("done") ||
      name.includes("complete")
    )
      return "DONE";
    return "PENDING";
  };

  // Drag & Drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = Number(active.id);
    const overId = Number(over.id);

    // Determinar columna destino
    const targetColumn =
      columns.find((c) => c.id === overId) ??
      columns.find((c) => getTasksByColumn(c.id).some((t) => t.id === overId));

    if (!targetColumn) return;

    const currentTask = tasks.find((t: Task) => t.id === taskId);
    if (!currentTask) return;

    // Si ya está en esa columna no hacer nada
    if (currentTask.columnId === targetColumn.id) return;

    const newOrder = getTasksByColumn(targetColumn.id).length;
    const newStatus = getStatusByColumnName(targetColumn.name);

    // Mover columna
    moveTask.mutate({
      id: taskId,
      columnId: targetColumn.id,
      order: newOrder,
    });

    // Actualizar status según columna destino
    updateTask.mutate({
      id: taskId,
      dto: {
        title: currentTask.title,
        description: currentTask.description ?? "",
        priority: currentTask.priority,
        status: newStatus,
        assignedTo: currentTask.assignedTo ?? null,
        dueDate: currentTask.dueDate ?? null,
        startDate: currentTask.startDate ?? null,
      },
    });
  };

  const handleAddTask = (columnId: number) => {
    setTargetColId(columnId);
    setShowModal(true);
  };

  const handleSaveTask = (data: any) => {
    if (editTask) {
      updateTask.mutate(data);
    } else {
      createTask.mutate(data);
    }
  };

  if (!boardDetail) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">
          Cargando tablero...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      {/* Board Header */}
{/* Board Header */}
<div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-gray-400 hover:text-white
                   transition-colors text-sm"
      >
        ← Dashboard
      </button>
      <span className="text-gray-600">/</span>
      <h2 className="text-white font-semibold text-sm">
        {boardDetail?.name ?? `Tablero #${boardId}`}
      </h2>
    </div>
    <div className="text-gray-500 text-xs">
      {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
    </div>
  </div>

  {/* Filtros */}
  <div className="flex items-center gap-3 flex-wrap">
    {/* Búsqueda */}
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-500 text-sm">🔍</span>
      <input
        className="bg-gray-800 border border-gray-700 rounded-lg
                   pl-8 pr-4 py-1.5 text-white text-sm w-52
                   focus:outline-none focus:border-indigo-500
                   transition-colors"
        placeholder="Buscar tareas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>

    {/* Filtro prioridad */}
    <select
      className="bg-gray-800 border border-gray-700 rounded-lg
                 px-3 py-1.5 text-sm text-gray-300
                 focus:outline-none focus:border-indigo-500"
      value={filterPriority}
      onChange={e => setFilterPriority(e.target.value)}
    >
      <option value="">Toda prioridad</option>
      <option value="LOW">Baja</option>
      <option value="MEDIUM">Media</option>
      <option value="HIGH">Alta</option>
      <option value="CRITICAL">Crítica</option>
    </select>

    {/* Filtro usuario */}
    <select
      className="bg-gray-800 border border-gray-700 rounded-lg
                 px-3 py-1.5 text-sm text-gray-300
                 focus:outline-none focus:border-indigo-500"
      value={filterAssigned}
      onChange={e => setFilterAssigned(e.target.value)}
    >
      <option value="">Todos los usuarios</option>
      {Array.from(new Set(tasks
        .filter((t: Task) => t.assignedTo)
        .map((t: Task) => JSON.stringify({
          code: t.assignedTo,
          name: t.assignedName
        }))))
        .map(s => JSON.parse(s))
        .map((u: any) => (
          <option key={u.code} value={u.code}>{u.name}</option>
        ))}
    </select>

    {/* Limpiar filtros */}
    {(search || filterPriority || filterAssigned) && (
      <button
        onClick={() => {
          setSearch('');
          setFilterPriority('');
          setFilterAssigned('');
        }}
        className="text-xs text-gray-400 hover:text-white
                   border border-gray-700 rounded-lg px-3 py-1.5
                   transition-colors"
      >
        ✕ Limpiar
      </button>
    )}
  </div>
</div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e) =>
            setActiveTask(
              tasks.find((t: Task) => t.id === Number(e.active.id)) ?? null,
            )
          }
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 min-w-max min-h-full">
            {columns
              .sort((a, b) => a.order - b.order)
              .map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={getFilteredTasks(col.id)} 
                  onAddTask={handleAddTask}
                  onEditTask={(task) => setEditTask(task)}
                />
              ))}
          </div>

          <DragOverlay>
            {activeTask && <KanbanCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal crear tarea */}
      {showModal && targetColId && (
        <TaskModal
          columnId={targetColId}
          boardId={numBoardId}
          isLoading={createTask.isPending}
          onSave={handleSaveTask}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Modal editar tarea */}
      {editTask && (
        <TaskModal
          task={editTask}
          isLoading={updateTask.isPending || deleteTask.isPending}
          onSave={handleSaveTask}
          onDelete={(id) => deleteTask.mutate(id)}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
