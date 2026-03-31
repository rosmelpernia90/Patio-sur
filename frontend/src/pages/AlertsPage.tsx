import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  Clock,
  ShieldAlert,
  TrendingDown,
  DollarSign,
  Truck,
  CalendarX,
  Loader,
} from 'lucide-react';
import clsx from 'clsx';
import { alertsApi, Alert } from '@/services/api/alerts';

// ============================================================
// Icon mapping for alert categories
// ============================================================
const alertIconMap: Record<string, React.ComponentType<any>> = {
  Cronograma: CalendarX,
  Avance: TrendingDown,
  Presupuesto: DollarSign,
  Financiero: ShieldAlert,
  Procura: Truck,
};

const severityConfig = {
  critical: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    badgeLabel: 'CRITICA',
    card: 'border-l-4 border-l-red-500 bg-white',
    icon: 'bg-red-100 text-red-600',
    pulse: 'bg-red-500',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeLabel: 'ADVERTENCIA',
    card: 'border-l-4 border-l-amber-500 bg-white',
    icon: 'bg-amber-100 text-amber-600',
    pulse: 'bg-amber-500',
  },
};

const categoryColors: Record<string, string> = {
  Cronograma: 'bg-purple-100 text-purple-700',
  Avance: 'bg-blue-100 text-blue-700',
  Presupuesto: 'bg-rose-100 text-rose-700',
  Financiero: 'bg-orange-100 text-orange-700',
  Procura: 'bg-teal-100 text-teal-700',
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['alerts', projectId],
    queryFn: () => (projectId ? alertsApi.list(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

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
        <p className="text-red-700">Error al cargar alertas. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${projectId}/dashboard`)}
          className="flex items-center gap-2 text-sm text-steel-500 hover:text-primary-600 transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Alertas del Proyecto</h1>
          <p className="text-sm text-steel-500 mt-1">
            Patio de Operacion Sur — OE 1035 — Alertas activas
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-sm font-bold text-red-700">{criticalCount}</span>
            <span className="text-xs text-red-600">Criticas</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-sm font-bold text-amber-700">{warningCount}</span>
            <span className="text-xs text-amber-600">Advertencias</span>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-xl bg-steel-50 border border-steel-200 p-8 text-center">
            <p className="text-steel-500">No hay alertas en este momento.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity as keyof typeof severityConfig];
            const IconComponent = alertIconMap[alert.category] || AlertTriangle;

            return (
              <div
                key={alert.id}
                className={clsx(
                  'rounded-xl border border-steel-200 shadow-card overflow-hidden transition-all hover:shadow-card-hover',
                  config.card,
                )}
              >
                {/* Card Header */}
                <div className="px-6 py-4 flex items-start gap-4">
                  <div className={clsx('rounded-xl p-3 flex-shrink-0 mt-0.5', config.icon)}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={clsx(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
                          config.badge,
                        )}
                      >
                        {config.badgeLabel}
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full',
                          categoryColors[alert.category] || 'bg-steel-100 text-steel-600',
                        )}
                      >
                        {alert.category}
                      </span>
                      <span className="text-[10px] text-steel-400 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.alert_date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-steel-900 leading-snug">{alert.title}</h3>
                    <p className="text-xs text-steel-600 mt-2 leading-relaxed">{alert.description}</p>
                  </div>
                  {/* Metric badge */}
                  {alert.metric && (
                    <div className="flex-shrink-0 text-center hidden sm:block">
                      <p
                        className={clsx(
                          'text-xl font-bold',
                          alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600',
                        )}
                      >
                        {alert.metric}
                      </p>
                      <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium mt-0.5">
                        {alert.metric_label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Impact & Recommendation */}
                <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-steel-50 p-3 border border-steel-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <p className="text-[10px] font-bold text-steel-500 uppercase tracking-wide">Impacto</p>
                    </div>
                    <p className="text-[11px] text-steel-700 leading-relaxed">{alert.impact}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-[10px] font-bold text-steel-500 uppercase tracking-wide">Recomendacion</p>
                    </div>
                    <p className="text-[11px] text-steel-700 leading-relaxed">{alert.recommendation}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div className="rounded-xl bg-steel-50 border border-steel-200 p-4">
        <p className="text-[11px] text-steel-500 leading-relaxed">
          <strong className="text-steel-600">Fuentes:</strong> Cronograma Microsoft Project (MPP), Presupuesto del caso de negocio,
          Proyeccion de Pagos, Informe de seguimiento semanal.
        </p>
      </div>
    </div>
  );
}
