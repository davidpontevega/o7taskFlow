import api from './axiosInstance';

export const dashboardApi = {
  getStats: () => api.get('/dashboard').then(r => r.data),
};