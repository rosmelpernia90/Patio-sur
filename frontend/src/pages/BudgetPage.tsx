import { useParams } from 'react-router-dom';
import { Download, AlertTriangle, TrendingUp, Shield, PieChart, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import HelpButton from '@/components/common/HelpButton';
import { formatCOPFull } from '@/utils/formatNumbers';

// Use full currency format for BudgetPage detailed display
const formatCOP = formatCOPFull;

// ============================================================
// DATA: From "Detallado caso de negocio_220126.xlsx"
// Sheet: "Costo vs Venta", "RESUMEN VENTA", "Admon Patios"
// Updated with real financing from "Proyeccion de Pagos" → CREDITO
// ============================================================
interface BudgetItem {
  code: string;
  description: string;
  category: string;
  venta: number;
  costo: number;
  margen: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

const budgetItems: BudgetItem[] = [
  { code: '1', description: 'Estudios y Disenos', category: 'Ingenieria', venta: 419047180, costo: 312727205, margen: 25.4 },
  { code: '2', description: 'Conexion a la Red', category: 'Electrico', venta: 519268407, costo: 369435063, margen: 28.9 },
  { code: '3', description: 'Redes MT (Celdas)', category: 'Electrico', venta: 2893959054, costo: 2046582157, margen: 29.3 },
  { code: '4', description: 'Subestaciones (Shelter)', category: 'Electrico', venta: 3406137000, costo: 2692179338, margen: 21.0 },
  { code: '5', description: 'Transformadores', category: 'Equipos', venta: 2338037308, costo: 2115002279, margen: 9.5 },
  { code: '6', description: 'Baja Tension (BT)', category: 'Electrico', venta: 3856386116, costo: 2864635880, margen: 25.7 },
  { code: '7', description: 'SPE y SPT', category: 'Electrico', venta: 262823529, costo: 257800000, margen: 1.9 },
  { code: '8', description: 'Comunicaciones', category: 'Comunicaciones', venta: 701469115, costo: 264839198, margen: 62.2 },
  { code: '9', description: 'Suministro Cargadores', category: 'Equipos', venta: 6743603237, costo: 5330376000, margen: 21.0 },
  { code: '10', description: 'Instalacion Cargadores', category: 'Instalacion', venta: 261567164, costo: 191000000, margen: 27.0 },
  { code: '11', description: 'Iluminacion y Auxiliares', category: 'Electrico', venta: 147984032, costo: 125786428, margen: 15.0 },
  { code: '12', description: 'Compensacion Reactiva', category: 'Electrico', venta: 547200000, costo: 751864128, margen: -37.4 },
  { code: '13', description: 'Deteccion de Incendios', category: 'Seguridad', venta: 270082618, costo: 227943849, margen: 15.6 },
  { code: '14', description: 'Obras Civiles', category: 'Civil', venta: 8177142400, costo: 6537881527, margen: 20.0 },
  { code: '15', description: 'Tramites', category: 'Administrativo', venta: 679896358, costo: 186229084, margen: 72.6 },
  { code: 'CD', description: 'COSTO DIRECTO', category: '', venta: 31224603518, costo: 24274282134, margen: 22.3, isSubtotal: true },
  { code: 'A', description: 'Administracion (11%)', category: 'AIU', venta: 3734163668, costo: 2444728897, margen: 0 },
  { code: 'I', description: 'Imprevistos (2%)', category: 'AIU', venta: 649419768, costo: 485485643, margen: 0 },
  { code: 'SF', description: 'TOTAL SIN FINANCIACION', category: '', venta: 37935535084, costo: 28082164387, margen: 26.0, isSubtotal: true },
  { code: 'F', description: 'Financiacion (9 meses)', category: 'Financiero', venta: 3077349397, costo: 2211000000, margen: 0 },
  { code: 'T', description: 'TOTAL OFERTA', category: '', venta: 41012884481, costo: 30293164387, margen: 26.1, isTotal: true },
];

// ============================================================
// COMPUTED KPIs
// ============================================================
const TOTAL_VENTA = 41012884481;
const TOTAL_COSTO_REAL = 30293164387;       // Costo con financiacion REAL ($2.211B)
const COSTO_DIRECTO = 24274282134;
const MARGEN_AJUSTADO = TOTAL_VENTA - TOTAL_COSTO_REAL;     // $10.720B
const COSTO_FIN_OFERTA = 1375000000;
const COSTO_FIN_REAL = 2211000000;
const SOBRECOSTO_FIN = COSTO_FIN_REAL - COSTO_FIN_OFERTA;   // $836M

// CPI Proyectado: calculado sobre el costo TOTAL del proyecto (no sobre ejecucion a la fecha)
// Formula: Valor Venta / Costo Total Proyectado = BAC / EAC
const CPI_PROYECTADO = TOTAL_VENTA / TOTAL_COSTO_REAL;      // ~1.354
// % Utilidad Esperada: Margen / Venta × 100
const PCT_UTILIDAD = (MARGEN_AJUSTADO / TOTAL_VENTA) * 100; // ~26.1%

// Chapters with issues
const capNegativo = budgetItems.filter(i => i.margen < 0 && !i.isSubtotal && !i.isTotal);
const capBajoMargen = budgetItems.filter(i => i.margen > 0 && i.margen < 10 && !i.isSubtotal && !i.isTotal);


// ============================================================
// HELP — Enfoque gerencial financiero
// ============================================================
const budgetHelp = {
  pageTitle: 'Ayuda — Presupuesto',
  description:
    'El Presupuesto presenta la estructura completa de costos y precios de venta del proyecto, ' +
    'desglosada en 15 capitulos de obra mas los costos indirectos (AIU) y financiacion. ' +
    'Es la herramienta base para el control financiero: define cuanto se cobra al cliente (Venta), ' +
    'cuanto cuesta ejecutar (Costo) y cual es la utilidad esperada (Margen). ' +
    'Fuente principal: Excel "Detallado caso de negocio_220126.xlsx", hojas "Costo vs Venta", ' +
    '"RESUMEN VENTA" y "Admon Patios". Costo financiero real actualizado de la hoja "CREDITO" ' +
    'del Excel "Proyeccion de Pagos Patio Sur.xlsx".',
  pdfUrl: '/docs/Informe_Presupuesto_Metricas.pdf',
  pdfName: 'Informe_Presupuesto_Metricas.pdf',
  sections: [
    {
      title: 'Tarjetas KPI Superiores',
      items: [
        {
          color: '#1B5EAB',
          label: 'Valor Oferta (Venta) — $41.012.884.481',
          description:
            'Precio global fijo que Consorcio Express pagara a PC Mejia por la totalidad de la obra. ' +
            'Incluye: costo directo de 15 capitulos ($31.2B) + AIU ($4.4B: Admon 11%, Imprevistos 2%, ' +
            'Utilidad 4%) + IVA utilidad ($247M) + Financiacion ($3.1B). No cambia salvo otrosies. ' +
            'Fuente: Hoja "RESUMEN VENTA" del Excel caso de negocio — celda TOTAL OFERTA.',
        },
        {
          color: '#4A4D56',
          label: 'Costo Total Ajustado — $30.293.164.387',
          description:
            'Costo total del proyecto actualizado con el costo financiero REAL ($2.211B) en lugar del ' +
            'estimado original ($1.375B). Composicion: Costo Directo $24.274B + Administracion $2.445B ' +
            '+ Imprevistos $485M + Financiacion Real $2.211B + IVA/ITS $878M. ' +
            'Fuente: Hoja "Costo vs Venta" + hoja "CREDITO" del Excel de Pagos.',
        },
        {
          color: '#16A34A',
          label: 'Margen Bruto Ajustado — $10.719.720.094',
          description:
            'Diferencia entre Venta ($41.013B) y Costo Ajustado ($30.293B). El margen original era ' +
            '$11.556B (28.2%), pero el sobrecosto financiero de $836M lo reduce a $10.720B (26.1%). ' +
            'Este es el margen mas realista del proyecto considerando el credito real. ' +
            'Fuente: Calculo: Venta Total - Costo Total Ajustado.',
        },
        {
          color: '#DC2626',
          label: 'Sobrecosto Financiero — $836.000.000',
          description:
            'Diferencia entre el costo financiero real ($2.211B por credito de $17B a IBR+2.85) y ' +
            'el estimado original ($1.375B incluido en la oferta). Reduce directamente el margen. ' +
            'Si la obra se retrasa (SPI=0.64), este sobrecosto aumenta ~$195M por cada mes adicional. ' +
            'Fuente: Hoja "CREDITO" del Excel de Pagos vs Hoja "Admon Patios" del caso de negocio.',
        },
        {
          color: '#4F46E5',
          label: 'CPI Proyectado — ' + (41012884481 / 30293164387).toFixed(2),
          description:
            'Indice de Desempeno de Costo calculado sobre el costo TOTAL PROYECTADO del proyecto ' +
            '(no sobre la ejecucion a la fecha). Formula: Valor Venta / Costo Total Ajustado = ' +
            '$41.013B / $30.293B = 1.35. A diferencia del CPI de ejecucion (EV/AC = 1.54, que mide ' +
            'eficiencia del gasto ya realizado), este CPI mide la rentabilidad global esperada del ' +
            'proyecto completo. Un valor > 1.0 significa que por cada $1 de costo proyectado se generan ' +
            '$1.35 de ingreso. Es la metrica clave para evaluar la viabilidad financiera total. ' +
            'Fuente: Calculo: Venta Total (RESUMEN VENTA) / Costo Total Ajustado (Costo vs Venta + CREDITO).',
        },
        {
          color: '#0D9488',
          label: '% Utilidad Esperada — ' + ((10719720094 / 41012884481) * 100).toFixed(1) + '%',
          description:
            'Porcentaje de utilidad neta esperada sobre el valor de venta del proyecto. ' +
            'Formula: (Margen Ajustado / Venta Total) × 100 = ($10.720B / $41.013B) × 100 = 26.1%. ' +
            'Representa la ganancia real proyectada despues de considerar todos los costos (directos, AIU ' +
            'y financiacion real). El % original era 28.2% con financiacion estimada ($1.375B); el ' +
            'sobrecosto financiero de $836M lo redujo 2.1 puntos porcentuales. Para una obra de infraestructura ' +
            'electrica de esta magnitud ($41B), un margen del 26% es saludable pero debe monitorearse ' +
            'si el SPI (0.64) no mejora, ya que cada mes de atraso erosiona ~0.5pp adicional. ' +
            'Fuente: Calculo: Margen Ajustado / Venta Total.',
        },
      ],
    },
    {
      title: 'Tabla de Presupuesto — Columnas',
      items: [
        {
          icon: '🔢',
          label: 'Cap. (Capitulo)',
          description:
            'Numero de identificacion del capitulo de obra (1 a 15 para costos directos, ' +
            'CD/A/I/SF/F/T para subtotales y totales). Cada capitulo agrupa un conjunto de ' +
            'actividades, materiales y servicios de la misma naturaleza tecnica. ' +
            'Fuente: Estructura de Desglose de Costos (EDC) del caso de negocio.',
        },
        {
          icon: '📝',
          label: 'Descripcion',
          description:
            'Nombre del capitulo de obra. Los 15 capitulos cubren: ingenieria (Cap 1), ' +
            'conexion electrica (Cap 2), media tension (Cap 3), subestaciones (Cap 4), ' +
            'transformadores (Cap 5), baja tension (Cap 6), puesta a tierra (Cap 7), ' +
            'comunicaciones (Cap 8), cargadores (Cap 9-10), iluminacion (Cap 11), ' +
            'compensacion reactiva (Cap 12), deteccion incendios (Cap 13), ' +
            'obras civiles (Cap 14) y tramites (Cap 15).',
        },
        {
          icon: '🏷️',
          label: 'Categoria',
          description:
            'Clasificacion tecnica del capitulo: Ingenieria, Electrico, Equipos, Comunicaciones, ' +
            'Instalacion, Seguridad, Civil, Administrativo, AIU o Financiero. Permite agrupar ' +
            'los costos por disciplina para analisis de concentracion de riesgo.',
        },
        {
          color: '#1B5EAB',
          label: 'Venta (Oferta)',
          description:
            'Precio de venta al cliente por cada capitulo. Es lo que Consorcio Express paga. ' +
            'Incluye el costo mas el margen aplicado. Los capitulos con mayor venta son: ' +
            'Obras Civiles ($8.2B), Cargadores ($6.7B) y BT ($3.9B). ' +
            'Fuente: Columna VENTA de la hoja "Costo vs Venta" del Excel.',
        },
        {
          color: '#6B6E77',
          label: 'Costo Estimado',
          description:
            'Costo presupuestado para ejecutar cada capitulo, incluyendo materiales, equipos, ' +
            'mano de obra, transporte y servicios. Es el "piso" de gasto esperado. ' +
            'Si los costos reales superan este valor, el margen se reduce. ' +
            'Fuente: Columna COSTO de la hoja "Costo vs Venta" del Excel.',
        },
        {
          color: '#16A34A',
          label: 'Margen ($ y %)',
          description:
            'Diferencia entre Venta y Costo de cada capitulo. El margen absoluto ($) indica la ' +
            'utilidad esperada. El margen porcentual (%) permite comparar eficiencia entre capitulos. ' +
            'La barra de progreso indica: verde (>10%), amarillo (0-10%), rojo (<0%). ' +
            'Fuente: Calculo: Venta - Costo y (Venta-Costo)/Venta x 100.',
        },
        {
          icon: '🚦',
          label: 'Estado (Semaforo)',
          description:
            'Indicador visual del nivel de riesgo del margen: ' +
            'Circulo verde = margen >= 10% (saludable). ' +
            'Triangulo amarillo = margen entre 0% y 10% (requiere monitoreo, riesgo de perdida). ' +
            'Triangulo rojo = margen < 0% (PERDIDA — el costo supera la venta). ' +
            'Fuente: Logica automatica basada en el porcentaje de margen.',
        },
      ],
    },
    {
      title: 'Filas Especiales de la Tabla',
      items: [
        {
          color: '#E8E9EB',
          label: 'CD — COSTO DIRECTO ($31.225B venta / $24.274B costo)',
          description:
            'Subtotal de los 15 capitulos de obra. Es la suma directa de materiales, equipos, ' +
            'mano de obra y servicios sin incluir costos indirectos. Margen directo: 22.3%. ' +
            'Fuente: Suma de filas 1 a 15 de la hoja "Costo vs Venta".',
        },
        {
          color: '#E8E9EB',
          label: 'A — Administracion 11% ($3.734B venta / $2.445B costo)',
          description:
            'Costos indirectos de administracion: personal administrativo (Director, Coordinador, ' +
            'Residentes, HSE, Calidad), oficinas, vehiculos, seguros, garantias, papeleria. ' +
            'Se calcula como 11% del costo directo de venta. ' +
            'Fuente: Hoja "Admon Patios" del Excel — desglose completo del AIU.',
        },
        {
          color: '#E8E9EB',
          label: 'I — Imprevistos 2% ($649M venta / $485M costo)',
          description:
            'Reserva para contingencias e imprevistos del proyecto. Cubre situaciones no previstas: ' +
            'variacion de precios, condiciones del terreno, cambios menores de alcance. ' +
            'Se calcula como 2% del costo directo de venta. ' +
            'Fuente: Hoja "Admon Patios" — porcentaje estandar de la industria.',
        },
        {
          color: '#EEF4FB',
          label: 'SF — TOTAL SIN FINANCIACION ($37.936B / $28.082B)',
          description:
            'Subtotal que incluye costo directo + AIU. Es el valor del proyecto sin considerar ' +
            'el costo de financiacion. Margen sin financiacion: 26.0%. Este valor sirve como ' +
            'referencia para comparar con otros proyectos que tengan distinta estructura de pago.',
        },
        {
          color: '#DC2626',
          label: 'F — Financiacion 9 meses ($3.077B venta / $2.211B costo REAL)',
          description:
            'Costo de financiar la ejecucion durante 9 meses sin ingresos (pago contra entrega). ' +
            'EN LA OFERTA: se incluyo $3.077B para cubrir financiacion (costo estimado: $1.375B). ' +
            'REALIDAD: el credito de $17B a IBR+2.85 genera $2.211B en intereses. ' +
            'SOBRECOSTO: $836M que reducen el margen neto del proyecto. ' +
            'Fuente: Oferta → "Admon Patios". Real → Hoja "CREDITO" del Excel de Pagos.',
        },
        {
          color: '#1B5EAB',
          label: 'T — TOTAL OFERTA ($41.013B / $30.293B)',
          description:
            'Linea final: precio de venta total y costo total ajustado con financiacion real. ' +
            'Margen ajustado: 26.1% ($10.720B). El margen original era 28.2% ($11.556B) pero el ' +
            'sobrecosto financiero de $836M lo reduce en 2.1 puntos porcentuales. ' +
            'Fuente: Sumatoria de todas las partidas con costo financiero actualizado.',
        },
      ],
    },
    {
      title: 'Alertas y Riesgos Presupuestarios',
      items: [
        {
          color: '#DC2626',
          label: 'Compensacion Reactiva — Margen NEGATIVO (-37.4%)',
          description:
            'UNICO capitulo con perdida: costo $752M > venta $547M = perdida de $205M. ' +
            'Causa: el costo de equipos de compensacion reactiva supero la estimacion original. ' +
            'Accion requerida: renegociar alcance con proveedor o solicitar adicion contractual. ' +
            'Fuente: Fila "Comp. Reactiva" de la hoja "Costo vs Venta".',
        },
        {
          color: '#D97706',
          label: 'SPE y SPT — Margen BAJO (1.9%)',
          description:
            'Capitulo de Sistema de Puesta a Tierra con margen de solo $5M sobre $263M de venta. ' +
            'Cualquier variacion en costos genera perdida. Requiere control estricto de cantidades. ' +
            'Fuente: Fila "SPE y SPT" de la hoja "Costo vs Venta".',
        },
        {
          color: '#D97706',
          label: 'Transformadores — Margen BAJO (9.5%)',
          description:
            'Capitulo de $2.338B en venta con margen de solo $223M (9.5%). Por ser un capitulo ' +
            'de alto valor, cualquier sobrecosto tiene impacto significativo en el margen global. ' +
            'Fuente: Fila "Transformadores" de la hoja "Costo vs Venta".',
        },
        {
          color: '#DC2626',
          label: 'Sobrecosto Financiero — $836M reduccion de margen',
          description:
            'El costo financiero real ($2.211B) supera el estimado ($1.375B) por $836M (61% mas). ' +
            'Esto ya esta reflejado en la fila "Financiacion" de la tabla con el costo actualizado. ' +
            'Si la obra se extiende 2 meses adicionales (SPI=0.64), serian ~$390M mas en intereses. ' +
            'Fuente: Hoja "CREDITO" del Excel de Pagos.',
        },
      ],
    },
    {
      title: 'Estructura de la Oferta (Composicion del Precio)',
      items: [
        {
          icon: '🏗️',
          label: 'Costo Directo — $24.274B (59.2% del precio)',
          description:
            'Suma de materiales, equipos, mano de obra directa y servicios de los 15 capitulos. ' +
            'Principales componentes: Obras Civiles $6.538B (27%), Cargadores $5.330B (22%), ' +
            'BT $2.865B (12%), Subestaciones $2.692B (11%). ' +
            'Fuente: Hoja "Costo vs Venta" — suma columna COSTO filas 1-15.',
        },
        {
          icon: '📋',
          label: 'AIU — 17% ($4.384B venta)',
          description:
            'Administracion (11%): personal indirecto, oficinas, vehiculos, seguros = $3.734B venta. ' +
            'Imprevistos (2%): reserva de contingencia = $649M venta. ' +
            'Utilidad (4%): ganancia contractual = $1.299B. IVA sobre utilidad: $247M. ' +
            'Fuente: Hoja "Admon Patios" y "RESUMEN VENTA" del Excel.',
        },
        {
          icon: '🏦',
          label: 'Financiacion — $3.077B en oferta (costo real $2.211B)',
          description:
            'Monto incluido en el precio de venta para cubrir 9 meses sin ingresos. ' +
            'Se cobran $3.077B al cliente pero el costo real del credito es $2.211B, ' +
            'dejando un margen financiero neto de $866M. Sin embargo, el costo original ' +
            'estimado era $1.375B, generando un sobrecosto de $836M vs lo planificado. ' +
            'Fuente: Oferta Mercantil + Hoja "CREDITO" del Excel de Pagos.',
        },
      ],
    },
    {
      title: 'Interpretacion Gerencial',
      items: [
        {
          icon: '📊',
          label: 'Concentracion de Riesgo',
          description:
            'El 73% del costo directo se concentra en 4 capitulos: Obras Civiles (27%), ' +
            'Cargadores (22%), BT (12%) y Subestaciones (11%). El control de costos debe ' +
            'priorizarse en estos capitulos ya que cualquier desviacion tiene alto impacto.',
        },
        {
          icon: '⚠️',
          label: 'Capitulos Criticos',
          description:
            `${capNegativo.length} capitulo(s) con margen negativo (perdida directa) y ` +
            `${capBajoMargen.length} capitulo(s) con margen bajo (<10%). En total, estos capitulos ` +
            'representan un riesgo combinado de ~$430M en potenciales sobrecostos.',
        },
        {
          icon: '✅',
          label: 'Margen de Seguridad',
          description:
            'Aun con el sobrecosto financiero de $836M, el proyecto mantiene un margen ajustado ' +
            'de 26.1% ($10.720B). Los capitulos de alto margen (Comunicaciones 62.2%, Tramites 72.6%) ' +
            'compensan parcialmente los de bajo margen. El margen es robusto para la industria.',
        },
      ],
    },
  ],
};

export default function BudgetPage() {
  useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-steel-900">Presupuesto del Proyecto</h2>
          <p className="text-xs text-steel-400 mt-1">
            Patio de Operacion Sur — PC Mejia Ingenieria S.A. para Consorcio Express S.A.S.
          </p>
          <p className="text-[11px] text-steel-400 mt-0.5">
            Fuente: Excel "Detallado caso de negocio_220126.xlsx" | Financiacion real: Hoja "CREDITO" del Excel de Pagos
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton {...budgetHelp} />
          <button className="flex items-center gap-2 rounded-lg border border-steel-300 bg-white px-4 py-2 text-sm font-medium text-steel-600 hover:bg-steel-50 transition">
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Valor Oferta (Venta)</p>
          </div>
          <p className="text-lg font-bold text-primary-700">{formatCOP(TOTAL_VENTA)}</p>
          <p className="text-[10px] text-steel-400 mt-1">Precio global fijo (inc. IVA, AIU, financiacion)</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-steel-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Costo Total Ajustado</p>
          </div>
          <p className="text-lg font-bold text-steel-900">{formatCOP(TOTAL_COSTO_REAL)}</p>
          <p className="text-[10px] text-steel-400 mt-1">Con financiacion real ($2.211B vs $1.375B est.)</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Margen Bruto Ajustado</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">{formatCOP(MARGEN_AJUSTADO)}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">26.1% (era 28.2% con est. original)</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">Sobrecosto Financiero</p>
          </div>
          <p className="text-lg font-bold text-red-600">{formatCOP(SOBRECOSTO_FIN)}</p>
          <p className="text-[10px] text-red-500 mt-1 font-semibold">+61% vs estimado en oferta</p>
        </div>
        <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">CPI Proyectado</p>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{CPI_PROYECTADO.toFixed(2)}</p>
          <p className="text-[10px] text-indigo-500 mt-1 font-medium">Venta / Costo Proyectado Total</p>
          <p className="text-[9px] text-steel-400 mt-0.5">{'>'}1.0 = proyecto rentable a nivel global</p>
        </div>
        <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-teal-600" />
            <p className="text-[10px] text-steel-400 uppercase tracking-wide font-medium">% Utilidad Esperada</p>
          </div>
          <p className="text-2xl font-bold text-teal-700">{PCT_UTILIDAD.toFixed(1)}%</p>
          <p className="text-[10px] text-teal-500 mt-1 font-medium">Margen / Venta × 100</p>
          <p className="text-[9px] text-steel-400 mt-0.5">Utilidad neta proyectada del proyecto</p>
        </div>
      </div>

      {/* KPI Cards — Row 2: Structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-steel-200 bg-white p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Costo Directo</p>
          <p className="text-sm font-bold text-steel-900 mt-1">{formatCOP(COSTO_DIRECTO)}</p>
          <p className="text-[9px] text-steel-400">15 capitulos de obra</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">AIU (17%)</p>
          <p className="text-sm font-bold text-steel-900 mt-1">{formatCOP(2444728897 + 485485643)}</p>
          <p className="text-[9px] text-steel-400">Admon 11% + Imprevistos 2%</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Financiacion Real</p>
          <p className="text-sm font-bold text-red-600 mt-1">{formatCOP(COSTO_FIN_REAL)}</p>
          <p className="text-[9px] text-steel-400">Credito $17B a IBR+2.85</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-3 shadow-card">
          <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Capitulos en Riesgo</p>
          <p className="text-sm font-bold text-amber-600 mt-1">{capNegativo.length + capBajoMargen.length}</p>
          <p className="text-[9px] text-steel-400">{capNegativo.length} negativo + {capBajoMargen.length} bajo margen</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 shadow-card">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" />
            <p className="text-[9px] text-steel-400 uppercase tracking-wide font-medium">Margen Financiero Neto</p>
          </div>
          <p className="text-sm font-bold text-emerald-600 mt-1">{formatCOP(3077349397 - COSTO_FIN_REAL)}</p>
          <p className="text-[9px] text-steel-400">Oferta financ. - Costo real</p>
        </div>
      </div>

      {/* Budget Table */}
      <div className="rounded-xl border border-steel-200 bg-white shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-steel-200 bg-steel-50">
          <h3 className="text-sm font-bold text-steel-800">Desglose Presupuestal: Venta vs Costo por Capitulo</h3>
          <p className="text-[10px] text-steel-400 mt-0.5">
            15 capitulos de obra + AIU + Financiacion | Valores en COP |
            <span className="text-red-500 font-semibold"> Costo financiero actualizado con dato real del credito</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-900 text-white">
                <th className="px-4 py-3 text-left font-semibold text-xs">Cap.</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Descripcion</th>
                <th className="px-4 py-3 text-left font-semibold text-xs">Categoria</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Venta (Oferta)</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Costo Estimado</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Margen</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">Margen %</th>
                <th className="px-4 py-3 text-center font-semibold text-xs">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {budgetItems.map((item) => (
                <tr
                  key={item.code}
                  className={clsx(
                    'hover:bg-steel-50/50 transition-colors',
                    item.isTotal && 'bg-primary-50 font-bold',
                    item.isSubtotal && 'bg-steel-50 font-semibold',
                    item.code === '12' && 'bg-red-50/60',
                    item.code === 'F' && 'bg-amber-50/60',
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary-600">{item.code}</td>
                  <td className={clsx('px-4 py-3 text-steel-800', (item.isTotal || item.isSubtotal) && 'font-bold')}>
                    {item.description}
                    {item.code === 'F' && (
                      <span className="ml-2 text-[9px] text-red-500 font-semibold bg-red-100 rounded px-1.5 py-0.5">
                        COSTO REAL ACTUALIZADO
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.category && (
                      <span className="rounded-full bg-primary-50 border border-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className={clsx('px-4 py-3 text-right text-steel-800', (item.isTotal || item.isSubtotal) && 'font-bold')}>
                    {formatCOP(item.venta)}
                  </td>
                  <td className={clsx('px-4 py-3 text-right', item.code === 'F' ? 'text-red-600 font-bold' : 'text-steel-600')}>
                    {formatCOP(item.costo)}
                    {item.code === 'F' && (
                      <div className="text-[9px] text-steel-400 line-through">{formatCOP(1375000000)}</div>
                    )}
                  </td>
                  <td className={clsx('px-4 py-3 text-right font-semibold', item.venta - item.costo < 0 ? 'text-red-600' : 'text-emerald-600')}>
                    {formatCOP(item.venta - item.costo)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(item.isSubtotal || item.isTotal || item.margen !== 0) && (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-steel-100 rounded-full">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              item.margen < 0 ? 'bg-red-500' : item.margen < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(Math.abs(item.margen), 100)}%` }}
                          />
                        </div>
                        <span className={clsx(
                          'text-xs font-bold',
                          item.margen < 0 ? 'text-red-600' : item.margen < 10 ? 'text-amber-600' : 'text-emerald-600'
                        )}>
                          {item.margen.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.margen < 0 ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mx-auto" />
                    ) : item.margen < 10 && item.margen !== 0 ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
                    ) : !item.isSubtotal && !item.isTotal && item.margen !== 0 ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Alerta: Capitulo con margen negativo</p>
              <p className="text-xs text-red-700 mt-1">
                <strong>Compensacion Reactiva (Cap. 12):</strong> El costo estimado ({formatCOP(751864128)}) supera
                el valor de venta ({formatCOP(547200000)}) por {formatCOP(751864128 - 547200000)}, representando un
                margen de -37.4%. Se recomienda revisar alcance y negociar con proveedor.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">Alerta: Sobrecosto financiero confirmado</p>
              <p className="text-xs text-amber-700 mt-1">
                El costo financiero real (<strong>{formatCOP(COSTO_FIN_REAL)}</strong>) supera el estimado
                original ({formatCOP(COSTO_FIN_OFERTA)}) por <strong>{formatCOP(SOBRECOSTO_FIN)}</strong> (+61%).
                Esto reduce el margen de 28.2% a <strong>26.1%</strong>. Si la obra se retrasa (SPI=0.64),
                cada mes adicional genera ~{formatCOP(195000000)} en intereses extra.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl bg-primary-50 border border-primary-200 p-4 text-xs text-primary-800">
        <p className="font-bold mb-1">Fuentes de Datos:</p>
        <ul className="space-y-1 text-[11px]">
          <li>• <strong>Capitulos 1-15 (Costo Directo):</strong> Hoja "Costo vs Venta" del Excel "Detallado caso de negocio_220126.xlsx".</li>
          <li>• <strong>AIU (Administracion + Imprevistos):</strong> Hoja "Admon Patios" del mismo Excel — desglose de personal, oficinas, seguros, garantias.</li>
          <li>• <strong>Estructura de Venta:</strong> Hoja "RESUMEN VENTA" — CD + AIU (17%) + IVA Utilidad + Financiacion = Total Oferta.</li>
          <li>• <strong>Financiacion REAL ($2.211B):</strong> Hoja "CREDITO" del Excel "Proyeccion de Pagos Patio Sur.xlsx" — credito $17B, IBR+2.85 (13.65% EA).</li>
          <li>• <strong>Precio global fijo:</strong> Oferta Mercantil PC Mejia a Consorcio Express. Incluye IVA, AIU y todos los impuestos. Pago total contra entrega.</li>
        </ul>
      </div>
    </div>
  );
}
