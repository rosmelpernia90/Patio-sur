import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronRight, Clock, TrendingUp, AlertTriangle, CheckCircle2, Plus, Trash2, Save } from 'lucide-react';
import clsx from 'clsx';
import HelpButton from '@/components/common/HelpButton';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart, Dot,
} from 'recharts';
import cronogramaBase from '@/data/cronogramaData';
import type { Activity } from '@/data/cronogramaData';
import { useAuthStore } from '@/stores/authStore';
import { logEdit } from '@/utils/activityTracker';

// ============================================================
// S-Curve data — datos base del proyecto
// ============================================================
const sCurveBase = [
  { w: 'S-00', d: '18 Jun', p: 0, e: 0 as number | null }, { w: 'S-02', d: '02 Jul', p: 1.53, e: 1.53 as number | null },
  { w: 'S-04', d: '16 Jul', p: 3.56, e: 3.56 as number | null }, { w: 'S-06', d: '30 Jul', p: 3.96, e: 3.96 as number | null },
  { w: 'S-08', d: '13 Ago', p: 4.11, e: 4.11 as number | null }, { w: 'S-10', d: '27 Ago', p: 4.25, e: 4.25 as number | null },
  { w: 'S-12', d: '10 Sep', p: 4.39, e: 4.39 as number | null }, { w: 'S-14', d: '24 Sep', p: 4.77, e: 4.77 as number | null },
  { w: 'S-16', d: '08 Oct', p: 6.02, e: 6.02 as number | null }, { w: 'S-18', d: '22 Oct', p: 8.02, e: 8.02 as number | null },
  { w: 'S-20', d: '05 Nov', p: 11.29, e: 11.44 as number | null }, { w: 'S-22', d: '19 Nov', p: 14.06, e: 14.17 as number | null },
  { w: 'S-24', d: '03 Dic', p: 16.93, e: 17.12 as number | null }, { w: 'S-26', d: '17 Dic', p: 21.88, e: 22.47 as number | null },
  { w: 'S-28', d: '31 Dic', p: 24.49, e: 25.52 as number | null }, { w: 'S-30', d: '14 Ene', p: 27.11, e: 30.16 as number | null },
  { w: 'S-32', d: '28 Ene', p: 30.83, e: 36.41 as number | null }, { w: 'S-34', d: '11 Feb', p: 36.33, e: 40.66 as number | null },
  { w: 'S-36', d: '25 Feb', p: 39.34, e: 41.48 as number | null }, { w: 'S-38', d: '11 Mar', p: 45.36, e: 48.05 as number | null },
  { w: 'S-40', d: '25 Mar', p: 51.90, e: 52.22 as number | null },
  { w: 'S-42', d: '08 Abr', p: 59.73, e: null }, { w: 'S-44', d: '22 Abr', p: 65.31, e: null },
  { w: 'S-46', d: '06 May', p: 76.00, e: null }, { w: 'S-48', d: '20 May', p: 89.86, e: null },
  { w: 'S-50', d: '03 Jun', p: 92.21, e: null }, { w: 'S-52', d: '17 Jun', p: 93.86, e: null },
  { w: 'S-54', d: '01 Jul', p: 96.39, e: null }, { w: 'S-56', d: '15 Jul', p: 97.14, e: null },
  { w: 'S-58', d: '29 Jul', p: 97.52, e: null }, { w: 'S-60', d: '12 Ago', p: 97.91, e: null },
  { w: 'S-62', d: '26 Ago', p: 98.63, e: null }, { w: 'S-64', d: '09 Sep', p: 99.18, e: null },
  { w: 'S-66', d: '23 Sep', p: 100.00, e: null },
];

// ============================================================
// Tabla completa de avance programado semanal (S-00 a S-66)
// Fuente: Excel "Control Patio Sur.xlsx" — pestaña Programado
// ============================================================
const weeklyProgrammed: { w: string; d: string; p: number }[] = [
  { w: 'S-00', d: '18 Jun', p: 0.00 },
  { w: 'S-01', d: '25 Jun', p: 0.30 },
  { w: 'S-02', d: '02 Jul', p: 1.53 },
  { w: 'S-03', d: '09 Jul', p: 3.21 },
  { w: 'S-04', d: '16 Jul', p: 3.56 },
  { w: 'S-05', d: '23 Jul', p: 3.88 },
  { w: 'S-06', d: '30 Jul', p: 3.96 },
  { w: 'S-07', d: '06 Ago', p: 4.04 },
  { w: 'S-08', d: '13 Ago', p: 4.11 },
  { w: 'S-09', d: '20 Ago', p: 4.18 },
  { w: 'S-10', d: '27 Ago', p: 4.25 },
  { w: 'S-11', d: '03 Sep', p: 4.32 },
  { w: 'S-12', d: '10 Sep', p: 4.39 },
  { w: 'S-13', d: '17 Sep', p: 4.52 },
  { w: 'S-14', d: '24 Sep', p: 4.77 },
  { w: 'S-15', d: '01 Oct', p: 5.09 },
  { w: 'S-16', d: '08 Oct', p: 6.02 },
  { w: 'S-17', d: '15 Oct', p: 7.07 },
  { w: 'S-18', d: '22 Oct', p: 8.02 },
  { w: 'S-19', d: '29 Oct', p: 10.25 },
  { w: 'S-20', d: '05 Nov', p: 11.29 },
  { w: 'S-21', d: '12 Nov', p: 12.86 },
  { w: 'S-22', d: '19 Nov', p: 14.06 },
  { w: 'S-23', d: '26 Nov', p: 15.51 },
  { w: 'S-24', d: '03 Dic', p: 16.93 },
  { w: 'S-25', d: '10 Dic', p: 20.22 },
  { w: 'S-26', d: '17 Dic', p: 21.88 },
  { w: 'S-27', d: '24 Dic', p: 23.71 },
  { w: 'S-28', d: '31 Dic', p: 24.49 },
  { w: 'S-29', d: '07 Ene', p: 25.24 },
  { w: 'S-30', d: '14 Ene', p: 27.11 },
  { w: 'S-31', d: '21 Ene', p: 29.25 },
  { w: 'S-32', d: '28 Ene', p: 30.83 },
  { w: 'S-33', d: '04 Feb', p: 34.45 },
  { w: 'S-34', d: '11 Feb', p: 36.33 },
  { w: 'S-35', d: '18 Feb', p: 37.74 },
  { w: 'S-36', d: '25 Feb', p: 39.34 },
  { w: 'S-37', d: '04 Mar', p: 42.54 },
  { w: 'S-38', d: '11 Mar', p: 45.36 },
  { w: 'S-39', d: '18 Mar', p: 48.77 },
  { w: 'S-40', d: '25 Mar', p: 51.90 },
  { w: 'S-41', d: '01 Abr', p: 57.38 },
  { w: 'S-42', d: '08 Abr', p: 59.73 },
  { w: 'S-43', d: '15 Abr', p: 62.78 },
  { w: 'S-44', d: '22 Abr', p: 65.31 },
  { w: 'S-45', d: '29 Abr', p: 68.07 },
  { w: 'S-46', d: '06 May', p: 76.00 },
  { w: 'S-47', d: '13 May', p: 84.65 },
  { w: 'S-48', d: '20 May', p: 89.86 },
  { w: 'S-49', d: '27 May', p: 91.27 },
  { w: 'S-50', d: '03 Jun', p: 92.21 },
  { w: 'S-51', d: '10 Jun', p: 92.77 },
  { w: 'S-52', d: '17 Jun', p: 93.86 },
  { w: 'S-53', d: '24 Jun', p: 94.32 },
  { w: 'S-54', d: '01 Jul', p: 96.39 },
  { w: 'S-55', d: '08 Jul', p: 96.94 },
  { w: 'S-56', d: '15 Jul', p: 97.14 },
  { w: 'S-57', d: '22 Jul', p: 97.35 },
  { w: 'S-58', d: '29 Jul', p: 97.52 },
  { w: 'S-59', d: '05 Ago', p: 97.67 },
  { w: 'S-60', d: '12 Ago', p: 97.91 },
  { w: 'S-61', d: '19 Ago', p: 98.28 },
  { w: 'S-62', d: '26 Ago', p: 98.63 },
  { w: 'S-63', d: '02 Sep', p: 98.90 },
  { w: 'S-64', d: '09 Sep', p: 99.18 },
  { w: 'S-65', d: '16 Sep', p: 100.00 },
  { w: 'S-66', d: '23 Sep', p: 100.00 },
];

// Index for fast lookup by week number
const weeklyProgMap = new Map<number, { d: string; p: number }>(
  weeklyProgrammed.map(wp => [parseInt(wp.w.replace('S-', '')), { d: wp.d, p: wp.p }])
);

// ============================================================
// HELPERS — Semanas personalizadas
// ============================================================
const LS_KEY = 'patio_sur_custom_weeks_v1';

interface CustomWeekData {
  weekNum: number;
  label: string;       // e.g. 'S-41'
  dateLabel: string;    // e.g. '01 Abr'
  values: Record<string, number>; // code → avanceReal (0-100)
}

function loadCustomWeeks(): CustomWeekData[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomWeeks(data: CustomWeekData[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Cronograma] Error al guardar en localStorage:', e);
  }
}

/** Extract all leaf avanceReal values from the WBS tree */
function getLeafValues(acts: Activity[]): Record<string, number> {
  const vals: Record<string, number> = {};
  for (const a of acts) {
    if (a.children && a.children.length > 0) {
      Object.assign(vals, getLeafValues(a.children));
    } else {
      vals[a.code] = a.avanceReal;
    }
  }
  return vals;
}

/** Apply avanceReal overrides to leaf nodes, recompute parents bottom-up */
function applyOverrides(acts: Activity[], overrides: Record<string, number>): Activity[] {
  return acts.map(a => {
    if (a.children && a.children.length > 0) {
      const newChildren = applyOverrides(a.children, overrides);
      const totalPeso = newChildren.reduce((s, c) => s + c.peso, 0);
      const wReal = newChildren.reduce((s, c) => s + c.avanceReal * c.peso, 0);
      return {
        ...a,
        children: newChildren,
        avanceReal: totalPeso > 0 ? Math.round(wReal / totalPeso * 10) / 10 : 0,
      };
    }
    return {
      ...a,
      avanceReal: overrides[a.code] !== undefined ? overrides[a.code] : a.avanceReal,
    };
  });
}

/** Compute date label from week number — uses exact Excel lookup, falls back to calculation */
function computeWeekDate(weekNum: number): string {
  const entry = weeklyProgMap.get(weekNum);
  if (entry) return entry.d;
  // Fallback for weeks beyond the table (should not happen with S-00..S-66)
  const start = new Date(2025, 5, 18); // 18 Jun 2025
  const date = new Date(start.getTime() + weekNum * 7 * 24 * 60 * 60 * 1000);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]}`;
}

/** Get exact programmed % for a week number from the weekly lookup table */
function interpolateProgrammed(weekNum: number): number {
  const entry = weeklyProgMap.get(weekNum);
  if (entry) return entry.p;
  // Fallback: clamp to nearest known value (should not happen with S-00..S-66)
  if (weekNum <= 0) return 0;
  if (weekNum >= 66) return 100;
  return 0;
}

// ============================================================
// Help
// ============================================================
const cronogramaHelp = {
  pageTitle: 'Ayuda — Cronograma',
  description:
    'Cronograma WBS del proyecto Patio de Operacion Sur con 515 actividades ponderadas. ' +
    'Muestra avance programado vs real por semana. La semana activa determina los KPIs del Dashboard (SPI, EV, CPI). ' +
    'Fuente base: "Curva S (19 mar) Pablo.xlsx". Semanas S-41 en adelante se ingresan manualmente.',
  pdfUrl: '/docs/Informe_Dashboard_Metricas.pdf',
  pdfName: 'Informe_Dashboard_Metricas.pdf',
  sections: [
    {
      title: 'Semanas de Corte',
      items: [
        { color: '#1B5EAB', label: 'Semanas base (azul) — S-00 a S-40', description: 'Datos historicos cargados desde Excel. Avance real hasta S-40 (25 Mar 2026, 52.2%). No editables.' },
        { color: '#16A34A', label: 'Semanas personalizadas (verde) — S-41 en adelante', description: 'Semanas ingresadas manualmente por el equipo. Click en "+ S-XX" para agregar la siguiente semana de corte.' },
        { icon: '✏️', label: 'Como agregar una semana nueva', description: '1) Click en "+ S-XX" para crear la semana. 2) Seleccionar la semana verde creada. 3) Expandir los capitulos en la tabla. 4) Editar el % de avance real de cada actividad hoja. 5) Presionar Enter o hacer click fuera del campo para guardar. Se guarda automaticamente en el navegador.' },
      ],
    },
    {
      title: 'Curva S — Avance Acumulado',
      items: [
        { color: '#1B5EAB', label: 'Linea Azul — Avance Planificado', description: 'Progreso acumulado segun cronograma base revisado (19 mar). 67 semanas (S-00 a S-66). Termina en 100% en S-65 (16 Sep 2026).' },
        { color: '#16A34A', label: 'Linea Verde — Avance Real', description: 'Progreso real acumulado al corte de cada semana. Se actualiza con las semanas personalizadas ingresadas.' },
        { color: '#DC2626', label: 'Linea Roja — Fecha Contractual', description: 'Fecha de entrega contractual original: 3 Julio 2026. El re-baseline extendio el plazo 48 dias adicionales.' },
        { color: '#7C3AED', label: 'Linea Morada — Semana seleccionada', description: 'Marca la semana de corte actualmente seleccionada en el selector de semanas.' },
      ],
    },
    {
      title: 'Tabla WBS — Actividades',
      items: [
        { icon: '🔢', label: 'Codigo WBS', description: 'Identificador jerarquico de la actividad. Ej: 4.2.1.3 = Capitulo 4, Subcapitulo 2, Grupo 1, Item 3.' },
        { icon: '⚖️', label: 'Peso (%)', description: 'Ponderacion de la actividad sobre el total del proyecto. La suma de todos los pesos = 100%.' },
        { color: '#1B5EAB', label: 'Barra Programado (azul claro)', description: 'Avance que deberia tener la actividad segun el cronograma base en la semana seleccionada.' },
        { color: '#16A34A', label: 'Barra Ejecutado (verde)', description: 'Avance real de la actividad. Verde = en tiempo o adelantado. Rojo = con atraso > 10pp.' },
        { color: '#DC2626', label: 'Estado Critico', description: 'Actividades con desviacion > 10pp entre programado y real. El row se resalta en rojo claro.' },
      ],
    },
    {
      title: 'KPIs e Interpretacion',
      items: [
        { icon: '📊', label: 'SPI = Real / Planificado', description: 'SPI > 1.0 = adelantado. SPI = 1.0 = en tiempo. SPI < 1.0 = atrasado. Este valor alimenta el Dashboard y las Alertas del proyecto.' },
        { icon: '⚠️', label: 'Ruta critica: Ejecucion (50% del peso)', description: 'La fase de Ejecucion es la mas critica. Retrasos aqui impactan directamente la fecha de entrega contractual.' },
        { icon: '💰', label: 'Impacto financiero del atraso', description: 'Cada semana de atraso en la fase de Ejecucion genera ~$195M en costos adicionales (nomina, alquiler, indirectos).' },
      ],
    },
  ],
};

// ============================================================
// Sub-components
// ============================================================
function GanttBar({ prog, real }: { prog: number; real: number }) {
  const diff = real - prog;
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <div className="flex-1 h-4 bg-steel-100 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-primary-200 rounded-full" style={{ width: `${Math.min(prog, 100)}%` }} />
        <div className={clsx('absolute inset-y-0 left-0 rounded-full', real >= prog ? 'bg-emerald-500' : 'bg-red-400')} style={{ width: `${Math.min(real, 100)}%` }} />
      </div>
      <span className={clsx('text-[10px] font-bold w-12 text-right', diff >= 0 ? 'text-emerald-600' : diff > -10 ? 'text-amber-600' : 'text-red-600')}>
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

function ActivityRow({
  act, level = 0, editable = false, onChangeReal,
}: {
  act: Activity;
  level?: number;
  editable?: boolean;
  onChangeReal?: (code: string, value: number) => void;
}) {
  const [open, setOpen] = useState(level === 0);
  // Estado local del input — evita re-renders por cada tecla y permite escribir multi-dígito
  const [localVal, setLocalVal] = useState<string>(String(act.avanceReal));
  const hasChildren = act.children && act.children.length > 0;
  const isLeaf = !hasChildren;
  const fmtDate = (d: string) => { const [, m, day] = d.split('-'); return `${day}/${m}`; };
  const diff = act.avanceReal - act.avanceProg;
  const isLevel0 = level === 0;

  // Sincronizar localVal cuando el valor externo cambia (ej: recalculo de otro campo)
  useEffect(() => {
    setLocalVal(String(act.avanceReal));
  }, [act.avanceReal]);

  // Confirmar y guardar al salir del campo (onBlur)
  const handleBlur = () => {
    const v = Math.min(100, Math.max(0, parseFloat(localVal) || 0));
    setLocalVal(String(v));
    onChangeReal?.(act.code, v);
  };

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
        {/* Gantt bar / Editable */}
        <td className="px-3 py-2.5">
          {editable && isLeaf ? (
            <div className="flex items-center gap-2 min-w-[180px]">
              <div className="flex-1 h-4 bg-steel-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-primary-200 rounded-full" style={{ width: `${Math.min(act.avanceProg, 100)}%` }} />
                <div className={clsx('absolute inset-y-0 left-0 rounded-full', act.avanceReal >= act.avanceProg ? 'bg-emerald-500' : 'bg-red-400')} style={{ width: `${Math.min(act.avanceReal, 100)}%` }} />
              </div>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={localVal}
                onChange={(e) => setLocalVal(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                className="w-14 px-1 py-0.5 text-[10px] font-bold text-right border border-primary-300 rounded bg-primary-50 text-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          ) : (
            <GanttBar prog={act.avanceProg} real={act.avanceReal} />
          )}
        </td>
        {/* Status */}
        <td className="px-3 py-2.5">
          <StatusBadge prog={act.avanceProg} real={act.avanceReal} />
        </td>
      </tr>
      {hasChildren && open && act.children!.map((c) => (
        <ActivityRow key={c.code} act={c} level={level + 1} editable={editable} onChangeReal={onChangeReal} />
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

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CronogramaPage() {
  const user = useAuthStore((s) => s.user);
  const [selectedWeek, setSelectedWeek] = useState<string>('S-40');
  const [customWeeks, setCustomWeeks] = useState<CustomWeekData[]>(loadCustomWeeks);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Ref para acceder al valor más reciente en el cleanup de desmontaje
  const customWeeksRef = useRef(customWeeks);
  useEffect(() => { customWeeksRef.current = customWeeks; });

  // ---- Persist custom weeks (primary: in updater, backup: useEffect) ----
  const updateCustomWeeks = useCallback((updater: (prev: CustomWeekData[]) => CustomWeekData[]) => {
    setCustomWeeks(prev => {
      const next = updater(prev);
      saveCustomWeeks(next);
      setLastSaved(new Date());
      return next;
    });
  }, []);

  // Safety net: also save on any customWeeks change via useEffect
  useEffect(() => {
    if (customWeeks.length > 0) {
      saveCustomWeeks(customWeeks);
    }
  }, [customWeeks]);

  // Guardar al desmontar (cuando el usuario navega a otra página)
  useEffect(() => {
    return () => {
      if (customWeeksRef.current.length > 0) {
        saveCustomWeeks(customWeeksRef.current);
      }
    };
  }, []);

  // ---- Determine which week is "custom" ----
  const isCustomWeek = useMemo(
    () => customWeeks.some(cw => cw.label === selectedWeek),
    [customWeeks, selectedWeek]
  );

  const selectedCustom = useMemo(
    () => customWeeks.find(cw => cw.label === selectedWeek),
    [customWeeks, selectedWeek]
  );

  // ---- Build the display cronograma (with overrides for custom weeks) ----
  const displayCronograma = useMemo(() => {
    if (!isCustomWeek || !selectedCustom) return cronogramaBase;
    return applyOverrides(cronogramaBase, selectedCustom.values);
  }, [isCustomWeek, selectedCustom]);

  // ---- Compute project-level avance for custom weeks ----
  const computeProjectReal = useCallback((values: Record<string, number>) => {
    const tree = applyOverrides(cronogramaBase, values);
    const totalPeso = tree.reduce((s, a) => s + a.peso, 0);
    const weighted = tree.reduce((s, a) => s + a.avanceReal * a.peso, 0);
    return totalPeso > 0 ? Math.round(weighted / totalPeso * 100) / 100 : 0;
  }, []);

  // ---- Merged S-Curve data (base + custom weeks) ----
  const sCurveData = useMemo(() => {
    if (customWeeks.length === 0) return sCurveBase;

    // Build map of custom week data points
    const customPoints = new Map<number, { w: string; d: string; p: number; e: number }>();
    for (const cw of customWeeks) {
      const pVal = interpolateProgrammed(cw.weekNum);
      const eVal = computeProjectReal(cw.values);
      customPoints.set(cw.weekNum, { w: cw.label, d: cw.dateLabel, p: pVal, e: eVal });
    }

    // Merge: insert custom points into the base array at the right position
    const merged: { w: string; d: string; p: number; e: number | null }[] = [];
    const baseNums = sCurveBase.map(d => parseInt(d.w.replace('S-', '')));

    let ci = 0;
    const sortedCustomNums = Array.from(customPoints.keys()).sort((a, b) => a - b);

    for (let i = 0; i < sCurveBase.length; i++) {
      const baseNum = baseNums[i];

      // Insert custom points before this base point
      while (ci < sortedCustomNums.length && sortedCustomNums[ci] < baseNum) {
        const cp = customPoints.get(sortedCustomNums[ci])!;
        merged.push(cp);
        ci++;
      }

      // If custom point has the same number as a base point, replace `e`
      if (ci < sortedCustomNums.length && sortedCustomNums[ci] === baseNum) {
        const cp = customPoints.get(sortedCustomNums[ci])!;
        merged.push({ ...sCurveBase[i], e: cp.e });
        ci++;
      } else {
        merged.push(sCurveBase[i]);
      }
    }

    // Append remaining custom points after all base points
    while (ci < sortedCustomNums.length) {
      const cp = customPoints.get(sortedCustomNums[ci])!;
      merged.push(cp);
      ci++;
    }

    return merged;
  }, [customWeeks, computeProjectReal]);

  // ---- Available weeks for selection (those with actual data) ----
  const availableWeeks = useMemo(() =>
    sCurveData.filter(d => d.e !== null),
    [sCurveData]
  );

  // ---- Selected week data ----
  const weekData = useMemo(() =>
    sCurveData.find(d => d.w === selectedWeek) || sCurveData[sCurveData.length - 1],
    [sCurveData, selectedWeek]
  );

  // ---- Dynamic KPIs ----
  const prog = weekData.p;
  const real = weekData.e ?? 0;
  const kpiDiff = real - prog;
  const spi = prog > 0 ? (real / prog) : 0;

  // ---- Summary stats from display cronograma ----
  const completadas = displayCronograma.filter(a => a.avanceReal >= 100).length;
  const enTiempo = displayCronograma.filter(a => a.avanceReal < 100 && a.avanceReal >= a.avanceProg).length;
  const atrasadas = displayCronograma.filter(a => a.avanceReal < 100 && a.avanceReal < a.avanceProg).length;

  // ---- Add new week handler ----
  const handleAddWeek = useCallback(() => {
    // Determine next week number
    const existingNums = customWeeks.map(cw => cw.weekNum);
    const lastRealNum = 40; // S-40 is the last base real week
    const maxCustom = existingNums.length > 0 ? Math.max(...existingNums) : lastRealNum;
    const nextNum = maxCustom + 1;

    // Get leaf values to copy from: previous custom week or base data
    const prevCustom = customWeeks.find(cw => cw.weekNum === maxCustom);
    const seedValues = prevCustom ? { ...prevCustom.values } : getLeafValues(cronogramaBase);

    const newWeek: CustomWeekData = {
      weekNum: nextNum,
      label: `S-${nextNum}`,
      dateLabel: computeWeekDate(nextNum),
      values: seedValues,
    };

    updateCustomWeeks(prev => [...prev, newWeek]);
    setSelectedWeek(newWeek.label);
    if (user) logEdit(user, 'Cronograma', `Agregó semana de corte ${newWeek.label} (${newWeek.dateLabel})`);
  }, [customWeeks, updateCustomWeeks, user]);

  // ---- Delete custom week handler ----
  const handleDeleteWeek = useCallback((label: string) => {
    updateCustomWeeks(prev => prev.filter(cw => cw.label !== label));
    setSelectedWeek('S-40');
    if (user) logEdit(user, 'Cronograma', `Eliminó semana de corte ${label}`);
  }, [updateCustomWeeks, user]);

  // ---- Update leaf avanceReal in custom week ----
  const handleChangeReal = useCallback((code: string, value: number) => {
    if (!selectedCustom) return;
    updateCustomWeeks(prev =>
      prev.map(cw =>
        cw.label === selectedCustom.label
          ? { ...cw, values: { ...cw.values, [code]: value } }
          : cw
      )
    );
  }, [selectedCustom, updateCustomWeeks]);

  // ---- Custom dots for chart ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.w !== selectedWeek || cy === undefined || cy === null) return null;
    return <Dot cx={cx} cy={cy} r={6} fill="#1b5eab" stroke="#fff" strokeWidth={2} />;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedDotReal = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.w !== selectedWeek || cy === undefined || cy === null || payload.e === null) return null;
    return <Dot cx={cx} cy={cy} r={6} fill="#16a34a" stroke="#fff" strokeWidth={2} />;
  };

  // ---- Next week number for the add button label ----
  const nextWeekNum = useMemo(() => {
    const existingNums = customWeeks.map(cw => cw.weekNum);
    const maxExisting = existingNums.length > 0 ? Math.max(...existingNums) : 40;
    return maxExisting + 1;
  }, [customWeeks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Cronograma del Proyecto</h2>
          <p className="text-xs text-steel-400 mt-0.5">
            Patio de Operacion Sur — OE 1035 | Jun 2025 - Sep 2026 | 515 actividades
          </p>
        </div>
        <HelpButton {...cronogramaHelp} />
      </div>

      {/* Week Selector */}
      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-steel-800">Seleccionar Semana de Corte</h3>
          <span className="ml-auto text-[10px] text-steel-400 bg-steel-50 px-2 py-1 rounded-full border border-steel-200">
            {availableWeeks.length} semanas con datos reales
          </span>
        </div>

        {/* Base weeks */}
        <div className="flex flex-wrap gap-1.5">
          {sCurveBase.filter(d => d.e !== null).map((wk) => (
            <button
              key={wk.w}
              onClick={() => setSelectedWeek(wk.w)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                selectedWeek === wk.w
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md scale-105'
                  : 'bg-steel-50 text-steel-600 border-steel-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700'
              )}
            >
              <span className="font-bold">{wk.w}</span>
              <span className="hidden sm:inline text-[9px] ml-1 opacity-75">({wk.d})</span>
            </button>
          ))}

          {/* Custom week buttons */}
          {customWeeks.map((cw) => (
            <div key={cw.label} className="relative group">
              <button
                onClick={() => setSelectedWeek(cw.label)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  selectedWeek === cw.label
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                )}
              >
                <span className="font-bold">{cw.label}</span>
                <span className="hidden sm:inline text-[9px] ml-1 opacity-75">({cw.dateLabel})</span>
              </button>
              {/* Delete button on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteWeek(cw.label); }}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                title={`Eliminar ${cw.label}`}
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}

          {/* Add week button */}
          <button
            onClick={handleAddWeek}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-dashed border-emerald-400 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 flex items-center gap-1"
            title={`Agregar semana S-${nextWeekNum}`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="font-bold">S-{nextWeekNum}</span>
          </button>
        </div>
      </div>

      {/* Editing banner for custom weeks */}
      {isCustomWeek && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-800">Modo edicion — {selectedWeek}</span>
            <span className="text-emerald-600">Edita el % de avance real en las actividades hoja para recalcular indicadores y Curva S.</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 shrink-0">
            <Save className="h-3 w-3" />
            <span className="font-medium">
              {lastSaved ? `Guardado ${lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Guardado automaticamente'}
            </span>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Avance Programado</p>
          <p className="text-xl font-bold text-primary-700 mt-1">{prog.toFixed(1)}%</p>
          <p className="text-[9px] text-steel-400">Semana {selectedWeek}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Avance Real</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{real.toFixed(1)}%</p>
          <p className={clsx('text-[9px]', kpiDiff >= 0 ? 'text-emerald-500' : 'text-red-500')}>
            {kpiDiff >= 0 ? '+' : ''}{kpiDiff.toFixed(1)}% {kpiDiff >= 0 ? 'adelantado' : 'atrasado'}
          </p>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">SPI</p>
          <p className={clsx('text-xl font-bold mt-1', spi >= 1 ? 'text-teal-700' : 'text-red-600')}>
            {spi.toFixed(2)}
          </p>
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

      {/* S-Curve Chart */}
      <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-steel-800">Curva S — Avance Acumulado Semanal</h3>
          <span className="ml-auto text-[10px] text-steel-400">Corte: {weekData.d} ({selectedWeek})</span>
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
            <ReferenceLine x="01 Jul" stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Contractual', fontSize: 9, fill: '#dc2626', position: 'top' }} />
            <ReferenceLine x={weekData.d} stroke="#7c3aed" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: selectedWeek, fontSize: 9, fill: '#7c3aed', position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="p" fill="url(#gp)" stroke="none" />
            <Area type="monotone" dataKey="e" fill="url(#ge)" stroke="none" connectNulls={false} />
            <Line type="monotone" dataKey="p" stroke="#1b5eab" strokeWidth={2} dot={<SelectedDot />} name="Planeado" />
            <Line type="monotone" dataKey="e" stroke="#16a34a" strokeWidth={2} dot={<SelectedDotReal />} name="Ejecutado" connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Schedule Table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-steel-200 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-bold text-steel-800">Estructura de Actividades (WBS)</h3>
          {isCustomWeek && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Editable
            </span>
          )}
          <span className="ml-auto text-[10px] text-steel-400 bg-steel-50 px-2 py-1 rounded-full border border-steel-200">
            12 capitulos | 515 actividades | Semana {selectedWeek}
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
              {displayCronograma.map((act) => (
                <ActivityRow
                  key={act.code}
                  act={act}
                  editable={isCustomWeek}
                  onChangeReal={handleChangeReal}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources */}
      <div className="rounded-lg bg-steel-50 border border-steel-200 p-4 text-[10px] text-steel-500">
        <p className="font-bold text-steel-600 mb-1">Fuentes de Datos:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> — Hoja "Curva S (19 mar)": datos semanales planeado/ejecutado</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> — Hoja "Cronog 19 mar": estructura WBS, pesos, fechas y duraciones (515 actividades)</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> — Hoja "Cortes 19 mar": avance real por actividad al corte</li>
          <li><strong>Curva S (19 mar) Pablo.xlsx</strong> — Hoja "Programado 19 mar": avance programado acumulado por actividad</li>
          {customWeeks.length > 0 && (
            <li><strong>Semanas personalizadas</strong> — {customWeeks.map(cw => cw.label).join(', ')} (datos editados localmente)</li>
          )}
        </ul>
      </div>
    </div>
  );
}
