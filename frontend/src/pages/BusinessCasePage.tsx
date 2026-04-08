import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Download, TrendingDown, AlertTriangle, Clock, ShieldCheck, Briefcase, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';
import HelpButton from '@/components/common/HelpButton';
import ChapterBreakdownChart from '@/components/dashboard/ChapterBreakdownChart';
import BudgetPageContent from './BudgetPage';

const businessCaseHelp = {
  pageTitle: 'Ayuda — Caso de Negocio',
  description:
    'Esta pagina presenta el analisis financiero detallado del proyecto basado en el archivo ' +
    '"Detallado caso de negocio_220126.xlsx". Muestra la estructura de costos vs venta, ' +
    'el estado de la gestion de compra y los indicadores de rentabilidad por capitulo.',
  sections: [
    {
      title: 'KPIs Macro Financieros',
      items: [
        { color: '#1B5EAB', label: 'Valor Oferta Total: $41.0B', description: 'Precio global fijo con financiacion. Fuente: hoja "Costo vs Venta" y "RESUMEN VENTA" del Excel.' },
        { color: '#4A4D56', label: 'Costo Total Estimado: $29.5B', description: 'Costo directo + AIU + financiacion. Fuente: suma de costos de "Costo vs Venta" + "Admon Patios".' },
        { color: '#16A34A', label: 'Margen Bruto: 28.2% ($11.6B)', description: 'Diferencia entre venta y costo: $41B - $29.5B. Incluye AIU (17%) y financiacion.' },
        { color: '#1B5EAB', label: 'Ahorro en Compras: $3.7B (15.3%)', description: 'Diferencia entre caso de negocio ($24.3B) y costo proyectado ($20.6B). Fuente: hoja "Ejecucion vs CN".' },
        { color: '#8B8E96', label: 'Financiacion: $3.1B', description: 'Costo financiero por 9 meses sin ingresos ($1.375B interes). Fuente: hoja "Admon Patios".' },
      ],
    },
    {
      title: 'Estado de Procura',
      items: [
        { color: '#4A4D56', label: 'Costo Directo (Caso Negocio): $24.3B', description: 'Presupuesto base de los 15 capitulos. Fuente: hoja "Ejecucion vs Caso de Negocio".' },
        { color: '#16A34A', label: 'Negociado: $13.2B (54.2%)', description: 'Ordenes de compra firmadas. Proveedores: Starcharge, WEG, Taesmet, R2F.' },
        { color: '#D97706', label: 'Pendiente: $7.4B (30.5%)', description: 'Sin contrato firmado. Criticos: Conexion Red, Comp. Reactiva, SPE/SPT.' },
        { color: '#1B5EAB', label: 'Costo Proyectado: $20.6B', description: 'Negociado + Pendiente. $3.7B por debajo del caso de negocio.' },
      ],
    },
    {
      title: 'Grafico: Venta vs Costo',
      items: [
        { color: '#1b5eab', label: 'Barra Azul — Venta (Oferta)', description: 'Precio cobrado al cliente por capitulo. Fuente: columna VENTA de "Costo vs Venta".' },
        { color: '#8b8e96', label: 'Barra Gris — Costo (Caso Negocio)', description: 'Costo estimado por capitulo. Fuente: columna COSTO de "Costo vs Venta".' },
      ],
    },
    {
      title: 'Grafico: Gestion de Compra',
      items: [
        { color: '#b5b8be', label: 'Barra Gris — Caso de Negocio', description: 'Presupuesto original estimado por capitulo.' },
        { color: '#16a34a', label: 'Barra Verde — Negociado', description: 'Monto con contrato/OC firmada con proveedor.' },
        { color: '#d97706', label: 'Barra Amarilla — Pendiente', description: 'Monto sin proveedor definido, riesgo de precio.' },
      ],
    },
    {
      title: 'Estructura de Costos (Pie)',
      items: [
        { color: '#1b5eab', label: 'Costo Directo: $24.3B', description: 'Materiales, equipos, mano de obra de los 15 capitulos.' },
        { color: '#d97706', label: 'Administracion (11%): $2.4B', description: 'Personal indirecto, oficinas, vehiculos, seguros.' },
        { color: '#f59e0b', label: 'Imprevistos (2%): $485M', description: 'Reserva para contingencias del proyecto.' },
        { color: '#8b8e96', label: 'Financiacion: $1.4B', description: 'Costo financiero (intereses) por 9 meses.' },
      ],
    },
    {
      title: 'Tabla: Indicadores de Riesgo',
      items: [
        { color: '#16A34A', label: 'OK (Verde) — Margen >= 10%', description: 'Capitulo con margen saludable. Sin riesgo financiero.' },
        { color: '#D97706', label: 'Bajo (Amarillo) — Margen 0%-10%', description: 'Margen ajustado, requiere monitoreo. Ej: Transformadores (9.5%), SPE/SPT (1.9%).' },
        { color: '#DC2626', label: 'Perdida (Rojo) — Margen < 0%', description: 'El costo supera la venta. Ej: Comp. Reactiva (-37.4%).' },
      ],
    },
    {
      title: 'Tabla: Estado de Negociacion',
      items: [
        { color: '#16A34A', label: 'Cerrado (>= 80%)', description: 'Capitulo con mayoria del presupuesto en contratos firmados.' },
        { color: '#D97706', label: 'Parcial (> 0% y < 80%)', description: 'Negociacion en curso, parcialmente comprometido.' },
        { color: '#DC2626', label: 'Pendiente (0%)', description: 'Sin proveedor definido. Riesgo alto de variacion de precio.' },
      ],
    },
  ],
};
import { formatCOPFull } from '@/utils/formatNumbers';

// Use full currency format for detailed business case display
const formatCOPDisplay = formatCOPFull;

// ==================== REAL DATA FROM EXCEL ====================


// ── Agrupación para tabla Costo vs Venta editable ──
const LS_KEY = 'patio_sur_cv_table_v1';
// Clave para sincronizar EAC con Dashboard
export const LS_EAC_KEY = 'patio_sur_eac_caso_negocio';

const GRUPOS_CV = [
  {
    id: 'suministro',
    nombre: 'Suministro',
    color: '#1b5eab',
    items: [
      { id: 'redes-mt',         cap: 'Redes MT (Celdas)',        venta: 2893959054, costo: 2046582157 },
      { id: 'subestaciones',    cap: 'Subestaciones (Shelter)',  venta: 3406137000, costo: 2692179338 },
      { id: 'transformadores',  cap: 'Transformadores',          venta: 2338037308, costo: 2115002279 },
      { id: 'bt',               cap: 'Baja Tensión (BT)',        venta: 3856386116, costo: 2864635880 },
      { id: 'spe',              cap: 'SPE y SPT',                venta: 262823529,  costo: 257800000  },
      { id: 'comunicaciones',   cap: 'Comunicaciones',           venta: 701469115,  costo: 264839198  },
      { id: 'cargadores',       cap: 'Cargadores',               venta: 6743603237, costo: 5330376000 },
      { id: 'deteccion',        cap: 'Detección Incendios',      venta: 270082618,  costo: 227943849  },
      { id: 'obras-civiles',    cap: 'Obras Civiles y Redes',    venta: 8177142400, costo: 6537881527 },
    ],
  },
  {
    id: 'mano-obra',
    nombre: 'Mano de Obra',
    color: '#16a34a',
    items: [
      { id: 'estudios',         cap: 'Estudios y Diseños',       venta: 419047180,  costo: 312727205  },
      { id: 'conexion-red',     cap: 'Conexión a la Red',        venta: 519268407,  costo: 369435063  },
      { id: 'inst-cargadores',  cap: 'Instalación Cargadores',   venta: 261567164,  costo: 191000000  },
      { id: 'iluminacion',      cap: 'ILU y Servicios Aux',      venta: 147984032,  costo: 125786428  },
    ],
  },
  {
    id: 'administracion',
    nombre: 'Administración',
    color: '#7c3aed',
    items: [
      { id: 'tramites',         cap: 'Trámites y Certificaciones', venta: 679896358, costo: 186229084 },
    ],
  },
  {
    id: 'intereses',
    nombre: 'Intereses',
    color: '#f59e0b',
    items: [
      { id: 'comp-reactiva',    cap: 'Compensación Reactiva',    venta: 547200000,  costo: 751864128  },
    ],
  },
];

type RowValues = Record<string, { venta: number; costo: number }>;

const EXTRA_ITEMS = [
  { id: 'iva-cargadores', label: 'IVA Cargadores',       venta: 337180162,  costo: 247981000  },
  { id: 'its',            label: 'ITS',                   venta: 444548919,  costo: 382907200  },
  { id: 'adm-11',         label: 'Administración (11%)',       venta: 3734163668, costo: 2444728897 },
  { id: 'imprev-2',       label: 'Imprevistos (2%)',           venta: 649419768,  costo: 485485643  },
  { id: 'utilidad-4',     label: 'Utilidad (4%)',              venta: 1298839537, costo: 0          },
  { id: 'ivau-19',        label: 'IVA sobre Utilidad (19%)',   venta: 246779512,  costo: 246779512  },
  { id: 'financiacion',   label: 'Financiación 9 m.',          venta: 3077349397, costo: 1375000000 },
];

function loadCVValues(): RowValues {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved) as RowValues;
  } catch { /* ignore */ }
  const defaults: RowValues = {};
  GRUPOS_CV.forEach(g => g.items.forEach(item => {
    defaults[item.id] = { venta: item.venta, costo: item.costo };
  }));
  EXTRA_ITEMS.forEach(item => {
    defaults[item.id] = { venta: item.venta, costo: item.costo };
  });
  return defaults;
}

// Procurement management (from "Ejecución vs Caso de Negocio" sheet)
const detalleCosto = [
  { ref: 'ESTUDIOS Y DISEÑOS', cn: 312727205, neg: 252360920, pend: 60366285, proy: 312727205, items: [
    { cap: 'Diseño Eléctrico - PC', prov: 'PC Mejía', neg: 0, pend: 60366285 },
    { cap: 'Diseño cimentaciones', prov: 'R2F', neg: 19658800, pend: 0 },
    { cap: 'Diseño geométrico', prov: 'Mobilé', neg: 80872400, pend: 0 },
    { cap: 'Estudio de suelos', prov: 'R2F', neg: 52586100, pend: 0 },
    { cap: 'Topografía', prov: 'R2F', neg: 44446500, pend: 0 },
    { cap: 'Diseño detección y extinción', prov: 'Ingeici', neg: 17790500, pend: 0 },
    { cap: 'Coordinación protecciones / ETPS', prov: 'Sice', neg: 21822220, pend: 0 },
    { cap: 'Medida resistividad terreno', prov: 'Iprecom', neg: 1011500, pend: 0 },
    { cap: 'Medida resistividad terreno', prov: 'Hidrocol', neg: 1558900, pend: 0 },
    { cap: 'Diseño de iluminación', prov: 'EDI', neg: 5890500, pend: 0 },
    { cap: 'Diseño comunicaciones', prov: 'EDI', neg: 6723500, pend: 0 },
  ]},
  { ref: 'CONEXIÓN A LA RED', cn: 369435063, neg: 0, pend: 369435063, proy: 369435063, items: [] },
  { ref: 'REDES MT (Celdas)', cn: 2046582157, neg: 1238615200, pend: 0, proy: 1238615200, items: [
    { cap: 'Celdas MT', prov: '', neg: 1005050200, pend: 0 },
    { cap: 'Cable MT', prov: '', neg: 233565000, pend: 0 },
  ]},
  { ref: 'SUBESTACIONES (Shelter)', cn: 2692179338, neg: 0, pend: 460221135, proy: 460221135, items: [] },
  { ref: 'TRANSFORMADORES', cn: 2115002279, neg: 1211417000, pend: 0, proy: 1211417000, items: [] },
  { ref: 'BAJA TENSIÓN (BT)', cn: 2864635880, neg: 1988944382, pend: 721684532, proy: 2710628914, items: [
    { cap: 'Celdas Trafos', prov: '', neg: 65705850, pend: 0 },
    { cap: 'TGA - Tableros', prov: '', neg: 723969820, pend: 0 },
    { cap: 'Cable BT - AC', prov: 'Por definir', neg: 0, pend: 634552345 },
    { cap: 'Cable BT - DC', prov: '', neg: 937601828, pend: 0 },
    { cap: 'Bus de barras', prov: 'Alpa', neg: 261666884, pend: 0 },
    { cap: 'Canalizaciones', prov: 'Por definir', neg: 0, pend: 87132187 },
  ]},
  { ref: 'SPE Y SPT', cn: 257800000, neg: 0, pend: 257800000, proy: 257800000, items: [
    { cap: 'Suministro equipos SPT', prov: 'Por definir', neg: 0, pend: 128900000 },
    { cap: 'Suministro equipos SPE', prov: 'Por definir', neg: 0, pend: 128900000 },
  ]},
  { ref: 'COMUNICACIONES', cn: 264839198, neg: 0, pend: 264839198, proy: 264839198, items: [
    { cap: 'Suministro redes pasivas', prov: 'Por definir', neg: 0, pend: 208185868 },
    { cap: 'Suministro equipos activos', prov: 'Por definir', neg: 0, pend: 56653330 },
  ]},
  { ref: 'CARGADORES', cn: 5330376000, neg: 4374580000, pend: 280756000, proy: 4655336000, items: [
    { cap: 'Cargadores', prov: 'Starcharge', neg: 4267580000, pend: 0 },
    { cap: 'Logística Internacional / Nacional', prov: 'Magnum', neg: 107000000, pend: 0 },
    { cap: 'Elevadores mangueras', prov: 'Por definir', neg: 0, pend: 280756000 },
  ]},
  { ref: 'INSTALACIÓN CARGADORES', cn: 191000000, neg: 0, pend: 191000000, proy: 191000000, items: [] },
  { ref: 'ILUMINACIÓN Y SERV. AUX', cn: 125786428, neg: 0, pend: 125786428, proy: 125786428, items: [
    { cap: 'Suministro luminarias', prov: 'Por definir', neg: 0, pend: 78391238 },
    { cap: 'Suministro aparatos', prov: 'Por definir', neg: 0, pend: 47395190 },
  ]},
  { ref: 'COMPENSACIÓN REACTIVA', cn: 751864128, neg: 0, pend: 751864128, proy: 751864128, items: [] },
  { ref: 'DETECCIÓN INCENDIOS', cn: 227943849, neg: 0, pend: 227943849, proy: 227943849, items: [
    { cap: 'Suministro equipos detección', prov: 'Por definir', neg: 0, pend: 158943849 },
    { cap: 'Suministro equipos extinción', prov: 'Por definir', neg: 0, pend: 69000000 },
  ]},
  { ref: 'CIVIL', cn: 3559740499, neg: 1978798738, pend: 1381964900, proy: 3360763638, items: [
    { cap: 'Perforación horizontal dirigida', prov: 'IDC', neg: 346565751, pend: 0 },
    { cap: 'Cajas inspección, canalizaciones, obras civiles', prov: 'R2F', neg: 1480003648, pend: 0 },
    { cap: 'Cimentaciones estructura', prov: 'Por definir', neg: 0, pend: 1345000000 },
    { cap: 'Cárcamo Mtto', prov: 'Por definir', neg: 0, pend: 36964900 },
    { cap: 'Pintura Pavimento', prov: 'P&C Pinturas', neg: 152229339, pend: 0 },
  ]},
  { ref: 'ESTRUCTURA', cn: 2978141027, neg: 2042797983, pend: 932042262, proy: 2974840245, items: [
    { cap: 'Estructura liviana', prov: 'Taesmet', neg: 2042797983, pend: 0 },
    { cap: 'Cubierta', prov: 'Building Panel Sol.', neg: 0, pend: 502042262 },
    { cap: 'Mecanismo rotación brazo', prov: 'Por definir', neg: 0, pend: 430000000 },
  ]},
  { ref: 'TRÁMITES', cn: 186229084, neg: 13605060, pend: 172624024, proy: 186229084, items: [
    { cap: 'PMT', prov: 'Transiobras', neg: 4500000, pend: 0 },
    { cap: 'Trámite licencia excavación', prov: 'Transiobras', neg: 2000000, pend: 0 },
    { cap: 'Retie', prov: 'Por definir', neg: 0, pend: 172624024 },
    { cap: 'Evento Primera Piedra', prov: '', neg: 7105060, pend: 0 },
  ]},
  { ref: 'MANO DE OBRA PROYECTADA', cn: 0, neg: 58299339, pend: 1198209318, proy: 1256508657, items: [] },
];

// Structure totals
const totalCasoNegocio = 24274282134;
const totalNegociado = 13159418623;
const totalPendiente = 7396537122;
const totalProyectado = 20555955744;
const ahorroCompra = totalCasoNegocio - totalProyectado; // 3,718M savings

// AIU breakdown
const financiacion = 3077349397;
const totalOferta = 41012884481;
const totalCostoSinFin = 28082164388;
const totalCostoFinal = 29457164387;
const totalAdministracion = 2444728897;


export default function BusinessCasePage() {
  const { projectId: _projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'presupuesto';

  // ── Estado editable Costo vs Venta ──
  const [cvValues, setCVValues] = useState<RowValues>(loadCVValues);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showAdmModal, setShowAdmModal] = useState(false);
  const [costoFilter, setCostoFilter] = useState<'todo' | 'negociado' | 'pendiente'>('todo');
  const [expandedCaps, setExpandedCaps] = useState<Set<string>>(new Set());
  const toggleCap = (ref: string) => setExpandedCaps(prev => { const n = new Set(prev); n.has(ref) ? n.delete(ref) : n.add(ref); return n; });
  const toggleGroup = (id: string) => setCollapsedGroups(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // Calcular EAC dinámico desde los valores editables y sincronizar con Dashboard
  const eacCasoNegocio = useMemo(() => {
    const allItems = GRUPOS_CV.flatMap(g => g.items);
    const C = (id: string) => cvValues[id]?.costo ?? (allItems.find(i => i.id === id)?.costo ?? EXTRA_ITEMS.find(i => i.id === id)?.costo ?? 0);
    const cdPcC = allItems.reduce((s, it) => s + C(it.id), 0);
    const ivaCarC = C('iva-cargadores');
    const itsC = C('its');
    const cdTotC = cdPcC + ivaCarC + itsC;
    const admC = C('adm-11');
    const imprC = C('imprev-2');
    const subAIC = cdTotC + admC + imprC;
    const sinFinC = subAIC + C('ivau-19');
    const finC = C('financiacion');
    return { sinFin: sinFinC, conFin: sinFinC + finC };
  }, [cvValues]);

  // Persistir EAC en localStorage para que Dashboard lo lea
  useEffect(() => {
    localStorage.setItem(LS_EAC_KEY, JSON.stringify(eacCasoNegocio));
  }, [eacCasoNegocio]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(cvValues)); } catch { /* ignore */ }
  }, [cvValues]);

  const updateCV = (id: string, key: 'venta' | 'costo', raw: string) => {
    const num = parseFloat(raw.replace(/[^\d.-]/g, '')) || 0;
    setCVValues(prev => ({ ...prev, [id]: { ...prev[id], [key]: num } }));
  };

  const tabs = [
    { id: 'presupuesto',  label: 'Presupuesto',     icon: DollarSign },
    { id: 'caso-negocio', label: 'Caso de Negocio', icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">
            {activeTab === 'presupuesto' ? 'Presupuesto' : 'Caso de Negocio'}
          </h2>
          <p className="text-xs text-steel-400">
            {activeTab === 'presupuesto'
              ? 'Detalle de venta vs costo por capítulo — Patio de Operacion Sur'
              : 'Analisis financiero detallado — Patio de Operacion Sur | Fuente: Detallado caso de negocio'}
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton {...businessCaseHelp} />
          <button className="flex items-center gap-2 rounded-lg border border-steel-300 bg-white px-4 py-2 text-sm font-medium text-steel-600 hover:bg-steel-50 transition">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-steel-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-steel-500 hover:text-steel-700 hover:border-steel-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Presupuesto */}
      {activeTab === 'presupuesto' && <BudgetPageContent />}

      {/* Tab: Caso de Negocio */}
      {activeTab === 'caso-negocio' && <>

      {/* KPI Row 1 - Macro Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor Oferta */}
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Valor Oferta Total</p>
          <p className="text-lg font-bold text-primary-700 mt-1">{formatCOPDisplay(totalOferta)}</p>
          <p className="text-[10px] text-steel-400">Precio global fijo con financiación</p>
        </div>

        {/* Costo — sin y con financiación */}
        <div
          className="rounded-xl border border-steel-200 bg-white p-4 shadow-card cursor-pointer hover:brightness-95 transition"
          onClick={() => document.getElementById('tabla-gestion-compra')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Costo Total "Caso de Negocio"</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-steel-400">Sin financiación</span>
              <span className="text-sm font-bold text-steel-700">{formatCOPDisplay(totalCostoSinFin)}</span>
            </div>
            <div className="h-px bg-steel-100" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-steel-400">Con financiación</span>
              <span className="text-sm font-black text-steel-900">{formatCOPDisplay(totalCostoFinal)}</span>
            </div>
          </div>
          <p className="text-[10px] text-steel-300 mt-2">Toca para ver Gestión de Compra →</p>
        </div>

        {/* Margen Bruto */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Margen Bruto</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCOPDisplay(totalOferta - totalCostoFinal)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">28.2% de rentabilidad</p>
        </div>

        {/* Administración — abre modal */}
        <div
          className="rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-card cursor-pointer hover:brightness-95 transition"
          onClick={() => setShowAdmModal(true)}
        >
          <p className="text-[10px] text-violet-500 uppercase tracking-wide font-medium">Administración</p>
          <p className="text-lg font-bold text-violet-700 mt-1">{formatCOPDisplay(totalAdministracion)}</p>
          <p className="text-[10px] text-violet-400 mt-0.5">Toca para ver el detalle →</p>
        </div>
      </div>

      {/* Modal Detalle Administración */}
      {showAdmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAdmModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-steel-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-steel-800">Discriminación de los Costos de Administración</h3>
                  <p className="text-[11px] text-steel-400 mt-0.5">Fuente: Detallado caso de negocio — Admon Patios · Duración: 12 meses</p>
                </div>
                <button onClick={() => setShowAdmModal(false)}
                  className="text-steel-400 hover:text-steel-700 transition text-xl font-bold leading-none ml-4">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2">
                  <p className="text-[9px] text-violet-500 uppercase font-semibold">Total Administración</p>
                  <p className="text-sm font-black text-violet-700">{formatCOPDisplay(totalAdministracion)}</p>
                </div>
                <div className="rounded-lg bg-steel-50 border border-steel-100 px-3 py-2">
                  <p className="text-[9px] text-steel-400 uppercase font-semibold">Costo Directo</p>
                  <p className="text-sm font-bold text-steel-700">{formatCOPDisplay(32203423966)}</p>
                </div>
                <div className="rounded-lg bg-steel-50 border border-steel-100 px-3 py-2">
                  <p className="text-[9px] text-steel-400 uppercase font-semibold">Relación CI/CD</p>
                  <p className="text-sm font-bold text-steel-700">7.59%</p>
                </div>
                <div className="rounded-lg bg-steel-50 border border-steel-100 px-3 py-2">
                  <p className="text-[9px] text-steel-400 uppercase font-semibold">AIU Calculado</p>
                  <p className="text-sm font-bold text-steel-700">17%</p>
                </div>
              </div>
            </div>
            {/* Table body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-violet-900 text-white">
                    <th className="px-3 py-2 text-left font-semibold w-[8%]">Item</th>
                    <th className="px-3 py-2 text-left font-semibold w-[42%]">Descripción</th>
                    <th className="px-3 py-2 text-center font-semibold w-[10%]">Unidad</th>
                    <th className="px-3 py-2 text-center font-semibold w-[8%]">Cant.</th>
                    <th className="px-3 py-2 text-right font-semibold w-[16%]">Vr. Unitario</th>
                    <th className="px-3 py-2 text-right font-semibold w-[16%]">Vr. Parcial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100">
                  {/* ── 1. PRESENTACIÓN DE OFERTA ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">1.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>COSTO DE PRESENTACIÓN DE LA OFERTA</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(23662693)}</td>
                  </tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">1.1</td><td className="px-3 py-1.5 text-steel-700">Costo de elaboración de la oferta</td><td className="px-3 py-1.5 text-center text-steel-400">Sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(494700)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(494700)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">1.2</td><td className="px-3 py-1.5 text-steel-700">Garantía de Seriedad de la oferta</td><td className="px-3 py-1.5 text-center text-steel-400">Sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(23167993)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(23167993)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">1.3</td><td className="px-3 py-1.5 text-steel-700">Papelería</td><td className="px-3 py-1.5 text-center text-steel-400">Sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">—</td><td className="px-3 py-1.5 text-right font-semibold text-steel-300">—</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">1.4</td><td className="px-3 py-1.5 text-steel-700">Envío</td><td className="px-3 py-1.5 text-center text-steel-400">Sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">—</td><td className="px-3 py-1.5 text-right font-semibold text-steel-300">—</td></tr>

                  {/* ── 2. PÓLIZAS ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">2.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>PÓLIZAS</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(296582052)}</td>
                  </tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.1</td><td className="px-3 py-1.5 text-steel-700">Póliza de Garantía de Cumplimiento</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(13329530)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(13329530)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.2</td><td className="px-3 py-1.5 text-steel-700">Póliza de Garantía del Anticipo</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(15233749)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(15233749)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.3</td><td className="px-3 py-1.5 text-steel-700">Póliza de pago de salarios</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(46177302)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(46177302)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.4</td><td className="px-3 py-1.5 text-steel-700">Póliza calidad de los bienes</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(69186610)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(69186610)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.6</td><td className="px-3 py-1.5 text-steel-700">Póliza calidad y correcto funcionamiento</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(69186610)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(69186610)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.8</td><td className="px-3 py-1.5 text-steel-700">Póliza estabilidad de obra</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(69186610)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(69186610)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">2.9</td><td className="px-3 py-1.5 text-steel-700">Póliza de RC PLO</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(14281640)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(14281640)}</td></tr>

                  {/* ── 3. PERSONAL DE OBRA ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">3.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>PERSONAL DE OBRA</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(1337888838)}</td>
                  </tr>
                  {/* 3.1 Salarios */}
                  <tr className="bg-steel-50"><td className="px-3 py-1.5 text-steel-500 font-semibold">3.1</td><td className="px-3 py-1.5 text-steel-600 font-semibold" colSpan={3}>Personal (Salarios + Prestaciones)</td><td /><td className="px-3 py-1.5 text-right font-semibold text-steel-600">{formatCOPDisplay(1327988838)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.1</td><td className="px-3 py-1.5 text-steel-700">Coordinador de obra</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(22950000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(275400000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.2</td><td className="px-3 py-1.5 text-steel-700">Director de obra (×4)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">4</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(11615535)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(557545670)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.3</td><td className="px-3 py-1.5 text-steel-700">Residente (×2)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">2</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(7004144)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(168099451)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.4</td><td className="px-3 py-1.5 text-steel-700">Residente Administrativo</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(6962724)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(83552688)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.5</td><td className="px-3 py-1.5 text-steel-700">Supervisor (×2)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">2</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(3603150)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(86475600)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.6</td><td className="px-3 py-1.5 text-steel-700">Seguridad Industrial</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(3615918)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(43391014)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.7</td><td className="px-3 py-1.5 text-steel-700">Almacenista</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(2648956)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(31787476)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.8</td><td className="px-3 py-1.5 text-steel-700">Auxiliar Almacén</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(2596353)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(31156241)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">3.1.9</td><td className="px-3 py-1.5 text-steel-700">BIM Manager</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(4215058)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(50580698)}</td></tr>
                  {/* 3.5 Otros */}
                  <tr className="bg-steel-50"><td className="px-3 py-1.5 text-steel-500 font-semibold">3.5</td><td className="px-3 py-1.5 text-steel-600 font-semibold" colSpan={3}>Otros (Hidratación)</td><td /><td className="px-3 py-1.5 text-right font-semibold text-steel-600">{formatCOPDisplay(9900000)}</td></tr>

                  {/* ── 4. EQUIPOS ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">4.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>EQUIPOS</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(277213880)}</td>
                  </tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.2</td><td className="px-3 py-1.5 text-steel-700">Andamios colgantes</td><td className="px-3 py-1.5 text-center text-steel-400">día</td><td className="px-3 py-1.5 text-center">360</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(95000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(34200000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.3</td><td className="px-3 py-1.5 text-steel-700">Andamios tubulares</td><td className="px-3 py-1.5 text-center text-steel-400">mes</td><td className="px-3 py-1.5 text-center">12</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(2550000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(30600000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.5</td><td className="px-3 py-1.5 text-steel-700">Taladro lámina (×44.5)</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">44.5</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(528360)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(23512020)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.6</td><td className="px-3 py-1.5 text-steel-700">Escaleras 4-7 peldaños</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">44.5</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(327250)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(14562625)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.7</td><td className="px-3 py-1.5 text-steel-700">Escaleras 8-12 peldaños</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">44.5</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(755650)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(33626425)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.8</td><td className="px-3 py-1.5 text-steel-700">Montacarga</td><td className="px-3 py-1.5 text-center text-steel-400">hora</td><td className="px-3 py-1.5 text-center">180</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(150000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(27000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.9</td><td className="px-3 py-1.5 text-steel-700">Estibadora</td><td className="px-3 py-1.5 text-center text-steel-400">día</td><td className="px-3 py-1.5 text-center">200</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(25000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(5000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.10</td><td className="px-3 py-1.5 text-steel-700">Elevador</td><td className="px-3 py-1.5 text-center text-steel-400">día</td><td className="px-3 py-1.5 text-center">360</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(300000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(108000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">4.4</td><td className="px-3 py-1.5 text-steel-700">Taladro percutor</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(712810)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(712810)}</td></tr>

                  {/* ── 5. SALUD OCUPACIONAL / SST ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">5.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>COSTOS DE SALUD OCUPACIONAL (SST)</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(84668214)}</td>
                  </tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">5.1</td><td className="px-3 py-1.5 text-steel-700">Exámenes médicos de ingreso</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">33</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(129948)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(4288284)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">5.2</td><td className="px-3 py-1.5 text-steel-700">Exámenes médicos de retiro</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">33</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(41650)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(1374450)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">5.3</td><td className="px-3 py-1.5 text-steel-700">Certificación trabajos en altura</td><td className="px-3 py-1.5 text-center text-steel-400">un</td><td className="px-3 py-1.5 text-center">20</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(339150)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(6783000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">5.4–5.21</td><td className="px-3 py-1.5 text-steel-700">EPP, dotación, botiquín y señalización</td><td className="px-3 py-1.5 text-center text-steel-400">vr</td><td className="px-3 py-1.5 text-center">—</td><td className="px-3 py-1.5 text-right text-steel-500">—</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(72222480)}</td></tr>

                  {/* ── 6. OTROS COSTOS GENERALES ── */}
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td className="px-3 py-2 font-black text-violet-700">6.</td>
                    <td className="px-3 py-2 font-black text-violet-700" colSpan={3}>OTROS COSTOS GENERALES</td>
                    <td />
                    <td className="px-3 py-2 text-right font-bold text-violet-700">{formatCOPDisplay(424713220)}</td>
                  </tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.1</td><td className="px-3 py-1.5 text-steel-700">Montaje y desmonte campamentos</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(1000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(1000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.2</td><td className="px-3 py-1.5 text-steel-700">Dotación de oficinas y campamentos</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(10000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(10000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.3</td><td className="px-3 py-1.5 text-steel-700">Construcción y desmontaje almacén</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(10000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(10000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.4</td><td className="px-3 py-1.5 text-steel-700">Vigilancia almacén obra (×5)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">5</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(2500000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(150000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.5</td><td className="px-3 py-1.5 text-steel-700">Servicios públicos (agua, energía, internet)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">14</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(50000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(8400000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.6–6.7</td><td className="px-3 py-1.5 text-steel-700">Baños portátiles (alquiler + mantenimiento)</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">—</td><td className="px-3 py-1.5 text-right text-steel-500">—</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(11112220)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.8</td><td className="px-3 py-1.5 text-steel-700">Alquiler de contenedores (×6)</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">6</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(1800000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(129600000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.9</td><td className="px-3 py-1.5 text-steel-700">Transporte del contenedor</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">6</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(1563000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(9378000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.11</td><td className="px-3 py-1.5 text-steel-700">Caja menor</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(1000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(12000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.12</td><td className="px-3 py-1.5 text-steel-700">Equipo de cómputo (×2)</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">2</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(15000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(30000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.14</td><td className="px-3 py-1.5 text-steel-700">Equipo REVIT</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(6000000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(6000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.16</td><td className="px-3 py-1.5 text-steel-700">Licencias Software Revit</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(7973000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(7973000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.18</td><td className="px-3 py-1.5 text-steel-700">Logística, envíos de paquetes</td><td className="px-3 py-1.5 text-center text-steel-400">12m</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(2500000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(30000000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.19–6.21</td><td className="px-3 py-1.5 text-steel-700">Aseo, certificaciones, planos as-built</td><td className="px-3 py-1.5 text-center text-steel-400">vr</td><td className="px-3 py-1.5 text-center">—</td><td className="px-3 py-1.5 text-right text-steel-500">—</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(8500000)}</td></tr>
                  <tr className="hover:bg-steel-50/50"><td className="px-3 py-1.5 text-steel-400">6.13</td><td className="px-3 py-1.5 text-steel-700">Impresora</td><td className="px-3 py-1.5 text-center text-steel-400">sg</td><td className="px-3 py-1.5 text-center">1</td><td className="px-3 py-1.5 text-right text-steel-500">{formatCOPDisplay(750000)}</td><td className="px-3 py-1.5 text-right font-semibold">{formatCOPDisplay(750000)}</td></tr>

                  {/* ── TOTAL COSTOS INDIRECTOS ── */}
                  <tr className="bg-violet-900 text-white border-t-2 border-violet-700">
                    <td className="px-3 py-2.5 font-black" colSpan={4}>TOTAL COSTOS INDIRECTOS</td>
                    <td />
                    <td className="px-3 py-2.5 text-right font-black">{formatCOPDisplay(totalAdministracion)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ── Gráfica Estructura General ── */}
      <ChapterBreakdownChart />

      {/* Tabla Costo vs Venta — agrupada, editable, persistente */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-steel-800">Costo vs Venta</h3>
            <p className="text-[11px] text-steel-400 mt-0.5">Valores editables — los cambios se guardan automáticamente</p>
          </div>
          <button
            onClick={() => { if (window.confirm('¿Restaurar valores originales?')) { const d: RowValues = {}; GRUPOS_CV.forEach(g => g.items.forEach(i => { d[i.id] = { venta: i.venta, costo: i.costo }; })); EXTRA_ITEMS.forEach(i => { d[i.id] = { venta: i.venta, costo: i.costo }; }); setCVValues(d); } }}
            className="text-[11px] text-steel-400 hover:text-red-500 transition border border-steel-200 rounded-lg px-3 py-1.5"
          >Restaurar originales</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs w-[34%]">Capítulo</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[22%]">Venta (Oferta)</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[22%]">Costo</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[14%]">Diferencia</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[8%]">Margen %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {(() => {
                // ── helpers to get current value from state ──
                const allItems = GRUPOS_CV.flatMap(g => g.items);
                const V = (id: string) => cvValues[id]?.venta ?? (allItems.find(i => i.id === id)?.venta ?? EXTRA_ITEMS.find(i => i.id === id)?.venta ?? 0);
                const C = (id: string) => cvValues[id]?.costo ?? (allItems.find(i => i.id === id)?.costo ?? EXTRA_ITEMS.find(i => i.id === id)?.costo ?? 0);
                const gv = (id: string) => GRUPOS_CV.find(g => g.id === id)!.items.reduce((s, it) => s + V(it.id), 0);
                const gc = (id: string) => GRUPOS_CV.find(g => g.id === id)!.items.reduce((s, it) => s + C(it.id), 0);

                // ── chapter-level (COSTO DIRECTO PC) ──
                const cdPcV = allItems.reduce((s, it) => s + V(it.id), 0);
                const cdPcC = allItems.reduce((s, it) => s + C(it.id), 0);

                // ── extra items ──
                const ivaCarV = V('iva-cargadores'), ivaCarC = C('iva-cargadores');
                const itsV    = V('its'),             itsC    = C('its');
                const finV    = V('financiacion'),    finC    = C('financiacion');

                // ── AIU chain ──
                const cdTotV = cdPcV + ivaCarV + itsV;
                const cdTotC = cdPcC + ivaCarC + itsC;
                const admV   = V('adm-11'),   admC  = C('adm-11');
                const imprV  = V('imprev-2'), imprC = C('imprev-2');
                const subAIV = cdTotV + admV + imprV;
                const subAIC = cdTotC + admC + imprC;
                const utilV  = V('utilidad-4');
                const ivaUV  = V('ivau-19');

                // ── group totals ──
                const sumV_s = gv('suministro'), sumC_s = gc('suministro');
                const sumV_m = gv('mano-obra'),  sumC_m = gc('mano-obra');
                const tramV  = V('tramites'),    tramC  = C('tramites');
                const compV  = V('comp-reactiva'), compC = C('comp-reactiva');

                // TOTAL SIN FINANCIACIÓN
                const sinFinV = subAIV + utilV + ivaUV;
                const sinFinC = subAIC + C('ivau-19'); // IVA-U aplica igual en ambos lados

                // TOTAL CON FINANCIACIÓN
                const totalV = sinFinV + finV;
                const totalC = sinFinC + finC;

                // ── render helpers ──
                const inp = (id: string, key: 'venta' | 'costo', val: number, tip: string) => {
                  const fkId = id + (key === 'venta' ? '-v' : '-c');
                  return (
                    <input title={tip} type="text"
                      className="w-full text-right text-xs bg-transparent border-b border-dashed border-steel-200 focus:border-primary-400 focus:outline-none py-1 px-1 text-steel-600 focus:text-steel-900"
                      value={focusedCell === fkId ? String(val) : formatCOPDisplay(val)}
                      onFocus={e => { setFocusedCell(fkId); e.target.select(); }}
                      onBlur={() => setFocusedCell(null)}
                      onChange={e => updateCV(id, key, e.target.value)}
                    />
                  );
                };

                const chapRow = (item: { id: string; cap: string }, v: number, c: number) => {
                  const dif = v - c, mgn = v > 0 ? dif / v * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-steel-50/50 transition">
                      <td className="px-4 py-2 pl-8 text-xs text-steel-700">{item.cap}</td>
                      <td className="px-2 py-1">{inp(item.id, 'venta', v, 'Valor de venta — editable')}</td>
                      <td className="px-2 py-1">{inp(item.id, 'costo', c, 'Valor de costo — editable')}</td>
                      <td className={`px-4 py-2 text-right text-xs font-bold ${dif >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                        title={`Diferencia = ${formatCOPDisplay(v)} − ${formatCOPDisplay(c)}`}>{formatCOPDisplay(dif)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`text-xs font-bold ${mgn < 0 ? 'text-red-600' : mgn < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{mgn.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                };

                const extraRow = (id: string, label: string, v: number, c: number) => {
                  const dif = v - c, mgn = v > 0 ? dif / v * 100 : 0;
                  return (
                    <tr key={id} className="hover:bg-steel-50/50 transition">
                      <td className="px-4 py-2 pl-8 text-xs text-steel-700">{label}</td>
                      <td className="px-2 py-1">{inp(id, 'venta', v, `${label} — editable`)}</td>
                      <td className="px-2 py-1">{inp(id, 'costo', c, `${label} costo — editable`)}</td>
                      <td className={`px-4 py-2 text-right text-xs font-bold ${dif >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                        title={`Diferencia = ${formatCOPDisplay(dif)}`}>{formatCOPDisplay(dif)}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={`text-xs font-bold ${mgn < 0 ? 'text-red-600' : mgn < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{mgn.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                };

                const grpHdr = (grpId: string, nombre: string, color: string, gV: number, gC: number, tip: string) => {
                  const dif = gV - gC, mgn = gV > 0 ? dif / gV * 100 : 0;
                  const collapsed = collapsedGroups.has(grpId);
                  return (
                    <tr className="border-t-2 cursor-pointer select-none" style={{ borderColor: color + '40', backgroundColor: color + '15' }}
                      onClick={() => toggleGroup(grpId)}>
                      <td className="px-4 py-2.5 text-xs font-black" style={{ color }} title={tip}>
                        <span className="inline-flex items-center gap-1.5">
                          {collapsed
                            ? <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                            : <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />}
                          {nombre}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-steel-700">{formatCOPDisplay(gV)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-steel-700">{formatCOPDisplay(gC)}</td>
                      <td className={`px-4 py-2.5 text-right text-xs font-bold ${dif >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCOPDisplay(dif)}</td>
                      <td className={`px-4 py-2.5 text-right text-xs font-bold ${mgn < 0 ? 'text-red-600' : mgn < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{mgn.toFixed(1)}%</td>
                    </tr>
                  );
                };

                const subtotRow = (label: string, v: number, c: number, tipV: string, tipC: string, cls = 'bg-steel-700 text-white') => {
                  const dif = v - c, mgn = v > 0 ? dif / v * 100 : 0;
                  return (
                    <tr className={`${cls} border-t border-opacity-30`}>
                      <td className="px-4 py-2.5 text-xs font-black">{label}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-black" title={tipV}>{formatCOPDisplay(v)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-black" title={tipC}>{formatCOPDisplay(c)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-black" style={{ color: dif >= 0 ? '#6ee7b7' : '#fca5a5' }}>{formatCOPDisplay(dif)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-black" style={{ color: mgn >= 0 ? '#6ee7b7' : '#fca5a5' }}>{mgn.toFixed(1)}%</td>
                    </tr>
                  );
                };

                const suministroGrupo = GRUPOS_CV.find(g => g.id === 'suministro')!;
                const manoObraGrupo   = GRUPOS_CV.find(g => g.id === 'mano-obra')!;
                const admGrupo        = GRUPOS_CV.find(g => g.id === 'administracion')!;
                const interesesGrupo  = GRUPOS_CV.find(g => g.id === 'intereses')!;

                return (
                  <>
                    {/* ── SUMINISTRO ── */}
                    {grpHdr('suministro', 'Suministro', '#1b5eab', sumV_s, sumC_s,
                      `= ${suministroGrupo.items.map(i => i.cap).join(' + ')}\n= ${formatCOPDisplay(sumV_s)}`)}
                    {!collapsedGroups.has('suministro') && suministroGrupo.items.map(item => chapRow(item, V(item.id), C(item.id)))}

                    {/* ── MANO DE OBRA ── */}
                    {grpHdr('mano-obra', 'Mano de Obra', '#16a34a', sumV_m, sumC_m,
                      `= ${manoObraGrupo.items.map(i => i.cap).join(' + ')}\n= ${formatCOPDisplay(sumV_m)}`)}
                    {!collapsedGroups.has('mano-obra') && manoObraGrupo.items.map(item => chapRow(item, V(item.id), C(item.id)))}

                    {/* Trámites y Certificaciones — capítulo independiente */}
                    {chapRow(admGrupo.items[0], tramV, tramC)}

                    {/* Compensación Reactiva — capítulo independiente */}
                    {chapRow(interesesGrupo.items[0], compV, compC)}

                    {/* ── COSTO DIRECTO PC ── */}
                    {subtotRow('COSTO DIRECTO PC', cdPcV, cdPcC,
                      `= Suministro + Mano de Obra + Trámites + Comp. Reactiva\n= ${formatCOPDisplay(sumV_s)} + ${formatCOPDisplay(sumV_m)} + ${formatCOPDisplay(tramV)} + ${formatCOPDisplay(compV)}\n= ${formatCOPDisplay(cdPcV)}`,
                      `= ${formatCOPDisplay(sumC_s)} + ${formatCOPDisplay(sumC_m)} + ${formatCOPDisplay(tramC)} + ${formatCOPDisplay(compC)}\n= ${formatCOPDisplay(cdPcC)}`)}

                    {/* IVA Cargadores — editable */}
                    {extraRow('iva-cargadores', 'IVA Cargadores', ivaCarV, ivaCarC)}

                    {/* ITS — editable */}
                    {extraRow('its', 'ITS', itsV, itsC)}

                    {/* ── COSTO DIRECTO TOTAL ── */}
                    {subtotRow('COSTO DIRECTO TOTAL', cdTotV, cdTotC,
                      `= COSTO DIRECTO PC + IVA Cargadores + ITS\n= ${formatCOPDisplay(cdPcV)} + ${formatCOPDisplay(ivaCarV)} + ${formatCOPDisplay(itsV)}\n= ${formatCOPDisplay(cdTotV)}`,
                      `= ${formatCOPDisplay(cdPcC)} + ${formatCOPDisplay(ivaCarC)} + ${formatCOPDisplay(itsC)}\n= ${formatCOPDisplay(cdTotC)}`)}

                    {/* Administración 11% — editable */}
                    {extraRow('adm-11', 'Administración (11%)', admV, admC)}

                    {/* Imprevistos 2% — editable */}
                    {extraRow('imprev-2', 'Imprevistos (2%)', imprV, imprC)}

                    {/* ── TOTAL CD + ADM + IMPREV ── */}
                    {subtotRow('TOTAL CD + ADM + IMPREV', subAIV, subAIC,
                      `= COSTO DIRECTO TOTAL + Adm 11% + Imprev 2%\n= ${formatCOPDisplay(cdTotV)} + ${formatCOPDisplay(admV)} + ${formatCOPDisplay(imprV)}\n= ${formatCOPDisplay(subAIV)}`,
                      `= ${formatCOPDisplay(cdTotC)} + ${formatCOPDisplay(admC)} + ${formatCOPDisplay(imprC)}\n= ${formatCOPDisplay(subAIC)}`)}

                    {/* Utilidad 4% — editable */}
                    {extraRow('utilidad-4', 'Utilidad (4%)', utilV, 0)}

                    {/* IVA sobre Utilidad 19% — editable */}
                    {extraRow('ivau-19', 'IVA sobre Utilidad (19%)', ivaUV, V('ivau-19'))}

                    {/* ── TOTAL SIN FINANCIACIÓN ── */}
                    {subtotRow('TOTAL SIN FINANCIACIÓN', sinFinV, sinFinC,
                      `= TOTAL CD+ADM+IMPREV + Utilidad + IVA-U\n= ${formatCOPDisplay(subAIV)} + ${formatCOPDisplay(utilV)} + ${formatCOPDisplay(ivaUV)}\n= ${formatCOPDisplay(sinFinV)}`,
                      `= ${formatCOPDisplay(subAIC)} + IVA-U ${formatCOPDisplay(ivaUV)}\n= ${formatCOPDisplay(sinFinC)}`)}

                    {/* Financiación 9 meses — editable */}
                    {extraRow('financiacion', 'Financiación 9 meses', finV, finC)}

                    {/* ── TOTAL CON FINANCIACIÓN ── */}
                    <tr className="bg-primary-900 text-white border-t-2 border-primary-700">
                      <td className="px-4 py-3 text-xs font-black"
                        title={`= TOTAL SIN FINANCIACIÓN + Financiación\n= ${formatCOPDisplay(sinFinV)} + ${formatCOPDisplay(finV)}\n= ${formatCOPDisplay(totalV)}`}>
                        TOTAL CON FINANCIACIÓN
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-black"
                        title={`Total Venta = ${formatCOPDisplay(totalV)}`}>{formatCOPDisplay(totalV)}</td>
                      <td className="px-4 py-3 text-right text-xs font-black"
                        title={`Total Costo = ${formatCOPDisplay(totalC)}`}>{formatCOPDisplay(totalC)}</td>
                      <td className="px-4 py-3 text-right text-xs font-black text-emerald-300"
                        title={`Diferencia = ${formatCOPDisplay(totalV)} − ${formatCOPDisplay(totalC)}`}>{formatCOPDisplay(totalV - totalC)}</td>
                      <td className="px-4 py-3 text-right text-xs font-black text-emerald-300"
                        title={`Margen = ${formatCOPDisplay(totalV - totalC)} ÷ ${formatCOPDisplay(totalV)} × 100`}>
                        {totalV > 0 ? ((totalV - totalC) / totalV * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de Costo */}
      <div id="tabla-gestion-compra" className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-steel-800">Detalle de Costo</h3>
            <p className="text-xs text-steel-400 mt-0.5">Gestión de compra vs presupuesto caso de negocio · Fuente: Excel Detallado</p>
          </div>
          <div className="flex items-center gap-1 bg-steel-100 rounded-lg p-0.5">
            {([['todo', 'Todo'], ['negociado', 'Negociado'], ['pendiente', 'Pendiente']] as const).map(([key, label]) => (
              <button key={key}
                onClick={() => setCostoFilter(key)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition ${costoFilter === key ? 'bg-white text-primary-700 shadow-sm' : 'text-steel-500 hover:text-steel-700'}`}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs w-[28%]">Referencia</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[16%]">Caso de Negocio</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[16%]">Negociado</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[16%]">Pendiente</th>
                <th className="px-4 py-3 text-right font-semibold text-xs w-[16%]">Total Proyectado</th>
                <th className="px-4 py-3 text-center font-semibold text-xs w-[8%]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {detalleCosto
                .filter(ch => costoFilter === 'todo' || (costoFilter === 'negociado' ? ch.neg > 0 : ch.pend > 0))
                .map(ch => {
                  const hasItems = ch.items.length > 0;
                  const expanded = expandedCaps.has(ch.ref);
                  const pctNeg = ch.cn > 0 ? ch.neg / ch.cn * 100 : 0;
                  const ahorro = ch.cn - ch.proy;
                  return (
                    <React.Fragment key={ch.ref}>
                      <tr className={`hover:bg-steel-50/50 transition ${hasItems ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => hasItems && toggleCap(ch.ref)}>
                        <td className="px-4 py-2.5 text-xs font-bold text-steel-800">
                          <span className="inline-flex items-center gap-1.5">
                            {hasItems && (expanded
                              ? <ChevronDown className="h-3 w-3 text-steel-400 flex-shrink-0" />
                              : <ChevronRight className="h-3 w-3 text-steel-400 flex-shrink-0" />)}
                            {ch.ref}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-steel-500">{ch.cn > 0 ? formatCOPDisplay(ch.cn) : '—'}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600">{ch.neg > 0 ? formatCOPDisplay(ch.neg) : '—'}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-amber-600">{ch.pend > 0 ? formatCOPDisplay(ch.pend) : '—'}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold"
                          title={ahorro > 0 ? `Ahorro: ${formatCOPDisplay(ahorro)}` : ''}
                          style={{ color: ahorro > 0 ? '#059669' : ahorro < 0 ? '#dc2626' : '#374151' }}>
                          {formatCOPDisplay(ch.proy)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {pctNeg >= 80
                            ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-200">Cerrado</span>
                            : ch.neg > 0
                            ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-200">Parcial</span>
                            : <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 border border-red-200">Pendiente</span>}
                        </td>
                      </tr>
                      {expanded && ch.items
                        .filter(it => costoFilter === 'todo' || (costoFilter === 'negociado' ? it.neg > 0 : it.pend > 0))
                        .map((it, idx) => (
                        <tr key={`${ch.ref}-${idx}`} className="bg-steel-50/40 hover:bg-steel-50 transition">
                          <td className="px-4 py-1.5 pl-10 text-[11px] text-steel-600">{it.cap}</td>
                          <td className="px-4 py-1.5 text-right text-[11px] text-steel-400 italic">{it.prov || '—'}</td>
                          <td className="px-4 py-1.5 text-right text-[11px] text-emerald-600">{it.neg > 0 ? formatCOPDisplay(it.neg) : '—'}</td>
                          <td className="px-4 py-1.5 text-right text-[11px] text-amber-600">{it.pend > 0 ? formatCOPDisplay(it.pend) : '—'}</td>
                          <td />
                          <td />
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              {/* COSTO DIRECTO PC */}
              <tr className="bg-steel-700 text-white border-t-2">
                <td className="px-4 py-2.5 text-xs font-black">COSTO DIRECTO PC</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalCasoNegocio)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalNegociado)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalPendiente)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalProyectado)}</td>
                <td />
              </tr>
              {/* Formula rows */}
              <tr className="hover:bg-steel-50/50"><td className="px-4 py-2 pl-8 text-xs text-steel-500">IVA Cargadores</td><td /><td /><td className="px-4 py-2 text-right text-xs text-amber-600">{formatCOPDisplay(213379000)}</td><td className="px-4 py-2 text-right text-xs font-semibold">{formatCOPDisplay(213379000)}</td><td /></tr>
              <tr className="hover:bg-steel-50/50"><td className="px-4 py-2 pl-8 text-xs text-steel-500">ITS</td><td /><td /><td className="px-4 py-2 text-right text-xs text-amber-600">{formatCOPDisplay(345550400)}</td><td className="px-4 py-2 text-right text-xs font-semibold">{formatCOPDisplay(345550400)}</td><td /></tr>
              <tr className="bg-steel-700 text-white">
                <td className="px-4 py-2.5 text-xs font-black">COSTO DIRECTO TOTAL</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(24905170334)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalNegociado)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(7955466522)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(21114885144)}</td>
                <td />
              </tr>
              <tr className="bg-steel-50/70"><td className="px-4 py-2 pl-8 text-xs text-steel-500 italic">Administración (11%)</td><td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(totalAdministracion)}</td><td /><td className="px-4 py-2 text-right text-xs text-amber-600">{formatCOPDisplay(totalAdministracion)}</td><td className="px-4 py-2 text-right text-xs font-semibold">{formatCOPDisplay(totalAdministracion)}</td><td /></tr>
              <tr className="bg-steel-50/70"><td className="px-4 py-2 pl-8 text-xs text-steel-500 italic">Imprevistos (2%)</td><td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(485485643)}</td><td /><td className="px-4 py-2 text-right text-xs text-amber-600">{formatCOPDisplay(485485643)}</td><td className="px-4 py-2 text-right text-xs font-semibold">{formatCOPDisplay(485485643)}</td><td /></tr>
              <tr className="bg-steel-700 text-white">
                <td className="px-4 py-2.5 text-xs font-black">TOTAL CD + ADM + IMPREV</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(27835384874)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(totalNegociado)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(10885681062)}</td>
                <td className="px-4 py-2.5 text-right text-xs font-black">{formatCOPDisplay(24045099684)}</td>
                <td />
              </tr>
              <tr className="bg-steel-50/70"><td className="px-4 py-2 pl-8 text-xs text-steel-500 italic">IVA sobre Utilidad (19%)</td><td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(246779512)}</td><td /><td className="px-4 py-2 text-right text-xs text-amber-600">{formatCOPDisplay(246779512)}</td><td className="px-4 py-2 text-right text-xs font-semibold">{formatCOPDisplay(246779512)}</td><td /></tr>
              <tr className="bg-primary-900 text-white border-t-2 border-primary-700">
                <td className="px-4 py-3 text-xs font-black">TOTAL SIN FINANCIACIÓN</td>
                <td className="px-4 py-3 text-right text-xs font-black">{formatCOPDisplay(28082164387)}</td>
                <td className="px-4 py-3 text-right text-xs font-black">{formatCOPDisplay(totalNegociado)}</td>
                <td className="px-4 py-3 text-right text-xs font-black">{formatCOPDisplay(11132460574)}</td>
                <td className="px-4 py-3 text-right text-xs font-black">{formatCOPDisplay(24291879196)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-800">Compensacion Reactiva: Margen Negativo</p>
              <p className="text-[11px] text-red-700 mt-0.5">Costo ({formatCOPDisplay(751864128)}) supera venta ({formatCOPDisplay(547200000)}) por {formatCOPDisplay(204664128)}. Margen -37.4%. Revisar alcance y negociar con proveedor.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">30.5% del costo directo pendiente por negociar</p>
              <p className="text-[11px] text-amber-700 mt-0.5">{formatCOPDisplay(totalPendiente)} aun sin negociar. Capitulos criticos: Conexion Red, Comp. Reactiva, SPE/SPT, Comunicaciones, Iluminacion.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <div className="flex items-start gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">Ahorro en gestion de compra: {formatCOPDisplay(ahorroCompra)}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">El costo proyectado total es {(ahorroCompra / totalCasoNegocio * 100).toFixed(1)}% menor al caso de negocio original. Principales ahorros: Subestaciones, Transformadores, Redes MT.</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-primary-50 border border-primary-200 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary-800">Estructura AIU saludable</p>
              <p className="text-[11px] text-primary-700 mt-0.5">Administracion 11% + Imprevistos 2% + Utilidad 4% = 17% AIU. Financiacion de {formatCOPDisplay(financiacion)} para 9 meses (costo financiero: {formatCOPDisplay(1375000000)}).</p>
            </div>
          </div>
        </div>
      </div>

      </>}
    </div>
  );
}
