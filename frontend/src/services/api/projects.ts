import apiClient from './client';
import type { Project, DashboardData } from '@/types';

export const projectsApi = {
  list: () => apiClient.get<Project[]>('/projects').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (data: Partial<Project>) =>
    apiClient.post<Project>('/projects', data).then((r) => r.data),

  update: (id: string, data: Partial<Project>) =>
    apiClient.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),

  getDashboard: (id: string) =>
    apiClient.get<DashboardData>(`/projects/${id}/dashboard`).then((r) => r.data),
};
