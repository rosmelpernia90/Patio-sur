import apiClient from './client';
import type { Project, DashboardData } from '@/types';

// ============================================================
// Datos locales del proyecto Patio Sur
// Fuente: Oferta Mercantil, Curva S (19 mar), Patio Sur_.xlsx
// Usados cuando el backend no está disponible (modo demo)
// ============================================================
const PROJECT_ID = 'patio-sur-oe1035';

export const PATIO_SUR_PROJECT: Project = {
  id: PROJECT_ID,
  name: 'Patio de Operacion Sur',
  code: 'OE 1035',
  description: 'Infraestructura de recarga electrica — 516 actividades ponderadas. Duracion 453 dias.',
  client_name: 'Consorcio Express S.A.S.',
  start_date: '2025-06-20',
  estimated_end_date: '2026-09-16',
  actual_end_date: null,
  total_budget: 41012884481,
  currency: 'COP',
  status: 'in_progress',
  location: 'Bogota, Colombia',
  project_manager: 'PC Mejia Ingenieria S.A.',
  time_progress_percentage: 52.22,
  created_at: '2025-06-20T00:00:00Z',
  updated_at: '2026-03-25T00:00:00Z',
};

function isDemoMode(): boolean {
  const token = localStorage.getItem('pcm_access_token');
  return !token || token.endsWith('.demo-signature');
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    if (isDemoMode()) return [PATIO_SUR_PROJECT];
    try {
      return await apiClient.get<Project[]>('/projects').then((r) => r.data);
    } catch {
      return [PATIO_SUR_PROJECT];
    }
  },

  getById: async (id: string): Promise<Project> => {
    if (isDemoMode()) return PATIO_SUR_PROJECT;
    try {
      return await apiClient.get<Project>(`/projects/${id}`).then((r) => r.data);
    } catch {
      return PATIO_SUR_PROJECT;
    }
  },

  create: (data: Partial<Project>) =>
    apiClient.post<Project>('/projects', data).then((r) => r.data),

  update: (id: string, data: Partial<Project>) =>
    apiClient.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/projects/${id}`),

  getDashboard: (id: string) =>
    apiClient.get<DashboardData>(`/projects/${id}/dashboard`).then((r) => r.data),
};
