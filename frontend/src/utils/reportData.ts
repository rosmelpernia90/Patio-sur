// Centralized report data for PDF/Excel generation
// All data extracted from real project Excel files
import { formatCOPFull, formatPercent } from './formatNumbers';

export const projectInfo = {
  name: 'Patio de Operacion Sur',
  code: 'OE 1035',
  client: 'Consorcio Express S.A.S.',
  contractor: 'PC Mejia Ingenieria S.A.',
  supervision: 'SGS',
  directorProyectos: 'Esteban Londono',
  ingenieroResidente: 'Daniela Arango',
  supervisor: 'Javier Pinzon',
  tipoContrato: 'EPC',
  fechaInicio: '2025-06-20',
  fechaFinContractual: '2026-07-03',
  fechaFinRevisada: '2026-09-16',
  duracionOriginal: 405,       // dias (linea base 27 nov)
  duracionRevisada: 453,       // dias (linea base 19 mar)
  date: new Date().toLocaleDateString('es-CO'),
};

// ==================== BUDGET DATA ====================
export interface BudgetRow {
  capitulo: string;
  venta: number;
  costo: number;
  margen: number;
  isSubtotal?: boolean;
}

export const budgetData: BudgetRow[] = [
  { capitulo: 'Estudios y Disenos', venta: 419047180, costo: 312727205, margen: 25.4 },
  { capitulo: 'Conexion a la Red', venta: 519268407, costo: 369435063, margen: 28.9 },
  { capitulo: 'Redes MT (Celdas)', venta: 2893959054, costo: 2046582157, margen: 29.3 },
  { capitulo: 'Subestaciones (Shelter)', venta: 3406137000, costo: 2692179338, margen: 21.0 },
  { capitulo: 'Transformadores', venta: 2338037308, costo: 2115002279, margen: 9.5 },
  { capitulo: 'Baja Tension (BT)', venta: 3856386116, costo: 2864635880, margen: 25.7 },
  { capitulo: 'SPE y SPT', venta: 262823529, costo: 257800000, margen: 1.9 },
  { capitulo: 'Comunicaciones', venta: 701469115, costo: 264839198, margen: 62.2 },
  { capitulo: 'Cargadores', venta: 6743603237, costo: 5330376000, margen: 21.0 },
  { capitulo: 'Instalacion Cargadores', venta: 261567164, costo: 191000000, margen: 27.0 },
  { capitulo: 'Iluminacion y Aux.', venta: 147984032, costo: 125786428, margen: 15.0 },
  { capitulo: 'Comp. Reactiva', venta: 547200000, costo: 751864128, margen: -37.4 },
  { capitulo: 'Deteccion Incendios', venta: 270082618, costo: 227943849, margen: 15.6 },
  { capitulo: 'Obras Civiles', venta: 8177142400, costo: 6537881527, margen: 20.0 },
  { capitulo: 'Tramites', venta: 679896358, costo: 186229084, margen: 72.6 },
];

export const budgetTotals = {
  costoDirecto: 24274282134,
  administracion: 3734163668,
  imprevistos: 649419768,
  utilidad: 1298839537,
  ivaUtilidad: 246779512,
  financiacion: 3077349397,
  totalOferta: 41012884481,
  totalCosto: 29457164387,
  margenGlobal: 28.2,
};

// ==================== CASH FLOW DATA ====================
// Fuente: Flujo de caja patio sur 26 marzo.xlsx + pagos Proyeccion de Pagos Patio Sur.xlsx
export interface CashFlowRow {
  periodo: string;
  ingresoProyectado: number;
  ingresoReal: number;
  egresoProyectado: number;
  egresoReal: number;
  netoProyectado: number;
  netoReal: number;
}

export const cashFlowData: CashFlowRow[] = [
  { periodo: 'Oct 2025', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 235139266, egresoReal: 235139266, netoProyectado: -235139266, netoReal: -235139266 },
  { periodo: 'Nov 2025', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 19000000, egresoReal: 954984, netoProyectado: -19000000, netoReal: -954984 },
  { periodo: 'Dic 2025', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 361000000, egresoReal: 198015049, netoProyectado: -361000000, netoReal: -198015049 },
  { periodo: 'Ene 2026', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 350000000, egresoReal: 316045103, netoProyectado: -350000000, netoReal: -316045103 },
  { periodo: 'Feb 2026', ingresoProyectado: 16745324701, ingresoReal: 16745324701, egresoProyectado: 7234000000, egresoReal: 7593000000, netoProyectado: 9511324701, netoReal: 9152324701 },
  { periodo: 'Mar 2026', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 2719000000, egresoReal: 1003716497, netoProyectado: -2719000000, netoReal: -1003716497 },
  { periodo: 'Abr 2026', ingresoProyectado: 5220402000, ingresoReal: 0, egresoProyectado: 4390000000, egresoReal: 0, netoProyectado: 830402000, netoReal: 0 },
  { periodo: 'May 2026', ingresoProyectado: 0, ingresoReal: 0, egresoProyectado: 3626000000, egresoReal: 0, netoProyectado: -3626000000, netoReal: 0 },
  { periodo: 'Jun 2026', ingresoProyectado: 2000000000, ingresoReal: 0, egresoProyectado: 2646000000, egresoReal: 0, netoProyectado: -646000000, netoReal: 0 },
  { periodo: 'Oct 2026', ingresoProyectado: 17714279534, ingresoReal: 0, egresoProyectado: 500000000, egresoReal: 0, netoProyectado: 17214279534, netoReal: 0 },
  { periodo: 'Nov 2026', ingresoProyectado: 16207000000, ingresoReal: 0, egresoProyectado: 300000000, egresoReal: 0, netoProyectado: 15907000000, netoReal: 0 },
];

// Datos del credito puente — Fuente: pagos Proyeccion de Pagos Patio Sur.xlsx (hoja CREDITO)
export const creditData = {
  monto: 17000000000,
  tasa: 13.66, // EA
  tasaNominal: 13.01,
  fechaDesembolso: '2026-02-06',
  fechaVencimiento: '2027-02-06',
  interesMensual: 184265833,
  interesTotal: 2211190000,
  tipo: 'Bullet (pago capital al vencimiento)',
};

// ==================== EARNED VALUE DATA ====================
// Fuentes: Curva S (19 mar).xlsx, BD 2025-2026 PROYECTOS PCM.xlsx, Patio Sur_.xlsx
export const earnedValueData = {
  BAC: 41012884481,                     // Valor contractual oferta mercantil
  PV: 21285687000,                      // BAC × 51.90% (linea base revisada 19 mar, semana S-40)
  EV: 21416929000,                      // BAC × 52.22% (avance real Curva S semana S-40)
  AC: 8530521315,                       // Costo real: materiales $7,552M + admin $500M (Patio Sur_.xlsx)
  CPI: 1.17,                            // Costo presupuestado / EAC bottom-up = $29,457M / $25,157M
  CPI_contractual: 2.51,                // EV/AC (sobre venta) — inflado por margen contractual
  SPI: 1.01,                            // EV/PV — en tiempo vs linea base revisada
  SPI_contractual: 0.73,                // SPI vs linea base original 27 nov — 27% atrasado
  EAC: 25157352188,                     // Proyeccion bottom-up (Pagos Patio Sur)
  ETC: 16626830873,                     // EAC - AC
  VAC: 15855532293,                     // BAC - EAC (utilidad proyectada segun Pagos)
  TCPI: 0.60,                           // (BAC - EV) / (BAC - AC)
  avanceFisico: 52.2,                   // Curva S 19 mar semana S-40
  avancePlanificado: 51.9,              // Linea base revisada semana S-40
  avanceFinanciero: 20.8,               // AC / BAC
  facturado: 16745324701,               // Monto facturado a la fecha
  cobrado: 7511240241,                  // Monto efectivamente cobrado
  costoMateriales: 7552733271,          // Patio Sur_.xlsx
  costoAdmin: 500782825,                // Patio Sur_.xlsx
  costoTotal: 8053516096,               // Patio Sur_.xlsx
  utilidadActual: 1180568364,           // Patio Sur_.xlsx — utilidad realizada a la fecha
};

// ==================== PROCUREMENT DATA ====================
export interface ProcurementRow {
  capitulo: string;
  casoNegocio: number;
  negociado: number;
  pendiente: number;
  ahorro: number;
}

export const procurementData: ProcurementRow[] = [
  { capitulo: 'Estudios y Disenos', casoNegocio: 312727205, negociado: 252360920, pendiente: 60366285, ahorro: 0 },
  { capitulo: 'Conexion a la Red', casoNegocio: 369435063, negociado: 0, pendiente: 369435063, ahorro: 0 },
  { capitulo: 'Redes MT (Celdas)', casoNegocio: 2046582157, negociado: 1238615200, pendiente: 0, ahorro: 807966957 },
  { capitulo: 'Subestaciones (Shelter)', casoNegocio: 2692179338, negociado: 0, pendiente: 460221135, ahorro: 2231958203 },
  { capitulo: 'Transformadores', casoNegocio: 2115002279, negociado: 1211417000, pendiente: 0, ahorro: 903585279 },
  { capitulo: 'Baja Tension (BT)', casoNegocio: 2864635880, negociado: 1988944382, pendiente: 721684532, ahorro: 154006966 },
  { capitulo: 'SPE y SPT', casoNegocio: 257800000, negociado: 0, pendiente: 257800000, ahorro: 0 },
  { capitulo: 'Comunicaciones', casoNegocio: 264839198, negociado: 0, pendiente: 264839198, ahorro: 0 },
  { capitulo: 'Cargadores', casoNegocio: 5330376000, negociado: 4374580000, pendiente: 280756000, ahorro: 675040000 },
  { capitulo: 'Instalacion Cargadores', casoNegocio: 191000000, negociado: 0, pendiente: 191000000, ahorro: 0 },
  { capitulo: 'Iluminacion y Aux.', casoNegocio: 125786428, negociado: 0, pendiente: 125786428, ahorro: 0 },
  { capitulo: 'Comp. Reactiva', casoNegocio: 751864128, negociado: 0, pendiente: 751864128, ahorro: 0 },
  { capitulo: 'Deteccion Incendios', casoNegocio: 227943849, negociado: 0, pendiente: 227943849, ahorro: 0 },
  { capitulo: 'Civil + Estructura', casoNegocio: 6537881527, negociado: 4021596721, pendiente: 2314007162, ahorro: 202278644 },
  { capitulo: 'Tramites', casoNegocio: 186229084, negociado: 13605060, pendiente: 172624024, ahorro: 0 },
];

export const procurementTotals = {
  totalCasoNegocio: 24274282134,
  totalNegociado: 13159418623,
  totalPendiente: 7396537122,
  totalProyectado: 20555955744,
  ahorroCompra: 3718326390,
  pctNegociado: 54.2,
  pctPendiente: 30.5,
};

// ==================== LIVE EVM DATA ====================
// Reads dynamic values from localStorage (same sources as Dashboard)
// - SPI: from Cronograma (patio_sur_custom_weeks_v1)
// - AC: ACTUAL_COST_TOTAL (Flujo de Caja)
// - EAC/BAC: from Caso de Negocio (patio_sur_eac_caso_negocio)
// - CPI: EV_cost / AC

import cronogramaBase from '@/data/cronogramaData';
import type { Activity } from '@/data/cronogramaData';

const LS_WEEKS_KEY = 'patio_sur_custom_weeks_v1';
const LS_EAC_KEY = 'patio_sur_eac_caso_negocio';
const ACTUAL_COST_TOTAL = 8741569503;

interface CustomWeekData { weekNum: number; label: string; dateLabel: string; values: Record<string, number> }

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

const weeklyProgMap = new Map<number, number>([
  [0,0],[1,0.30],[2,1.53],[3,3.21],[4,3.56],[5,3.88],[6,3.96],[7,4.04],
  [8,4.11],[9,4.18],[10,4.25],[11,4.32],[12,4.39],[13,4.52],[14,4.77],[15,5.09],
  [16,6.02],[17,7.07],[18,8.02],[19,10.25],[20,11.29],[21,12.86],[22,14.06],[23,15.51],
  [24,16.93],[25,20.22],[26,21.88],[27,23.71],[28,24.49],[29,25.24],[30,27.11],[31,29.25],
  [32,30.83],[33,34.45],[34,36.33],[35,37.74],[36,39.34],[37,42.54],[38,45.36],[39,48.77],
  [40,51.90],[41,57.38],[42,59.73],[43,62.78],[44,65.31],[45,68.07],[46,76.00],[47,84.65],
  [48,89.86],[49,91.27],[50,92.21],[51,92.77],[52,93.86],[53,94.32],[54,96.39],[55,96.94],
  [56,97.14],[57,97.35],[58,97.52],[59,97.67],[60,97.91],[61,98.28],[62,98.63],[63,98.90],
  [64,99.18],[65,100.00],[66,100.00],
]);

export interface LiveEVMData {
  BAC: number;
  PV: number;
  EV: number;
  AC: number;
  CPI: number;
  SPI: number;
  EAC: number;
  ETC: number;
  VAC: number;
  TCPI: number;
  avanceFisico: number;
  avancePlanificado: number;
  avanceFinanciero: number;
  weekLabel: string;
  weekDate: string;
}

/** Returns EVM metrics computed from the latest dynamic sources (localStorage) */
export function getLiveEarnedValueData(): LiveEVMData {
  // 1. Read SPI source: Cronograma weeks
  let latestWeekNum = 40;
  let latestReal = 52.22;
  let latestLabel = 'S-40';
  let latestDate = '25 Mar';

  try {
    const raw = localStorage.getItem(LS_WEEKS_KEY);
    if (raw) {
      const weeks: CustomWeekData[] = JSON.parse(raw);
      const sorted = [...weeks].sort((a, b) => a.weekNum - b.weekNum);
      if (sorted.length > 0) {
        const last = sorted[sorted.length - 1];
        latestWeekNum = last.weekNum;
        latestReal = computeProjectReal(last.values);
        latestLabel = last.label;
        latestDate = last.dateLabel;
      }
    }
  } catch { /* use defaults */ }

  const latestProg = weeklyProgMap.get(latestWeekNum) ?? 51.90;
  const spi = latestProg > 0 ? Math.round((latestReal / latestProg) * 100) / 100 : 0;

  // 2. Read EAC source: Caso de Negocio
  let eacConFin = 29457164387;
  try {
    const raw = localStorage.getItem(LS_EAC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      eacConFin = parsed.conFin ?? eacConFin;
    }
  } catch { /* use default */ }

  // 3. Compute EVM
  const BAC = budgetTotals.totalOferta;  // $41,012M (valor oferta contractual)
  const AC = ACTUAL_COST_TOTAL;
  const PV = BAC * latestProg / 100;
  const EV_oferta = BAC * latestReal / 100; // EV sobre oferta (para SPI contractual)

  // CPI uses BAC = Costo Total Caso de Negocio (not oferta)
  const bacCosto = eacConFin;
  const evCosto = bacCosto * latestReal / 100;
  const cpi = AC > 0 ? Math.round((evCosto / AC) * 100) / 100 : 0;

  const EAC = eacConFin;
  const ETC = EAC - AC;
  const VAC = BAC - EAC;
  const TCPI = (BAC - AC) > 0 ? Math.round(((BAC - EV_oferta) / (BAC - AC)) * 100) / 100 : 0;

  return {
    BAC,
    PV: Math.round(PV),
    EV: Math.round(EV_oferta),
    AC,
    CPI: cpi,
    SPI: spi,
    EAC,
    ETC,
    VAC,
    TCPI,
    avanceFisico: Math.round(latestReal * 10) / 10,
    avancePlanificado: Math.round(latestProg * 10) / 10,
    avanceFinanciero: Math.round((AC / BAC) * 1000) / 10,
    weekLabel: latestLabel,
    weekDate: latestDate,
  };
}

// ==================== FORMAT HELPERS ====================
// Use centralized formatting utilities
export const fmtCOP = formatCOPFull;

export const fmtNum = (v: number): string =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(v);

export const fmtPct = formatPercent;
