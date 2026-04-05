import { useState, useEffect, useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import cronogramaBase from '@/data/cronogramaData';
import type { Activity } from '@/data/cronogramaData';

// ============================================================
// Semanas personalizadas — misma clave que CronogramaPage
// ============================================================
const LS_KEY = 'patio_sur_custom_weeks_v1';

interface CustomWeekData {
  weekNum: number;
  label: string;
  dateLabel: string;
  values: Record<string, number>;
}

function loadCustomWeeks(): CustomWeekData[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Aplica overrides a hojas y recalcula padres (igual que CronogramaPage) */
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

/** Calcula el avance real del proyecto a partir de los overrides */
function computeProjectReal(values: Record<string, number>): number {
  const tree = applyOverrides(cronogramaBase, values);
  const totalPeso = tree.reduce((s, a) => s + a.peso, 0);
  const weighted = tree.reduce((s, a) => s + a.avanceReal * a.peso, 0);
  return totalPeso > 0 ? Math.round(weighted / totalPeso * 100) / 100 : 0;
}

// ============================================================
// DATA BASE — Curva S del proyecto
// Fuente: "Curva S (19 mar) Pablo.xlsx" → Hoja "Curva S (19 mar)"
// 67 semanas: S-00 (18 Jun 2025) a S-66 (23 Sep 2026)
// ============================================================
interface SCurvePoint {
  week: string;
  date: string;
  planeado: number;
  ejecutado: number | null;
  isCustom?: boolean;
}

const rawData: SCurvePoint[] = [
  { week: 'S-00', date: '2025-06-18', planeado: 0, ejecutado: 0 },
  { week: 'S-01', date: '2025-06-25', planeado: 0.30, ejecutado: 0.30 },
  { week: 'S-02', date: '2025-07-02', planeado: 1.53, ejecutado: 1.53 },
  { week: 'S-03', date: '2025-07-09', planeado: 3.21, ejecutado: 3.21 },
  { week: 'S-04', date: '2025-07-16', planeado: 3.56, ejecutado: 3.56 },
  { week: 'S-05', date: '2025-07-23', planeado: 3.88, ejecutado: 3.88 },
  { week: 'S-06', date: '2025-07-30', planeado: 3.96, ejecutado: 3.96 },
  { week: 'S-07', date: '2025-08-06', planeado: 4.04, ejecutado: 4.04 },
  { week: 'S-08', date: '2025-08-13', planeado: 4.11, ejecutado: 4.11 },
  { week: 'S-09', date: '2025-08-20', planeado: 4.18, ejecutado: 4.18 },
  { week: 'S-10', date: '2025-08-27', planeado: 4.25, ejecutado: 4.25 },
  { week: 'S-11', date: '2025-09-03', planeado: 4.32, ejecutado: 4.32 },
  { week: 'S-12', date: '2025-09-10', planeado: 4.39, ejecutado: 4.39 },
  { week: 'S-13', date: '2025-09-17', planeado: 4.52, ejecutado: 4.52 },
  { week: 'S-14', date: '2025-09-24', planeado: 4.77, ejecutado: 4.77 },
  { week: 'S-15', date: '2025-10-01', planeado: 5.09, ejecutado: 5.09 },
  { week: 'S-16', date: '2025-10-08', planeado: 6.02, ejecutado: 6.02 },
  { week: 'S-17', date: '2025-10-15', planeado: 7.07, ejecutado: 7.07 },
  { week: 'S-18', date: '2025-10-22', planeado: 8.02, ejecutado: 8.02 },
  { week: 'S-19', date: '2025-10-29', planeado: 10.25, ejecutado: 10.43 },
  { week: 'S-20', date: '2025-11-05', planeado: 11.29, ejecutado: 11.44 },
  { week: 'S-21', date: '2025-11-12', planeado: 12.86, ejecutado: 12.99 },
  { week: 'S-22', date: '2025-11-19', planeado: 14.06, ejecutado: 14.17 },
  { week: 'S-23', date: '2025-11-26', planeado: 15.51, ejecutado: 15.65 },
  { week: 'S-24', date: '2025-12-03', planeado: 16.93, ejecutado: 17.12 },
  { week: 'S-25', date: '2025-12-10', planeado: 20.22, ejecutado: 20.60 },
  { week: 'S-26', date: '2025-12-17', planeado: 21.88, ejecutado: 22.47 },
  { week: 'S-27', date: '2025-12-24', planeado: 23.71, ejecutado: 24.62 },
  { week: 'S-28', date: '2025-12-31', planeado: 24.49, ejecutado: 25.52 },
  { week: 'S-29', date: '2026-01-07', planeado: 25.24, ejecutado: 26.31 },
  { week: 'S-30', date: '2026-01-14', planeado: 27.11, ejecutado: 30.16 },
  { week: 'S-31', date: '2026-01-21', planeado: 29.25, ejecutado: 34.00 },
  { week: 'S-32', date: '2026-01-28', planeado: 30.83, ejecutado: 36.41 },
  { week: 'S-33', date: '2026-02-04', planeado: 34.45, ejecutado: 40.38 },
  { week: 'S-34', date: '2026-02-11', planeado: 36.33, ejecutado: 40.66 },
  { week: 'S-35', date: '2026-02-18', planeado: 37.74, ejecutado: 42.00 },
  { week: 'S-36', date: '2026-02-25', planeado: 39.34, ejecutado: 41.48 },
  { week: 'S-37', date: '2026-03-04', planeado: 42.54, ejecutado: 44.95 },
  { week: 'S-38', date: '2026-03-11', planeado: 45.36, ejecutado: 48.05 },
  { week: 'S-39', date: '2026-03-18', planeado: 48.77, ejecutado: 51.23 },
  { week: 'S-40', date: '2026-03-25', planeado: 51.90, ejecutado: 52.22 },
  { week: 'S-41', date: '2026-04-01', planeado: 57.38, ejecutado: null },
  { week: 'S-42', date: '2026-04-08', planeado: 59.73, ejecutado: null },
  { week: 'S-43', date: '2026-04-15', planeado: 62.78, ejecutado: null },
  { week: 'S-44', date: '2026-04-22', planeado: 65.31, ejecutado: null },
  { week: 'S-45', date: '2026-04-29', planeado: 68.07, ejecutado: null },
  { week: 'S-46', date: '2026-05-06', planeado: 76.00, ejecutado: null },
  { week: 'S-47', date: '2026-05-13', planeado: 84.65, ejecutado: null },
  { week: 'S-48', date: '2026-05-20', planeado: 89.86, ejecutado: null },
  { week: 'S-49', date: '2026-05-27', planeado: 91.27, ejecutado: null },
  { week: 'S-50', date: '2026-06-03', planeado: 92.21, ejecutado: null },
  { week: 'S-51', date: '2026-06-10', planeado: 92.77, ejecutado: null },
  { week: 'S-52', date: '2026-06-17', planeado: 93.86, ejecutado: null },
  { week: 'S-53', date: '2026-06-24', planeado: 94.32, ejecutado: null },
  { week: 'S-54', date: '2026-07-01', planeado: 96.39, ejecutado: null },
  { week: 'S-55', date: '2026-07-08', planeado: 96.94, ejecutado: null },
  { week: 'S-56', date: '2026-07-15', planeado: 97.14, ejecutado: null },
  { week: 'S-57', date: '2026-07-22', planeado: 97.35, ejecutado: null },
  { week: 'S-58', date: '2026-07-29', planeado: 97.52, ejecutado: null },
  { week: 'S-59', date: '2026-08-05', planeado: 97.67, ejecutado: null },
  { week: 'S-60', date: '2026-08-12', planeado: 97.91, ejecutado: null },
  { week: 'S-61', date: '2026-08-19', planeado: 98.28, ejecutado: null },
  { week: 'S-62', date: '2026-08-26', planeado: 98.63, ejecutado: null },
  { week: 'S-63', date: '2026-09-02', planeado: 98.90, ejecutado: null },
  { week: 'S-64', date: '2026-09-09', planeado: 99.18, ejecutado: null },
  { week: 'S-65', date: '2026-09-16', planeado: 100.00, ejecutado: null },
  { week: 'S-66', date: '2026-09-23', planeado: 100.00, ejecutado: null },
];

// Format date for display
const fmtDate = (d: string) => {
  const [, m, day] = d.split('-');
  const months: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  };
  return `${parseInt(day)} ${months[m]}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl border border-steel-200 shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-steel-800 mb-1">
        {d.week} — {fmtDate(d.date)}
        {d.isCustom && <span className="ml-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">Nuevo corte</span>}
      </p>
      <p className="text-primary-600">Planeado: <span className="font-bold">{d.planeado.toFixed(2)}%</span></p>
      {d.ejecutado !== null && (
        <>
          <p className="text-emerald-600">Ejecutado: <span className="font-bold">{d.ejecutado.toFixed(2)}%</span></p>
          <p className={d.ejecutado >= d.planeado ? 'text-emerald-600' : 'text-red-500'}>
            Δ: <span className="font-bold">{(d.ejecutado - d.planeado) >= 0 ? '+' : ''}{(d.ejecutado - d.planeado).toFixed(2)}%</span>
          </p>
        </>
      )}
    </div>
  );
};

export default function SCurveChart() {
  const [customWeeks, setCustomWeeks] = useState<CustomWeekData[]>(loadCustomWeeks);

  // Escuchar cambios en localStorage (navegación entre páginas actualiza al volver)
  useEffect(() => {
    const handleStorage = () => setCustomWeeks(loadCustomWeeks());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Re-leer localStorage al montar (por si el usuario viene de Cronograma)
  useEffect(() => {
    setCustomWeeks(loadCustomWeeks());
  }, []);

  // Combinar datos base con semanas personalizadas del Cronograma
  const mergedData = useMemo(() => {
    // Mapa: weekNum → ejecutado calculado de semanas personalizadas
    const customMap = new Map<number, number>();
    for (const cw of customWeeks) {
      customMap.set(cw.weekNum, computeProjectReal(cw.values));
    }

    return rawData.map((d) => {
      const weekNum = parseInt(d.week.replace('S-', ''));
      const customVal = customMap.get(weekNum);
      const isCustom = customVal !== undefined;
      // Mostrar etiqueta cada 2 semanas (semanas pares) para igualar densidad del Cronograma
      const showLabel = weekNum % 2 === 0;
      return {
        ...d,
        ejecutado: isCustom ? customVal : d.ejecutado,
        isCustom,
        label: showLabel ? fmtDate(d.date) : '',
        displayLabel: `${d.week} (${fmtDate(d.date)})`,
      };
    });
  }, [customWeeks]);

  // Semana actual = última con dato ejecutado
  const currentIdx = mergedData.reduce((acc, d, i) => d.ejecutado !== null ? i : acc, 0);
  const currentData = mergedData[currentIdx];
  const currentPlaneado = currentData.planeado;
  const currentEjecutado = currentData.ejecutado as number;
  const desviacion = currentEjecutado - currentPlaneado;
  const spiCurva = currentPlaneado > 0 ? currentEjecutado / currentPlaneado : 0;

  const hasCustomWeeks = customWeeks.length > 0;

  return (
    <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-steel-800">
            Curva S — Avance del Proyecto
          </h3>
          <p className="text-xs text-steel-400 mt-1">
            Progreso acumulado ponderado semanal (Jun 2025 - Sep 2026) | 515 actividades | Fuente: Curva S (19 mar) Pablo.xlsx
            {hasCustomWeeks && (
              <span className="ml-2 text-emerald-600 font-medium">
                + {customWeeks.length} corte{customWeeks.length > 1 ? 's' : ''} nuevo{customWeeks.length > 1 ? 's' : ''} ({customWeeks.map(cw => cw.label).join(', ')})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-primary-600 rounded" />
            <span className="text-steel-500">Planeado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-emerald-600 rounded" />
            <span className="text-steel-500">Ejecutado</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={mergedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="gradPlan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1b5eab" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#1b5eab" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 8, fill: '#6e7179' }}
            tickLine={false}
            interval={0}
            height={42}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: '#6e7179' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Línea de corte actual */}
          <ReferenceLine
            x={mergedData[currentIdx].label || ''}
            stroke={currentData.isCustom ? '#16a34a' : '#8b8e96'}
            strokeDasharray="4 4"
            label={{
              value: `${currentData.week} (${fmtDate(currentData.date)})`,
              position: 'top',
              fontSize: 9,
              fill: currentData.isCustom ? '#16a34a' : '#6e7179',
            }}
          />
          {/* Fecha contractual S-54 */}
          <ReferenceLine
            x={mergedData[54].label || ''}
            stroke="#dc2626"
            strokeDasharray="4 4"
            label={{ value: 'Fecha Contractual (Jul 2026)', position: 'top', fontSize: 8, fill: '#dc2626' }}
          />

          {/* Áreas de relleno */}
          <Area type="monotone" dataKey="planeado" fill="url(#gradPlan)" stroke="none" />
          <Area type="monotone" dataKey="ejecutado" fill="url(#gradReal)" stroke="none" connectNulls={false} />

          {/* Líneas principales */}
          <Line
            type="monotone"
            dataKey="planeado"
            stroke="#1b5eab"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#1b5eab', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="ejecutado"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Métricas resumen */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 border-t border-steel-100 pt-4">
        <div className="text-center">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Semana Actual</p>
          <p className="text-sm font-bold text-steel-800 flex items-center justify-center gap-1">
            {currentData.week}
            {currentData.isCustom && (
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">Nuevo</span>
            )}
          </p>
          <p className="text-[10px] text-steel-400">{fmtDate(currentData.date)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Avance Planificado</p>
          <p className="text-lg font-bold text-primary-600">{currentPlaneado.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Avance Real</p>
          <p className="text-lg font-bold text-emerald-600">{currentEjecutado.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Desviacion</p>
          <p className={`text-lg font-bold ${desviacion >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {desviacion >= 0 ? '+' : ''}{desviacion.toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">SPI (Curva S)</p>
          <p className={`text-lg font-bold ${spiCurva >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {spiCurva.toFixed(2)}
          </p>
          <p className="text-[10px] text-steel-400">Real / Planeado</p>
        </div>
      </div>
    </div>
  );
}
