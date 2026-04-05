import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatCOP, formatCOPFull } from '@/utils/formatNumbers';
import {
  Download, AlertTriangle, TrendingDown, Wallet, CreditCard,
  ArrowDownRight, ArrowUpRight, Landmark, GripVertical,
  ChevronDown, ChevronRight, Plus, Minus, DollarSign,
  Bell, Edit3, Check, X, Users, Briefcase, Package,
  Droplets, Zap, Target, TrendingUp, Calendar, Lightbulb,
  Paperclip, FileText, Trash2,
} from 'lucide-react';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import HelpButton from '@/components/common/HelpButton';
import clsx from 'clsx';

// ============================================================
// TYPES
// ============================================================
type GroupId = 'materiales' | 'mano_obra' | 'administracion';

interface PaymentItem {
  id: string;
  proveedor: string;
  concepto: string;
  contratoTotal: number;
  pagado: number;
  porPagar: number;
  grupo: GroupId;
  estado: 'pagado' | 'parcial' | 'pendiente' | 'por_negociar';
  observacion?: string;
  isNominaExterna?: boolean; // items from nomina in observations — toggleable
  incluido: boolean; // whether it's included in the totals
}

interface IncomeEntry {
  id: string;
  label: string;
  monto: number;
  editable: boolean;
  isScenario?: boolean;
  scenarioDate?: string; // Formato: "DD/MM/YYYY"
  incomeMonth?: string;  // Mes donde se aplica el ingreso, ej: "Feb 2026"
}

interface MonthlyPaymentDetail {
  proveedor: string;
  concepto: string;
  categoria: string;
  grupo: GroupId;
  monto: number;
}

// ============================================================
// REAL DATA — Extracted from "Proyeccion de Pagos Patio Sur (1).xlsx"
// Sheet: "Hoja2" (main projection), "Pagos Patio Sur" (status/payments)
// ============================================================

const INITIAL_ITEMS: PaymentItem[] = [
  // ── MATERIALES ──────────────────────────────────────────────
  // Equipos principales
  { id: 'M01', proveedor: 'Starcharge', concepto: 'Cargadores electricos (importacion)', contratoTotal: 4232468750, pagado: 4231800000, porPagar: 668750, grupo: 'materiales', estado: 'pagado', incluido: true },
  { id: 'M02', proveedor: 'WEG', concepto: 'Transformadores', contratoTotal: 1004389650, pagado: 351500000, porPagar: 652889650, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M03', proveedor: 'MTG', concepto: 'Celdas MT/BT', contratoTotal: 1473080000, pagado: 368300000, porPagar: 1104780000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M04', proveedor: 'IVA Cargadores', concepto: 'IVA importacion cargadores', contratoTotal: 211623438, pagado: 211623438, porPagar: 0, grupo: 'materiales', estado: 'pagado', incluido: true },
  // Obras civiles
  { id: 'M05', proveedor: 'R2F', concepto: 'Obras civiles (contrato final)', contratoTotal: 3100000000, pagado: 491700000, porPagar: 2608300000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M06', proveedor: 'Taesmet', concepto: 'Estructura metalica', contratoTotal: 2043000000, pagado: 810200000, porPagar: 1232800000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M07', proveedor: 'Building Panel', concepto: 'Cubierta', contratoTotal: 502000000, pagado: 0, porPagar: 502000000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M08', proveedor: 'IDC', concepto: 'Perforacion pilotes', contratoTotal: 346600000, pagado: 254200000, porPagar: 92400000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M09', proveedor: 'Prowinch', concepto: 'Brazo movil', contratoTotal: 119800000, pagado: 0, porPagar: 119800000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M10', proveedor: 'P&C Pinturas', concepto: 'Pintura y acabados', contratoTotal: 139000000, pagado: 0, porPagar: 139000000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  // Cables y barras
  { id: 'M11', proveedor: 'Cablecol', concepto: 'Cable MT', contratoTotal: 193800000, pagado: 0, porPagar: 193800000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M12', proveedor: 'Cable BT AC', concepto: 'Cable BT corriente alterna', contratoTotal: 665000000, pagado: 288500000, porPagar: 376500000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M13', proveedor: 'Cablecol', concepto: 'Cable BT DC', contratoTotal: 938200000, pagado: 0, porPagar: 938200000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M14', proveedor: 'Alpa', concepto: 'Bus barras', contratoTotal: 281700000, pagado: 200000000, porPagar: 81700000, grupo: 'materiales', estado: 'parcial', incluido: true },
  // Sistemas
  { id: 'M15', proveedor: 'Bandejas', concepto: 'Bandejas portacables', contratoTotal: 250000000, pagado: 0, porPagar: 250000000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M16', proveedor: 'Hidrocol', concepto: 'Pozos capacitivos (sum. + inst.)', contratoTotal: 71400000, pagado: 0, porPagar: 71400000, grupo: 'materiales', estado: 'por_negociar', observacion: 'Pendiente por negociacion', incluido: true },
  { id: 'M17', proveedor: 'LG ITS', concepto: 'Sistema ITS', contratoTotal: 407800000, pagado: 0, porPagar: 407800000, grupo: 'materiales', estado: 'pendiente', incluido: true },
  { id: 'M18', proveedor: 'Det. Incendios', concepto: 'Sistema deteccion incendios', contratoTotal: 227900000, pagado: 0, porPagar: 227900000, grupo: 'materiales', estado: 'pendiente', incluido: true },
  { id: 'M19', proveedor: 'Comunicaciones', concepto: 'Sistema de comunicaciones', contratoTotal: 264800000, pagado: 0, porPagar: 264800000, grupo: 'materiales', estado: 'pendiente', incluido: true },
  { id: 'M20', proveedor: 'Apantallamiento', concepto: 'Sistema apantallamiento', contratoTotal: 186400000, pagado: 0, porPagar: 186400000, grupo: 'materiales', estado: 'pendiente', incluido: true },
  // Logistica
  { id: 'M21', proveedor: 'Magnum', concepto: 'Flete + seguro importacion', contratoTotal: 39400000, pagado: 39400000, porPagar: 0, grupo: 'materiales', estado: 'pagado', incluido: true },
  { id: 'M22', proveedor: 'OTM / ZF / Aduana', concepto: 'Logistica aduanera y transporte', contratoTotal: 72700000, pagado: 72700000, porPagar: 0, grupo: 'materiales', estado: 'pagado', incluido: true },
  // Disenos
  { id: 'M23', proveedor: 'R2F / Mobile / SICE', concepto: 'Estudios y disenos (paquete)', contratoTotal: 184600000, pagado: 184600000, porPagar: 0, grupo: 'materiales', estado: 'pagado', incluido: true },
  // Tramites
  { id: 'M24', proveedor: 'RETIE / PMT / Otros', concepto: 'Tramites y certificaciones', contratoTotal: 40000000, pagado: 5400000, porPagar: 34600000, grupo: 'materiales', estado: 'parcial', incluido: true },
  { id: 'M25', proveedor: 'Jesus A. Lozano', concepto: 'Trabajos electricos adicionales', contratoTotal: 40000000, pagado: 20000000, porPagar: 20000000, grupo: 'materiales', estado: 'parcial', incluido: true },

  // ── MANO DE OBRA ────────────────────────────────────────────
  { id: 'MO01', proveedor: 'PC Mejia', concepto: 'Operativos obra (Mar-Sep 2026)', contratoTotal: 589400000, pagado: 84200000, porPagar: 505200000, grupo: 'mano_obra', estado: 'parcial', observacion: 'Proyeccion $84.2M/mes x 7 meses restantes', incluido: true },

  // ── ADMINISTRACION ──────────────────────────────────────────
  { id: 'A01', proveedor: 'GIR', concepto: 'Polizas y seguros', contratoTotal: 235100000, pagado: 235100000, porPagar: 0, grupo: 'administracion', estado: 'pagado', incluido: true },
  { id: 'A02', proveedor: 'PC Mejia', concepto: 'Nomina administrativa (Mar-Sep)', contratoTotal: 169400000, pagado: 24200000, porPagar: 145200000, grupo: 'administracion', estado: 'parcial', observacion: 'Proyeccion $24.2M/mes x 7 meses', incluido: true },
  { id: 'A03', proveedor: 'Tecnigrafic', concepto: 'Impresion planos y documentos', contratoTotal: 15000000, pagado: 5000000, porPagar: 10000000, grupo: 'administracion', estado: 'parcial', incluido: true },
  { id: 'A04', proveedor: 'Varios', concepto: 'EPPs y dotacion', contratoTotal: 25000000, pagado: 8000000, porPagar: 17000000, grupo: 'administracion', estado: 'parcial', incluido: true },
  { id: 'A05', proveedor: 'Le Catering', concepto: 'Evento primera piedra', contratoTotal: 12000000, pagado: 12000000, porPagar: 0, grupo: 'administracion', estado: 'pagado', incluido: true },
  { id: 'A06', proveedor: 'Caja Menor', concepto: 'Gastos menores operativos', contratoTotal: 30000000, pagado: 10000000, porPagar: 20000000, grupo: 'administracion', estado: 'parcial', incluido: true },
  { id: 'A07', proveedor: 'Préstamo Interno', concepto: 'Préstamo interno (egreso Banco Occidente)', contratoTotal: 7506435528, pagado: 7506435528, porPagar: 0, grupo: 'administracion', estado: 'pagado', observacion: 'Desembolso de préstamo interno en febrero 2026', incluido: true },

  // ── NOMINA EXTERNA (en observaciones — toggleable) ──────────
  { id: 'NE01', proveedor: 'Nomina Externa', concepto: 'Nomina operativa otros proyectos (REPONER)', contratoTotal: 860000000, pagado: 0, porPagar: 860000000, grupo: 'administracion', estado: 'pendiente', observacion: 'Nomina que se pago desde Patio Sur para otros proyectos. Pendiente reposicion.', isNominaExterna: true, incluido: false },
  { id: 'NE02', proveedor: 'Factoring', concepto: 'Factoring pagado desde Patio Sur (REPONER)', contratoTotal: 640000000, pagado: 0, porPagar: 640000000, grupo: 'administracion', estado: 'pendiente', observacion: 'Factoring de otros proyectos cargado a Patio Sur. Pendiente reposicion.', isNominaExterna: true, incluido: false },
];

// ============================================================
// CASH FLOW MONTHLY ENTRIES (for chart)
// ============================================================
const cashFlowEntries = [
  { id: '1', project_id: '', year: 2025, month: 10, period_label: 'Oct 2025', projected_income: 0, projected_expense: 235139266, projected_net: -235139266, actual_income: 0, actual_expense: 235139266, actual_net: -235139266, is_negative_cash_flow: true },
  { id: '2', project_id: '', year: 2025, month: 11, period_label: 'Nov 2025', projected_income: 0, projected_expense: 19000000, projected_net: -19000000, actual_income: 0, actual_expense: 954984, actual_net: -954984, is_negative_cash_flow: true },
  { id: '3', project_id: '', year: 2025, month: 12, period_label: 'Dic 2025', projected_income: 0, projected_expense: 361000000, projected_net: -361000000, actual_income: 0, actual_expense: 198015049, actual_net: -198015049, is_negative_cash_flow: true },
  { id: '4', project_id: '', year: 2026, month: 1, period_label: 'Ene 2026', projected_income: 0, projected_expense: 350000000, projected_net: -350000000, actual_income: 0, actual_expense: 316045103, actual_net: -316045103, is_negative_cash_flow: true },
  { id: '5', project_id: '', year: 2026, month: 2, period_label: 'Feb 2026', projected_income: 16855000000, projected_expense: 7526804818, projected_net: 9328195182, actual_income: 16855000000, actual_expense: 7526804818, actual_net: 9328195182, is_negative_cash_flow: false },
  { id: '6', project_id: '', year: 2026, month: 3, period_label: 'Mar 2026', projected_income: 0, projected_expense: 1003716497, projected_net: -1003716497, actual_income: 0, actual_expense: 1003716497, actual_net: -1003716497, is_negative_cash_flow: true },
  { id: '7', project_id: '', year: 2026, month: 4, period_label: 'Abr 2026', projected_income: 0, projected_expense: 2310900000, projected_net: -2310900000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
  { id: '8', project_id: '', year: 2026, month: 5, period_label: 'May 2026', projected_income: 0, projected_expense: 789700000, projected_net: -789700000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
  { id: '9', project_id: '', year: 2026, month: 6, period_label: 'Jun 2026', projected_income: 0, projected_expense: 500000000, projected_net: -500000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
  { id: '10', project_id: '', year: 2026, month: 7, period_label: 'Jul 2026', projected_income: 0, projected_expense: 171300000, projected_net: -171300000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
  { id: '11', project_id: '', year: 2026, month: 8, period_label: 'Ago 2026', projected_income: 0, projected_expense: 300000000, projected_net: -300000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
  { id: '12', project_id: '', year: 2026, month: 9, period_label: 'Sep 2026', projected_income: 0, projected_expense: 200000000, projected_net: -200000000, actual_income: 0, actual_expense: 0, actual_net: 0, is_negative_cash_flow: true },
];

// ============================================================
// MONTHLY PAYMENT DETAILS — extracted from "Pagos Patio Sur (2)" sheet
// ============================================================
const MONTHLY_PAYMENT_DETAILS: Record<string, MonthlyPaymentDetail[]> = {
  'Oct 2025': [
    { proveedor: 'GIR', concepto: 'Pólizas y seguros obra', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 235139267 },
  ],
  'Nov 2025': [
    { proveedor: 'Varios', concepto: 'Gastos operativos menores', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 954984 },
  ],
  'Dic 2025': [
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa diciembre', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 61556893 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa diciembre', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 53401348 },
    { proveedor: 'Producciones generales SA', concepto: 'Maletines primera piedra', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 13685000 },
    { proveedor: 'Le catering francés SAS', concepto: 'Evento primera piedra', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 7676465 },
    { proveedor: 'Tecnigrafic Digital S.A.S', concepto: 'Pendón evento primera piedra', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 202300 },
    { proveedor: 'Prev&sa', concepto: "EPP's dotación", categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 80100 },
    { proveedor: 'Cinco T SAS', concepto: 'Servicios técnicos', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 386100 },
    { proveedor: 'Daniela Arango Ramírez', concepto: 'Caja menor', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 91000 },
    { proveedor: 'Acualianza & Baquero S.A.S', concepto: 'Servicios varios', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 891000 },
    { proveedor: 'R2F', concepto: 'Estudio de suelos (Factura 38)', categoria: 'DISEÑOS', grupo: 'materiales', monto: 52586100 },
    { proveedor: 'Hidrocol', concepto: 'Medida resistividad', categoria: 'DISEÑOS', grupo: 'materiales', monto: 1558900 },
    { proveedor: 'Mobilé', concepto: 'Diseño geométrico (Anticipo)', categoria: 'DISEÑOS', grupo: 'materiales', monto: 10000000 },
    { proveedor: 'Starcharge', concepto: 'Cargadores (Anticipo importación)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 4231824600 },
    { proveedor: 'Magnum', concepto: 'Flete + seguro importación', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 39401866 },
  ],
  'Ene 2026': [
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa enero 2026', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 56490719 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa enero 2026', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 75844027 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica (Anticipo)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 810246566 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura (Anticipo)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 251021000 },
    { proveedor: 'IDC', concepto: 'Perforación horizontal dirigida (Anticipo)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 254236471 },
    { proveedor: 'R2F', concepto: 'Obras civiles (Anticipo contrato final)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 1240000000 },
    { proveedor: 'WEG', concepto: 'Transformadores (Anticipo)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 351483685 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT (Anticipo)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 368295250 },
    { proveedor: 'Cablecol', concepto: 'Cable BT DC (Anticipo)', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 281461200 },
    { proveedor: 'Alpa', concepto: 'Bus de barras (Anticipo)', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 140833442 },
    { proveedor: 'Hidrocol', concepto: 'Suministro pozos capacitivos', categoria: 'SISTEMAS', grupo: 'materiales', monto: 52528886 },
    { proveedor: 'LG', concepto: 'Sistema ITS (Anticipo)', categoria: 'SISTEMAS', grupo: 'materiales', monto: 171328780 },
    { proveedor: 'Calidad de Energía', concepto: 'RETIE (Anticipo)', categoria: 'TRÁMITES', grupo: 'materiales', monto: 13495000 },
    { proveedor: 'Transiobras', concepto: 'PMT (Anticipo)', categoria: 'TRÁMITES', grupo: 'materiales', monto: 2700000 },
    { proveedor: 'INVERSIONES FLEXILECTRIC SAS', concepto: 'Anticipo inversiones', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 41572591 },
  ],
  'Feb 2026': [
    { proveedor: 'R2F', concepto: 'Estudio de suelos', categoria: 'DISEÑOS', grupo: 'materiales', monto: 52586100 },
    { proveedor: 'Mobilé', concepto: 'Diseño geométrico', categoria: 'DISEÑOS', grupo: 'materiales', monto: 63396800 },
    { proveedor: 'Ingeici', concepto: 'Diseño RCI', categoria: 'DISEÑOS', grupo: 'materiales', monto: 5980000 },
    { proveedor: 'SICE', concepto: 'ETPS y Coordinación de protecciones', categoria: 'DISEÑOS', grupo: 'materiales', monto: 21822220 },
    { proveedor: 'EDI', concepto: 'Diseño de iluminación', categoria: 'DISEÑOS', grupo: 'materiales', monto: 2565000 },
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 1)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 1240000000 },
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato inicial', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 444000194 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 810246566 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 251021000 },
    { proveedor: 'IDC', concepto: 'Perforación horizontal dirigida', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 254236471 },
    { proveedor: 'Prowinch', concepto: 'Brazo móvil', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 59910600 },
    { proveedor: 'P&C Pinturas', concepto: 'Pintura patio', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 69485534 },
    { proveedor: 'WEG', concepto: 'Transformadores', categoria: 'EQUIPOS', grupo: 'materiales', monto: 351483685 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT', categoria: 'EQUIPOS', grupo: 'materiales', monto: 368295250 },
    { proveedor: 'Starcharge', concepto: 'Cargadores (importación)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 4231824600 },
    { proveedor: 'IVA Cargadores', concepto: 'IVA importación cargadores', categoria: 'EQUIPOS', grupo: 'materiales', monto: 211591230 },
    { proveedor: 'Cablecol', concepto: 'Cable MT', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 96908564 },
    { proveedor: 'Cablecol', concepto: 'Cable BT DC', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 288497730 },
    { proveedor: 'Alpa', concepto: 'Bus de barras', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 140833442 },
    { proveedor: 'Hidrocol', concepto: 'Suministro pozos capacitivos', categoria: 'SISTEMAS', grupo: 'materiales', monto: 52528886 },
    { proveedor: 'Hidrocol', concepto: 'Instalación pozos capacitivos', categoria: 'SISTEMAS', grupo: 'materiales', monto: 11337734 },
    { proveedor: 'LG', concepto: 'Sistema ITS', categoria: 'SISTEMAS', grupo: 'materiales', monto: 171328780 },
    { proveedor: 'Magnum', concepto: 'Flete + seguro importación', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 39401866 },
    { proveedor: 'Magnum', concepto: 'OTM', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 34075000 },
    { proveedor: 'Magnum', concepto: 'Zona franca — cuando ingrese la mercancía', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 17785000 },
    { proveedor: 'Magnum', concepto: 'Agenciamiento aduanero — RETIE — LEVANTE', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 17242000 },
    { proveedor: 'Calidad de Energía', concepto: 'RETIE', categoria: 'TRÁMITES', grupo: 'materiales', monto: 13495000 },
    { proveedor: 'Transiobras', concepto: 'PMT', categoria: 'TRÁMITES', grupo: 'materiales', monto: 2700000 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa febrero 2026', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 64293985 },
    { proveedor: 'GIR', concepto: 'Pólizas obra', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 235139267 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 189610068 },
    { proveedor: 'GABRIEL DE JESUS BALDOVINO AP 50%', concepto: 'Anticipo personal', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 4250000 },
    { proveedor: 'IEO GUSTAVO ADOLFO AP 50%', concepto: 'Anticipo personal', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 20800000 },
    { proveedor: 'INVERSIONES FLEXILECTRIC SAS', concepto: 'Otros pagos', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 41572591 },
  ],
  'Mar 2026': [
    { proveedor: 'Ingeici', concepto: 'Diseño RCI (Pago 2)', categoria: 'DISEÑOS', grupo: 'materiales', monto: 11810500 },
    { proveedor: 'SICE', concepto: 'ETPS y Coordinación de protecciones (Pago 2)', categoria: 'DISEÑOS', grupo: 'materiales', monto: 3907960 },
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 2)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 792375502 },
    { proveedor: 'IDC', concepto: 'Perforación horizontal dirigida (Pago 2)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 92329280 },
    { proveedor: 'Prowinch', concepto: 'Brazo móvil (Pago 2)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 69460015 },
    { proveedor: 'Alpa', concepto: 'Bus de barras (Pago 2)', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 95861419 },
    { proveedor: 'JESUS ANTONIO LOZANO CASTRO', concepto: 'Prestación de servicios e instalación', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 20000000 },
    { proveedor: 'Hidrocol', concepto: 'Instalación pozos capacitivos (Pago 2)', categoria: 'SISTEMAS', grupo: 'materiales', monto: 7558489 },
    { proveedor: 'LG', concepto: 'Sistema ITS (Pago real marzo)', categoria: 'SISTEMAS', grupo: 'materiales', monto: 174870247 },
    { proveedor: 'Magnum', concepto: 'Agenciamiento aduanero (real marzo)', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 16470748 },
    { proveedor: 'Magnum', concepto: 'Tte a patio', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 3600000 },
    { proveedor: 'Transiobras', concepto: 'PMT (Pago 2)', categoria: 'TRÁMITES', grupo: 'materiales', monto: 2655000 },
    { proveedor: 'Transiobras', concepto: 'Licencia intervención espacio público', categoria: 'TRÁMITES', grupo: 'materiales', monto: 1180000 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 189610068 },
  ],
  'Abr 2026': [
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 3)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 620000000 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 168530833 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 251021000 },
    { proveedor: 'IDC', concepto: 'Perforación horizontal dirigida', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 128329280 },
    { proveedor: 'WEG', concepto: 'Transformadores (saldo)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 652755415 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT (saldo)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 1104885750 },
    { proveedor: 'Hidrocol', concepto: 'Suministro pozos capacitivos', categoria: 'SISTEMAS', grupo: 'materiales', monto: 9673821 },
    { proveedor: 'Hidrocol', concepto: 'Instalación pozos capacitivos', categoria: 'SISTEMAS', grupo: 'materiales', monto: 18896223 },
    { proveedor: 'Sistema', concepto: 'Detección de incendios', categoria: 'SISTEMAS', grupo: 'materiales', monto: 91177540 },
    { proveedor: 'Sistema', concepto: 'Comunicaciones', categoria: 'SISTEMAS', grupo: 'materiales', monto: 105935679 },
    { proveedor: 'Sistema', concepto: 'Apantallamiento', categoria: 'SISTEMAS', grupo: 'materiales', monto: 74549956 },
    { proveedor: 'Magnum', concepto: 'OTM', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 34075000 },
    { proveedor: 'Magnum', concepto: 'Zona franca', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 17785000 },
    { proveedor: 'Magnum', concepto: 'Tte a patio', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 3600000 },
    { proveedor: 'Contratista', concepto: 'Mano de obra y montacarga y descargue', categoria: 'LOGÍSTICA', grupo: 'materiales', monto: 5000000 },
    { proveedor: 'Calidad de Energía', concepto: 'RETIE', categoria: 'TRÁMITES', grupo: 'materiales', monto: 16059050 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
  'May 2026': [
    { proveedor: 'EDI', concepto: 'Diseño de iluminación (saldo)', categoria: 'DISEÑOS', grupo: 'materiales', monto: 3325500 },
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 4)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 993962963 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 243433426 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 83673667 },
    { proveedor: 'Prowinch', concepto: 'Brazo móvil', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 19960920 },
    { proveedor: 'P&C Pinturas', concepto: 'Pintura patio', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 69485535 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT', categoria: 'EQUIPOS', grupo: 'materiales', monto: 368295250 },
    { proveedor: 'Cablecol', concepto: 'Cable MT', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 193817128 },
    { proveedor: 'LG', concepto: 'Sistema ITS', categoria: 'SISTEMAS', grupo: 'materiales', monto: 236433716 },
    { proveedor: 'Sistema', concepto: 'Detección de incendios', categoria: 'SISTEMAS', grupo: 'materiales', monto: 68383155 },
    { proveedor: 'Sistema', concepto: 'Comunicaciones', categoria: 'SISTEMAS', grupo: 'materiales', monto: 79451759 },
    { proveedor: 'Sistema', concepto: 'Apantallamiento', categoria: 'SISTEMAS', grupo: 'materiales', monto: 55912467 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
  'Jun 2026': [
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 5)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 620000000 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 243433426 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 83673667 },
    { proveedor: 'Prowinch', concepto: 'Brazo móvil', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 19960920 },
    { proveedor: 'WEG', concepto: 'Transformadores', categoria: 'EQUIPOS', grupo: 'materiales', monto: 200847820 },
    { proveedor: 'Cable BT AC', concepto: 'Cable BT corriente alterna', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 221666667 },
    { proveedor: 'Alpa', concepto: 'Bus de barras', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 94809644 },
    { proveedor: 'Bandejas', concepto: 'Bandejas portacables', categoria: 'SISTEMAS', grupo: 'materiales', monto: 83333333 },
    { proveedor: 'Sistema', concepto: 'Detección de incendios', categoria: 'SISTEMAS', grupo: 'materiales', monto: 68383155 },
    { proveedor: 'Sistema', concepto: 'Comunicaciones', categoria: 'SISTEMAS', grupo: 'materiales', monto: 79451759 },
    { proveedor: 'Sistema', concepto: 'Apantallamiento', categoria: 'SISTEMAS', grupo: 'materiales', monto: 55912467 },
    { proveedor: 'Calidad de Energía', concepto: 'RETIE', categoria: 'TRÁMITES', grupo: 'materiales', monto: 16059050 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
  'Jul 2026': [
    { proveedor: 'R2F', concepto: 'Obras civiles — contrato final (Pago 6)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 196432280 },
    { proveedor: 'Taesmet', concepto: 'Estructura metálica', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 243433426 },
    { proveedor: 'Building Panel Solution', concepto: 'Cubierta estructura', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 83673667 },
    { proveedor: 'Prowinch', concepto: 'Brazo móvil', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 19960920 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT', categoria: 'EQUIPOS', grupo: 'materiales', monto: 368295250 },
    { proveedor: 'Cable BT AC', concepto: 'Cable BT corriente alterna', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 221666667 },
    { proveedor: 'Cablecol', concepto: 'Cable BT DC', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 324853135 },
    { proveedor: 'Bandejas', concepto: 'Bandejas portacables', categoria: 'SISTEMAS', grupo: 'materiales', monto: 83333333 },
    { proveedor: 'LG', concepto: 'Sistema ITS', categoria: 'SISTEMAS', grupo: 'materiales', monto: 171328780 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
  'Ago 2026': [
    { proveedor: 'Taesmet', concepto: 'Estructura metálica (saldo)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 224707778 },
    { proveedor: 'WEG', concepto: 'Transformadores (saldo)', categoria: 'EQUIPOS', grupo: 'materiales', monto: 150635865 },
    { proveedor: 'MTG', concepto: 'Celdas MT y BT', categoria: 'EQUIPOS', grupo: 'materiales', monto: 368295250 },
    { proveedor: 'Cable BT AC', concepto: 'Cable BT corriente alterna', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 221666667 },
    { proveedor: 'Cablecol', concepto: 'Cable BT DC (saldo)', categoria: 'CABLE / BARRAS', grupo: 'materiales', monto: 324853135 },
    { proveedor: 'Bandejas', concepto: 'Bandejas portacables', categoria: 'SISTEMAS', grupo: 'materiales', monto: 83333333 },
    { proveedor: 'LG', concepto: 'Sistema ITS (saldo)', categoria: 'SISTEMAS', grupo: 'materiales', monto: 232892249 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
  'Sep 2026': [
    { proveedor: 'Taesmet', concepto: 'Estructura metálica (saldo final)', categoria: 'OBRAS CIVILES', grupo: 'materiales', monto: 109012527 },
    { proveedor: 'Mano de obra Operativos', concepto: 'Nómina operativa', categoria: 'MANO DE OBRA', grupo: 'mano_obra', monto: 84229664 },
    { proveedor: 'Adminsitrativos', concepto: 'Nómina administrativa', categoria: 'ADMINISTRATIVOS', grupo: 'administracion', monto: 24175807 },
  ],
};

// ============================================================
// GROUP CONFIG
// ============================================================
const GROUP_CONFIG: Record<GroupId, { label: string; icon: typeof Package; color: string; bgColor: string; borderColor: string }> = {
  materiales: { label: 'Materiales, Equipos y Obras', icon: Package, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  mano_obra: { label: 'Mano de Obra', icon: Users, color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  administracion: { label: 'Administracion y Gastos Indirectos', icon: Briefcase, color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
};

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  pagado: { label: 'Pagado', cls: 'bg-emerald-100 text-emerald-700' },
  parcial: { label: 'Parcial', cls: 'bg-amber-100 text-amber-700' },
  pendiente: { label: 'Pendiente', cls: 'bg-red-100 text-red-700' },
  por_negociar: { label: 'Por negociar', cls: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300' },
};

// ============================================================
// HELP CONFIG
// ============================================================
const cashFlowHelp = {
  pageTitle: 'Ayuda — Flujo de Caja',
  description:
    'El Flujo de Caja proyecta los movimientos de efectivo del proyecto mes a mes. ' +
    'Los pagos se organizan en tres grupos: Materiales, Mano de Obra y Administracion. ' +
    'Puede mover items entre grupos, incluir/excluir nomina externa y simular escenarios de ingreso.',
  sections: [
    {
      title: 'Funcionalidades',
      items: [
        { icon: '📦', label: 'Grupos de pago', description: 'Los pagos se organizan en Materiales, Mano de Obra y Administracion. Puede mover items entre grupos con el selector de grupo.' },
        { icon: '👷', label: 'Nomina Externa', description: 'Items de nomina/factoring de otros proyectos cargados a Patio Sur. Use el boton +/- para incluirlos o excluirlos del total de gastos.' },
        { icon: '🟡', label: 'Falta por pagar (amarillo)', description: 'Los montos en amarillo representan el saldo pendiente de pago de cada concepto.' },
        { icon: '💰', label: 'Ingresos y escenarios', description: 'El ingreso de Feb 2026 es editable. Agregue escenarios de ingreso adicional para evaluar necesidades de liquidez.' },
        { icon: '🔔', label: 'Alertas inteligentes', description: 'El sistema genera alertas automaticas cuando detecta que los fondos disponibles no cubren los pagos pendientes.' },
      ],
    },
  ],
};

// ============================================================
// FORMAT HELPERS — Using centralized utilities
// ============================================================
// Use centralized formatCOP for abbreviated M/B notation display
const formatB = formatCOP;
const formatM = formatCOP;
const formatShort = formatCOP;
// formatCOPFull is available if full currency format is needed

// ============================================================
// COMPONENT
// ============================================================
export default function CashFlowPage() {
  useParams();

  // ── Server-side persistence helpers ──
  const savePref = (key: string, data: unknown) => {
    fetch(`/api/v1/preferences/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  const DEFAULT_INCOMES: IncomeEntry[] = [
    { id: 'ING-FEB', label: 'Ingreso recibido Feb 2026', monto: 16745324700, editable: true, incomeMonth: 'Feb 2026' },
    { id: 'ING-ESC1', label: 'Escenario ingreso adicional 1', monto: 0, editable: true, isScenario: true },
    { id: 'ING-ESC2', label: 'Escenario ingreso adicional 2', monto: 0, editable: true, isScenario: true },
  ];
  const DEFAULT_CREDIT = {
    desembolso: 17000000000,
    tasaInteres: 13.66,
    gmfPorcentaje: 0.395,
    comisionPorcentaje: 1.1,
    mesesCredito: 12,
  };

  // ── Payment items state ──
  const [items, setItems] = useState<PaymentItem[]>(INITIAL_ITEMS);
  const [incomes, setIncomes] = useState<IncomeEntry[]>(DEFAULT_INCOMES);
  const [creditParams, setCreditParams] = useState(DEFAULT_CREDIT);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load preferences from server on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/v1/preferences/payment_items').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/v1/preferences/incomes').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/v1/preferences/credit_params').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([savedItems, savedIncomes, savedCredit]) => {
      if (savedItems && Array.isArray(savedItems) && savedItems.length > 0) {
        setItems(INITIAL_ITEMS.map(base => {
          const s = savedItems.find((p: { id: string }) => p.id === base.id);
          return s ? { ...base, grupo: s.grupo, incluido: s.incluido } : base;
        }));
      }
      if (savedIncomes && Array.isArray(savedIncomes) && savedIncomes.length > 0) {
        setIncomes(savedIncomes);
      }
      if (savedCredit && typeof savedCredit === 'object' && savedCredit.desembolso !== undefined) {
        setCreditParams(savedCredit);
      }
      setPrefsLoaded(true);
    });
  }, []);

  // Save to server whenever state changes (skip initial load)
  useEffect(() => {
    if (!prefsLoaded) return;
    savePref('payment_items', items.map(i => ({ id: i.id, grupo: i.grupo, incluido: i.incluido })));
  }, [items, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    savePref('incomes', incomes);
  }, [incomes, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;
    savePref('credit_params', creditParams);
  }, [creditParams, prefsLoaded]);

  const [expandedGroups, setExpandedGroups] = useState<Record<GroupId, boolean>>({
    materiales: true,
    mano_obra: true,
    administracion: true,
  });
  const [dragItem, setDragItem] = useState<string | null>(null);

  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [showCreditModal, setShowCreditModal] = useState(false);

  // Modal para crear nuevo escenario
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // Parámetros del escenario que se está creando (copia de creditParams)
  const [scenarioParams, setScenarioParams] = useState({
    desembolso: 17000000000,
    tasaInteres: 13.66,
    gmfPorcentaje: 0.395,
    comisionPorcentaje: 1.1,
    mesesCredito: 12,
  });

  // Tipo de escenario seleccionado: "inversion" | "capital"
  const [scenarioType, setScenarioType] = useState<"inversion" | "capital">("inversion");

  // Monto de capital para escenarios tipo "capital"
  const [scenarioCapitalAmount, setScenarioCapitalAmount] = useState(0);

  // Fecha del escenario (día/mes/año)
  const [scenarioDay, setScenarioDay] = useState(1);
  const [scenarioMonth, setScenarioMonth] = useState(2); // Febrero 2026
  const [scenarioYear, setScenarioYear] = useState(2026);

  // Error de validación del escenario
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  // Action plan expansion state
  const [expandedActions, setExpandedActions] = useState<Record<string, boolean>>({
    prestamo: false,
    estrategias: false,
    monitoreo: false,
  });

  // ── Cálculo dinámico del ingreso real (Desembolso - GMF - Comisión) ──
  const ingresoRealCalculado = useMemo(() => {
    const gmf = creditParams.desembolso * (creditParams.gmfPorcentaje / 100);
    const comision = creditParams.desembolso * (creditParams.comisionPorcentaje / 100);
    const ingresoReal = creditParams.desembolso - gmf - comision;
    return { gmf, comision, ingresoReal };
  }, [creditParams]);

  // ── Cálculo dinámico para escenarios de inversión ──
  const scenarioIngresoCalculado = useMemo(() => {
    const gmf = scenarioParams.desembolso * (scenarioParams.gmfPorcentaje / 100);
    const comision = scenarioParams.desembolso * (scenarioParams.comisionPorcentaje / 100);
    const ingresoReal = scenarioParams.desembolso - gmf - comision;
    return { gmf, comision, ingresoReal };
  }, [scenarioParams]);

  // ── Computed values ──
  const includedItems = useMemo(() => items.filter((i) => i.incluido), [items]);
  const totalContrato = useMemo(() => includedItems.reduce((s, i) => s + i.contratoTotal, 0), [includedItems]);
  const totalPagado = useMemo(() => includedItems.reduce((s, i) => s + i.pagado, 0), [includedItems]);
  const totalPorPagar = useMemo(() => includedItems.reduce((s, i) => s + i.porPagar, 0), [includedItems]);
  const totalIngresos = useMemo(() => incomes.reduce((s, i) => s + i.monto, 0), [incomes]);
  const saldoDisponible = useMemo(() => totalIngresos - totalPagado, [totalIngresos, totalPagado]);
  const brechaFinanciamiento = useMemo(() => totalPorPagar - saldoDisponible, [totalPorPagar, saldoDisponible]);

  // Intereses credito puente
  const interesesCredito = 1658392500;
  const gastosAdicionales = 1500000000; // VG + adicionales
  const totalConFinanciamiento = totalContrato + interesesCredito + gastosAdicionales;

  // Group totals
  const groupTotals = useMemo(() => {
    const result: Record<GroupId, { contrato: number; pagado: number; porPagar: number; count: number }> = {
      materiales: { contrato: 0, pagado: 0, porPagar: 0, count: 0 },
      mano_obra: { contrato: 0, pagado: 0, porPagar: 0, count: 0 },
      administracion: { contrato: 0, pagado: 0, porPagar: 0, count: 0 },
    };
    includedItems.forEach((item) => {
      const g = result[item.grupo];
      g.contrato += item.contratoTotal;
      g.pagado += item.pagado;
      g.porPagar += item.porPagar;
      g.count++;
    });
    return result;
  }, [includedItems]);

  // ── Alerts ──
  const alerts = useMemo(() => {
    const list: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (brechaFinanciamiento > 0) {
      list.push({
        type: 'critical',
        message: `Brecha de financiamiento: Falta ${formatB(brechaFinanciamiento)} para cubrir los pagos pendientes. Se requiere un ingreso adicional o gestion de credito.`,
      });
    }
    const porNegociar = items.filter((i) => i.incluido && i.estado === 'por_negociar');
    if (porNegociar.length > 0) {
      const totalNeg = porNegociar.reduce((s, i) => s + i.porPagar, 0);
      list.push({
        type: 'warning',
        message: `${porNegociar.length} contratos pendientes por negociacion por ${formatB(totalNeg)}. Estos valores pueden cambiar.`,
      });
    }
    const nominaExterna = items.filter((i) => i.isNominaExterna);
    const nominaExcluidaTotal = nominaExterna.filter((i) => !i.incluido).reduce((s, i) => s + i.porPagar, 0);
    if (nominaExcluidaTotal > 0) {
      list.push({
        type: 'info',
        message: `Hay ${formatB(nominaExcluidaTotal)} en nomina/factoring externa excluida del calculo. Activelos si la reposicion no se concreta.`,
      });
    }
    if (totalPorPagar > totalIngresos * 0.6) {
      list.push({
        type: 'warning',
        message: `Los pagos pendientes (${formatB(totalPorPagar)}) representan mas del 60% de los ingresos totales. Considere escenarios de ingreso adicional.`,
      });
    }
    return list;
  }, [brechaFinanciamiento, items, totalPorPagar, totalIngresos]);

  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<string | null>(null);

  // ── Filtros de tabla ──
  interface TableFilters { proveedor: string; concepto: string; estado: string; }
  const emptyFilters: TableFilters = { proveedor: '', concepto: '', estado: '' };
  const [tableFilters, setTableFilters] = useState<Record<GroupId, TableFilters>>({
    materiales: { ...emptyFilters },
    mano_obra: { ...emptyFilters },
    administracion: { ...emptyFilters },
  });
  const setFilter = (groupId: GroupId, key: keyof TableFilters, value: string) =>
    setTableFilters(prev => ({ ...prev, [groupId]: { ...prev[groupId], [key]: value } }));
  const clearFilters = (groupId: GroupId) =>
    setTableFilters(prev => ({ ...prev, [groupId]: { ...emptyFilters } }));
  const hasFilters = (groupId: GroupId) =>
    Object.values(tableFilters[groupId]).some(v => v !== '');

  // ── Contratos ──
  interface ContratoInfo { filename: string; previewable: boolean; }
  const [contratos, setContratos] = useState<Record<string, ContratoInfo>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewContrato, setPreviewContrato] = useState<{ itemId: string; filename: string } | null>(null);

  // Load existing contracts from backend on mount
  useEffect(() => {
    fetch('/api/v1/documents/contratos')
      .then(r => r.ok ? r.json() : {})
      .then((data: Record<string, { filename: string; previewable: boolean }>) => {
        if (Object.keys(data).length > 0) setContratos(data);
      })
      .catch(() => {});
  }, []);

  const handleUploadContrato = async (itemId: string, file: File) => {
    setUploadingId(itemId);
    const form = new FormData();
    form.append('item_id', itemId);
    form.append('file', file);
    try {
      const res = await fetch('/api/v1/documents/upload-contrato', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Error al subir');
      const data = await res.json();
      setContratos(prev => ({ ...prev, [itemId]: { filename: data.original_name, previewable: data.previewable } }));
    } catch {
      alert('Error al subir el contrato. Intente de nuevo.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteContrato = async (itemId: string) => {
    await fetch(`/api/v1/documents/contrato/${itemId}`, { method: 'DELETE' });
    setContratos(prev => { const n = { ...prev }; delete n[itemId]; return n; });
  };

  // ── Handlers ──
  const toggleGroup = (g: GroupId) =>
    setExpandedGroups((prev) => ({ ...prev, [g]: !prev[g] }));

  const toggleIncluido = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, incluido: !i.incluido } : i)));
  }, []);

  const moveToGroup = useCallback((itemId: string, newGroup: GroupId) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, grupo: newGroup } : i)));
  }, []);

  const startEditIncome = (id: string, currentMonto: number) => {
    setEditingIncome(id);
    setEditValue(String(currentMonto));
  };

  const saveIncome = (id: string) => {
    const val = parseFloat(editValue) || 0;
    setIncomes((prev) => prev.map((i) => (i.id === id ? { ...i, monto: val } : i)));
    setEditingIncome(null);
  };

  const addScenario = () => {
    // Abrir modal en lugar de agregar directamente
    setScenarioType("inversion"); // Default a inversión
    setScenarioCapitalAmount(0);
    setShowScenarioModal(true);
  };

  // Validar fecha del escenario
  const validateScenarioDate = (): boolean => {
    setScenarioError(null);

    // Validar que la fecha sea válida
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Considerar años bisiestos
    const isLeapYear = (scenarioYear % 4 === 0 && scenarioYear % 100 !== 0) || (scenarioYear % 400 === 0);
    if (isLeapYear) daysInMonth[1] = 29;

    if (scenarioDay < 1 || scenarioDay > daysInMonth[scenarioMonth - 1]) {
      setScenarioError(`El día ${scenarioDay} no es válido para el mes ${scenarioMonth}/${scenarioYear}`);
      return false;
    }

    // Validar que no sea una fecha pasada (comparar con fecha actual)
    const today = new Date();
    const selectedDate = new Date(scenarioYear, scenarioMonth - 1, scenarioDay);

    if (selectedDate < today) {
      setScenarioError(`La fecha no puede ser en el pasado. Selecciona una fecha a partir de hoy.`);
      return false;
    }

    return true;
  };

  const saveScenario = () => {
    // Validar fecha
    if (!validateScenarioDate()) {
      return;
    }

    const idx = incomes.filter((i) => i.isScenario).length + 1;

    // Determinar el monto según el tipo de escenario
    let scenarioMonto = 0;
    if (scenarioType === "inversion") {
      scenarioMonto = scenarioIngresoCalculado.ingresoReal;
    } else if (scenarioType === "capital") {
      scenarioMonto = scenarioCapitalAmount;
    }

    // Formatear fecha como DD/MM/YYYY
    const dateStr = `${String(scenarioDay).padStart(2, '0')}/${String(scenarioMonth).padStart(2, '0')}/${scenarioYear}`;

    // Crear nuevo escenario
    const newScenario: IncomeEntry = {
      id: `ING-ESC${Date.now()}`,
      label: `Escenario ${scenarioType === "inversion" ? "inversión" : "capital"} ${idx} (${dateStr})`,
      monto: scenarioMonto,
      editable: true,
      isScenario: true,
      scenarioDate: dateStr,
    };

    // Agregar a la lista de ingresos
    setIncomes((prev) => [...prev, newScenario]);

    // Cerrar modal y limpiar error
    setShowScenarioModal(false);
    setScenarioError(null);
  };

  const removeScenario = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Drag handlers
  const handleDragStart = (itemId: string) => setDragItem(itemId);
  const handleDragEnd = () => setDragItem(null);
  const handleDrop = (targetGroup: GroupId) => {
    if (dragItem) {
      moveToGroup(dragItem, targetGroup);
      setDragItem(null);
    }
  };

  // Mes seleccionado para el ingreso principal (ING-FEB)
  const mainIncomeMonth = useMemo(() => {
    const feb = incomes.find(i => i.id === 'ING-FEB');
    return feb?.incomeMonth || 'Feb 2026';
  }, [incomes]);

  // Función para obtener ingresos por mes considerando escenarios con fecha
  const getMonthIncomes = useMemo(() => {
    const monthIncomes: Record<string, number> = {};

    // Inicializar todo en 0
    cashFlowEntries.forEach((e) => {
      monthIncomes[e.period_label] = 0;
    });

    // Colocar el ingreso principal en el mes seleccionado
    const febIncome = incomes.find(i => i.id === 'ING-FEB');
    if (febIncome) {
      const targetMonth = febIncome.incomeMonth || 'Feb 2026';
      if (!monthIncomes[targetMonth]) monthIncomes[targetMonth] = 0;
      monthIncomes[targetMonth] += ingresoRealCalculado.ingresoReal;
    }

    // Agregar ingresos de escenarios según su fecha
    incomes.forEach((inc) => {
      if (inc.scenarioDate) {
        const [, month, year] = inc.scenarioDate.split('/').map(Number);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const correctPeriodLabel = `${monthNames[month - 1]} ${year}`;

        if (!monthIncomes[correctPeriodLabel]) {
          monthIncomes[correctPeriodLabel] = 0;
        }
        monthIncomes[correctPeriodLabel] += inc.monto;
      }
    });

    return monthIncomes;
  }, [incomes, cashFlowEntries, ingresoRealCalculado]);

  // KPIs
  const totalEgresoReal = cashFlowEntries.reduce((s, e) => s + e.actual_expense, 0);
  const totalEgresoProyectado = cashFlowEntries.reduce((s, e) => s + e.projected_expense, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Flujo de Caja</h2>
          <p className="text-xs text-steel-400 mt-1">
            Patio de Operacion Sur — Proyeccion de pagos, ingresos y escenarios de liquidez
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton {...cashFlowHelp} />
          <button className="flex items-center gap-2 rounded-lg border border-steel-300 bg-white px-4 py-2 text-sm text-steel-600 hover:bg-steel-50 transition">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Total Ingresos</p>
          </div>
          <p className="text-lg font-bold text-emerald-700">{formatB(totalIngresos)}</p>
          <p className="text-[10px] text-steel-400 mt-0.5">Recibido + escenarios</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Total Pagado</p>
          </div>
          <p className="text-lg font-bold text-red-600">{formatB(totalPagado)}</p>
          <p className="text-[10px] text-steel-400 mt-0.5">Desembolsos efectivos</p>
        </div>
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-yellow-600" />
            <p className="text-[10px] text-yellow-700 uppercase tracking-wide font-bold">Falta por Pagar</p>
          </div>
          <p className="text-lg font-black text-yellow-700">{formatB(totalPorPagar)}</p>
          <p className="text-[10px] text-yellow-600 mt-0.5 font-semibold">Saldo pendiente de pago</p>
        </div>
        <div className={clsx(
          'rounded-xl p-4 shadow-card',
          saldoDisponible >= 0 ? 'border border-primary-200 bg-primary-50' : 'border-2 border-red-300 bg-red-50',
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-primary-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Saldo Disponible</p>
          </div>
          <p className={clsx('text-lg font-bold', saldoDisponible >= 0 ? 'text-primary-700' : 'text-red-600')}>
            {formatB(saldoDisponible)}
          </p>
          <p className="text-[10px] text-steel-400 mt-0.5">Ingresos - Pagado</p>
        </div>
        <div className={clsx(
          'rounded-xl p-4 shadow-card',
          brechaFinanciamiento <= 0 ? 'border border-emerald-200 bg-emerald-50' : 'border-2 border-red-400 bg-red-50',
        )}>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-red-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Brecha Financiera</p>
          </div>
          <p className={clsx('text-lg font-bold', brechaFinanciamiento <= 0 ? 'text-emerald-600' : 'text-red-700')}>
            {brechaFinanciamiento <= 0 ? 'Cubierto' : formatB(brechaFinanciamiento)}
          </p>
          <p className="text-[10px] text-steel-400 mt-0.5">{brechaFinanciamiento <= 0 ? 'Sin deficit' : 'Necesita financiamiento'}</p>
        </div>
      </div>

      {/* ── Alerts Button ── */}
      {alerts.length > 0 && (
        <div className="rounded-xl border overflow-hidden shadow-card"
          style={{ borderColor: alerts.some(a => a.type === 'critical') ? '#fca5a5' : '#fcd34d' }}
        >
          {/* Trigger button */}
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className={clsx(
              'w-full flex items-center justify-between px-5 py-3 transition',
              alerts.some(a => a.type === 'critical') ? 'bg-red-50 hover:bg-red-100' : 'bg-amber-50 hover:bg-amber-100',
            )}
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-black',
                alerts.some(a => a.type === 'critical') ? 'bg-red-500 text-white' : 'bg-amber-400 text-white',
              )}>
                {alerts.length}
              </div>
              <div className="text-left">
                <p className={clsx(
                  'text-sm font-bold',
                  alerts.some(a => a.type === 'critical') ? 'text-red-700' : 'text-amber-700',
                )}>
                  {alerts.some(a => a.type === 'critical') ? 'Alertas criticas activas' : 'Alertas activas'}
                </p>
                <p className="text-[10px] text-steel-400 mt-0.5">
                  {alerts.filter(a => a.type === 'critical').length} critica(s) ·{' '}
                  {alerts.filter(a => a.type === 'warning').length} advertencia(s) ·{' '}
                  {alerts.filter(a => a.type === 'info').length} info
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-steel-400">{showAlerts ? 'Ocultar' : 'Ver detalle'}</span>
              {showAlerts
                ? <ChevronDown className="h-4 w-4 text-steel-400" />
                : <ChevronRight className="h-4 w-4 text-steel-400" />}
            </div>
          </button>

          {/* Alert detail list */}
          {showAlerts && (
            <div className="divide-y divide-steel-100 bg-white">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    'flex items-start gap-3 px-5 py-3',
                    alert.type === 'critical' && 'bg-red-50/60',
                    alert.type === 'warning' && 'bg-amber-50/60',
                    alert.type === 'info' && 'bg-blue-50/60',
                  )}
                >
                  <div className={clsx(
                    'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                    alert.type === 'critical' && 'bg-red-100',
                    alert.type === 'warning' && 'bg-amber-100',
                    alert.type === 'info' && 'bg-blue-100',
                  )}>
                    {alert.type === 'critical'
                      ? <AlertTriangle className="h-3 w-3 text-red-600" />
                      : <Bell className={clsx('h-3 w-3', alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600')} />
                    }
                  </div>
                  <p className={clsx(
                    'text-xs font-medium leading-relaxed',
                    alert.type === 'critical' && 'text-red-700',
                    alert.type === 'warning' && 'text-amber-700',
                    alert.type === 'info' && 'text-blue-700',
                  )}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Monthly Payment Schedule ── */}
      {(() => {
        // Compute running balance month by month
        const MONTHS = cashFlowEntries.map((e) => ({
          label: e.period_label,
          expense: e.projected_expense,
          realExpense: e.actual_expense,
          income: getMonthIncomes[e.period_label] || e.projected_income,
          isReal: e.actual_expense > 0,
        }));

        // Running balance starting from total incomes
        let balance = totalIngresos;
        const months = MONTHS.map((m) => {
          const netIncome = m.label === mainIncomeMonth ? 0 : (m.income > 0 ? m.income : 0);
          balance = balance + netIncome - m.expense;
          const balanceBefore = balance + m.expense - netIncome;
          const needsInjection = balance < 0;
          const isTight = balance >= 0 && balance < m.expense * 0.5;
          return { ...m, balanceBefore, balanceAfter: balance, needsInjection, isTight };
        });

        const maxExpense = Math.max(...months.map((m) => m.expense));

        return (
          <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-steel-200 bg-gradient-to-r from-primary-900 to-primary-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Cronograma de Caja — Vista por Mes</h3>
                <p className="text-[10px] text-primary-300 mt-0.5">Balance disponible vs pagos programados · Rojo = inyección de capital requerida</p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-primary-200"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />Cubierto</span>
                <span className="flex items-center gap-1.5 text-primary-200"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />Ajustado</span>
                <span className="flex items-center gap-1.5 text-primary-200"><span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />Requiere inyeccion</span>
              </div>
            </div>

            {/* Month cards — horizontal scroll */}
            <div className="overflow-x-auto">
              <div className="flex gap-0 min-w-max">
                {months.map((m, idx) => {
                  const pct = maxExpense > 0 ? (m.expense / maxExpense) * 100 : 0;
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={m.label}
                      onClick={() => MONTHLY_PAYMENT_DETAILS[m.label] && setSelectedMonthDetail(m.label)}
                      className={clsx(
                        'flex flex-col w-[130px] flex-shrink-0 border-r border-steel-100 last:border-r-0',
                        m.needsInjection ? 'bg-red-50' : m.isTight ? 'bg-yellow-50/70' : 'bg-white',
                        isFirst && 'border-l-0',
                        MONTHLY_PAYMENT_DETAILS[m.label] && 'cursor-pointer hover:ring-2 hover:ring-primary-400 hover:ring-inset transition-all',
                      )}
                    >
                      {/* Month label */}
                      <div className={clsx(
                        'px-3 py-2 border-b text-center',
                        m.needsInjection ? 'border-red-200 bg-red-100/60' : m.isTight ? 'border-yellow-200 bg-yellow-100/60' : 'border-steel-100 bg-steel-50',
                      )}>
                        <p className={clsx('text-[11px] font-bold', m.needsInjection ? 'text-red-700' : m.isTight ? 'text-yellow-700' : 'text-steel-700')}>
                          {m.label}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          {m.isReal && (
                            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5">Real</span>
                          )}
                          {MONTHLY_PAYMENT_DETAILS[m.label] && (
                            <span className="text-[8px] font-medium text-primary-500 bg-primary-50 rounded-full px-1.5 py-0.5 border border-primary-200">Ver detalle</span>
                          )}
                        </div>
                      </div>

                      {/* Payment bar visualization */}
                      <div className="px-3 pt-3 pb-1">
                        <div className="h-20 flex items-end">
                          {m.expense > 0 ? (
                            <div className="w-full relative">
                              <div
                                className={clsx(
                                  'w-full rounded-t-md transition-all',
                                  m.needsInjection ? 'bg-red-400' : m.isTight ? 'bg-yellow-400' : 'bg-primary-500/70',
                                )}
                                style={{ height: `${Math.max(8, pct * 0.8)}px` }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-1 rounded bg-steel-100" />
                          )}
                        </div>
                      </div>

                      {/* Payment amount */}
                      <div className="px-3 pb-1 text-center">
                        <p className="text-[9px] text-steel-400 uppercase font-medium">Pago</p>
                        <p className={clsx(
                          'text-[11px] font-bold font-mono',
                          m.expense === 0 ? 'text-steel-300' : m.needsInjection ? 'text-red-600' : 'text-steel-700',
                        )}>
                          {m.expense > 0 ? formatCOP(m.expense) : '—'}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="mx-3 border-t border-dashed border-steel-200 my-1" />

                      {/* Balance after */}
                      <div className="px-3 pb-2 text-center">
                        <p className="text-[9px] text-steel-400 uppercase font-medium">Balance</p>
                        <p className={clsx(
                          'text-[11px] font-black font-mono',
                          m.balanceAfter < 0 ? 'text-red-600' : m.balanceAfter < 1e9 ? 'text-yellow-600' : 'text-emerald-600',
                        )}>
                          {formatCOP(m.balanceAfter)}
                        </p>
                      </div>

                      {/* Injection badge */}
                      {m.needsInjection && (
                        <div className="px-2 pb-2">
                          <div className="flex items-center justify-center gap-1 bg-red-500 text-white rounded-md py-1 px-1.5">
                            <Zap className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="text-[9px] font-bold leading-tight text-center">Inyeccion<br/>requerida</span>
                          </div>
                        </div>
                      )}
                      {m.isTight && !m.needsInjection && (
                        <div className="px-2 pb-2">
                          <div className="flex items-center justify-center gap-1 bg-yellow-400 text-yellow-900 rounded-md py-1 px-1.5">
                            <Droplets className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="text-[9px] font-bold">Ajustado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="px-5 py-3 border-t border-steel-200 bg-steel-50 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-steel-400">Balance inicial (ingresos):</span>
                  <span className="font-bold text-emerald-600 ml-1">{formatCOP(totalIngresos)}</span>
                </div>
                <div>
                  <span className="text-steel-400">Total pagos proyectados:</span>
                  <span className="font-bold text-red-600 ml-1">{formatCOP(cashFlowEntries.reduce((s, e) => s + e.projected_expense, 0))}</span>
                </div>
                <div>
                  <span className="text-steel-400">Meses con deficit:</span>
                  <span className={clsx('font-bold ml-1', months.filter(m => m.needsInjection).length > 0 ? 'text-red-600' : 'text-emerald-600')}>
                    {months.filter(m => m.needsInjection).length === 0 ? 'Ninguno' : `${months.filter(m => m.needsInjection).length} mes(es)`}
                  </span>
                </div>
              </div>
              {months.some(m => m.needsInjection) && (
                <div className="flex items-center gap-1.5 bg-red-100 border border-red-200 rounded-lg px-3 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-red-700">
                    Use los escenarios de ingreso (abajo) para cubrir el deficit
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Income Management ── */}
      <div className="rounded-xl border border-emerald-200 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-emerald-100 bg-emerald-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-800">Gestion de Ingresos y Escenarios</h3>
          </div>
          <button
            onClick={addScenario}
            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg px-3 py-1.5 transition"
          >
            <Plus className="h-3 w-3" /> Agregar Escenario
          </button>
        </div>
        <div className="p-4 space-y-2">
          {incomes.map((inc) => {
            // Para el ingreso Feb 2026 (ING-FEB), mostrar el valor calculado
            const isFebreroIngreso = inc.id === 'ING-FEB';
            const displayMonto = isFebreroIngreso ? ingresoRealCalculado.ingresoReal : inc.monto;

            // Para escenarios: extraer mes/año y tipo
            const isScenario = inc.isScenario && inc.scenarioDate;
            let scenarioMonthYear = '';
            let scenarioType = '';
            let scenarioTypeLabel = '';
            let scenarioTypeIcon = '';

            if (isScenario && inc.scenarioDate) {
              // Parsear fecha: DD/MM/YYYY
              const [day, month, year] = inc.scenarioDate.split('/');
              const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              scenarioMonthYear = `${monthNames[parseInt(month) - 1]} ${year}`;

              // Determinar tipo de escenario desde el label
              if (inc.label.includes('inversión')) {
                scenarioType = 'inversion';
                scenarioTypeLabel = 'Inversión';
                scenarioTypeIcon = '💰';
              } else if (inc.label.includes('capital')) {
                scenarioType = 'capital';
                scenarioTypeLabel = 'Capital';
                scenarioTypeIcon = '💵';
              }
            }

            return (
              <div
                key={inc.id}
                className={clsx(
                  'rounded-lg px-4 py-3 transition',
                  inc.isScenario ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50/60 border border-emerald-200',
                  inc.isScenario ? 'flex items-center gap-3' : 'flex items-center gap-3'
                )}
              >
                {/* Type badge */}
                {(isScenario || isFebreroIngreso) && (
                  <div className="flex-shrink-0">
                    <div className={clsx(
                      'rounded-lg px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5',
                      isFebreroIngreso
                        ? 'bg-emerald-100 text-emerald-700'
                        : scenarioType === 'inversion'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                    )}>
                      <span className="text-sm">{isFebreroIngreso ? '🏦' : scenarioTypeIcon}</span>
                      <span>{isFebreroIngreso ? 'Credito' : scenarioTypeLabel}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isFebreroIngreso ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <select
                          value={inc.incomeMonth || 'Feb 2026'}
                          onChange={(e) => {
                            const newMonth = e.target.value;
                            setIncomes(prev => prev.map(i =>
                              i.id === 'ING-FEB'
                                ? { ...i, incomeMonth: newMonth }
                                : i
                            ));
                          }}
                          className="text-xs font-bold text-emerald-900 bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-0 appearance-none"
                          style={{ WebkitAppearance: 'none' }}
                        >
                          {cashFlowEntries.map(e => (
                            <option key={e.period_label} value={e.period_label}>{e.period_label}</option>
                          ))}
                        </select>
                        <ChevronDown className="h-3 w-3 text-emerald-400 -ml-1" />
                      </div>
                      <p className="text-[10px] text-emerald-600">Calculado: Desembolso - GMF - Comision</p>
                    </div>
                  ) : isScenario ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-blue-900">{scenarioMonthYear}</p>
                      <p className="text-[10px] text-blue-600">{inc.label}</p>
                    </div>
                  ) : (
                    <p className={clsx('text-xs font-semibold', 'text-steel-600')}>
                      {inc.label}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingIncome === inc.id && !isFebreroIngreso ? (
                    <>
                      <span className="text-xs text-steel-400">$</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-44 rounded-lg border border-primary-300 px-3 py-1.5 text-sm font-mono text-right focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveIncome(inc.id)}
                      />
                      <button onClick={() => saveIncome(inc.id)} className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingIncome(null)} className="p-1.5 rounded-lg bg-steel-100 hover:bg-steel-200 text-steel-600 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => isFebreroIngreso && setShowCreditModal(true)}
                        className={clsx(
                          'text-sm font-bold font-mono cursor-pointer rounded px-2 py-1 transition',
                          displayMonto > 0 ? (isScenario ? 'text-blue-700 hover:bg-blue-100' : 'text-emerald-700 hover:bg-emerald-100') : 'text-steel-400',
                          isFebreroIngreso && 'hover:underline'
                        )}
                        title={isFebreroIngreso ? "Haz click para ver desglose del crédito" : ""}
                      >
                        {displayMonto > 0 ? formatCOP(displayMonto) : 'Sin definir'}
                      </button>
                      {inc.editable && !isFebreroIngreso && !inc.isScenario && (
                        <button
                          onClick={() => startEditIncome(inc.id, inc.monto)}
                          className="p-1.5 rounded-lg hover:bg-steel-100 text-steel-400 hover:text-steel-600 transition"
                          title="Editar monto"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isFebreroIngreso && (
                        <button
                          onClick={() => setShowCreditModal(true)}
                          className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition"
                          title="Ver desglose del crédito"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {inc.isScenario && (
                        <button
                          onClick={() => removeScenario(inc.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-steel-400 hover:text-red-600 transition"
                          title="Eliminar escenario"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {/* Total */}
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-100 rounded-lg mt-2">
            <p className="text-xs font-bold text-emerald-800">TOTAL INGRESOS</p>
            <p className="text-sm font-black font-mono text-emerald-800">{formatCOP(totalIngresos)}</p>
          </div>
        </div>

        {/* Modal: Agregar Nuevo Escenario */}
        {showScenarioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="sticky top-0 px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-blue-900">Agregar Escenario de Ingreso</h2>
                  <p className="text-xs text-blue-700 mt-1">Elige entre Inversión (crédito) o Capital directo</p>
                </div>
                <button onClick={() => setShowScenarioModal(false)} className="p-2 rounded-lg hover:bg-blue-200 text-blue-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-steel-200 flex">
                <button
                  onClick={() => setScenarioType("inversion")}
                  className={clsx(
                    "flex-1 px-4 py-3 font-semibold text-sm transition",
                    scenarioType === "inversion"
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                      : "text-steel-600 hover:bg-steel-50"
                  )}
                >
                  💰 Inversión (Crédito)
                </button>
                <button
                  onClick={() => setScenarioType("capital")}
                  className={clsx(
                    "flex-1 px-4 py-3 font-semibold text-sm transition",
                    scenarioType === "capital"
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                      : "text-steel-600 hover:bg-steel-50"
                  )}
                >
                  💵 Capital Directo
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">

                {scenarioType === "inversion" ? (
                  // TAB: INVERSIÓN (Desglose del Crédito)
                  <>
                    {/* Fecha del Escenario */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-steel-800">Fecha del Ingreso</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Día */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Día</label>
                          <select
                            value={scenarioDay}
                            onChange={(e) => setScenarioDay(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                              <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>

                        {/* Mes */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Mes</label>
                          <select
                            value={scenarioMonth}
                            onChange={(e) => setScenarioMonth(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')} - {m}</option>
                            ))}
                          </select>
                        </div>

                        {/* Año */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Año</label>
                          <select
                            value={scenarioYear}
                            onChange={(e) => setScenarioYear(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {[2025, 2026, 2027].map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {scenarioError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                          <p className="font-semibold">⚠️ Error en la fecha</p>
                          <p className="mt-1">{scenarioError}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-steel-800">Parámetros del Crédito</h3>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Desembolso */}
                        <div className="rounded-lg border border-steel-200 p-4">
                          <label className="text-xs font-semibold text-steel-600 uppercase">Desembolso (Crédito)</label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-steel-400">$</span>
                            <input
                              type="number"
                              value={scenarioParams.desembolso}
                              onChange={(e) => setScenarioParams({...scenarioParams, desembolso: parseFloat(e.target.value) || 0})}
                              className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                            />
                          </div>
                          <p className="text-xs text-steel-400 mt-2">{formatCOP(scenarioParams.desembolso)}</p>
                        </div>

                        {/* GMF % */}
                        <div className="rounded-lg border border-steel-200 p-4">
                          <label className="text-xs font-semibold text-steel-600 uppercase">GMF (%)</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              step="0.001"
                              value={scenarioParams.gmfPorcentaje}
                              onChange={(e) => setScenarioParams({...scenarioParams, gmfPorcentaje: parseFloat(e.target.value) || 0})}
                              className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                            />
                            <span className="text-xs text-steel-400">%</span>
                          </div>
                          <p className="text-xs text-steel-400 mt-2">{formatCOP(scenarioIngresoCalculado.gmf)}</p>
                        </div>

                        {/* Comisión % */}
                        <div className="rounded-lg border border-steel-200 p-4">
                          <label className="text-xs font-semibold text-steel-600 uppercase">Comisión (%)</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              step="0.01"
                              value={scenarioParams.comisionPorcentaje}
                              onChange={(e) => setScenarioParams({...scenarioParams, comisionPorcentaje: parseFloat(e.target.value) || 0})}
                              className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                            />
                            <span className="text-xs text-steel-400">%</span>
                          </div>
                          <p className="text-xs text-steel-400 mt-2">{formatCOP(scenarioIngresoCalculado.comision)}</p>
                        </div>

                        {/* Tasa EA */}
                        <div className="rounded-lg border border-steel-200 p-4">
                          <label className="text-xs font-semibold text-steel-600 uppercase">Tasa Efectiva Anual (%)</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              step="0.01"
                              value={scenarioParams.tasaInteres}
                              onChange={(e) => setScenarioParams({...scenarioParams, tasaInteres: parseFloat(e.target.value) || 0})}
                              className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                            />
                            <span className="text-xs text-steel-400">%</span>
                          </div>
                          <p className="text-xs text-steel-400 mt-2">{(scenarioParams.tasaInteres / 12).toFixed(2)}% mensual aprox.</p>
                        </div>

                        {/* Plazo */}
                        <div className="rounded-lg border border-steel-200 p-4">
                          <label className="text-xs font-semibold text-steel-600 uppercase">Plazo (Meses)</label>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              value={scenarioParams.mesesCredito}
                              onChange={(e) => setScenarioParams({...scenarioParams, mesesCredito: parseInt(e.target.value) || 0})}
                              className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                            />
                            <span className="text-xs text-steel-400">meses</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cálculo Formulado */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-5 space-y-3">
                      <h3 className="text-sm font-bold text-blue-900">Cálculo del Ingreso Real</h3>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Desembolso</span>
                          <span className="font-bold text-blue-800">{formatCOP(scenarioParams.desembolso)}</span>
                        </div>
                        <div className="border-t border-blue-300"></div>
                        <div className="flex justify-between items-center text-red-600">
                          <span>(-) GMF ({scenarioParams.gmfPorcentaje}%)</span>
                          <span className="font-bold">- {formatCOP(scenarioIngresoCalculado.gmf)}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600">
                          <span>(-) Comisión ({scenarioParams.comisionPorcentaje}%)</span>
                          <span className="font-bold">- {formatCOP(scenarioIngresoCalculado.comision)}</span>
                        </div>
                        <div className="border-t-2 border-blue-400 pt-2 flex justify-between items-center">
                          <span className="text-blue-900 font-bold">= Ingreso Real</span>
                          <span className="font-black text-lg text-blue-700">{formatCOP(scenarioIngresoCalculado.ingresoReal)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // TAB: CAPITAL (Input Simple)
                  <div className="space-y-6">
                    {/* Fecha del Escenario */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-steel-800">Fecha del Ingreso</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {/* Día */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Día</label>
                          <select
                            value={scenarioDay}
                            onChange={(e) => setScenarioDay(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                              <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>

                        {/* Mes */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Mes</label>
                          <select
                            value={scenarioMonth}
                            onChange={(e) => setScenarioMonth(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')} - {m}</option>
                            ))}
                          </select>
                        </div>

                        {/* Año */}
                        <div className="rounded-lg border border-steel-200 p-3">
                          <label className="text-xs font-semibold text-steel-600 uppercase block mb-2">Año</label>
                          <select
                            value={scenarioYear}
                            onChange={(e) => setScenarioYear(parseInt(e.target.value))}
                            className="w-full rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                          >
                            {[2025, 2026, 2027].map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {scenarioError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                          <p className="font-semibold">⚠️ Error en la fecha</p>
                          <p className="mt-1">{scenarioError}</p>
                        </div>
                      )}
                    </div>

                    {/* Monto de Capital */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-steel-800">Ingresar Monto de Capital</h3>

                      <div className="rounded-lg border border-steel-200 p-6">
                        <label className="text-xs font-semibold text-steel-600 uppercase block mb-3">Monto Capital</label>
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-steel-400">$</span>
                          <input
                            type="number"
                            value={scenarioCapitalAmount}
                            onChange={(e) => setScenarioCapitalAmount(parseFloat(e.target.value) || 0)}
                            placeholder="Ingresa el monto de capital"
                            className="flex-1 rounded border border-primary-300 px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-primary-400"
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-steel-400 mt-3">Valor: {formatCOP(scenarioCapitalAmount)}</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
                        <p className="font-semibold mb-2">💡 Capital Directo</p>
                        <p>Ingresa simplemente el monto de capital que deseas proyectar como ingreso adicional, sin cálculos de comisiones o impuestos.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-steel-200 px-6 py-4 bg-steel-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowScenarioModal(false)}
                  className="px-4 py-2 rounded-lg border border-steel-300 text-steel-700 hover:bg-steel-100 transition text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveScenario}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Guardar Escenario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Desglose del Crédito */}
        {showCreditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-emerald-50 to-emerald-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Desglose del Ingreso por Crédito</h2>
                  <p className="text-xs text-emerald-700 mt-1">Presupuesto puente - Desembolso - GMF - Comisión = Ingreso Real</p>
                </div>
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="p-2 rounded-lg hover:bg-emerald-200 text-emerald-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Parámetros del Crédito */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-steel-800">Parámetros del Crédito</h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Desembolso */}
                    <div className="rounded-lg border border-steel-200 p-4">
                      <label className="text-xs font-semibold text-steel-600 uppercase">Desembolso (Monto del Crédito)</label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-steel-400">$</span>
                        <input
                          type="number"
                          value={creditParams.desembolso}
                          onChange={(e) => setCreditParams({...creditParams, desembolso: parseFloat(e.target.value) || 0})}
                          className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                        />
                      </div>
                      <p className="text-xs text-steel-400 mt-2">{formatCOP(creditParams.desembolso)}</p>
                    </div>

                    {/* GMF % */}
                    <div className="rounded-lg border border-steel-200 p-4">
                      <label className="text-xs font-semibold text-steel-600 uppercase">GMF (%)</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          step="0.001"
                          value={creditParams.gmfPorcentaje}
                          onChange={(e) => setCreditParams({...creditParams, gmfPorcentaje: parseFloat(e.target.value) || 0})}
                          className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                        />
                        <span className="text-xs text-steel-400">%</span>
                      </div>
                      <p className="text-xs text-steel-400 mt-2">{formatCOP(ingresoRealCalculado.gmf)}</p>
                    </div>

                    {/* Comisión % */}
                    <div className="rounded-lg border border-steel-200 p-4">
                      <label className="text-xs font-semibold text-steel-600 uppercase">Comisión (%)</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          step="0.01"
                          value={creditParams.comisionPorcentaje}
                          onChange={(e) => setCreditParams({...creditParams, comisionPorcentaje: parseFloat(e.target.value) || 0})}
                          className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                        />
                        <span className="text-xs text-steel-400">%</span>
                      </div>
                      <p className="text-xs text-steel-400 mt-2">{formatCOP(ingresoRealCalculado.comision)}</p>
                    </div>

                    {/* Tasa de Interés */}
                    <div className="rounded-lg border border-steel-200 p-4">
                      <label className="text-xs font-semibold text-steel-600 uppercase">Tasa Efectiva Anual (%)</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          step="0.01"
                          value={creditParams.tasaInteres}
                          onChange={(e) => setCreditParams({...creditParams, tasaInteres: parseFloat(e.target.value) || 0})}
                          className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                        />
                        <span className="text-xs text-steel-400">%</span>
                      </div>
                      <p className="text-xs text-steel-400 mt-2">{(creditParams.tasaInteres / 12).toFixed(2)}% mensual aprox.</p>
                    </div>

                    {/* Meses del Crédito */}
                    <div className="rounded-lg border border-steel-200 p-4">
                      <label className="text-xs font-semibold text-steel-600 uppercase">Plazo (Meses)</label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          value={creditParams.mesesCredito}
                          onChange={(e) => setCreditParams({...creditParams, mesesCredito: parseInt(e.target.value) || 0})}
                          className="flex-1 rounded border border-primary-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-400"
                        />
                        <span className="text-xs text-steel-400">meses</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cálculo Formulado */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-5 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900">Cálculo del Ingreso Real</h3>

                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700">Desembolso</span>
                      <span className="font-bold text-emerald-800">{formatCOP(creditParams.desembolso)}</span>
                    </div>
                    <div className="border-t border-emerald-300"></div>
                    <div className="flex justify-between items-center text-red-600">
                      <span>(-) GMF ({creditParams.gmfPorcentaje}%)</span>
                      <span className="font-bold">- {formatCOP(ingresoRealCalculado.gmf)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                      <span>(-) Comisión ({creditParams.comisionPorcentaje}%)</span>
                      <span className="font-bold">- {formatCOP(ingresoRealCalculado.comision)}</span>
                    </div>
                    <div className="border-t-2 border-emerald-400 pt-2 flex justify-between items-center">
                      <span className="text-emerald-900 font-bold">= Ingreso Real</span>
                      <span className="font-black text-lg text-emerald-700">{formatCOP(ingresoRealCalculado.ingresoReal)}</span>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-700">
                  <p className="font-semibold mb-2">💡 Información del Crédito Puente:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>GMF (Gravamen Movimiento Financiero): Impuesto bancario en Colombia (~0.395%)</li>
                    <li>Comisión: Cargo del banco por gestión y desembolso (~1.1%)</li>
                    <li>Tasa Efectiva Anual: IBR + 2.85% spread según contrato</li>
                    <li>Plazo: {creditParams.mesesCredito} meses (vencimiento con pago final)</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-steel-200 px-6 py-4 bg-steel-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 rounded-lg border border-steel-300 text-steel-700 hover:bg-steel-100 transition text-sm font-semibold"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Actualizar el monto de ingreso Feb
                    setIncomes((prev) =>
                      prev.map((i) =>
                        i.id === 'ING-FEB' ? { ...i, monto: ingresoRealCalculado.ingresoReal } : i
                      )
                    );
                    setShowCreditModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm font-semibold"
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grouped Payment Items ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-steel-800">Proyeccion de Pagos por Grupo</h3>
            <p className="text-[10px] text-steel-400 mt-0.5">
              Fuente: Excel "Proyeccion de Pagos Patio Sur" | Arrastre items entre grupos | Amarillo = falta por pagar
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" /> Pagado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300" /> Parcial</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400 ring-1 ring-yellow-300" /> Por negociar</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 border border-red-300" /> Pendiente</span>
          </div>
        </div>

        {(Object.keys(GROUP_CONFIG) as GroupId[]).map((groupId) => {
          const config = GROUP_CONFIG[groupId];
          const Icon = config.icon;
          const f = tableFilters[groupId];
          const groupItems = items.filter((i) => {
            if (i.grupo !== groupId) return false;
            if (f.proveedor && !i.proveedor.toLowerCase().includes(f.proveedor.toLowerCase())) return false;
            if (f.concepto && !i.concepto.toLowerCase().includes(f.concepto.toLowerCase())) return false;
            if (f.estado && i.estado !== f.estado) return false;
            return true;
          });
          const allGroupItems = items.filter((i) => i.grupo === groupId);
          const isExpanded = expandedGroups[groupId];
          const gt = groupTotals[groupId];

          return (
            <div
              key={groupId}
              className={clsx('rounded-xl border bg-white shadow-card overflow-hidden', config.borderColor)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(groupId)}
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupId)}
                className={clsx('w-full flex items-center justify-between px-5 py-3 transition', config.bgColor)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className={clsx('h-4 w-4', config.color)} /> : <ChevronRight className={clsx('h-4 w-4', config.color)} />}
                  <Icon className={clsx('h-4 w-4', config.color)} />
                  <div className="text-left">
                    <p className={clsx('text-sm font-bold', config.color)}>{config.label}</p>
                    <p className="text-[10px] text-steel-400">{gt.count} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-[9px] text-steel-400 uppercase">Contrato</p>
                    <p className="text-xs font-bold text-steel-700 font-mono">{formatShort(gt.contrato)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-steel-400 uppercase">Pagado</p>
                    <p className="text-xs font-bold text-emerald-600 font-mono">{formatShort(gt.pagado)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-yellow-600 uppercase font-bold">Por pagar</p>
                    <p className="text-xs font-black text-yellow-700 font-mono">{formatShort(gt.porPagar)}</p>
                  </div>
                </div>
              </button>

              {/* Group Items Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-steel-50 border-y border-steel-100">
                        <th className="px-2 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left text-steel-500 font-semibold">Proveedor</th>
                        <th className="px-3 py-2 text-left text-steel-500 font-semibold">Concepto</th>
                        <th className="px-3 py-2 text-right text-steel-500 font-semibold">Contrato Total</th>
                        <th className="px-3 py-2 text-right text-steel-500 font-semibold">Pagado</th>
                        <th className="px-3 py-2 text-right text-yellow-600 font-bold">Por Pagar</th>
                        <th className="px-3 py-2 text-center text-steel-500 font-semibold">Estado</th>
                        <th className="px-3 py-2 text-center text-steel-500 font-semibold">Grupo</th>
                        <th className="px-3 py-2 text-center text-steel-500 font-semibold w-28">Contrato</th>
                        {groupId === 'administracion' && (
                          <th className="px-3 py-2 text-center text-steel-500 font-semibold w-16">Inc.</th>
                        )}
                      </tr>
                      {/* Filter row */}
                      <tr className="bg-white border-b border-steel-100">
                        <td className="px-2 py-1.5 text-center">
                          {hasFilters(groupId) && (
                            <button onClick={() => clearFilters(groupId)} title="Limpiar filtros" className="text-steel-300 hover:text-red-400 transition">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={tableFilters[groupId].proveedor}
                            onChange={e => setFilter(groupId, 'proveedor', e.target.value)}
                            className="w-full text-[10px] border border-steel-200 rounded px-2 py-1 focus:outline-none focus:border-primary-400 placeholder-steel-300"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={tableFilters[groupId].concepto}
                            onChange={e => setFilter(groupId, 'concepto', e.target.value)}
                            className="w-full text-[10px] border border-steel-200 rounded px-2 py-1 focus:outline-none focus:border-primary-400 placeholder-steel-300"
                          />
                        </td>
                        <td /><td /><td />
                        <td className="px-2 py-1.5">
                          <select
                            value={tableFilters[groupId].estado}
                            onChange={e => setFilter(groupId, 'estado', e.target.value)}
                            className="w-full text-[10px] border border-steel-200 rounded px-1.5 py-1 focus:outline-none focus:border-primary-400 bg-white text-steel-600"
                          >
                            <option value="">Todos</option>
                            <option value="pagado">Pagado</option>
                            <option value="parcial">Parcial</option>
                            <option value="por_negociar">Por negociar</option>
                            <option value="pendiente">Pendiente</option>
                          </select>
                        </td>
                        <td /><td />
                        {groupId === 'administracion' && <td />}
                      </tr>
                      {hasFilters(groupId) && (
                        <tr className="bg-primary-50/50">
                          <td colSpan={groupId === 'administracion' ? 10 : 9} className="px-3 py-1 text-[10px] text-primary-600">
                            Mostrando {groupItems.length} de {allGroupItems.length} items
                          </td>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-steel-50">
                      {groupItems.map((item) => {
                        const porPagarPct = item.contratoTotal > 0 ? (item.porPagar / item.contratoTotal) * 100 : 0;
                        return (
                          <tr
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragEnd={handleDragEnd}
                            className={clsx(
                              'hover:bg-steel-50/70 transition cursor-grab active:cursor-grabbing',
                              !item.incluido && 'opacity-40 bg-steel-50',
                              item.isNominaExterna && item.incluido && 'bg-orange-50/50',
                              dragItem === item.id && 'ring-2 ring-primary-400 bg-primary-50',
                            )}
                          >
                            <td className="px-2 py-2.5 text-center">
                              <GripVertical className="h-3.5 w-3.5 text-steel-300 inline-block" />
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-steel-800 whitespace-nowrap">{item.proveedor}</td>
                            <td className="px-3 py-2.5 text-steel-600">
                              <div>
                                {item.concepto}
                                {item.observacion && (
                                  <p className="text-[10px] text-steel-400 mt-0.5 italic">{item.observacion}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-steel-700">{formatCOP(item.contratoTotal)}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-emerald-600 font-semibold">{formatCOP(item.pagado)}</td>
                            <td className={clsx('px-3 py-2.5 text-right font-mono font-bold', item.porPagar > 0 ? 'text-yellow-700' : 'text-emerald-600')}>
                              {item.porPagar > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-yellow-100 border border-yellow-300 rounded-md px-2 py-0.5">
                                  {formatCOP(item.porPagar)}
                                  <span className="text-[9px] text-yellow-600">({porPagarPct.toFixed(0)}%)</span>
                                </span>
                              ) : (
                                <span className="text-emerald-500">Completo</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={clsx('text-[10px] font-semibold rounded-full px-2 py-0.5', ESTADO_BADGE[item.estado].cls)}>
                                {ESTADO_BADGE[item.estado].label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <select
                                value={item.grupo}
                                onChange={(e) => moveToGroup(item.id, e.target.value as GroupId)}
                                className="text-[10px] rounded border border-steel-200 px-1.5 py-1 bg-white text-steel-600 cursor-pointer hover:border-primary-400 transition"
                              >
                                {(Object.keys(GROUP_CONFIG) as GroupId[]).map((g) => (
                                  <option key={g} value={g}>{GROUP_CONFIG[g].label.split(' ')[0]}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {contratos[item.id] ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setPreviewContrato({ itemId: item.id, filename: contratos[item.id].filename })}
                                    className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-md px-1.5 py-0.5 max-w-[90px] truncate transition"
                                    title={`Ver: ${contratos[item.id].filename}`}
                                  >
                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{contratos[item.id].filename}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteContrato(item.id)}
                                    className="p-0.5 rounded hover:bg-red-100 text-steel-300 hover:text-red-500 transition"
                                    title="Eliminar contrato"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer inline-flex items-center gap-1 text-[10px] text-steel-400 hover:text-primary-600 bg-steel-50 hover:bg-primary-50 border border-steel-200 hover:border-primary-300 rounded-md px-2 py-0.5 transition">
                                  {uploadingId === item.id ? (
                                    <span className="animate-pulse">Subiendo...</span>
                                  ) : (
                                    <>
                                      <Paperclip className="h-3 w-3" />
                                      <span>Adjuntar</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleUploadContrato(item.id, f);
                                      e.target.value = '';
                                    }}
                                  />
                                </label>
                              )}
                            </td>
                            {groupId === 'administracion' && (
                              <td className="px-3 py-2.5 text-center">
                                {item.isNominaExterna && (
                                  <button
                                    onClick={() => toggleIncluido(item.id)}
                                    className={clsx(
                                      'p-1.5 rounded-lg transition',
                                      item.incluido
                                        ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600',
                                    )}
                                    title={item.incluido ? 'Excluir del gasto' : 'Incluir en el gasto'}
                                  >
                                    {item.incluido ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary Totals ── */}
      <div className="rounded-xl border-2 border-primary-200 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-3 bg-primary-900">
          <h3 className="text-sm font-bold text-white">Resumen Financiero del Proyecto</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-steel-50">
              <p className="text-[10px] text-steel-400 uppercase font-medium">Contrato Total (Items)</p>
              <p className="text-base font-black text-steel-800 font-mono mt-1">{formatB(totalContrato)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50">
              <p className="text-[10px] text-emerald-600 uppercase font-medium">Total Pagado</p>
              <p className="text-base font-black text-emerald-700 font-mono mt-1">{formatB(totalPagado)}</p>
              <div className="mt-1.5 w-full bg-steel-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalPagado / totalContrato) * 100)}%` }} />
              </div>
              <p className="text-[9px] text-emerald-500 mt-0.5">{((totalPagado / totalContrato) * 100).toFixed(1)}% ejecutado</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-[10px] text-yellow-700 uppercase font-bold">Falta por Pagar</p>
              <p className="text-base font-black text-yellow-700 font-mono mt-1">{formatB(totalPorPagar)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <p className="text-[10px] text-red-600 uppercase font-medium">Total + Intereses + Adic.</p>
              <p className="text-base font-black text-red-700 font-mono mt-1">{formatB(totalConFinanciamiento)}</p>
              <p className="text-[9px] text-red-400 mt-0.5">Int. {formatB(interesesCredito)} + Adic. {formatB(gastosAdicionales)}</p>
            </div>
          </div>

          {/* Oferta vs Costo */}
          <div className="mt-4 flex items-center gap-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
            <div className="flex-1">
              <p className="text-[10px] text-primary-600 uppercase font-medium">Valor Oferta Mercantil</p>
              <p className="text-lg font-black text-primary-800 font-mono">{formatCOP(41012884481)}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-steel-400">menos</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-red-500 uppercase font-medium">Costo Total Proyectado</p>
              <p className="text-lg font-black text-red-700 font-mono">{formatCOP(totalConFinanciamiento)}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-steel-400">=</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-emerald-600 uppercase font-medium">Utilidad Proyectada</p>
              <p className="text-lg font-black text-emerald-700 font-mono">{formatCOP(41012884481 - totalConFinanciamiento)}</p>
              <p className="text-[9px] text-emerald-500">{((1 - totalConFinanciamiento / 41012884481) * 100).toFixed(1)}% margen</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cash Flow Chart ── */}
      <CashFlowChart entries={cashFlowEntries} />

      {/* ── Financial Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="h-4 w-4 text-violet-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Credito Puente</p>
          </div>
          <p className="text-lg font-bold text-violet-700">{formatCOP(17000000000)}</p>
          <p className="text-[10px] text-steel-400 mt-1">IBR + 2.85 (13.66% EA) | Bullet Feb 2027</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-red-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Intereses Credito</p>
          </div>
          <p className="text-lg font-bold text-red-600">{formatCOP(interesesCredito)}</p>
          <p className="text-[10px] text-red-500 mt-1 font-semibold">$552.8M / trimestre x 3</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Gastos Adicionales</p>
          </div>
          <p className="text-lg font-bold text-amber-700">{formatCOP(gastosAdicionales)}</p>
          <p className="text-[10px] text-steel-400 mt-1">Int. adicionales + VG</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Ingreso Recibido</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">{formatCOP(incomes[0].monto)}</p>
          <p className="text-[10px] text-steel-400 mt-1">Feb 2026 — unico ingreso a la fecha</p>
        </div>
      </div>

      {/* ── Plan de Acción Recomendado ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-steel-900">Plan de Acción Recomendado</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Paso 1: Evaluar Préstamo Interno */}
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 overflow-hidden">
            <button
              onClick={() => setExpandedActions(prev => ({ ...prev, prestamo: !prev.prestamo }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-100 transition"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700">1</span>
                </div>
                <h4 className="font-bold text-blue-900">Evaluar Préstamo Interno</h4>
              </div>
              <ChevronDown className={clsx('h-4 w-4 text-blue-600 transition', expandedActions.prestamo && 'rotate-180')} />
            </button>

            {expandedActions.prestamo && (
              <div className="px-4 pb-4 pt-2 border-t border-blue-200 space-y-2">
                <ul className="space-y-2 text-xs text-blue-900">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>Monto:</strong> {formatB(7506435528)} desembolsado en Feb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>¿Plazo?</strong> Definir cronograma de recuperación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>¿Términos?</strong> Tasa, garantías, condiciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>Impacto:</strong> Reduce saldo disponible en {formatB(7506435528)}</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-blue-200 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition">
                    Ver Detalles
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-200 text-blue-700 text-xs font-semibold rounded hover:bg-blue-300 transition">
                    Editar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paso 2: Estrategias de Financiamiento */}
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 overflow-hidden">
            <button
              onClick={() => setExpandedActions(prev => ({ ...prev, estrategias: !prev.estrategias }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-100 transition"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700">2</span>
                </div>
                <h4 className="font-bold text-purple-900">Estrategias Financiamiento</h4>
              </div>
              <ChevronDown className={clsx('h-4 w-4 text-purple-600 transition', expandedActions.estrategias && 'rotate-180')} />
            </button>

            {expandedActions.estrategias && (
              <div className="px-4 pb-4 pt-2 border-t border-purple-200 space-y-2">
                <ul className="space-y-2 text-xs text-purple-900">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span><strong>Brecha crítica:</strong> {formatB(brechaFinanciamiento)} adicionales necesarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span><strong>Solicitar crédito puente</strong> al banco para cobertura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span><strong>Negociar plazos extendidos</strong> con proveedores clave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span><strong>Evaluar ingresos adicionales</strong> de clientes</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-purple-200 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition">
                    Generar Propuesta
                  </button>
                  <button className="flex-1 px-3 py-2 bg-purple-200 text-purple-700 text-xs font-semibold rounded hover:bg-purple-300 transition">
                    Simulador
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Paso 3: Monitoreo Mensual */}
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
            <button
              onClick={() => setExpandedActions(prev => ({ ...prev, monitoreo: !prev.monitoreo }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-100 transition"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-700">3</span>
                </div>
                <h4 className="font-bold text-orange-900">Monitoreo Mensual</h4>
              </div>
              <ChevronDown className={clsx('h-4 w-4 text-orange-600 transition', expandedActions.monitoreo && 'rotate-180')} />
            </button>

            {expandedActions.monitoreo && (
              <div className="px-4 pb-4 pt-2 border-t border-orange-200 space-y-2">
                <ul className="space-y-2 text-xs text-orange-900">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span><strong>Marzo 2026:</strong> Pago $1.004 M → Saldo $0.326 M</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span><strong>Abril 2026:</strong> Pago $2.310 M → DEFÍCIT ⚠️</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span><strong>Seguimiento semanal</strong> de ingresos vs pagos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold mt-0.5">•</span>
                    <span><strong>Alertas automáticas</strong> si balance cae bajo $500M</span>
                  </li>
                </ul>
                <div className="pt-3 border-t border-orange-200 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition">
                    Ver Cronograma
                  </button>
                  <button className="flex-1 px-3 py-2 bg-orange-200 text-orange-700 text-xs font-semibold rounded hover:bg-orange-300 transition">
                    Alertas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Data Sources ── */}
      <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 text-xs text-primary-800">
        <p className="font-bold mb-1">Fuentes de Datos:</p>
        <ul className="space-y-1 text-[11px]">
          <li>• <strong>Proyeccion de pagos:</strong> Excel "Proyeccion de Pagos Patio Sur (1).xlsx" — Hoja "Hoja2" (proyeccion principal) y "Pagos Patio Sur" (estado contratos).</li>
          <li>• <strong>Pagos reales (Feb 2026):</strong> Hoja "Otros Pagos" — $7.5B proyecto + $3.5B bancos + $3.8B proveedores.</li>
          <li>• <strong>Credito puente:</strong> $17B a IBR+2.85 (13.66% EA), tipo bullet con vencimiento Feb 2027.</li>
          <li>• <strong>Nomina externa:</strong> $860M nomina + $640M factoring cargados a Patio Sur, pendientes de reposicion.</li>
        </ul>
      </div>

      {/* ── Modal: Previsualización de contrato ── */}
      {previewContrato && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewContrato(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-steel-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-semibold text-steel-800 truncate max-w-lg">{previewContrato.filename}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/v1/documents/contrato/${previewContrato.itemId}`}
                  download={previewContrato.filename}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-lg px-3 py-1.5 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </a>
                <button
                  onClick={() => setPreviewContrato(null)}
                  className="p-1.5 rounded-lg hover:bg-steel-100 text-steel-500 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-xl bg-steel-50">
              {(() => {
                const ext = previewContrato.filename.split('.').pop()?.toLowerCase();
                const previewUrl = `/api/v1/documents/contrato/${previewContrato.itemId}/preview`;
                if (ext === 'pdf') {
                  return <iframe src={previewUrl} className="w-full h-full rounded-b-xl" title={previewContrato.filename} />;
                }
                if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img src={previewUrl} alt={previewContrato.filename} className="max-w-full max-h-full object-contain rounded-lg shadow" />
                    </div>
                  );
                }
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-steel-500">
                    <FileText className="h-16 w-16 text-steel-300" />
                    <p className="text-sm">Vista previa no disponible para este tipo de archivo.</p>
                    <a
                      href={`/api/v1/documents/contrato/${previewContrato.itemId}`}
                      download={previewContrato.filename}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 transition"
                    >
                      <Download className="h-4 w-4" />
                      Descargar para ver
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Detalle de pagos por mes ── */}
      {selectedMonthDetail && (() => {
        const details = MONTHLY_PAYMENT_DETAILS[selectedMonthDetail] ?? [];
        const totalMes = details.reduce((s, d) => s + d.monto, 0);

        // Agrupar por grupo
        const byGroup: Record<string, MonthlyPaymentDetail[]> = {};
        for (const d of details) {
          if (!byGroup[d.grupo]) byGroup[d.grupo] = [];
          byGroup[d.grupo].push(d);
        }

        // Agrupar por categoria dentro de cada grupo
        const isRealMonth = ['Oct 2025', 'Nov 2025', 'Dic 2025', 'Ene 2026', 'Feb 2026', 'Mar 2026'].includes(selectedMonthDetail);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMonthDetail(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-steel-200 bg-gradient-to-r from-primary-900 to-primary-800 rounded-t-xl flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-300" />
                    <h2 className="text-lg font-bold text-white">Detalle de Pagos — {selectedMonthDetail}</h2>
                    {isRealMonth && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Real</span>
                    )}
                    {!isRealMonth && (
                      <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Proyectado</span>
                    )}
                  </div>
                  <p className="text-xs text-primary-300 mt-0.5">
                    {details.length} conceptos · Total: <span className="font-bold text-white">{formatCOP(totalMes)}</span>
                  </p>
                </div>
                <button onClick={() => setSelectedMonthDetail(null)} className="p-2 rounded-lg hover:bg-primary-700 text-primary-300 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {(['materiales', 'mano_obra', 'administracion'] as GroupId[]).map(grupoId => {
                  const grupoItems = byGroup[grupoId];
                  if (!grupoItems || grupoItems.length === 0) return null;
                  const config = GROUP_CONFIG[grupoId];
                  const Icon = config.icon;
                  const grupoTotal = grupoItems.reduce((s, d) => s + d.monto, 0);
                  const pct = totalMes > 0 ? (grupoTotal / totalMes * 100).toFixed(1) : '0';

                  // Agrupar por categoria
                  const byCat: Record<string, MonthlyPaymentDetail[]> = {};
                  for (const d of grupoItems) {
                    if (!byCat[d.categoria]) byCat[d.categoria] = [];
                    byCat[d.categoria].push(d);
                  }

                  return (
                    <div key={grupoId} className={clsx('rounded-xl border', config.borderColor, config.bgColor)}>
                      {/* Grupo header */}
                      <div className={clsx('px-4 py-3 flex items-center justify-between rounded-t-xl border-b', config.borderColor)}>
                        <div className="flex items-center gap-2">
                          <Icon className={clsx('h-4 w-4', config.color)} />
                          <span className={clsx('text-sm font-bold', config.color)}>{config.label}</span>
                          <span className="text-[10px] text-steel-500 bg-white rounded-full px-2 py-0.5 border border-steel-200">{pct}% del total</span>
                        </div>
                        <span className={clsx('text-sm font-black font-mono', config.color)}>{formatCOP(grupoTotal)}</span>
                      </div>

                      {/* Items por categoria */}
                      <div className="divide-y divide-white/60">
                        {Object.entries(byCat).map(([cat, catItems]) => (
                          <div key={cat}>
                            {/* Subcategoria label */}
                            <div className="px-4 py-1.5 bg-white/40">
                              <span className="text-[10px] font-bold text-steel-500 uppercase tracking-wide">{cat}</span>
                            </div>
                            {/* Items */}
                            {catItems.map((item, i) => (
                              <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-white/60 transition">
                                <div className="flex-1 min-w-0 mr-4">
                                  <p className="text-sm font-semibold text-steel-800 truncate">{item.proveedor || '—'}</p>
                                  <p className="text-[11px] text-steel-500 truncate">{item.concepto}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-bold font-mono text-steel-800">{formatCOP(item.monto)}</p>
                                  <p className="text-[10px] text-steel-400">{(item.monto / totalMes * 100).toFixed(1)}%</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer — totals */}
              <div className="px-6 py-4 border-t border-steel-200 bg-steel-50 rounded-b-xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs">
                    {(['materiales', 'mano_obra', 'administracion'] as GroupId[]).map(g => {
                      const items = byGroup[g];
                      if (!items) return null;
                      const tot = items.reduce((s, d) => s + d.monto, 0);
                      const config = GROUP_CONFIG[g];
                      return (
                        <div key={g}>
                          <p className="text-steel-400">{config.label.split(' ')[0]}</p>
                          <p className={clsx('font-bold', config.color)}>{formatCOP(tot)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-steel-400">TOTAL {selectedMonthDetail.toUpperCase()}</p>
                    <p className="text-xl font-black font-mono text-steel-900">{formatCOP(totalMes)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
