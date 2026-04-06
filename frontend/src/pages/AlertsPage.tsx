import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  TrendingDown,
  DollarSign,
  Truck,
  CalendarX,
  Info,
  CheckCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { formatCOP } from '@/utils/formatNumbers';
import cronogramaBase from '@/data/cronogramaData';
import type { Activity } from '@/data/cronogramaData';

// ── Shared utilities (same as DashboardPage) ──
interface CustomWeekData { weekNum: number; label: string; dateLabel: string; values: Record<string, number> }
const LS_WEEKS_KEY = 'patio_sur_custom_weeks_v1';
const LS_EAC_KEY = 'patio_sur_eac_caso_negocio';
const ACTUAL_COST_TOTAL = 8741569503;

function loadCustomWeeks(): CustomWeekData[] {
  try { const s = localStorage.getItem(LS_WEEKS_KEY); if (s) return JSON.parse(s); } catch {} return [];
}
function loadEAC() {
  try { const s = localStorage.getItem(LS_EAC_KEY); if (s) return JSON.parse(s); } catch {}
  return { sinFin: 28082164388, conFin: 29457164387 };
}
function applyOverrides(acts: Activity[], overrides: Record<string, number>): Activity[] {
  return acts.map(a => {
    if (a.children && a.children.length > 0) {
      const newChildren = applyOverrides(a.children, overrides);
      const totalPeso = newChildren.reduce((s, c) => s + c.peso, 0);
      const wReal = newChildren.reduce((s, c) => s + c.avanceReal * c.peso, 0);
      return { ...a, children: newChildren, avanceReal: totalPeso > 0 ? Math.round(wReal / totalPeso * 10) / 10 : 0 };
    }
    return { ...a, avanceReal: overrides[a.code] !== undefined ? overrides[a.code] : a.avanceReal };
  });
}
function computeProjectReal(overrides: Record<string, number>): number {
  const tree = applyOverrides(cronogramaBase, overrides);
  const totalPeso = tree.reduce((s, a) => s + a.peso, 0);
  const weighted = tree.reduce((s, a) => s + a.avanceReal * a.peso, 0);
  return totalPeso > 0 ? Math.round(weighted / totalPeso * 100) / 100 : 0;
}

const weeklyProgMap = new Map<number, number>([
  [0,0],[1,0.30],[2,0.50],[3,0.70],[4,1.00],[5,1.40],[6,1.60],[7,2.10],[8,2.60],[9,3.30],
  [10,4.10],[11,5.10],[12,6.20],[13,7.50],[14,8.80],[15,10.10],[16,11.40],[17,12.80],[18,14.20],
  [19,15.60],[20,17.30],[21,19.10],[22,20.90],[23,22.80],[24,24.90],[25,27.10],[26,29.30],
  [27,31.90],[28,34.00],[29,35.80],[30,37.40],[31,38.90],[32,40.30],[33,41.70],[34,43.10],
  [35,44.50],[36,45.80],[37,47.00],[38,48.10],[39,50.20],[40,51.90],[41,57.38],[42,58.46],
  [43,59.54],[44,60.62],[45,61.70],[46,63.52],[47,65.34],[48,67.16],[49,68.98],[50,70.80],
  [51,73.32],[52,75.84],[53,78.36],[54,80.88],[55,83.40],[56,85.46],[57,87.52],[58,89.58],
  [59,91.64],[60,93.70],[61,95.08],[62,96.46],[63,97.84],[64,99.18],[65,100],[66,100],
]);

// ============================================================
// Alert type for this page
// ============================================================
interface ProjectAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metric?: string;
  metric_label?: string;
  source: string;
}

// ============================================================
// Icon & style configs
// ============================================================
const alertIconMap: Record<string, React.ComponentType<any>> = {
  Cronograma: CalendarX,
  Costo: DollarSign,
  Presupuesto: DollarSign,
  Financiero: ShieldAlert,
  Procura: Truck,
  Avance: TrendingDown,
};

const severityConfig = {
  critical: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    badgeLabel: 'CRITICA',
    card: 'border-l-4 border-l-red-500 bg-white',
    icon: 'bg-red-100 text-red-600',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    badgeLabel: 'ADVERTENCIA',
    card: 'border-l-4 border-l-amber-500 bg-white',
    icon: 'bg-amber-100 text-amber-600',
  },
  info: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    badgeLabel: 'INFORMATIVA',
    card: 'border-l-4 border-l-blue-400 bg-white',
    icon: 'bg-blue-100 text-blue-600',
  },
};

const categoryColors: Record<string, string> = {
  Cronograma: 'bg-purple-100 text-purple-700',
  Costo: 'bg-rose-100 text-rose-700',
  Presupuesto: 'bg-rose-100 text-rose-700',
  Financiero: 'bg-orange-100 text-orange-700',
  Procura: 'bg-teal-100 text-teal-700',
  Avance: 'bg-blue-100 text-blue-700',
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [customWeeks, setCustomWeeks] = useState<CustomWeekData[]>(loadCustomWeeks);
  const [eacData, setEacData] = useState(loadEAC);

  useEffect(() => { setCustomWeeks(loadCustomWeeks()); setEacData(loadEAC()); }, []);
  useEffect(() => {
    const h = () => { setCustomWeeks(loadCustomWeeks()); setEacData(loadEAC()); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  // Compute dynamic SPI
  const dynamicSPI = useMemo(() => {
    let latestWeekNum = 40, latestReal = 52.22, latestLabel = 'S-40', latestDate = '25 Mar';
    const sorted = [...customWeeks].sort((a, b) => a.weekNum - b.weekNum);
    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      latestWeekNum = last.weekNum;
      latestReal = computeProjectReal(last.values);
      latestLabel = last.label;
      latestDate = last.dateLabel;
    }
    const latestProg = weeklyProgMap.get(latestWeekNum) ?? 51.90;
    const spiReal = latestProg > 0 ? latestReal / latestProg : 0;
    return {
      weekLabel: latestLabel, weekDate: latestDate, weekNum: latestWeekNum,
      prog: latestProg, real: latestReal,
      spi: Math.round(spiReal * 100) / 100,
      desviacion: Math.round((latestReal - latestProg) * 10) / 10,
    };
  }, [customWeeks]);

  // Compute dynamic CPI
  const dynamicCPI = useMemo(() => {
    const bac = eacData.conFin;
    const ev = bac * dynamicSPI.real / 100;
    const ac = ACTUAL_COST_TOTAL;
    const cpi = ac > 0 ? ev / ac : 0;
    return { cpi: Math.round(cpi * 100) / 100, ev, ac, eacConFin: eacData.conFin, eacSinFin: eacData.sinFin };
  }, [dynamicSPI, eacData]);

  // Generate alerts
  const alerts = useMemo<ProjectAlert[]>(() => {
    const list: ProjectAlert[] = [];

    // 1. SPI — Cronograma
    if (dynamicSPI.spi < 0.95) {
      list.push({
        id: 'spi-atraso', severity: 'critical', category: 'Cronograma',
        title: `Atraso en cronograma: SPI ${dynamicSPI.spi.toFixed(2)} (${dynamicSPI.weekLabel})`,
        description: `Avance real ${dynamicSPI.real.toFixed(1)}% vs planificado ${dynamicSPI.prog.toFixed(1)}%. Desviacion: ${dynamicSPI.desviacion.toFixed(1)}%. Semana ${dynamicSPI.weekLabel} (${dynamicSPI.weekDate}).`,
        impact: 'El proyecto esta significativamente atrasado respecto a la linea base revisada. Riesgo de incumplimiento de hitos contractuales.',
        recommendation: 'Revisar ruta critica y asignar recursos adicionales a actividades con mayor desviacion. Evaluar re-programacion.',
        metric: dynamicSPI.spi.toFixed(2), metric_label: 'SPI',
        source: 'Cronograma',
      });
    } else if (dynamicSPI.spi < 1.0) {
      list.push({
        id: 'spi-leve', severity: 'warning', category: 'Cronograma',
        title: `Leve atraso en cronograma: SPI ${dynamicSPI.spi.toFixed(2)} (${dynamicSPI.weekLabel})`,
        description: `Avance real ${dynamicSPI.real.toFixed(1)}% vs planificado ${dynamicSPI.prog.toFixed(1)}%. Desviacion: ${dynamicSPI.desviacion.toFixed(1)}%.`,
        impact: 'Atraso menor que puede acumularse si no se atiende. Monitorear semanalmente.',
        recommendation: 'Verificar actividades de ruta critica y confirmar que los recursos estan disponibles para las proximas semanas.',
        metric: dynamicSPI.spi.toFixed(2), metric_label: 'SPI',
        source: 'Cronograma',
      });
    } else {
      list.push({
        id: 'spi-ok', severity: 'info', category: 'Cronograma',
        title: `Avance en tiempo: SPI ${dynamicSPI.spi.toFixed(2)} (${dynamicSPI.weekLabel})`,
        description: `Avance real ${dynamicSPI.real.toFixed(1)}% vs planificado ${dynamicSPI.prog.toFixed(1)}%. Desviacion: +${dynamicSPI.desviacion.toFixed(1)}%.`,
        impact: 'El proyecto avanza segun lo planificado o por encima.',
        recommendation: 'Mantener el ritmo actual y monitorear actividades proximas a iniciar.',
        metric: dynamicSPI.spi.toFixed(2), metric_label: 'SPI',
        source: 'Cronograma',
      });
    }

    // 2. CPI — Caso de Negocio + Flujo de Caja
    if (dynamicCPI.cpi < 0.9) {
      list.push({
        id: 'cpi-sobrecosto', severity: 'critical', category: 'Costo',
        title: `Sobrecosto: CPI ${dynamicCPI.cpi.toFixed(2)}`,
        description: `EV ${formatCOP(dynamicCPI.ev)} vs AC ${formatCOP(dynamicCPI.ac)}. El costo real supera el valor ganado.`,
        impact: 'El proyecto esta gastando mas de lo presupuestado para el trabajo completado. Riesgo de perdida financiera.',
        recommendation: 'Analizar partidas con mayor desviacion de costo. Renegociar contratos o reducir alcance no critico.',
        metric: dynamicCPI.cpi.toFixed(2), metric_label: 'CPI',
        source: 'Caso de Negocio + Flujo de Caja',
      });
    } else if (dynamicCPI.cpi < 1.0) {
      list.push({
        id: 'cpi-ajustado', severity: 'warning', category: 'Costo',
        title: `CPI ajustado: ${dynamicCPI.cpi.toFixed(2)}`,
        description: `EV ${formatCOP(dynamicCPI.ev)} vs AC ${formatCOP(dynamicCPI.ac)}. Costo cercano al presupuesto.`,
        impact: 'El margen de costo es reducido. Cualquier gasto imprevisto puede generar sobrecosto.',
        recommendation: 'Monitorear gastos semanalmente y controlar ordenes de compra pendientes.',
        metric: dynamicCPI.cpi.toFixed(2), metric_label: 'CPI',
        source: 'Caso de Negocio + Flujo de Caja',
      });
    } else {
      list.push({
        id: 'cpi-eficiente', severity: 'info', category: 'Costo',
        title: `CPI eficiente: ${dynamicCPI.cpi.toFixed(2)} (${((dynamicCPI.cpi - 1) * 100).toFixed(0)}% bajo presupuesto)`,
        description: `EV ${formatCOP(dynamicCPI.ev)} vs AC ${formatCOP(dynamicCPI.ac)}. Costo real por debajo del presupuestado.`,
        impact: 'Eficiencia en costos favorable. El proyecto genera mas valor del que cuesta.',
        recommendation: 'Mantener control de costos actual. Documentar lecciones aprendidas de ahorro.',
        metric: dynamicCPI.cpi.toFixed(2), metric_label: 'CPI',
        source: 'Caso de Negocio + Flujo de Caja',
      });
    }

    // 3. Ejecucion presupuestal
    const pctEjecutado = (dynamicCPI.ac / dynamicCPI.eacConFin) * 100;
    list.push({
      id: 'ejecucion',
      severity: pctEjecutado > 80 ? 'critical' : pctEjecutado > 50 ? 'warning' : 'info',
      category: 'Presupuesto',
      title: `Ejecucion presupuestal: ${pctEjecutado.toFixed(1)}% del EAC`,
      description: `Costo real ${formatCOP(dynamicCPI.ac)} de ${formatCOP(dynamicCPI.eacConFin)} presupuestado (Caso de Negocio con financiacion).`,
      impact: pctEjecutado > 80 ? 'Alto porcentaje del presupuesto ya ejecutado.' : pctEjecutado > 50 ? 'Mas de la mitad del presupuesto ejecutado.' : 'Ejecucion dentro de lo esperado para el avance actual.',
      recommendation: pctEjecutado > 50 ? 'Revisar proyeccion de gastos restantes y confirmar disponibilidad de fondos.' : 'Continuar monitoreo regular del flujo de caja.',
      metric: `${pctEjecutado.toFixed(1)}%`, metric_label: 'Ejecutado',
      source: 'Flujo de Caja vs Caso de Negocio',
    });

    // 4. Alertas fijas del proyecto
    list.push({
      id: 'rebaseline', severity: 'critical', category: 'Cronograma',
      title: 'Re-baseline: cronograma extendido 48 dias',
      description: 'Cronograma re-baselineado de 405 a 453 dias (fin: 16 Sep 2026 vs 30 Jul 2026 original). SPI contractual = 0.73 (27% atrasado). Fecha contractual: 3 Jul 2026.',
      impact: 'Extension de 48 dias genera costos adicionales de administracion y financiacion. Riesgo de penalidad contractual.',
      recommendation: 'Documentar causa raiz ante el cliente. Negociar extension formal del plazo contractual.',
      metric: '0.73', metric_label: 'SPI Contr.',
      source: 'Cronograma',
    });

    list.push({
      id: 'financieros', severity: 'critical', category: 'Financiero',
      title: 'Causa raiz del atraso: problemas financieros',
      description: 'Segun reporte Patio Sur (7 mar): "Retraso en inicio de actividades por problemas financieros de PC MEJIA". Solo $7,511M cobrados de $16,745M facturados (45%).',
      impact: 'Flujo de caja negativo afecta capacidad de compra de materiales y pago a subcontratistas.',
      recommendation: 'Gestionar cobro inmediato de facturas pendientes. Evaluar linea de credito adicional.',
      metric: '45%', metric_label: 'Cobrado',
      source: 'Reporte semanal',
    });

    list.push({
      id: 'comp-reactiva', severity: 'critical', category: 'Presupuesto',
      title: 'Compensacion Reactiva: margen negativo -37.4%',
      description: 'Costo estimado ($751.9M) supera venta ($547.2M). Perdida confirmada de $204.7M en este capitulo.',
      impact: 'Perdida directa en este capitulo que reduce el margen global del proyecto.',
      recommendation: 'Negociar precio con proveedor o solicitar cambio de alcance al cliente. Documentar para reclamo.',
      metric: '-37.4%', metric_label: 'Margen',
      source: 'Caso de Negocio',
    });

    list.push({
      id: 'credito', severity: 'warning', category: 'Financiero',
      title: 'Credito puente $17,000M al 13.66% anual',
      description: 'Desembolso 6 Feb 2026. Pago bullet Feb 2027. Intereses totales ~$3,711M (9% del contrato). Cobro de facturacion con 9 meses de desfase.',
      impact: 'Costo financiero significativo que reduce la utilidad neta del proyecto. $3,711M en intereses.',
      recommendation: 'Acelerar cobro de facturacion para reducir periodo de uso del credito. Evaluar pago parcial anticipado.',
      metric: '13.66%', metric_label: 'Tasa',
      source: 'Flujo de Caja',
    });

    list.push({
      id: 'pendiente', severity: 'warning', category: 'Procura',
      title: '40% del presupuesto pendiente de negociar',
      description: '$11,132M de $28,082M aun sin adjudicar. Ahorro en compras logrado: $3,790M (15.6%). Principales pendientes: cables BT/DC, SPE, compensacion reactiva.',
      impact: 'Riesgo de aumento de precios en materiales pendientes. Volatilidad del mercado afecta proyeccion.',
      recommendation: 'Priorizar negociacion de capitulos de mayor monto. Solicitar cotizaciones multiples para asegurar precio.',
      metric: '40%', metric_label: 'Pendiente',
      source: 'Caso de Negocio',
    });

    return list;
  }, [dynamicSPI, dynamicCPI]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

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
            Patio de Operacion Sur — OE 1035 — {alerts.length} alertas activas
          </p>
        </div>
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
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-sm font-bold text-blue-700">{infoCount}</span>
            <span className="text-xs text-blue-600">Informativas</span>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const IconComponent = alertIconMap[alert.category] || AlertTriangle;

          return (
            <div
              key={alert.id}
              className={clsx(
                'rounded-xl border border-steel-200 shadow-card overflow-hidden transition-all hover:shadow-card-hover',
                config.card,
              )}
            >
              <div className="px-6 py-4 flex items-start gap-4">
                <div className={clsx('rounded-xl p-3 flex-shrink-0 mt-0.5', config.icon)}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={clsx('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', config.badge)}>
                      {config.badgeLabel}
                    </span>
                    <span className={clsx('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', categoryColors[alert.category] || 'bg-steel-100 text-steel-600')}>
                      {alert.category}
                    </span>
                    <span className="text-[10px] text-steel-400 ml-auto flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Fuente: {alert.source}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-steel-900 leading-snug">{alert.title}</h3>
                  <p className="text-xs text-steel-600 mt-2 leading-relaxed">{alert.description}</p>
                </div>
                {alert.metric && (
                  <div className="flex-shrink-0 text-center hidden sm:block">
                    <p className={clsx('text-xl font-bold', alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600')}>
                      {alert.metric}
                    </p>
                    <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium mt-0.5">
                      {alert.metric_label}
                    </p>
                  </div>
                )}
              </div>

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
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-[10px] font-bold text-steel-500 uppercase tracking-wide">Recomendacion</p>
                  </div>
                  <p className="text-[11px] text-steel-700 leading-relaxed">{alert.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-steel-50 border border-steel-200 p-4">
        <p className="text-[11px] text-steel-500 leading-relaxed">
          <strong className="text-steel-600">Fuentes:</strong> Cronograma (Curva S), Caso de Negocio (Detallado), Flujo de Caja (Pagos Proyeccion), Reporte de seguimiento semanal. Las alertas de SPI, CPI y ejecucion presupuestal se actualizan automaticamente.
        </p>
      </div>
    </div>
  );
}
