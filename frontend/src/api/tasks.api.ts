import api from './axiosInstance';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskComment } from '../types';

// Control global para evitar llamadas duplicadas
const pendingRequests = new Set<string>();

export const tasksApi = {
  getByBoard: (boardId: number) =>
    api.get<Task[]>(`/tasks/board/${boardId}`).then(r => r.data),

  create: (dto: CreateTaskDto) =>
    api.post<{ id: number }>('/tasks', dto).then(r => r.data),

  update: (id: number, dto: UpdateTaskDto) =>
    api.put(`/tasks/${id}`, dto).then(r => r.data),

  move: (id: number, columnId: number, order: number) =>
    api.patch(`/tasks/${id}/move`, { columnId, order }).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/tasks/${id}`).then(r => r.data),

  getComments: (id: number) =>
    api.get<TaskComment[]>(`/tasks/${id}/comments`).then(r => r.data),

  addComment: async (id: number, text: string): Promise<{ id: number }> => {
    const key = `comment-${id}-${text}`;
    if (pendingRequests.has(key)) {
      return Promise.reject(new Error('Duplicate request'));
    }
    pendingRequests.add(key);
    try {
      const result = await api.post(`/tasks/${id}/comments`, { text });
      return result.data;
    } finally {
      setTimeout(() => pendingRequests.delete(key), 2000);
    }
  },
};