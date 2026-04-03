import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  X,
  Loader,
  BarChart2,
  CalendarClock,
} from 'lucide-react';
import clsx from 'clsx';
import KPICard from '@/components/common/KPICard';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import HelpButton from '@/components/common/HelpButton';
import { dashboardApi } from '@/services/api/dashboard';
import { formatCOP, formatPercent, formatRatio } from '@/utils/formatNumbers';

const dashboardHelp = {
  pageTitle: 'Ayuda — Dashboard',
  description:
    'El Dashboard presenta una vista ejecutiva del estado del proyecto Patio de Operacion Sur. ' +
    'Incluye indicadores financieros (EVM), avance fisico vs planificado (Curva S), resumen presupuestario, ' +
    'alertas de riesgo, flujo de caja y datos contractuales.',
  pdfUrl: '/docs/Informe_Dashboard_Metricas.pdf',
  pdfName: 'Informe_Dashboard_Metricas.pdf',
  sections: [
    {
      title: 'Tarjetas KPI — Fila 1',
      items: [
        { color: '#1B5EAB', label: 'Valor Total Oferta (BAC) = $41,012M', description: 'Precio global fijo de la oferta mercantil. Fuente: Detallado caso de negocio_220126.xlsx, hoja "Costo vs Venta".' },
        { color: '#4A4D56', label: 'Costo Real (ACWP) = $8,530M', description: 'Materiales $7,552M + Admin $500M. Fuente: Patio Sur_.xlsx. 20.8% del BAC ejecutado.' },
        { color: '#16A34A', label: 'CPI = 2.51', description: 'EV/AC. Alto porque EV se calcula sobre precio de venta ($41B) y AC es costo real ($8.5B). Refleja margen contractual + ahorro compras $3,790M.' },
        { color: '#D97706', label: 'SPI = 1.01 / 0.73', description: 'Dos valores: 1.01 vs linea base revisada (19 mar, en tiempo) y 0.73 vs linea base contractual (27 nov, 27% atrasado). Re-baseline de +48 dias.' },
      ],
    },
    {
      title: 'Tarjetas KPI — Fila 2',
      items: [
        { color: '#1B5EAB', label: 'Valor Ganado (BCWP) = $21,416M', description: 'BAC x 52.22% avance fisico. Fuente: Curva S (19 mar).xlsx, semana S-40 (25 Mar 2026). 516 actividades ponderadas.' },
        { color: '#16A34A', label: 'EAC = $25,157M', description: 'Proyeccion bottom-up del equipo financiero. VAC = $15,855M (utilidad proyectada 38.7%). Fuente: pagos Proyeccion de Pagos.xlsx.' },
        { color: '#DC2626', label: 'Alertas Activas: 6', description: '3 criticas (re-baseline, problemas financieros, comp. reactiva) + 2 advertencias (credito, pendiente negociar) + 1 informativa (Curva S).' },
      ],
    },
    {
      title: 'Curva S — Fuente: Curva S (19 mar).xlsx',
      items: [
        { color: '#1B5EAB', label: 'Linea Azul — Planificado (Base Revisada)', description: '67 semanas (S-00 a S-66). Semana S-40: 51.9%. Duracion: 453 dias (20 Jun 2025 - 16 Sep 2026). 516 actividades.' },
        { color: '#16A34A', label: 'Linea Verde — Avance Real', description: 'Semana S-40 (25 Mar): 52.2%. Desviacion: +0.3%. En tiempo vs base revisada. SPI = 1.006.' },
        { color: '#DC2626', label: 'Nota: Base Original (27 Nov)', description: 'El cronograma original tenia 405 dias (fin 30 Jul 2026). SPI contractual = 0.73. Se extendio 48 dias adicionales.' },
      ],
    },
    {
      title: 'Resumen Presupuestario',
      items: [
        { color: '#a9c8eb', label: 'Original / Vigente = $41,012M', description: 'BAC sin modificaciones. Fuente: Oferta Mercantil.' },
        { color: '#1b5eab', label: 'Comprometido = $13,159M (54.2%)', description: 'Contratos y OC adjudicados. Fuente: caso de negocio, hoja "Ejecucion vs Caso de Negocio".' },
        { color: '#dc2626', label: 'Ejecutado = $8,053M', description: 'Costos reales: materiales + admin. Fuente: Patio Sur_.xlsx.' },
        { color: '#16a34a', label: 'Disponible = $27,853M', description: 'Vigente - Comprometido. Nota: $11,132M pendientes de negociar (40% del costo directo).' },
      ],
    },
    {
      title: 'Flujo de Caja — Fuente: Flujo de caja patio sur 26 marzo.xlsx',
      items: [
        { color: '#a9c8eb', label: 'Ingresos', description: 'Facturacion Feb $16,745M (cobrado $7,511M). Proximos: Abr $5,220M, Jun $2,000M, Oct $17,714M. Cobro con 9 meses de desfase.' },
        { color: '#fbbf24', label: 'Egreso Proyectado', description: 'Pico en Feb-May 2026 ($7.2B-$3.6B/mes). Materiales pesados: cargadores, estructura, cables. Fuente: FC X OBRAS.' },
        { color: '#dc2626', label: 'Egreso Real', description: 'Pagos reales registrados: Feb $7,593M + Mar $1,003M. Fuente: pagos Proyeccion de Pagos.xlsx.' },
        { color: '#16a34a', label: 'Credito Puente', description: '$17,000M al IBR+2.85% (13.66% EA). Intereses totales ~$3,711M. Vencimiento bullet Feb 2027.' },
      ],
    },
    {
      title: 'Analisis EVM',
      items: [
        { icon: '📊', label: 'BAC=$41B, PV=$21.3B, EV=$21.4B, AC=$8.5B', description: 'PV y EV calculados sobre linea base revisada 19 mar. AC de Patio Sur_.xlsx (materiales + admin).' },
        { icon: '📈', label: 'CPI = 2.51', description: 'Muy eficiente porque EV es sobre precio de venta y AC es costo real. Consistente con margen 28.2% + ahorro compras.' },
        { icon: '📉', label: 'SPI Contractual = 0.73', description: '27% atrasado vs plan original. Causa raiz: problemas financieros PC Mejia (Patio Sur_.xlsx).' },
        { icon: '🎯', label: 'EAC = $25,157M → Utilidad = $15,855M (38.7%)', description: 'Proyeccion bottom-up del equipo. Incluye intereses credito $3,711M. Superior al margen original de 28.2%.' },
      ],
    },
  ],
};
import SCurveChart from '@/components/dashboard/SCurveChart';
import ChapterBreakdownChart from '@/components/dashboard/ChapterBreakdownChart';
import { generateProjectStatusPDF } from '@/utils/generatePDF';
import { generateProjectStatusExcel } from '@/utils/generateExcel';

// Real project data from Oferta Mercantil and Presupuesto
const dashboardData = {
  project: {
    name: 'Patio de Operacion Sur',
    code: 'OE 1035',
    status: 'in_progress',
    client_name: 'Consorcio Express S.A.S.',
    contractor_name: 'PC Mejia Ingenieria S.A.',
    total_budget: 41012884481,
    total_cost: 29457164387,
    currency: 'COP',
  },
  budget_summary: {
    total_original_budget: 41012884481,
    total_approved_changes: 0,
    total_current_budget: 41012884481,
    total_committed: 13159418623,
    total_actual: 8530521315,
    total_available: 27853465858,
    consumption_percentage: 20.8,
  },
  // Fuente: Flujo de caja patio sur 26 marzo.xlsx (FC X OBRAS) + Pagos Proyeccion.xlsx (Otros Pagos)
  cash_flow_entries: [
    { id: '1', project_id: '', year: 2025, month: 10, period_label: 'Oct 2025', projected_income: 0, projected_expense: 235139266, projected_net: -235139266, actual_income: 0, actual_expense: 235139266, actual_net: -235139266, is_negative_cash_flow: true },
    { id: '2', project_id: '', year: 2025, month: 11, period_label: 'Nov 2025', projected_income: 0, projected_expense: 19000000, projected_net: -19000000, actual_income: 0, actual_expense: 954984, actual_net: -954984, is_negative_cash_flow: true },
    { id: '3', project_id: '', year: 2025, month: 12, period_label: 'Dic 2025', projected_income: 0, projected_expense: 361000000, projected_net: -361000000, actual_income: 0, actual_expense: 198015049, actual_net: -198015049, is_negative_cash_flow: true },
    { id: '4', project_id: '', year: 2026, month: 1, period_label: 'Ene 2026', projected_income: 0, projected_expense: 350000000, projected_net: -350000000, actual_income: 0, actual_expense: 316045103, actual_net: -316045103, is_negative_cash_flow: true },
    { id: '5', project_id: '', year: 2026, month: 2, period_label: 'Feb 2026', projected_income: 16745324701, projected_expense: 7234000000, projected_net: 9511324701, actual_income: 16745324701, actual_expense: 7593000000, actual_net: 9152324701, is_negative_cash_flow: false },
    { id: '6', project_id: '', year: 2026, month: 3, period_label: 'Mar 2026', projected_income: 0, projected_expense: 2719000000, projected_net: -2719000000, actual_income: 0, actual_expense: 1003716497, actual_net: -1003716497, is_negative_cash_flow: true },
    { id: '7', project_id: '', year: 2026, month: 4, period_label: 'Abr 2026', projected_income: 5220402000, projected_expense: 4390000000, projected_net: 830402000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: false },
    { id: '8', project_id: '', year: 2026, month: 5, period_label: 'May 2026', projected_income: 0, projected_expense: 3626000000, projected_net: -3626000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
    { id: '9', project_id: '', year: 2026, month: 6, period_label: 'Jun 2026', projected_income: 2000000000, projected_expense: 2646000000, projected_net: -646000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
    { id: '10', project_id: '', year: 2026, month: 7, period_label: 'Jul 2026', projected_income: 0, projected_expense: 2017135279, projected_net: -2017135279, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
    { id: '11', project_id: '', year: 2026, month: 8, period_label: 'Ago 2026', projected_income: 0, projected_expense: 2052859877, projected_net: -2052859877, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
    { id: '12', project_id: '', year: 2026, month: 9, period_label: 'Sep 2026', projected_income: 0, projected_expense: 584499127, projected_net: -584499127, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
    { id: '13', project_id: '', year: 2026, month: 10, period_label: 'Oct 2026', projected_income: 17714279534, projected_expense: 500000000, projected_net: 17214279534, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: false },
    { id: '14', project_id: '', year: 2026, month: 11, period_label: 'Nov 2026', projected_income: 16207000000, projected_expense: 300000000, projected_net: 15907000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: false },
  ],
  // Alertas actualizadas con datos reales del analisis de archivos SharePoint
  alerts: [
    { id: '1', severity: 'critical' as const, title: 'Re-baseline: cronograma extendido 48 dias', message: 'Cronograma re-baselineado de 405 a 453 dias (fin: 16 Sep 2026 vs 30 Jul 2026 original). SPI contractual = 0.73 (27% atrasado). Fecha contractual: 3 Jul 2026.' },
    { id: '2', severity: 'critical' as const, title: 'Causa raiz del atraso: problemas financieros', message: 'Segun reporte Patio Sur (7 mar): "Retraso en inicio de actividades por problemas financieros de PC MEJIA". Solo $7,511M cobrados de $16,745M facturados (45%).' },
    { id: '3', severity: 'critical' as const, title: 'Compensacion Reactiva: margen negativo -37.4%', message: 'Costo estimado ($751.9M) supera venta ($547.2M). Perdida confirmada de $204.7M en este capitulo.' },
    { id: '4', severity: 'warning' as const, title: 'Credito puente $17,000M al 13.66% anual', message: 'Desembolso 6 Feb 2026. Pago bullet Feb 2027. Intereses totales ~$3,711M (9% del contrato). Cobro de facturacion con 9 meses de desfase.' },
    { id: '5', severity: 'warning' as const, title: '40% del presupuesto pendiente de negociar', message: '$11,132M de $28,082M aun sin adjudicar. Ahorro en compras logrado: $3,790M (15.6%). Principales pendientes: cables BT/DC, SPE, compensacion reactiva.' },
    { id: '6', severity: 'info' as const, title: 'Avance Curva S re-baselineada: en tiempo', message: 'Semana S-40 (25 Mar): Planificado 51.9% vs Real 52.2%. SPI (base revisada) = 1.006. Desviacion: +0.3%.' },
  ],
  counts: {
    recent_transactions: 47,
    pending_invoices: 12,
    overdue_invoices: 3,
  },
  earned_value: {
    bac: 41012884481,
    actual_cost: 8530521315,
    earned_value_amount: 21416929000,   // BAC × 52.22% (Curva S 19 mar, semana S-40)
    planned_value_amount: 21285687000,  // BAC × 51.90% (linea base revisada 19 mar)
    cpi: 1.17,                          // Costo presupuestado / EAC bottom-up = $29,457M / $25,157M
    cpi_contractual: 2.51,              // EV / AC (sobre venta) — inflado por margen contractual
    spi: 1.01,                          // EV / PV — en tiempo vs linea base revisada
    spi_contractual: 0.73,              // SPI vs linea base original (27 nov) — 27% atrasado
    eac: 25157352188,                   // Proyeccion bottom-up del equipo (archivo Pagos)
  },
};

// Formatting function is now imported from formatNumbers.ts

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCPIDetail, setShowCPIDetail] = useState(false);
  const [showCostoDetail, setShowCostoDetail] = useState(false);
  const [showSPIDetail, setShowSPIDetail] = useState(false);

  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: () => (projectId ? dashboardApi.get(projectId) : Promise.reject('No project ID')),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Merge API data with hardcoded defaults for fields the API doesn't yet compute
  const data = {
    ...dashboardData,
    ...(apiData ? {
      project: { ...dashboardData.project, ...apiData.project },
      budget_summary: { ...dashboardData.budget_summary, ...apiData.budget_summary },
      cash_flow_summary: apiData.cash_flow_summary,
      counts: { ...dashboardData.counts, ...apiData.counts },
      earned_value: { ...dashboardData.earned_value, ...apiData.earned_value },
    } : {}),
  };

  const costoPresupuestado = 29457164387;
  const eacBottomUp = data.earned_value.eac;
  const ahorroCompras = 3790285190;
  const ahorroTotal = costoPresupuestado - eacBottomUp;
  const margenOriginal = 28.2;
  const margenProyectado = ((data.earned_value.bac - eacBottomUp) / data.earned_value.bac * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">
            Dashboard — {data.project.name}
          </h2>
          <p className="text-xs text-steel-400 mt-1">
            Codigo: {data.project.code} | Contratista: {data.project.contractor_name} |
            Cliente: {data.project.client_name} |{' '}
            Estado:{' '}
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              En Progreso
            </span>
          </p>
          <p className="text-[11px] text-steel-400 mt-0.5">
            Marco: Otrosi No. 23 - Contrato de Concesion No. 009 de 2010 (Transmilenio S.A.) | Plazo: 15 meses | Inicio: 20 Jun 2025 | Fin contractual: 3 Jul 2026 | Fin revisado: 16 Sep 2026
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton {...dashboardHelp} />
          <button
            onClick={() => void generateProjectStatusPDF()}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition shadow-sm"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => generateProjectStatusExcel()}
            className="rounded-lg border border-steel-300 bg-white px-4 py-2 text-sm font-medium text-steel-600 hover:bg-steel-50 transition"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Valor Total Oferta"
          value={formatCOP(data.budget_summary.total_current_budget)}
          subtitle="BAC - Precio Global Fijo (inc. IVA, AIU)"
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Costo Real (ACWP)"
          value={formatCOP(data.earned_value.actual_cost)}
          subtitle={`${data.budget_summary.consumption_percentage}% ejecutado · Ver costo estimado`}
          icon={TrendingDown}
          trend={data.budget_summary.consumption_percentage > 90 ? 'down' : 'neutral'}
          trendValue={`${data.budget_summary.consumption_percentage}%`}
          variant={data.budget_summary.consumption_percentage > 95 ? 'danger' : 'default'}
          onClick={() => setShowCostoDetail(true)}
        />
        <KPICard
          title="CPI Contractual (Referencia)"
          value={data.earned_value.cpi_contractual.toFixed(2)}
          subtitle="EV/AC sobre precio de venta — Margen contractual"
          icon={Target}
          trend="up"
          variant="success"
          onClick={() => setShowCPIDetail(true)}
        />
        <KPICard
          title="SPI (Indice Cronograma)"
          value={`${data.earned_value.spi.toFixed(2)} / ${data.earned_value.spi_contractual.toFixed(2)}`}
          subtitle={`Revisado: en tiempo | Contractual: -27% · Ver detalle`}
          icon={Clock}
          trend={data.earned_value.spi_contractual >= 1 ? 'up' : 'down'}
          variant={'warning'}
          onClick={() => setShowSPIDetail(true)}
        />
      </div>

      {/* Second KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <KPICard
          title="EAC (Costo Estimado Final)"
          value={formatCOP(data.earned_value.eac)}
          subtitle={`VAC: ${formatCOP(data.earned_value.bac - data.earned_value.eac)} — Utilidad proyectada ${margenProyectado.toFixed(1)}%`}
          icon={TrendingUp}
          variant={data.earned_value.eac > data.earned_value.bac ? 'warning' : 'success'}
        />
        <KPICard
          title="Alertas Activas"
          value={data.alerts.length}
          subtitle={`${data.alerts.filter((a) => a.severity === 'critical').length} criticas · Ver todas`}
          icon={AlertTriangle}
          variant={data.alerts.some((a) => a.severity === 'critical') ? 'danger' : 'warning'}
          onClick={() => navigate(`/projects/${projectId}/alerts`)}
        />
      </div>

      {/* S-Curve Chart */}
      <SCurveChart />

      {/* Chapter Breakdown Chart */}
      <ChapterBreakdownChart />

      {/* Cash Flow Chart */}
      <CashFlowChart entries={data.cash_flow_entries} />

      {/* Contract Summary Section */}
      <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
        <h3 className="text-base font-bold text-steel-800 mb-4">
          Resumen del Contrato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Oferente</p>
            <p className="font-bold text-steel-800">PC Mejia Ingenieria S.A.</p>
            <p className="text-[11px] text-steel-400">NIT: 811.025.231-5 | Itagui, Antioquia</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Representante Legal</p>
            <p className="font-bold text-steel-800">PC Mejia Ingenieria S.A.</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Aceptante</p>
            <p className="font-bold text-steel-800">Consorcio Express S.A.S.</p>
            <p className="text-[11px] text-steel-400">NIT: 900.365.740-3 | Bogota</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Objeto</p>
            <p className="font-semibold text-[11px] text-steel-700">Estudios, Disenos, Ingenieria de Detalle, Construccion, Instalacion, Pruebas y Puesta en Marcha de la IRE del Patio de Operacion Sur</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Capacidad</p>
            <p className="font-bold text-steel-800">116 buses: 42 articulados + 74 autobuses</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Forma de Pago</p>
            <p className="font-bold text-steel-800">Pago total contra entrega</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <p className="text-steel-400 text-xs font-medium">Clausula Penal</p>
            <p className="font-bold text-red-600">20% = {formatCOP(41012884481 * 0.20)}</p>
          </div>
          <div className="p-3 rounded-lg bg-steel-50">
            <p className="text-steel-400 text-xs font-medium">Garantias</p>
            <p className="text-[11px] text-steel-700">Cumplimiento 20% | Salarios 10% | Calidad 20% | Estabilidad 30% | RC 20%</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-steel-400 text-xs font-medium">Margen Estimado del Proyecto</p>
            <p className="font-bold text-emerald-600">28.2% ({formatCOP(41012884481 - 29457164387)})</p>
          </div>
        </div>
      </div>

      {/* Earned Value Analysis Section */}
      <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
        <h3 className="text-base font-bold text-steel-800 mb-4">
          Analisis de Valor Ganado (EVM)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-200 bg-steel-50">
                <th className="px-4 py-3 text-left font-semibold text-steel-600 text-xs">Indicador</th>
                <th className="px-4 py-3 text-left font-semibold text-steel-600 text-xs">Sigla</th>
                <th className="px-4 py-3 text-right font-semibold text-steel-600 text-xs">Valor</th>
                <th className="px-4 py-3 text-left font-semibold text-steel-600 text-xs">Interpretacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              <tr className="hover:bg-steel-50/50">
                <td className="px-4 py-3 text-steel-700">Presupuesto a la Terminacion</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 font-semibold">BAC</td>
                <td className="px-4 py-3 text-right font-semibold text-steel-800">{formatCOP(data.earned_value.bac)}</td>
                <td className="px-4 py-3 text-steel-400 text-xs">Precio global fijo de la oferta</td>
              </tr>
              <tr className="hover:bg-steel-50/50">
                <td className="px-4 py-3 text-steel-700">Valor Planificado</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 font-semibold">PV / BCWS</td>
                <td className="px-4 py-3 text-right font-semibold text-steel-800">{formatCOP(data.earned_value.planned_value_amount)}</td>
                <td className="px-4 py-3 text-steel-400 text-xs">51.9% — Trabajo planificado a semana S-40 (linea base revisada 19 mar)</td>
              </tr>
              <tr className="hover:bg-steel-50/50">
                <td className="px-4 py-3 text-steel-700">Valor Ganado</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 font-semibold">EV / BCWP</td>
                <td className="px-4 py-3 text-right font-semibold text-steel-800">{formatCOP(data.earned_value.earned_value_amount)}</td>
                <td className="px-4 py-3 text-steel-400 text-xs">52.2% — Trabajo realmente completado (Curva S semana S-40, 25 Mar 2026)</td>
              </tr>
              <tr className="hover:bg-steel-50/50">
                <td className="px-4 py-3 text-steel-700">Costo Real</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 font-semibold">AC / ACWP</td>
                <td className="px-4 py-3 text-right font-semibold text-steel-800">{formatCOP(data.earned_value.actual_cost)}</td>
                <td className="px-4 py-3 text-steel-400 text-xs">Lo que realmente se ha gastado</td>
              </tr>
              <tr className="bg-emerald-50/60 cursor-pointer hover:bg-emerald-100/60 transition" onClick={() => setShowCPIDetail(true)}>
                <td className="px-4 py-3 font-semibold text-steel-800">Indice Rendimiento Costo</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-700 font-bold">CPI</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700 text-lg">{data.earned_value.cpi.toFixed(2)}</td>
                <td className="px-4 py-3 text-steel-600 text-xs">17% bajo presupuesto. Ahorro proyectado $4,299M. <span className="text-primary-600 underline">Ver detalle</span></td>
              </tr>
              <tr className="bg-emerald-50/60">
                <td className="px-4 py-3 font-semibold text-steel-800">SPI (Linea Base Revisada 19 Mar)</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-700 font-bold">SPI Rev.</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700 text-lg">{data.earned_value.spi.toFixed(2)}</td>
                <td className="px-4 py-3 text-steel-600 text-xs">En tiempo vs cronograma revisado (453 dias, fin 16 Sep 2026)</td>
              </tr>
              <tr className="bg-red-50/60">
                <td className="px-4 py-3 font-semibold text-steel-800">SPI (Linea Base Contractual 27 Nov)</td>
                <td className="px-4 py-3 font-mono text-xs text-red-700 font-bold">SPI Contr.</td>
                <td className="px-4 py-3 text-right font-bold text-red-700 text-lg">{data.earned_value.spi_contractual.toFixed(2)}</td>
                <td className="px-4 py-3 text-steel-600 text-xs">27% atrasado vs plan original (405 dias, fin 30 Jul 2026). Re-baseline de +48 dias</td>
              </tr>
              <tr className="bg-emerald-50/60">
                <td className="px-4 py-3 font-semibold text-steel-800">Estimacion a la Terminacion</td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600 font-bold">EAC</td>
                <td className="px-4 py-3 text-right font-bold text-steel-800">{formatCOP(data.earned_value.eac)}</td>
                <td className="px-4 py-3 text-steel-600 text-xs">Costo total estimado (por debajo del BAC gracias al CPI favorable)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Costo Real Detail Modal */}
      {showCostoDetail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowCostoDetail(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCostoDetail(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-steel-800 to-steel-700 rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-white">Costo Real vs Costo Estimado a Terminacion</h3>
                  <p className="text-xs text-steel-300 mt-0.5">Fuente: Patio Sur_.xlsx + Caso de Negocio (Pagos Proyeccion)</p>
                </div>
                <button onClick={() => setShowCostoDetail(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Main comparison cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-steel-300 bg-steel-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-steel-500 uppercase tracking-wider">Costo Real (ACWP)</p>
                    <p className="text-[10px] text-steel-400 mb-1">Lo que se ha gastado hoy</p>
                    <p className="text-3xl font-black text-steel-800">{formatCOP(data.earned_value.actual_cost)}</p>
                    <p className="text-xs text-steel-500 mt-1 font-medium">{data.budget_summary.consumption_percentage}% del presupuesto</p>
                  </div>
                  <div className="rounded-xl border-2 border-primary-300 bg-primary-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider">Costo Estimado Final (EAC)</p>
                    <p className="text-[10px] text-primary-400 mb-1">Proyeccion bottom-up al cierre</p>
                    <p className="text-3xl font-black text-primary-800">{formatCOP(eacBottomUp)}</p>
                    <p className="text-xs text-primary-600 mt-1 font-medium">Fuente: Caso de Negocio</p>
                  </div>
                </div>

                {/* Desglose Costo Real */}
                <div>
                  <p className="text-xs font-bold text-steel-700 mb-2 flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5 text-steel-500" /> Desglose del Costo Real Acumulado
                  </p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-steel-100">
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Materiales (compras OC)</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(7552521315)}</td>
                        <td className="py-2 text-right text-steel-400">88.5%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Administrativos y generales</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(500000000)}</td>
                        <td className="py-2 text-right text-steel-400">5.9%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Otros pagos realizados</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(478000000)}</td>
                        <td className="py-2 text-right text-steel-400">5.6%</td>
                      </tr>
                      <tr className="bg-steel-50 font-semibold">
                        <td className="py-2 text-steel-700">Total Ejecutado (ACWP)</td>
                        <td className="py-2 text-right text-steel-900">{formatCOP(data.earned_value.actual_cost)}</td>
                        <td className="py-2 text-right text-steel-600">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Proyeccion de costo total */}
                <div>
                  <p className="text-xs font-bold text-steel-700 mb-2 flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5 text-primary-500" /> Proyeccion Costo Total a Terminacion (EAC)
                  </p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-steel-100">
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Materiales</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(21511513454)}</td>
                        <td className="py-2 text-right text-steel-400">85.5%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Mano de Obra</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(1681443883)}</td>
                        <td className="py-2 text-right text-steel-400">6.7%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Administrativos</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(772769364)}</td>
                        <td className="py-2 text-right text-steel-400">3.1%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600 text-red-500">Intereses credito puente</td>
                        <td className="py-2 text-right font-semibold text-red-600">{formatCOP(3158392500)}</td>
                        <td className="py-2 text-right text-steel-400">4.7%</td>
                      </tr>
                      <tr className="border-t-2 border-primary-200 bg-primary-50 font-bold">
                        <td className="py-2.5 text-primary-800">EAC Total (Caso de Negocio)</td>
                        <td className="py-2.5 text-right text-primary-900">{formatCOP(eacBottomUp)}</td>
                        <td className="py-2.5 text-right text-primary-700">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Vs presupuesto */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-steel-50 border border-steel-200 p-3 text-center">
                    <p className="text-[10px] text-steel-400 font-medium uppercase">Presupuesto Directo</p>
                    <p className="text-lg font-bold text-steel-700 mt-1">{formatCOP(costoPresupuestado)}</p>
                    <p className="text-[10px] text-steel-400">Caso de Negocio</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                    <p className="text-[10px] text-emerald-600 font-medium uppercase">Ahorro Proyectado</p>
                    <p className="text-lg font-bold text-emerald-700 mt-1">{formatCOP(ahorroTotal)}</p>
                    <p className="text-[10px] text-emerald-500">vs presupuesto</p>
                  </div>
                  <div className="rounded-xl bg-primary-50 border border-primary-200 p-3 text-center">
                    <p className="text-[10px] text-primary-600 font-medium uppercase">Utilidad Proyectada</p>
                    <p className="text-lg font-bold text-primary-800 mt-1">{margenProyectado.toFixed(1)}%</p>
                    <p className="text-[10px] text-primary-400">vs 28.2% original</p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <p className="text-[11px] text-amber-800 font-semibold">Nota Gerencial</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    Los valores proyectados del <strong>Costo Estimado Final (EAC)</strong> provienen del Caso de Negocio (Pagos Proyeccion Patio Sur). El costo real actual representa solo el <strong>{data.budget_summary.consumption_percentage}%</strong> del total proyectado — el grueso de los pagos de materiales esta programado entre Abr–Sep 2026.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SPI Detail Modal */}
      {showSPIDetail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowSPIDetail(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSPIDetail(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-amber-700 to-amber-600 rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-white">SPI — Indice de Rendimiento del Cronograma</h3>
                  <p className="text-xs text-amber-200 mt-0.5">Real vs Proyectado (Caso de Negocio · Curva S 19 mar)</p>
                </div>
                <button onClick={() => setShowSPIDetail(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Two SPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">SPI Real</p>
                    <p className="text-[10px] text-emerald-500 mb-1">vs Linea Base Revisada (19 Mar)</p>
                    <p className="text-4xl font-black text-emerald-700">{data.earned_value.spi.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 mt-2 font-bold bg-emerald-100 rounded-lg px-2 py-1">✓ En Tiempo</p>
                    <p className="text-[10px] text-emerald-600 mt-1">EV $21,416M / PV $21,285M</p>
                  </div>
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">SPI Contractual</p>
                    <p className="text-[10px] text-red-400 mb-1">vs Linea Base Original (27 Nov)</p>
                    <p className="text-4xl font-black text-red-700">{data.earned_value.spi_contractual.toFixed(2)}</p>
                    <p className="text-xs text-red-600 mt-2 font-bold bg-red-100 rounded-lg px-2 py-1">⚠ 27% Atrasado</p>
                    <p className="text-[10px] text-red-500 mt-1">EV $21,416M / PV~$29,338M</p>
                  </div>
                </div>

                {/* Timeline comparison */}
                <div>
                  <p className="text-xs font-bold text-steel-700 mb-3 flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 text-steel-500" /> Comparativo de Cronogramas
                  </p>
                  <div className="space-y-3">
                    {/* Base Revisada */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-emerald-700">Linea Base Revisada (Re-Baseline)</p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold rounded px-2 py-0.5">SPI = 1.01</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <p className="text-steel-400">Inicio</p>
                          <p className="font-semibold text-steel-700">20 Jun 2025</p>
                        </div>
                        <div>
                          <p className="text-steel-400">Duracion</p>
                          <p className="font-semibold text-steel-700">453 dias</p>
                        </div>
                        <div>
                          <p className="text-steel-400">Fin Revisado</p>
                          <p className="font-semibold text-emerald-700">16 Sep 2026</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-steel-500 mb-1">
                          <span>Avance planificado (S-40)</span>
                          <span className="font-semibold">51.9%</span>
                        </div>
                        <div className="w-full bg-steel-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '51.9%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-steel-500 mt-1 mb-1">
                          <span>Avance real (S-40, 25 Mar 2026)</span>
                          <span className="font-semibold text-emerald-700">52.2%</span>
                        </div>
                        <div className="w-full bg-steel-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: '52.2%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Base Original */}
                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-red-700">Linea Base Original (Contractual)</p>
                        <span className="text-[10px] bg-red-100 text-red-700 font-semibold rounded px-2 py-0.5">SPI = 0.73</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <p className="text-steel-400">Inicio</p>
                          <p className="font-semibold text-steel-700">20 Jun 2025</p>
                        </div>
                        <div>
                          <p className="text-steel-400">Duracion Original</p>
                          <p className="font-semibold text-steel-700">405 dias</p>
                        </div>
                        <div>
                          <p className="text-steel-400">Fin Original</p>
                          <p className="font-semibold text-red-700">30 Jul 2026</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-steel-500 mb-1">
                          <span>Avance que deberia tener hoy</span>
                          <span className="font-semibold">~71.5%</span>
                        </div>
                        <div className="w-full bg-steel-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-red-200 h-full rounded-full" style={{ width: '71.5%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-steel-500 mt-1 mb-1">
                          <span>Avance real vs base original</span>
                          <span className="font-semibold text-red-700">52.2%</span>
                        </div>
                        <div className="w-full bg-steel-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: '52.2%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Re-baseline info */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-bold text-amber-800">Re-Baseline: +48 dias</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    El cronograma fue re-baselineado por <strong>problemas financieros de PC Mejia</strong> (retraso en inicio de actividades). La nueva linea base revisada (19 Mar 2026) extiende el plazo de 405 a 453 dias, moviendo el fin del <strong>30 Jul 2026</strong> al <strong>16 Sep 2026</strong>. La fecha contractual con Consorcio Express sigue siendo <strong>3 Jul 2026</strong>.
                  </p>
                  <p className="text-[10px] text-amber-600 mt-2 font-semibold">
                    Los valores proyectados del cronograma provienen del Caso de Negocio y la Curva S (19 mar).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CPI Detail Modal */}
      {showCPIDetail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowCPIDetail(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCPIDetail(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-primary-900 to-primary-800 rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold text-white">Analisis CPI — Indice de Rendimiento de Costo</h3>
                  <p className="text-xs text-primary-200 mt-0.5">Fuente: Caso de Negocio + Pagos Proyeccion Patio Sur</p>
                </div>
                <button onClick={() => setShowCPIDetail(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Two CPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">CPI Costo (Principal)</p>
                    <p className="text-4xl font-black text-emerald-700 mt-1">{data.earned_value.cpi.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">17% bajo presupuesto</p>
                    <div className="mt-2 px-2 py-1 bg-emerald-100 rounded-lg">
                      <p className="text-[10px] text-emerald-700">Costo Presupuestado / EAC</p>
                      <p className="text-[10px] font-mono text-emerald-800 font-bold">{formatCOP(costoPresupuestado)} / {formatCOP(eacBottomUp)}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-steel-200 bg-steel-50 p-4 text-center">
                    <p className="text-[10px] font-semibold text-steel-500 uppercase tracking-wider">CPI Contractual (Referencia)</p>
                    <p className="text-4xl font-black text-primary-700 mt-1">{data.earned_value.cpi_contractual.toFixed(2)}</p>
                    <p className="text-xs text-steel-500 mt-1 font-medium">EV / AC (sobre precio venta)</p>
                    <div className="mt-2 px-2 py-1 bg-steel-100 rounded-lg">
                      <p className="text-[10px] text-steel-600">Valor Ganado / Costo Real</p>
                      <p className="text-[10px] font-mono text-steel-700 font-bold">{formatCOP(data.earned_value.earned_value_amount)} / {formatCOP(data.earned_value.actual_cost)}</p>
                    </div>
                  </div>
                </div>

                {/* Why different */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-bold text-amber-800">Por que son diferentes?</p>
                  <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                    El CPI Contractual (2.51) compara el valor del trabajo a <strong>precio de venta</strong> ($41B) contra el costo real ($8.5B), lo que incluye el margen de utilidad del 28.2%. Para la gerencia, el <strong>CPI Costo = 1.17</strong> es mas relevante porque compara el costo presupuestado ($29.4B) contra el costo total proyectado ($25.1B), midiendo la eficiencia real sin inflar por margen.
                  </p>
                </div>

                {/* Cost Breakdown */}
                <div>
                  <p className="text-xs font-bold text-steel-700 mb-2">Desglose del Costo Total Proyectado (EAC)</p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-steel-100">
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Materiales</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(21511513454)}</td>
                        <td className="py-2 text-right text-steel-400">85.5%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Mano de Obra</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(1681443883)}</td>
                        <td className="py-2 text-right text-steel-400">6.7%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Administrativos</td>
                        <td className="py-2 text-right font-semibold text-steel-800">{formatCOP(772769364)}</td>
                        <td className="py-2 text-right text-steel-400">3.1%</td>
                      </tr>
                      <tr className="bg-steel-50 font-semibold">
                        <td className="py-2 text-steel-700">Subtotal Operativo</td>
                        <td className="py-2 text-right text-steel-900">{formatCOP(23965726701)}</td>
                        <td className="py-2 text-right text-steel-500">95.3%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Intereses credito (4 trim.)</td>
                        <td className="py-2 text-right font-semibold text-red-600">{formatCOP(1658392500)}</td>
                        <td className="py-2 text-right text-steel-400">2.6%</td>
                      </tr>
                      <tr className="hover:bg-steel-50">
                        <td className="py-2 text-steel-600">Intereses adicionales</td>
                        <td className="py-2 text-right font-semibold text-red-600">{formatCOP(1500000000)}</td>
                        <td className="py-2 text-right text-steel-400">—</td>
                      </tr>
                      <tr className={clsx('border-t-2 border-primary-200 bg-primary-50')}>
                        <td className="py-2.5 font-bold text-primary-800">EAC Total (Bottom-Up)</td>
                        <td className="py-2.5 text-right font-bold text-primary-900">{formatCOP(eacBottomUp)}</td>
                        <td className="py-2.5 text-right font-bold text-primary-700">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Savings & Margin */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase">Ahorro Total Proyectado</p>
                    <p className="text-xl font-black text-emerald-700 mt-1">{formatCOP(ahorroTotal)}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-emerald-600">Ahorro en compras</span>
                        <span className="font-semibold text-emerald-700">{formatCOP(ahorroCompras)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-emerald-600">Ahorro admin/imprevistos</span>
                        <span className="font-semibold text-emerald-700">{formatCOP(ahorroTotal - ahorroCompras)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-primary-50 border border-primary-200 p-4">
                    <p className="text-[10px] font-semibold text-primary-600 uppercase">Margen de Utilidad</p>
                    <div className="mt-1 space-y-2">
                      <div>
                        <p className="text-[10px] text-steel-500">Presupuestado</p>
                        <p className="text-lg font-bold text-steel-600">{margenOriginal}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary-600">Proyectado Real</p>
                        <p className="text-lg font-bold text-primary-800">{margenProyectado.toFixed(1)}%</p>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 rounded px-1.5 py-0.5 inline-block">
                        +{(margenProyectado - margenOriginal).toFixed(1)} puntos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Paid vs Pending */}
                <div>
                  <p className="text-xs font-bold text-steel-700 mb-2">Ejecucion del Gasto</p>
                  <div className="w-full h-6 bg-steel-100 rounded-full overflow-hidden flex">
                    <div className="bg-primary-600 h-full flex items-center justify-center" style={{ width: '34.2%' }}>
                      <span className="text-[9px] font-bold text-white">34.2%</span>
                    </div>
                    <div className="bg-amber-400 h-full flex items-center justify-center" style={{ width: '55.5%' }}>
                      <span className="text-[9px] font-bold text-amber-900">55.5%</span>
                    </div>
                    <div className="bg-steel-300 h-full flex items-center justify-center" style={{ width: '10.3%' }}>
                      <span className="text-[9px] font-bold text-steel-700">10.3%</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                      <span className="text-steel-600">Pagado: {formatCOP(8597143906)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-steel-600">Proyectado Abr-Sep: {formatCOP(13949590459)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-steel-300" />
                      <span className="text-steel-600">Financiero: {formatCOP(2610617823)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
