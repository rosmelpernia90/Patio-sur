import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, DollarSign, Building2, User, Zap, Loader } from 'lucide-react';
import clsx from 'clsx';
import { projectsApi } from '@/services/api/projects';
import { formatCOPFull } from '@/utils/formatNumbers';

// Use full currency format for project budget display
const formatCOP = formatCOPFull;

const statusLabels: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planificacion', color: 'bg-primary-50 text-primary-700 border border-primary-200' },
  in_progress: { label: 'En Progreso', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  on_hold: { label: 'En Pausa', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Completado', color: 'bg-steel-50 text-steel-700 border border-steel-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-700 border border-red-200' },
};

// Helper to calculate time progress percentage
const getTimeProgressPercentage = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();

  if (now >= end) return 100;
  if (now <= start) return 0;

  return Math.round(((now - start) / (end - start)) * 100);
};

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6">
        <p className="text-red-700">Error al cargar proyectos. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Proyectos</h2>
          <p className="text-xs text-steel-400 mt-1">
            Gestion de proyectos de infraestructura de recarga electrica
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition shadow-sm">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl bg-steel-50 border border-steel-200 p-8 text-center">
          <p className="text-steel-500">No hay proyectos disponibles.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const statusConfig = statusLabels[project.status] || statusLabels.planning;
            const timeProgress = getTimeProgressPercentage(project.start_date, project.estimated_end_date);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}/dashboard`}
                className="group rounded-xl border border-steel-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary-50 p-2.5 border border-primary-100">
                      <Zap className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-steel-900 group-hover:text-primary-600 transition">
                        {project.name}
                      </h3>
                      <p className="text-xs text-steel-400">{project.code}</p>
                    </div>
                  </div>
                  <span className={clsx('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                </div>

                <p className="text-xs text-steel-400 mb-3 line-clamp-2">{project.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-steel-600">
                    <Building2 className="h-4 w-4 text-steel-300" />
                    <span>
                      Cliente: <strong className="text-steel-800">{project.client_name}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-steel-600">
                    <DollarSign className="h-4 w-4 text-steel-300" />
                    <span>
                      Presupuesto: <strong className="text-primary-700">{formatCOP(project.total_budget)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-steel-600">
                    <Calendar className="h-4 w-4 text-steel-300" />
                    <span>
                      {project.start_date} al {project.estimated_end_date}
                    </span>
                  </div>
                </div>

                {/* Time progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-steel-400 font-medium">Avance temporal (plazo)</span>
                    <span className="font-bold text-steel-700">{timeProgress}%</span>
                  </div>
                  <div className="h-2 bg-steel-100 rounded-full">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${Math.min(timeProgress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-steel-100 flex justify-between text-[10px] text-steel-400">
                  <span>Estado: {statusConfig.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
