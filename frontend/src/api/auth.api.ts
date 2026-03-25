import api from './axiosInstance';
import type { Company, Branch, UserSession } from '../types';

export const authApi = {
  getCompanies: (user: string, password: string) =>
    api.post<Company[]>('/auth/companies', { user, password })
       .then(r => r.data),

  getBranches: (user: string, password: string) =>
    api.post<Branch[]>('/auth/branches', { user, password })
       .then(r => r.data),

  login: (user: string, password: string,
          company: string, branch: string) =>
    api.post<UserSession>('/auth/login',
       { user, password, company, branch })
       .then(r => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { oldPassword, newPassword })
       .then(r => r.data),
};