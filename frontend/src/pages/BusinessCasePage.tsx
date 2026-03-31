import { useParams } from 'react-router-dom';
import { Download, TrendingDown, AlertTriangle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import HelpButton from '@/components/common/HelpButton';

const businessCaseHelp = {
  pageTitle: 'Ayuda — Caso de Negocio',
  description:
    'Esta pagina presenta el analisis financiero detallado del proyecto basado en el archivo ' +
    '"Detallado caso de negocio_220126.xlsx". Muestra la estructura de costos vs venta, ' +
    'el estado de la gestion de compra y los indicadores de rentabilidad por capitulo.',
  pdfUrl: '/docs/Informe_CasoDeNegocio_Metricas.pdf',
  pdfName: 'Informe_CasoDeNegocio_Metricas.pdf',
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clsx from 'clsx';
import { formatCOP, formatCOPFull } from '@/utils/formatNumbers';

// Use full currency format for detailed business case display
const formatCOPDisplay = formatCOPFull;
// Use abbreviated M/B notation for charts
const formatB = formatCOP;

// ==================== REAL DATA FROM EXCEL ====================

// Costo vs Venta by chapter (from "Costo vs Venta" sheet)
const costoVsVenta = [
  { cap: 'Estudios y Diseños', venta: 419047180, costo: 312727205, margen: 25.4 },
  { cap: 'Conexión a la Red', venta: 519268407, costo: 369435063, margen: 28.9 },
  { cap: 'Redes MT (Celdas)', venta: 2893959054, costo: 2046582157, margen: 29.3 },
  { cap: 'Subestaciones (Shelter)', venta: 3406137000, costo: 2692179338, margen: 21.0 },
  { cap: 'Transformadores', venta: 2338037308, costo: 2115002279, margen: 9.5 },
  { cap: 'Baja Tensión (BT)', venta: 3856386116, costo: 2864635880, margen: 25.7 },
  { cap: 'SPE y SPT', venta: 262823529, costo: 257800000, margen: 1.9 },
  { cap: 'Comunicaciones', venta: 701469115, costo: 264839198, margen: 62.2 },
  { cap: 'Cargadores', venta: 6743603237, costo: 5330376000, margen: 21.0 },
  { cap: 'Instalación Cargadores', venta: 261567164, costo: 191000000, margen: 27.0 },
  { cap: 'Iluminación y Aux.', venta: 147984032, costo: 125786428, margen: 15.0 },
  { cap: 'Comp. Reactiva', venta: 547200000, costo: 751864128, margen: -37.4 },
  { cap: 'Detección Incendios', venta: 270082618, costo: 227943849, margen: 15.6 },
  { cap: 'Obras Civiles', venta: 8177142400, costo: 6537881527, margen: 20.0 },
  { cap: 'Trámites', venta: 679896358, costo: 186229084, margen: 72.6 },
];

// Procurement management (from "Ejecución vs Caso de Negocio" sheet)
const gestionCompra = [
  { cap: 'Estudios y Diseños', casoNegocio: 312727205, negociado: 252360920, pendiente: 60366285, ahorro: 0 },
  { cap: 'Conexión a la Red', casoNegocio: 369435063, negociado: 0, pendiente: 369435063, ahorro: 0 },
  { cap: 'Redes MT (Celdas)', casoNegocio: 2046582157, negociado: 1238615200, pendiente: 0, ahorro: 807966957 },
  { cap: 'Subestaciones (Shelter)', casoNegocio: 2692179338, negociado: 0, pendiente: 460221135, ahorro: 2231958203 },
  { cap: 'Transformadores', casoNegocio: 2115002279, negociado: 1211417000, pendiente: 0, ahorro: 903585279 },
  { cap: 'Baja Tensión (BT)', casoNegocio: 2864635880, negociado: 1988944382, pendiente: 721684532, ahorro: 154006966 },
  { cap: 'SPE y SPT', casoNegocio: 257800000, negociado: 0, pendiente: 257800000, ahorro: 0 },
  { cap: 'Comunicaciones', casoNegocio: 264839198, negociado: 0, pendiente: 264839198, ahorro: 0 },
  { cap: 'Cargadores', casoNegocio: 5330376000, negociado: 4374580000, pendiente: 280756000, ahorro: 675040000 },
  { cap: 'Instalación Cargadores', casoNegocio: 191000000, negociado: 0, pendiente: 191000000, ahorro: 0 },
  { cap: 'Iluminación y Aux.', casoNegocio: 125786428, negociado: 0, pendiente: 125786428, ahorro: 0 },
  { cap: 'Comp. Reactiva', casoNegocio: 751864128, negociado: 0, pendiente: 751864128, ahorro: 0 },
  { cap: 'Detección Incendios', casoNegocio: 227943849, negociado: 0, pendiente: 227943849, ahorro: 0 },
  { cap: 'Civil + Estructura', casoNegocio: 6537881527, negociado: 4021596721, pendiente: 2314007162, ahorro: 202278644 },
  { cap: 'Trámites', casoNegocio: 186229084, negociado: 13605060, pendiente: 172624024, ahorro: 0 },
];

// Structure totals
const totalCasoNegocio = 24274282134;
const totalNegociado = 13159418623;
const totalPendiente = 7396537122;
const totalProyectado = 20555955744;
const ahorroCompra = totalCasoNegocio - totalProyectado; // 3,718M savings

// AIU breakdown
const costoDirecto = 31224603518;
const administracion = 3734163668;   // 11%
const imprevistos = 649419768;       // 2%
const financiacion = 3077349397;
const totalOferta = 41012884481;
const totalCostoFinal = 29457164387;

// Pie chart data for cost structure
const costStructure = [
  { name: 'Costo Directo', value: 24274282134, color: '#1b5eab' },
  { name: 'IVA Cargadores', value: 247981000, color: '#4d8fd4' },
  { name: 'ITS', value: 382907200, color: '#7eade1' },
  { name: 'Administración (11%)', value: 2444728897, color: '#d97706' },
  { name: 'Imprevistos (2%)', value: 485485643, color: '#f59e0b' },
  { name: 'Financiación', value: 1375000000, color: '#8b8e96' },
];

// Pie for sale structure
const saleStructure = [
  { name: 'Costo Directo', value: 32006332599, color: '#1b5eab' },
  { name: 'Administración', value: 3734163668, color: '#d97706' },
  { name: 'Imprevistos', value: 649419768, color: '#f59e0b' },
  { name: 'Utilidad', value: 1298839537, color: '#16a34a' },
  { name: 'IVA Utilidad', value: 246779512, color: '#86efac' },
  { name: 'Financiación', value: 3077349397, color: '#8b8e96' },
];

// Chart data for top chapters comparison
const chartComparison = costoVsVenta
  .filter(c => c.costo > 500000000)
  .map(c => ({
    name: c.cap.length > 18 ? c.cap.substring(0, 18) + '...' : c.cap,
    Venta: c.venta,
    Costo: c.costo,
    Margen: c.venta - c.costo,
  }));

// Procurement chart
const procurementChart = gestionCompra
  .filter(g => g.casoNegocio > 200000000)
  .map(g => ({
    name: g.cap.length > 16 ? g.cap.substring(0, 16) + '...' : g.cap,
    'Caso de Negocio': g.casoNegocio,
    Negociado: g.negociado,
    Pendiente: g.pendiente,
  }));

export default function BusinessCasePage() {
  const { projectId: _projectId } = useParams();
  const pctNegociado = (totalNegociado / totalCasoNegocio * 100);
  const pctPendiente = (totalPendiente / totalCasoNegocio * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Caso de Negocio</h2>
          <p className="text-xs text-steel-400">
            Analisis financiero detallado — Patio de Operacion Sur | Fuente: Detallado caso de negocio
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton {...businessCaseHelp} />
          <button className="flex items-center gap-2 rounded-lg border border-steel-300 bg-white px-4 py-2 text-sm font-medium text-steel-600 hover:bg-steel-50 transition">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Row 1 - Macro Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Valor Oferta Total</p>
          <p className="text-lg font-bold text-primary-700 mt-1">{formatCOPDisplay(totalOferta)}</p>
          <p className="text-[10px] text-steel-400">Precio global fijo con financiación</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Costo Total Estimado</p>
          <p className="text-lg font-bold text-steel-800 mt-1">{formatCOPDisplay(totalCostoFinal)}</p>
          <p className="text-[10px] text-steel-400">Caso de negocio + AIU + financiación</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Margen Bruto</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCOPDisplay(totalOferta - totalCostoFinal)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">28.2% de rentabilidad</p>
        </div>
        <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Ahorro en Compras</p>
          <p className="text-lg font-bold text-primary-700 mt-1">{formatCOPDisplay(ahorroCompra)}</p>
          <p className="text-[10px] text-primary-600 font-semibold">{(ahorroCompra / totalCasoNegocio * 100).toFixed(1)}% vs caso de negocio</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Financiación (9 meses)</p>
          <p className="text-lg font-bold text-steel-800 mt-1">{formatCOPDisplay(financiacion)}</p>
          <p className="text-[10px] text-steel-400">Costo financiero: {formatCOPDisplay(1375000000)}</p>
        </div>
      </div>

      {/* KPI Row 2 - Procurement Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Costo Directo (Caso Negocio)</p>
          <p className="text-lg font-bold text-steel-800 mt-1">{formatCOPDisplay(totalCasoNegocio)}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Negociado</p>
          </div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCOPDisplay(totalNegociado)}</p>
          <div className="mt-1.5 h-1.5 bg-steel-100 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctNegociado}%` }} />
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{pctNegociado.toFixed(1)}% del CD</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Pendiente por Negociar</p>
          </div>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCOPDisplay(totalPendiente)}</p>
          <div className="mt-1.5 h-1.5 bg-steel-100 rounded-full">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pctPendiente}%` }} />
          </div>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{pctPendiente.toFixed(1)}% del CD</p>
        </div>
        <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 shadow-card">
          <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Costo Proyectado Total</p>
          <p className="text-lg font-bold text-primary-700 mt-1">{formatCOPDisplay(totalProyectado)}</p>
          <p className="text-[10px] text-primary-600 font-semibold">{formatCOPDisplay(ahorroCompra)} por debajo del caso</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cost vs Sale Chart */}
        <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
          <h3 className="text-base font-bold text-steel-800 mb-4">Venta vs Costo por Capitulo</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartComparison} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6e7179' }} angle={-35} textAnchor="end" height={80} />
              <YAxis tickFormatter={(v) => formatB(v)} tick={{ fontSize: 10, fill: '#6e7179' }} />
              <Tooltip formatter={(v: number) => formatCOPDisplay(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Venta" fill="#1b5eab" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Costo" fill="#8b8e96" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Procurement Status Chart */}
        <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
          <h3 className="text-base font-bold text-steel-800 mb-4">Gestion de Compra vs Caso de Negocio</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={procurementChart} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6e7179' }} angle={-35} textAnchor="end" height={80} />
              <YAxis tickFormatter={(v) => formatB(v)} tick={{ fontSize: 10, fill: '#6e7179' }} />
              <Tooltip formatter={(v: number) => formatCOPDisplay(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Caso de Negocio" fill="#b5b8be" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Negociado" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pendiente" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Structure Pies */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
          <h3 className="text-base font-bold text-steel-800 mb-4">Estructura de Costos</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={costStructure} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {costStructure.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCOPDisplay(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {costStructure.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-steel-600 flex-1">{item.name}</span>
                  <span className="font-bold text-steel-800">{formatCOPDisplay(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-steel-200 pt-1.5 flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5" />
                <span className="font-bold text-steel-800 flex-1">Total Costo</span>
                <span className="font-bold text-steel-900">{formatCOPDisplay(totalCostoFinal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
          <h3 className="text-base font-bold text-steel-800 mb-4">Estructura de Venta (Oferta)</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={saleStructure} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {saleStructure.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCOPDisplay(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {saleStructure.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-steel-600 flex-1">{item.name}</span>
                  <span className="font-bold text-steel-800">{formatCOPDisplay(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-steel-200 pt-1.5 flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5" />
                <span className="font-bold text-steel-800 flex-1">Total Oferta</span>
                <span className="font-bold text-primary-700">{formatCOPDisplay(totalOferta)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Costo vs Venta Table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-100">
          <h3 className="text-base font-bold text-steel-800">Detalle Costo vs Venta por Capitulo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs">Capitulo</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Venta (Oferta)</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Costo (Caso Negocio)</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Diferencia</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Margen %</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {costoVsVenta.map((item) => (
                <tr key={item.cap} className="hover:bg-steel-50/50 transition">
                  <td className="px-4 py-2.5 text-xs font-medium text-steel-800">{item.cap}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-steel-600">{formatCOPDisplay(item.venta)}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-steel-600">{formatCOPDisplay(item.costo)}</td>
                  <td className={clsx('px-4 py-2.5 text-right text-xs font-bold', item.venta - item.costo >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {formatCOPDisplay(item.venta - item.costo)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={clsx('text-xs font-bold', item.margen < 0 ? 'text-red-600' : item.margen < 10 ? 'text-amber-600' : 'text-emerald-600')}>
                      {item.margen.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {item.margen < 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 border border-red-200">
                        <AlertTriangle className="h-3 w-3" /> Perdida
                      </span>
                    ) : item.margen < 10 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" /> Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {/* Subtotals */}
              <tr className="bg-steel-50 font-bold border-t-2 border-steel-300">
                <td className="px-4 py-3 text-xs font-bold text-steel-900">COSTO DIRECTO</td>
                <td className="px-4 py-3 text-right text-xs font-bold">{formatCOPDisplay(costoDirecto)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold">{formatCOPDisplay(totalCasoNegocio)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">{formatCOPDisplay(costoDirecto - totalCasoNegocio)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">22.3%</td>
                <td />
              </tr>
              <tr className="bg-steel-50">
                <td className="px-4 py-2 text-xs text-steel-600">+ Administracion (11%)</td>
                <td className="px-4 py-2 text-right text-xs">{formatCOPDisplay(administracion)}</td>
                <td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(2444728897)}</td>
                <td colSpan={3} />
              </tr>
              <tr className="bg-steel-50">
                <td className="px-4 py-2 text-xs text-steel-600">+ Imprevistos (2%)</td>
                <td className="px-4 py-2 text-right text-xs">{formatCOPDisplay(imprevistos)}</td>
                <td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(485485643)}</td>
                <td colSpan={3} />
              </tr>
              <tr className="bg-steel-50">
                <td className="px-4 py-2 text-xs text-steel-600">+ Financiacion (9 meses)</td>
                <td className="px-4 py-2 text-right text-xs">{formatCOPDisplay(financiacion)}</td>
                <td className="px-4 py-2 text-right text-xs text-steel-400">{formatCOPDisplay(1375000000)}</td>
                <td colSpan={3} />
              </tr>
              <tr className="bg-primary-50 font-bold border-t-2 border-primary-200">
                <td className="px-4 py-3 text-xs font-bold text-primary-900">TOTAL OFERTA</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-primary-700">{formatCOPDisplay(totalOferta)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold">{formatCOPDisplay(totalCostoFinal)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCOPDisplay(totalOferta - totalCostoFinal)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">28.2%</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Procurement Detail Table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-100">
          <h3 className="text-base font-bold text-steel-800">Gestion de Compra — Ejecucion vs Caso de Negocio</h3>
          <p className="text-xs text-steel-400 mt-0.5">Estado de negociacion de cada capitulo con proveedores</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs">Capitulo</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Caso de Negocio</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Negociado</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Pendiente</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Ahorro vs Caso</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {gestionCompra.map((item) => {
                const pctNeg = item.negociado / item.casoNegocio * 100;
                return (
                  <tr key={item.cap} className="hover:bg-steel-50/50 transition">
                    <td className="px-4 py-2.5 text-xs font-medium text-steel-800">{item.cap}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-steel-500">{formatCOPDisplay(item.casoNegocio)}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600">
                      {item.negociado > 0 ? formatCOPDisplay(item.negociado) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-semibold text-amber-600">
                      {item.pendiente > 0 ? formatCOPDisplay(item.pendiente) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold text-primary-600">
                      {item.ahorro > 0 ? formatCOPDisplay(item.ahorro) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {pctNeg >= 80 ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-200">Cerrado</span>
                      ) : pctNeg > 0 ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-200">Parcial</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 border border-red-200">Pendiente</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-primary-50 font-bold border-t-2 border-primary-200">
                <td className="px-4 py-3 text-xs font-bold text-primary-900">TOTAL</td>
                <td className="px-4 py-3 text-right text-xs font-bold">{formatCOPDisplay(totalCasoNegocio)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">{formatCOPDisplay(totalNegociado)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-amber-600">{formatCOPDisplay(totalPendiente)}</td>
                <td className="px-4 py-3 text-right text-xs font-bold text-primary-700">{formatCOPDisplay(ahorroCompra)}</td>
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
    </div>
  );
}
