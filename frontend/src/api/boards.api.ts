import api from './axiosInstance';
import type { Board } from '../types';

export const boardsApi = {
  getByProject: (projectId: number) =>
    api.get<Board[]>(`/boards/${projectId}`).then(r => r.data),

  create: (projectId: number, name: string, description?: string) =>
    api.post<{ id: number }>('/boards', { projectId, name, description })
       .then(r => r.data),
};