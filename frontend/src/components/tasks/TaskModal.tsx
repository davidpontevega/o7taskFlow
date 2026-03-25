import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, UpdateTaskDto, TaskComment } from "../../types";
import { tasksApi } from "../../api/tasks.api";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

interface Props {
  task?: Task | null;
  columnId?: number;
  boardId?: number;
  isLoading?: boolean;
  onSave: (data: any) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};
const STATUSES = ["PENDING", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  IN_REVIEW: "En Revisión",
  DONE: "Completado",
};

type Tab = "details" | "comments";

export default function TaskModal({
  task,
  columnId,
  boardId,
  isLoading = false,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const isEdit = !!task;
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("details");
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "MEDIUM",
    status: task?.status ?? "PENDING",
    assignedTo: task?.assignedTo ?? "",
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
    startDate: task?.startDate ? task.startDate.split("T")[0] : "",
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users").then((r) => r.data),
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["comments", task?.id],
    queryFn: () => tasksApi.getComments(task!.id),
    enabled: !!task?.id && tab === "comments",
    staleTime: 0,
    gcTime: 0,
  });

  const addComment = useMutation({
    mutationFn: () => tasksApi.addComment(task!.id, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task?.id] });
      setNewComment("");
    },
  });

  const handleAddComment = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      await addComment.mutateAsync();
    } catch {
      // ignorar
    } finally {
      setSending(false);
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (isEdit) {
      onSave({
        id: task!.id,
        dto: {
          title: form.title,
          description: form.description,
          priority: form.priority,
          status: form.status,
          assignedTo: form.assignedTo || null,
          dueDate: form.dueDate || null,
          startDate: form.startDate || null,
        } as UpdateTaskDto,
      });
    } else {
      onSave({
        columnId,
        boardId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
        startDate: form.startDate || null,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                    flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl
                      w-full max-w-lg shadow-2xl flex flex-col
                      max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5
                        border-b border-gray-800 flex-shrink-0"
        >
          <h3 className="text-white font-bold text-lg">
            {isEdit ? "Editar Tarea" : "Nueva Tarea"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {isEdit && (
          <div className="flex border-b border-gray-800 flex-shrink-0">
            <button
              onClick={() => setTab("details")}
              className={`px-5 py-2.5 text-sm font-medium transition-colors
                ${
                  tab === "details"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
            >
              📋 Detalles
            </button>
            <button
              onClick={() => {
                queryClient.removeQueries({ queryKey: ["comments", task?.id] });
                setTab("comments");
              }}
              className={`px-5 py-2.5 text-sm font-medium transition-colors
                flex items-center gap-1.5
                ${
                  tab === "comments"
                    ? "text-indigo-400 border-b-2 border-indigo-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
            >
              💬 Comentarios
              {tab === "comments" && comments.length > 0 && (
                <span
                  className="bg-indigo-900 text-indigo-300 text-xs
                                 px-1.5 py-0.5 rounded-full"
                >
                  {comments.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {/* TAB DETALLES */}
          {tab === "details" && (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1.5"
                >
                  Título *
                </label>
                <input
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-indigo-500"
                  placeholder="¿Qué hay que hacer?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1.5"
                >
                  Descripción
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-4 py-2.5 text-white text-sm
                             focus:outline-none focus:border-indigo-500
                             resize-none"
                  rows={3}
                  placeholder="Detalles opcionales..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-gray-400
                                    uppercase tracking-wider mb-1.5"
                  >
                    Prioridad
                  </label>
                  <select
                    className="w-full bg-gray-800 border border-gray-700
                               rounded-lg px-3 py-2.5 text-white text-sm
                               focus:outline-none focus:border-indigo-500"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as
                          | "LOW"
                          | "MEDIUM"
                          | "HIGH"
                          | "CRITICAL",
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>

                {isEdit && (
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-400
                      uppercase tracking-wider mb-1.5"
                    >
                      Estado
                    </label>
                    <select
                      className="w-full bg-gray-800 border border-gray-700
                 rounded-lg px-3 py-2.5 text-white text-sm
                 focus:outline-none focus:border-indigo-500"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-gray-400
                                  uppercase tracking-wider mb-1.5"
                >
                  Asignar a
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700
                             rounded-lg px-3 py-2.5 text-white text-sm
                             focus:outline-none focus:border-indigo-500"
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
                >
                  <option value="">Sin asignar</option>
                  {users.map((u: any) => (
                    <option key={u.code} value={u.code}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-gray-400
                                    uppercase tracking-wider mb-1.5"
                  >
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700
                               rounded-lg px-3 py-2.5 text-white text-sm
                               focus:outline-none focus:border-indigo-500"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-gray-400
                                    uppercase tracking-wider mb-1.5"
                  >
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700
                               rounded-lg px-3 py-2.5 text-white text-sm
                               focus:outline-none focus:border-indigo-500"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB COMENTARIOS */}
          {tab === "comments" && (
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full bg-indigo-700
                                  flex items-center justify-center
                                  text-white text-xs font-bold flex-shrink-0"
                  >
                    {session?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-400 text-xs">
                    {session?.fullName}
                  </span>
                </div>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700
                             rounded-lg px-3 py-2 text-white text-sm
                             focus:outline-none focus:border-indigo-500
                             resize-none"
                  rows={2}
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey && newComment.trim())
                      handleAddComment();
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600 text-xs">
                    Ctrl+Enter para enviar
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || sending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white
                               text-xs font-medium px-3 py-1.5 rounded-lg
                               disabled:opacity-50 transition-colors
                               flex items-center gap-1.5"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      "💬 Comentar"
                    )}
                  </button>
                </div>
              </div>

              {loadingComments ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  Cargando comentarios...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm">Sin comentarios aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(comments as TaskComment[])
                    .filter(
                      (c, i, self) =>
                        i === self.findIndex((x) => x.id === c.id),
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-7 h-7 rounded-full bg-indigo-800
                                          flex items-center justify-center
                                          text-white text-xs font-bold flex-shrink-0"
                          >
                            {(c.userName || c.userCode).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">
                              {c.userName || c.userCode}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {formatDate(c.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {c.text}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === "details" && (
          <div
            className="flex items-center gap-3 p-5
                          border-t border-gray-800 flex-shrink-0"
          >
            {isEdit && onDelete && (
              <button
                onClick={() => onDelete(task!.id)}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300
                           border border-red-900 hover:border-red-700
                           rounded-lg transition-colors disabled:opacity-50"
              >
                🗑 Eliminar
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white
                           border border-gray-700 rounded-lg transition-colors
                           disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || isLoading}
                className="px-4 py-2 text-sm text-white bg-indigo-600
                           hover:bg-indigo-500 disabled:opacity-50
                           rounded-lg font-semibold transition-colors
                           min-w-[120px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Guardando...
                  </>
                ) : isEdit ? (
                  "Guardar cambios"
                ) : (
                  "Crear tarea"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
