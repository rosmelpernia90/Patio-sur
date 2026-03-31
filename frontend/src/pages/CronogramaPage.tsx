import { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import HelpButton from '@/components/common/HelpButton';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts';

// ============================================================
// DATA — Cronograma del proyecto
// Fuente: "Curva S (19 mar) Pablo.xlsx"
//   Hoja "Cronog 19 mar" → estructura WBS y pesos
//   Hoja "Cortes 19 mar" → avance real por actividad
//   Hoja "Curva S (19 mar)" → curva S semanal
// ============================================================

interface Activity {
  code: string;
  name: string;
  peso: number;      // % del proyecto (0 a 1)
  inicio: string;    // YYYY-MM-DD
  fin: string;
  duracion: string;
  avanceProg: number; // 0-100 avance programado a la fecha
  avanceReal: number; // 0-100 avance real a la fecha
  children?: Activity[];
}

// Top-level WBS from "Cronog 19 mar"
const cronograma: Activity[] = [
  {
    code: '1', name: 'No Objecion TMSA - EPC', peso: 0.01,
    inicio: '2025-06-21', fin: '2025-07-15', duracion: '24 dias',
    avanceProg: 100, avanceReal: 100,
  },
  {
    code: '2', name: 'Tramites de Ejecucion', peso: 0.05,
    inicio: '2025-06-20', fin: '2026-04-23', duracion: '307 dias',
    avanceProg: 91.2, avanceReal: 92.0,
    children: [
      { code: '2.1', name: 'Plan de manejo de transito', peso: 0.25, inicio: '2026-02-22', fin: '2026-04-23', duracion: '60 dias', avanceProg: 55, avanceReal: 100 },
      { code: '2.2', name: 'Licencia intervencion espacio publico', peso: 0.25, inicio: '2025-12-12', fin: '2026-01-26', duracion: '45 dias', avanceProg: 100, avanceReal: 100 },
      { code: '2.3', name: 'Diseno y aprobacion series Codensa', peso: 0.50, inicio: '2025-06-20', fin: '2026-03-11', duracion: '264 dias', avanceProg: 100, avanceReal: 76 },
    ],
  },
  {
    code: '3', name: 'Diseno Civil - Arquitectonico', peso: 0.10,
    inicio: '2025-10-22', fin: '2026-04-03', duracion: '163 dias',
    avanceProg: 75.0, avanceReal: 71.5,
    children: [
      { code: '3.1', name: 'Levantamiento topografico', peso: 0.10, inicio: '2025-10-22', fin: '2025-11-08', duracion: '17 dias', avanceProg: 100, avanceReal: 100 },
      { code: '3.2', name: 'Diseno arquitectonico', peso: 0.20, inicio: '2025-10-22', fin: '2026-01-21', duracion: '91 dias', avanceProg: 100, avanceReal: 95 },
      { code: '3.3', name: 'Diseno estructural', peso: 0.30, inicio: '2025-11-08', fin: '2026-02-14', duracion: '98 dias', avanceProg: 100, avanceReal: 90 },
      { code: '3.4', name: 'Diseno hidraulico y pluvial', peso: 0.15, inicio: '2025-11-08', fin: '2026-01-21', duracion: '74 dias', avanceProg: 100, avanceReal: 80 },
      { code: '3.5', name: 'Diseno vial y pavimentos', peso: 0.25, inicio: '2026-01-21', fin: '2026-04-03', duracion: '72 dias', avanceProg: 45, avanceReal: 20 },
    ],
  },
  {
    code: '4', name: 'Diseno Electrico', peso: 0.10,
    inicio: '2025-06-25', fin: '2026-02-06', duracion: '226 dias',
    avanceProg: 100, avanceReal: 95.0,
  },
  {
    code: '5', name: 'No Objecion TMSA - Diseno', peso: 0.01,
    inicio: '2025-10-28', fin: '2026-03-09', duracion: '132 dias',
    avanceProg: 95, avanceReal: 80,
  },
  {
    code: '6', name: 'Presupuesto', peso: 0.01,
    inicio: '2025-07-22', fin: '2025-10-29', duracion: '99 dias',
    avanceProg: 100, avanceReal: 100,
  },
  {
    code: '7', name: 'Gestion de Compra - Equipos', peso: 0.15,
    inicio: '2025-09-15', fin: '2026-05-24', duracion: '251 dias',
    avanceProg: 68, avanceReal: 72,
    children: [
      { code: '7.1', name: 'Cargadores electricos Starcharge', peso: 0.40, inicio: '2025-09-15', fin: '2026-05-24', duracion: '251 dias', avanceProg: 65, avanceReal: 70 },
      { code: '7.2', name: 'Transformadores WEG', peso: 0.20, inicio: '2025-10-01', fin: '2026-03-15', duracion: '165 dias', avanceProg: 90, avanceReal: 85 },
      { code: '7.3', name: 'Celdas MT / Subestaciones', peso: 0.25, inicio: '2025-10-15', fin: '2026-04-20', duracion: '187 dias', avanceProg: 55, avanceReal: 60 },
      { code: '7.4', name: 'Tableros BT y cables', peso: 0.15, inicio: '2025-11-01', fin: '2026-03-30', duracion: '149 dias', avanceProg: 80, avanceReal: 75 },
    ],
  },
  {
    code: '8', name: 'Previos Obra - Alistamiento', peso: 0.01,
    inicio: '2025-10-27', fin: '2025-12-21', duracion: '55 dias',
    avanceProg: 100, avanceReal: 100,
  },
  {
    code: '9', name: 'Liberacion de Espacios', peso: 0.01,
    inicio: '2025-11-20', fin: '2026-04-17', duracion: '148 dias',
    avanceProg: 80, avanceReal: 65,
  },
  {
    code: '10', name: 'Ejecucion', peso: 0.50,
    inicio: '2025-10-01', fin: '2026-06-30', duracion: '272 dias',
    avanceProg: 45, avanceReal: 47,
    children: [
      { code: '10.1', name: 'Obras civiles (cimentacion, estructura)', peso: 0.30, inicio: '2025-10-01', fin: '2026-05-30', duracion: '241 dias', avanceProg: 50, avanceReal: 52 },
      { code: '10.2', name: 'Canalizacion electrica', peso: 0.15, inicio: '2025-11-15', fin: '2026-04-30', duracion: '166 dias', avanceProg: 55, avanceReal: 48 },
      { code: '10.3', name: 'Montaje subestaciones / shelters', peso: 0.15, inicio: '2026-01-15', fin: '2026-05-15', duracion: '120 dias', avanceProg: 30, avanceReal: 35 },
      { code: '10.4', name: 'Instalacion cableado MT/BT', peso: 0.15, inicio: '2026-02-01', fin: '2026-06-15', duracion: '134 dias', avanceProg: 25, avanceReal: 28 },
      { code: '10.5', name: 'Instalacion cargadores', peso: 0.15, inicio: '2026-03-15', fin: '2026-06-30', duracion: '107 dias', avanceProg: 5, avanceReal: 8 },
      { code: '10.6', name: 'Iluminacion, SPT, deteccion incendios', peso: 0.10, inicio: '2026-04-01', fin: '2026-06-20', duracion: '80 dias', avanceProg: 0, avanceReal: 0 },
    ],
  },
  {
    code: '11', name: 'Energizacion', peso: 0.04,
    inicio: '2026-04-21', fin: '2026-09-13', duracion: '145 dias',
    avanceProg: 0, avanceReal: 0,
  },
  {
    code: '12', name: 'Puesta en Marcha', peso: 0.01,
    inicio: '2026-07-01', fin: '2026-09-16', duracion: '77 dias',
    avanceProg: 0, avanceReal: 0,
  },
];

// S-Curve data (same source as dashboard)
const sCurveData = [
  { w: 'S-00', d: '18 Jun', p: 0, e: 0 }, { w: 'S-02', d: '02 Jul', p: 1.53, e: 1.53 },
  { w: 'S-04', d: '16 Jul', p: 3.56, e: 3.56 }, { w: 'S-06', d: '30 Jul', p: 3.96, e: 3.96 },
  { w: 'S-08', d: '13 Ago', p: 4.11, e: 4.11 }, { w: 'S-10', d: '27 Ago', p: 4.25, e: 4.25 },
  { w: 'S-12', d: '10 Sep', p: 4.39, e: 4.39 }, { w: 'S-14', d: '24 Sep', p: 4.77, e: 4.77 },
  { w: 'S-16', d: '08 Oct', p: 6.02, e: 6.02 }, { w: 'S-18', d: '22 Oct', p: 8.02, e: 8.02 },
  { w: 'S-20', d: '05 Nov', p: 11.29, e: 11.44 }, { w: 'S-22', d: '19 Nov', p: 14.06, e: 14.17 },
  { w: 'S-24', d: '03 Dic', p: 16.93, e: 17.12 }, { w: 'S-26', d: '17 Dic', p: 21.88, e: 22.47 },
  { w: 'S-28', d: '31 Dic', p: 24.49, e: 25.52 }, { w: 'S-30', d: '14 Ene', p: 27.11, e: 30.16 },
  { w: 'S-32', d: '28 Ene', p: 30.83, e: 36.41 }, { w: 'S-34', d: '11 Feb', p: 36.33, e: 40.66 },
  { w: 'S-36', d: '25 Feb', p: 39.34, e: 41.48 }, { w: 'S-38', d: '11 Mar', p: 45.36, e: 48.05 },
  { w: 'S-40', d: '25 Mar', p: 51.90, e: 52.22 },
  { w: 'S-42', d: '08 Abr', p: 59.73, e: null }, { w: 'S-44', d: '22 Abr', p: 65.31, e: null },
  { w: 'S-46', d: '06 May', p: 76.00, e: null }, { w: 'S-48', d: '20 May', p: 89.86, e: null },
  { w: 'S-50', d: '03 Jun', p: 92.21, e: null }, { w: 'S-52', d: '17 Jun', p: 93.86, e: null },
  { w: 'S-54', d: '01 Jul', p: 96.39, e: null }, { w: 'S-56', d: '15 Jul', p: 97.14, e: null },
  { w: 'S-58', d: '29 Jul', p: 97.52, e: null }, { w: 'S-60', d: '12 Ago', p: 97.91, e: null },
  { w: 'S-62', d: '26 Ago', p: 98.63, e: null }, { w: 'S-64', d: '09 Sep', p: 99.18, e: null },
  { w: 'S-66', d: '23 Sep', p: 100.00, e: null },
];

const cronogramaHelp = {
  pageTitle: 'Ayuda — Cronograma',
  description:
    'El Cronograma presenta la estructura de actividades del proyecto con sus pesos ponderados, ' +
    'fechas de inicio y fin, y el avance programado vs real. La Curva S muestra la progresion ' +
    'acumulada del proyecto semana a semana. Fuente: "Curva S (19 mar) Pablo.xlsx".',
  pdfUrl: '/docs/Informe_Dashboard_Metricas.pdf',
  pdfName: 'Informe_Dashboard_Metricas.pdf',
  sections: [
    {
      title: 'Curva S',
      items: [
        { color: '#1B5EAB', label: 'Linea Azul — Avance Planeado', description: 'Progreso acumulado segun cronograma y pesos ponderados de cada actividad. A S-40 (25 Mar): 51.90%.' },
        { color: '#16A34A', label: 'Linea Verde — Avance Real', description: 'Progreso real acumulado al corte de cada semana. A S-40: 52.22%. El proyecto va ligeramente adelantado (+0.32%).' },
        { color: '#DC2626', label: 'Linea Roja — Fecha Contractual', description: 'Fecha de entrega contractual: 3 Julio 2026. Todo trabajo debe completarse antes de esta fecha.' },
      ],
    },
    {
      title: 'Tabla de Cronograma',
      items: [
        { icon: '🔢', label: 'Codigo WBS', description: 'Identificador jerarquico de la actividad en la Estructura de Desglose de Trabajo.' },
        { icon: '⚖️', label: 'Peso (%)', description: 'Incidencia de la actividad sobre el total del proyecto. La sumatoria de pesos de nivel 1 = 100%.' },
        { icon: '📅', label: 'Fechas (Inicio - Fin)', description: 'Fechas de inicio y fin segun el cronograma vigente.' },
        { color: '#1B5EAB', label: 'Barra Programado (azul)', description: 'Porcentaje de avance que deberia tener la actividad a la fecha actual segun la distribucion temporal.' },
        { color: '#16A34A', label: 'Barra Ejecutado (verde)', description: 'Porcentaje de avance real de la actividad al ultimo corte.' },
        { color: '#DC2626', label: 'Estado Critico (rojo)', description: 'Actividades con desviacion > 10% entre programado y ejecutado. Requieren atencion inmediata.' },
      ],
    },
    {
      title: 'Interpretacion Gerencial',
      items: [
        { icon: '📊', label: 'SPI del cronograma = 1.01', description: 'El avance real (52.22%) esta alineado con el planeado (51.90%). SPI > 1.0 indica que el proyecto va en tiempo global. Sin embargo, las desviaciones son a nivel de actividades individuales.' },
        { icon: '⚠️', label: 'Ruta critica: Ejecucion (50%)', description: 'La fase de Ejecucion representa el 50% del peso y es la mas critica. Retrasos aqui impactan directamente la Curva S y la fecha de entrega.' },
        { icon: '💰', label: 'Impacto financiero', description: 'Cada semana de atraso en la fase de Ejecucion genera ~$195M en costos financieros adicionales por el credito de $17B.' },
      ],
    },
  ],
};

// Gantt-like bar helper
function GanttBar({ prog, real }: { prog: number; real: number }) {
  const diff = real - prog;
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <div className="flex-1 h-4 bg-steel-100 rounded-full overflow-hidden relative">
        {/* Programado background */}
        <div
          className="absolute inset-y-0 left-0 bg-primary-200 rounded-full"
          style={{ width: `${Math.min(prog, 100)}%` }}
        />
        {/* Real on top */}
        <div
          className={clsx(
            'absolute inset-y-0 left-0 rounded-full',
            real >= prog ? 'bg-emerald-500' : 'bg-red-400'
          )}
          style={{ width: `${Math.min(real, 100)}%` }}
        />
      </div>
      <span className={clsx(
        'text-[10px] font-bold w-12 text-right',
        diff >= 0 ? 'text-emerald-600' : diff > -10 ? 'text-amber-600' : 'text-red-600'
      )}>
        {real.toFixed(0)}%
      </span>
    </div>
  );
}

function StatusBadge({ prog, real }: { prog: number; real: number }) {
  const diff = real - prog;
  if (real >= 100) return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">Completado</span>;
  if (diff >= 0) return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600">En tiempo</span>;
  if (diff > -10) return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">Leve atraso</span>;
  return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600">Critico</span>;
}

function ActivityRow({ act, level = 0 }: { act: Activity; level?: number }) {
  const [open, setOpen] = useState(level === 0);
  const hasChildren = act.children && act.children.length > 0;
  const fmtDate = (d: string) => { const [, m, day] = d.split('-'); return `${day}/${m}`; };
  const diff = act.avanceReal - act.avanceProg;
  const isLevel0 = level === 0;

  return (
    <>
      <tr className={clsx(
        'hover:bg-steel-50/50 transition',
        isLevel0 ? 'border-b border-steel-200' : 'border-b border-steel-100',
        diff < -10 && 'bg-red-50/30',
      )}>
        {/* Code + expand */}
        <td className={clsx('px-3 py-2.5 whitespace-nowrap', isLevel0 ? 'font-bold text-steel-800' : 'text-steel-500')} style={{ paddingLeft: `${12 + level * 20}px` }}>
          <div className="flex items-center gap-1">
            {hasChildren ? (
              <button onClick={() => setOpen(!open)} className="p-0.5 hover:bg-steel-200 rounded">
                {open ? <ChevronDown className="h-3 w-3 text-steel-400" /> : <ChevronRight className="h-3 w-3 text-steel-400" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <span className="text-xs">{act.code}</span>
          </div>
        </td>
        {/* Name */}
        <td className={clsx('px-3 py-2.5 text-xs', isLevel0 ? 'font-semibold text-steel-800' : 'text-steel-600')}>
          {act.name}
        </td>
        {/* Peso */}
        <td className="px-3 py-2.5 text-xs text-center font-medium text-steel-600">
          {(act.peso * 100).toFixed(0)}%
        </td>
        {/* Fechas */}
        <td className="px-3 py-2.5 text-[10px] text-steel-500 whitespace-nowrap">
          {fmtDate(act.inicio)} — {fmtDate(act.fin)}
        </td>
        {/* Duracion */}
        <td className="px-3 py-2.5 text-[10px] text-steel-400 text-center whitespace-nowrap">
          {act.duracion}
        </td>
        {/* Gantt bar */}
        <td className="px-3 py-2.5">
          <GanttBar prog={act.avanceProg} real={act.avanceReal} />
        </td>
        {/* Status */}
        <td className="px-3 py-2.5">
          <StatusBadge prog={act.avanceProg} real={act.avanceReal} />
        </td>
      </tr>
      {hasChildren && open && act.children!.map((c) => (
        <ActivityRow key={c.code} act={c} level={level + 1} />
      ))}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCurveTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg border border-steel-200 shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-steel-800">{d.w} — {d.d}</p>
      <p className="text-primary-600">Plan: {d.p.toFixed(1)}%</p>
      {d.e !== null && <p className="text-emerald-600">Real: {d.e.toFixed(1)}%</p>}
    </div>
  );
};

export default function CronogramaPage() {
  // Summary stats
  const completadas = cronograma.filter(a => a.avanceReal >= 100).length;
  const enTiempo = cronograma.filter(a => a.avanceReal < 100 && a.avanceReal >= a.avanceProg).length;
  const atrasadas = cronograma.filter(a => a.avanceReal < 100 && a.avanceReal < a.avanceProg).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Cronograma del Proyecto</h2>
          <p className="text-xs text-steel-400 mt-0.5">
            Patio de Operacion Sur — OE 1035 | Jun 2025 - Sep 2026 | 518 actividades
          </p>
        </div>
        <HelpButton {...cronogramaHelp} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Avance Programado</p>
          <p className="text-xl font-bold text-primary-700 mt-1">51.9%</p>
          <p className="text-[9px] text-steel-400">Semana S-40</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Avance Real</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">52.2%</p>
          <p className="text-[9px] text-steel-400">+0.3% adelantado</p>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">SPI</p>
          <p className="text-xl font-bold text-teal-700 mt-1">1.01</p>
          <p className="text-[9px] text-steel-400">Real / Planeado</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-card text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
          <p className="text-lg font-bold text-emerald-600 mt-1">{completadas}</p>
          <p className="text-[9px] text-steel-400">Completadas</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-card text-center">
          <Clock className="h-4 w-4 text-amber-500 mx-auto" />
          <p className="text-lg font-bold text-amber-600 mt-1">{enTiempo}</p>
          <p className="text-[9px] text-steel-400">En Tiempo</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-white p-3 shadow-card text-center">
          <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
          <p className="text-lg font-bold text-red-600 mt-1">{atrasadas}</p>
          <p className="text-[9px] text-steel-400">Con Atraso</p>
        </div>
      </div>

      {/* S-Curve Chart (condensed) */}
      <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-steel-800">Curva S — Avance Acumulado Semanal</h3>
          <span className="ml-auto text-[10px] text-steel-400">67 semanas | Corte: 25 Mar 2026</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={sCurveData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1b5eab" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#1b5eab" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
            <XAxis dataKey="d" tick={{ fontSize: 8, fill: '#6e7179' }} tickLine={false} angle={-30} textAnchor="end" height={40} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#6e7179' }} tickLine={false} />
            <Tooltip content={<SCurveTooltip />} />
            <ReferenceLine x="01 Jul" stroke="#dc2626" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="p" fill="url(#gp)" stroke="none" />
            <Area type="monotone" dataKey="e" fill="url(#ge)" stroke="none" connectNulls={false} />
            <Line type="monotone" dataKey="p" stroke="#1b5eab" strokeWidth={2} dot={false} name="Planeado" />
            <Line type="monotone" dataKey="e" stroke="#16a34a" strokeWidth={2} dot={false} name="Ejecutado" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Schedule Table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-200 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-steel-800">Estructura de Actividades (WBS)</h3>
          <span className="ml-auto text-[10px] text-steel-400 bg-steel-50 px-2 py-1 rounded-full border border-steel-200">
            12 capitulos principales | Peso total: 100%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 border-b border-steel-200">
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[80px]">Cod.</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-steel-500 uppercase tracking-wide">Actividad</th>
                <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[60px]">Peso</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[110px]">Fechas</th>
                <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[80px]">Duracion</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[220px]">Avance (Prog / Real)</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-steel-500 uppercase tracking-wide w-[100px]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cronograma.map((act) => (
                <ActivityRow key={act.code} act={act} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources */}
      <div className="rounded-lg bg-steel-50 border border-steel-200 p-4 text-[10px] text-steel-500">
        <p className="font-bold text-steel-600 mb-1">Fuentes de Datos:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> → Hoja "Curva S (19 mar)": datos semanales planeado/ejecutado (67 semanas)</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> → Hoja "Cronog 19 mar": estructura WBS, pesos, fechas y duraciones (518 actividades)</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> → Hoja "Cortes 19 mar": avance real por actividad al corte del 25 Mar 2026</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> → Hoja "Programado 19 mar": avance programado acumulado por actividad</li>
        </ul>
      </div>
    </div>
  );
}
