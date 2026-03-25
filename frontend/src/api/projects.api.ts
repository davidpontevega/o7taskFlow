import api from './axiosInstance';
import type { Project, CreateProjectDto } from '../types';

export const projectsApi = {
  getAll: () =>
    api.get<Project[]>('/projects').then(r => r.data),

  getById: (id: number) =>
    api.get<Project>(`/projects/${id}`).then(r => r.data),

  create: (dto: CreateProjectDto) =>
    api.post<{ id: number }>('/projects', dto).then(r => r.data),

  update: (id: number, dto: CreateProjectDto) =>
    api.put(`/projects/${id}`, dto).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/projects/${id}`).then(r => r.data),
};