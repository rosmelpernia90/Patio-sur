// ============================================================
// cronogramaStats.ts — Utilidad compartida de avance del cronograma
// Lee localStorage (misma clave que CronogramaPage) y devuelve
// los KPIs de la semana más reciente con datos reales.
// ============================================================

import cronogramaBase from '@/data/cronogramaData';
import type { Activity } from '@/data/cronogramaData';

const LS_KEY = 'patio_sur_custom_weeks_v1';

// Datos base de la Curva S (hasta S-40 con avance real registrado)
const sCurveBase: { w: string; d: string; p: number; e: number | null }[] = [
  { w: 'S-00', d: '18 Jun', p: 0, e: 0 },
  { w: 'S-02', d: '02 Jul', p: 1.53, e: 1.53 },
  { w: 'S-04', d: '16 Jul', p: 3.56, e: 3.56 },
  { w: 'S-06', d: '30 Jul', p: 3.96, e: 3.96 },
  { w: 'S-08', d: '13 Ago', p: 4.11, e: 4.11 },
  { w: 'S-10', d: '27 Ago', p: 4.25, e: 4.25 },
  { w: 'S-12', d: '10 Sep', p: 4.39, e: 4.39 },
  { w: 'S-14', d: '24 Sep', p: 4.77, e: 4.77 },
  { w: 'S-16', d: '08 Oct', p: 6.02, e: 6.02 },
  { w: 'S-18', d: '22 Oct', p: 8.02, e: 8.02 },
  { w: 'S-20', d: '05 Nov', p: 11.29, e: 11.44 },
  { w: 'S-22', d: '19 Nov', p: 14.06, e: 14.17 },
  { w: 'S-24', d: '03 Dic', p: 16.93, e: 17.12 },
  { w: 'S-26', d: '17 Dic', p: 21.88, e: 22.47 },
  { w: 'S-28', d: '31 Dic', p: 24.49, e: 25.52 },
  { w: 'S-30', d: '14 Ene', p: 27.11, e: 30.16 },
  { w: 'S-32', d: '28 Ene', p: 30.83, e: 36.41 },
  { w: 'S-34', d: '11 Feb', p: 36.33, e: 40.66 },
  { w: 'S-36', d: '25 Feb', p: 39.34, e: 41.48 },
  { w: 'S-38', d: '11 Mar', p: 45.36, e: 48.05 },
  { w: 'S-40', d: '25 Mar', p: 51.90, e: 52.22 },
  { w: 'S-42', d: '08 Abr', p: 59.73, e: null },
];

// Tabla completa de avance programado por semana
const weeklyProgrammed: Record<number, { d: string; p: number }> = {
  0: { d: '18 Jun', p: 0.00 }, 1: { d: '25 Jun', p: 0.30 }, 2: { d: '02 Jul', p: 1.53 },
  3: { d: '09 Jul', p: 3.21 }, 4: { d: '16 Jul', p: 3.56 }, 5: { d: '23 Jul', p: 3.88 },
  6: { d: '30 Jul', p: 3.96 }, 7: { d: '06 Ago', p: 4.04 }, 8: { d: '13 Ago', p: 4.11 },
  9: { d: '20 Ago', p: 4.18 }, 10: { d: '27 Ago', p: 4.25 }, 11: { d: '03 Sep', p: 4.32 },
  12: { d: '10 Sep', p: 4.39 }, 13: { d: '17 Sep', p: 4.52 }, 14: { d: '24 Sep', p: 4.77 },
  15: { d: '01 Oct', p: 5.09 }, 16: { d: '08 Oct', p: 6.02 }, 17: { d: '15 Oct', p: 7.07 },
  18: { d: '22 Oct', p: 8.02 }, 19: { d: '29 Oct', p: 10.25 }, 20: { d: '05 Nov', p: 11.29 },
  21: { d: '12 Nov', p: 12.86 }, 22: { d: '19 Nov', p: 14.06 }, 23: { d: '26 Nov', p: 15.51 },
  24: { d: '03 Dic', p: 16.93 }, 25: { d: '10 Dic', p: 20.22 }, 26: { d: '17 Dic', p: 21.88 },
  27: { d: '24 Dic', p: 23.71 }, 28: { d: '31 Dic', p: 24.49 }, 29: { d: '07 Ene', p: 25.24 },
  30: { d: '14 Ene', p: 27.11 }, 31: { d: '21 Ene', p: 29.25 }, 32: { d: '28 Ene', p: 30.83 },
  33: { d: '04 Feb', p: 34.45 }, 34: { d: '11 Feb', p: 36.33 }, 35: { d: '18 Feb', p: 37.74 },
  36: { d: '25 Feb', p: 39.34 }, 37: { d: '04 Mar', p: 42.54 }, 38: { d: '11 Mar', p: 45.36 },
  39: { d: '18 Mar', p: 48.77 }, 40: { d: '25 Mar', p: 51.90 }, 41: { d: '01 Abr', p: 57.38 },
  42: { d: '08 Abr', p: 59.73 }, 43: { d: '15 Abr', p: 62.78 }, 44: { d: '22 Abr', p: 65.31 },
  45: { d: '29 Abr', p: 68.07 }, 46: { d: '06 May', p: 76.00 }, 47: { d: '13 May', p: 84.65 },
  48: { d: '20 May', p: 89.86 }, 49: { d: '27 May', p: 91.27 }, 50: { d: '03 Jun', p: 92.21 },
  51: { d: '10 Jun', p: 92.77 }, 52: { d: '17 Jun', p: 93.86 }, 53: { d: '24 Jun', p: 94.32 },
  54: { d: '01 Jul', p: 96.39 }, 55: { d: '08 Jul', p: 96.94 }, 56: { d: '15 Jul', p: 97.14 },
  57: { d: '22 Jul', p: 97.35 }, 58: { d: '29 Jul', p: 97.52 }, 59: { d: '05 Ago', p: 97.67 },
  60: { d: '12 Ago', p: 97.91 }, 61: { d: '19 Ago', p: 98.28 }, 62: { d: '26 Ago', p: 98.63 },
  63: { d: '02 Sep', p: 98.90 }, 64: { d: '09 Sep', p: 99.18 }, 65: { d: '16 Sep', p: 100.00 },
  66: { d: '23 Sep', p: 100.00 },
};

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

function computeProjectReal(values: Record<string, number>): number {
  const tree = applyOverrides(cronogramaBase, values);
  const totalPeso = tree.reduce((s, a) => s + a.peso, 0);
  const weighted = tree.reduce((s, a) => s + a.avanceReal * a.peso, 0);
  return totalPeso > 0 ? Math.round(weighted / totalPeso * 100) / 100 : 0;
}

export interface CronogramaStats {
  weekLabel: string;   // e.g. "S-41"
  dateLabel: string;   // e.g. "01 Abr"
  planned: number;     // % planificado (0-100)
  real: number;        // % real (0-100)
  spi: number;         // real / planned
}

/**
 * Retorna el KPI de avance de la última semana con datos registrados.
 * Prioriza semanas personalizadas del localStorage, luego cae en S-40 base.
 */
export function getCronogramaStats(): CronogramaStats {
  // 1. Leer semanas personalizadas del localStorage
  let customWeeks: { weekNum: number; label: string; dateLabel: string; values: Record<string, number> }[] = [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) customWeeks = JSON.parse(raw);
  } catch { /* ignore */ }

  if (customWeeks.length > 0) {
    // Tomar la semana más reciente
    const latest = customWeeks.reduce((a, b) => a.weekNum > b.weekNum ? a : b);
    const planned = weeklyProgrammed[latest.weekNum]?.p ?? latest.weekNum / 66 * 100;
    const real = computeProjectReal(latest.values);
    return {
      weekLabel: latest.label,
      dateLabel: latest.dateLabel,
      planned: Math.round(planned * 10) / 10,
      real: Math.round(real * 10) / 10,
      spi: planned > 0 ? Math.round(real / planned * 100) / 100 : 0,
    };
  }

  // 2. Fallback: última semana base con datos reales (S-40)
  const baseWithReal = sCurveBase.filter(d => d.e !== null);
  const lastBase = baseWithReal[baseWithReal.length - 1];
  const planned = lastBase.p;
  const real = lastBase.e ?? 0;
  return {
    weekLabel: lastBase.w,
    dateLabel: lastBase.d,
    planned: Math.round(planned * 10) / 10,
    real: Math.round(real * 10) / 10,
    spi: planned > 0 ? Math.round(real / planned * 100) / 100 : 0,
  };
}
