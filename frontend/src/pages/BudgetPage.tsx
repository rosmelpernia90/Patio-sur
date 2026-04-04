import { AlertTriangle, Package, HardHat, Briefcase, Wrench } from 'lucide-react';
import clsx from 'clsx';
import { formatCOPFull } from '@/utils/formatNumbers';

const fmt = formatCOPFull;
// Formato en millones con separador de miles colombiano: 24.274.282.134 → "24.274 M"
const fmtM = (v: number) => {
  const millions = Math.round(v / 1_000_000);
  return millions.toLocaleString('es-CO') + ' M';
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Fuente: PS USD4000costo (Detallado caso de negocio_220126.xlsx)
// Organizado por grupo funcional para análisis gerencial
// Costo Directo Total: $24,274,282,134
// ─────────────────────────────────────────────────────────────────────────────

interface LineItem { code: string; descripcion: string; costo: number; venta: number; un?: string }
interface Grupo {
  id: string;
  nombre: string;
  descripcion: string;
  costo: number;
  venta: number;
  color: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  icon: React.ElementType;
  items: LineItem[];
}

const GRUPOS: Grupo[] = [
  {
    id: 'materiales',
    nombre: 'Materiales y Equipos',
    descripcion: 'Suministro de equipos, máquinas, cables y materiales electromecánicos',
    costo: 15660094915,
    venta: 21856944982,
    color: '#1b5eab',
    colorBg: 'bg-primary-50',
    colorText: 'text-primary-700',
    colorBorder: 'border-primary-200',
    icon: Package,
    items: [
      { code: 'S-01', descripcion: 'Suministro Cargadores (17 Módulos 720kW + 80 Dispensadores Triton + Controladores)', costo: 5049620000, venta: 6743603237, un: 'sg' },
      { code: 'S-02', descripcion: 'Cableado BT e Interconexiones Trafo–TGA–Armarios (cable 2x150mm² Cu)', costo: 2864635880, venta: 3856386116, un: 'm' },
      { code: 'S-03', descripcion: 'Subestaciones Eléctricas tipo Shelter (1 principal 9MVA + 6 secundarias)', costo: 2692179338, venta: 3406137000, un: 'u' },
      { code: 'S-04', descripcion: 'Transformadores secos en resina (2x1.500kVA + 3x2.250kVA + 1x3.000kVA)', costo: 2115002279, venta: 2338037308, un: 'u' },
      { code: 'S-05', descripcion: 'Celdas MT 35kV — Subestación Principal (entrada, medida, interruptores, seccionadores)', costo: 2046582157, venta: 2893959054, un: 'u' },
      { code: 'S-06', descripcion: 'Redes Exteriores MT — Acometida 35kV CODENSA (cables, postes, seccionadores, zanjas)', costo: 369435063, venta: 519268407, un: 'sg' },
      { code: 'S-07', descripcion: 'Sistema de Puesta a Tierra, MPT y Apantallamiento + Transporte Internacional', costo: 257800000, venta: 262823529, un: 'sg' },
      { code: 'S-08', descripcion: 'Comunicaciones — Fibra óptica OM3, Cat6A, racks, patch panels, certificación', costo: 208185868, venta: 701469115, un: 'sg' },
      { code: 'S-09', descripcion: 'Luminarias LED 50W herméticas, avisos emergencia, luminarias cárcamo', costo: 88163674, venta: 147984032, un: 'u' },
      { code: 'S-10', descripcion: 'Equipos Activos — Switches, routers y equipos de red activos', costo: 56653330, venta: 147984032, un: 'sg' },
    ],
  },
  {
    id: 'mano_obra',
    nombre: 'Mano de Obra e Instalación',
    descripcion: 'Obra civil, estructura metálica, canalizaciones e instalaciones eléctricas',
    costo: 7135423954,
    venta: 8637614264,
    color: '#059669',
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-700',
    colorBorder: 'border-emerald-200',
    icon: HardHat,
    items: [
      { code: 'M-01', descripcion: 'Estructura Metálica — 198.926 kg cubierta, Metaldeck, pernos de anclaje, tótems', costo: 2978141027, venta: 3500000000, un: 'kg' },
      { code: 'M-02', descripcion: 'Obra Civil — Excavaciones, concreto, dados, adecuación shelters, red hidro, ventilación', costo: 2148043906, venta: 2677142400, un: 'sg' },
      { code: 'M-03', descripcion: 'Canalizaciones Subterráneas MT Interna (Islas) — Tubería PVC 6∅6", cajas CODENSA', costo: 1156457151, venta: 1400000000, un: 'm' },
      { code: 'M-04', descripcion: 'Instalación Cargadores (17 Módulos + 80 Dispensadores) y Elevadores de Mangueras', costo: 471756000, venta: 540000000, un: 'sg' },
      { code: 'M-05', descripcion: 'Canalizaciones Subterráneas Comunicaciones — Cajas CODENSA, topo misil, obra civil', costo: 218274542, venta: 280000000, un: 'm' },
      { code: 'M-06', descripcion: 'Salidas Eléctricas — Tomacorrientes, interruptores, salidas de iluminación y emergencia', costo: 37622754, venta: 50000000, un: 'u' },
      { code: 'M-07', descripcion: 'Canalizaciones MT Principal — Tubería PVC 6∅6", cajas de paso, topo misil', costo: 36964900, venta: 45000000, un: 'm' },
      { code: 'M-08', descripcion: 'Canalizaciones Bandejas y Tubería IMT — Ductos 60/50/40/30x10, puesta a tierra', costo: 89163674, venta: 145471864, un: 'm' },
    ],
  },
  {
    id: 'administracion',
    nombre: 'Administración y Estudios',
    descripcion: 'Diseños de ingeniería, estudios técnicos, trámites y certificaciones',
    costo: 498956289,
    venta: 1099792697,
    color: '#7c3aed',
    colorBg: 'bg-violet-50',
    colorText: 'text-violet-700',
    colorBorder: 'border-violet-200',
    icon: Briefcase,
    items: [
      { code: 'A-01', descripcion: 'Diseños Estructurales, Eléctricos, Contra Incendios, Geométricos y Coordinación Protecciones', costo: 312727205, venta: 419047180, un: 'sg' },
      { code: 'A-02', descripcion: 'Trámites — Certificación RETIE, RETILAP, Legalización CODENSA, Pruebas VLF', costo: 186229084, venta: 679896358, un: 'sg' },
    ],
  },
  {
    id: 'otros',
    nombre: 'Especiales y Contingencias',
    descripcion: 'Capítulos con riesgo o margen negativo y sistemas de seguridad especiales',
    costo: 979807977,
    venta: 817282618,
    color: '#f59e0b',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-700',
    colorBorder: 'border-amber-200',
    icon: Wrench,
    items: [
      { code: 'O-01', descripcion: 'Compensación de Reactiva — Capacitor bank (costo supera venta: margen -37.4%)', costo: 751864128, venta: 547200000, un: 'sg' },
      { code: 'O-02', descripcion: 'Detección y Extinción de Incendios — Sistema contra incendio y detección cuartos técnicos', costo: 227943849, venta: 270082618, un: 'sg' },
    ],
  },
];

const TOTAL_COSTO   = 24274282134;
const IVA_UTIL      = 246779512;
const TOTAL_OFERTA  = 41012884481;
const TOTAL_COSTO_FINAL = 30293164387;

// AIU Detalle
const AIU_COSTO = 2930214540;
const FIN_COSTO = 2211000000;

export function BudgetPageContent() {

  const margenTotal = ((TOTAL_OFERTA - TOTAL_COSTO_FINAL) / TOTAL_OFERTA * 100);

  return (
    <div className="space-y-5">

      {/* ── KPI Summary ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 shadow-card">
          <p className="text-[10px] text-primary-600 uppercase font-semibold tracking-wide">Valor Oferta Total (BAC)</p>
          <p className="text-xl font-black text-primary-800 mt-1">{fmtM(TOTAL_OFERTA)}</p>
          <p className="text-[10px] text-primary-500 mt-0.5">Precio global fijo inc. IVA, AIU, financiación</p>
        </div>
        <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
          <p className="text-[10px] text-steel-500 uppercase font-semibold tracking-wide">Costo Directo Total</p>
          <p className="text-xl font-black text-steel-800 mt-1">{fmtM(TOTAL_COSTO)}</p>
          <p className="text-[10px] text-steel-400 mt-0.5">15 capítulos · hoja PS USD4000costo</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-card">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold tracking-wide">Margen Bruto Proyectado</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{margenTotal.toFixed(1)}%</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">{fmtM(TOTAL_OFERTA - TOTAL_COSTO_FINAL)} de utilidad</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-card">
          <p className="text-[10px] text-red-600 uppercase font-semibold tracking-wide">Capítulos en Riesgo</p>
          <p className="text-xl font-black text-red-700 mt-1">1</p>
          <p className="text-[10px] text-red-500 mt-0.5">Comp. Reactiva — margen negativo -37.4%</p>
        </div>
      </div>

      {/* ── Grupos resumen cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GRUPOS.map(g => {
          const margenGrupo = g.venta > 0 ? ((g.venta - g.costo) / g.venta * 100) : 0;
          const pctDelTotal = (g.costo / TOTAL_COSTO * 100).toFixed(1);
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              className={clsx('rounded-xl border p-4 shadow-card', g.colorBg, g.colorBorder)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg p-1.5" style={{ backgroundColor: g.color + '20' }}>
                  <Icon className="h-4 w-4" style={{ color: g.color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: g.color }}>
                  {pctDelTotal}% del costo
                </span>
              </div>
              <p className="text-xs font-bold text-steel-800 leading-tight">{g.nombre}</p>
              <p className="text-lg font-black mt-1" style={{ color: g.color }}>{fmtM(g.costo)}</p>
              <span className={clsx('text-[10px] font-semibold mt-2 block', margenGrupo < 0 ? 'text-red-600' : 'text-steel-500')}>
                Margen {margenGrupo.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Barra de composición ── */}
      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
        <p className="text-xs font-bold text-steel-700 mb-3">Composición del Costo Directo</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-10 rounded-lg overflow-hidden flex">
            {GRUPOS.map(g => {
              const w = (g.costo / TOTAL_COSTO * 100);
              return (
                <div
                  key={g.id}
                  className="flex flex-col items-center justify-center transition-all overflow-hidden"
                  style={{ width: `${w.toFixed(1)}%`, backgroundColor: g.color }}
                  title={`${g.nombre}: ${fmtM(g.costo)} (${w.toFixed(1)}%)`}
                >
                  {w > 10 && (
                    <>
                      <span className="text-[9px] font-bold text-white leading-tight">{fmtM(g.costo)}</span>
                      <span className="text-[8px] text-white/80 leading-tight">{w.toFixed(1)}%</span>
                    </>
                  )}
                  {w > 4 && w <= 10 && (
                    <span className="text-[8px] font-bold text-white">{w.toFixed(1)}%</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Total a la derecha */}
          <div className="flex-shrink-0 text-right min-w-[90px] border-l-2 border-steel-200 pl-4 py-1">
            <p className="text-[9px] text-steel-400 uppercase font-semibold tracking-widest">Total</p>
            <p className="text-base font-black text-steel-900 leading-snug">{fmtM(TOTAL_COSTO)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
          {GRUPOS.map(g => (
            <div key={g.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
              <span className="text-[10px] text-steel-600 font-medium">{g.nombre}</span>
              <span className="text-[10px] font-bold text-steel-800">{fmtM(g.costo)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detalle por grupo (siempre visible) ── */}
      {GRUPOS.map(g => {
        const Icon = g.icon;
        return (
          <div key={g.id} className={clsx('rounded-xl border p-5 shadow-card', g.colorBorder, g.colorBg)}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl p-2.5" style={{ backgroundColor: g.color + '20' }}>
                <Icon className="h-5 w-5" style={{ color: g.color }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-steel-900">{g.nombre}</h4>
                <p className="text-[11px] text-steel-500">{g.descripcion}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-steel-400">Costo Total</p>
                <p className="text-lg font-black" style={{ color: g.color }}>{fmtM(g.costo)}</p>
              </div>
            </div>

            {/* Tabla de items */}
            <div className="overflow-x-auto rounded-lg border border-steel-200">
              <table className="w-full text-xs bg-white">
                <thead>
                  <tr className="border-b border-steel-200" style={{ backgroundColor: g.color + '10' }}>
                    <th className="px-3 py-2.5 text-left font-semibold text-steel-600 w-16">Código</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-steel-600">Descripción</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-steel-600 w-32">Costo</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-steel-600 w-32">Venta</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-steel-600 w-20">Margen</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-steel-600 w-24">% del grupo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100">
                  {g.items.map((item, i) => {
                    const margenItem = item.venta > 0 ? ((item.venta - item.costo) / item.venta * 100) : 0;
                    const pctGrupo = (item.costo / g.costo * 100);
                    const isNeg = margenItem < 0;
                    return (
                      <tr key={i} className="hover:bg-steel-50/50">
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: g.color + '15', color: g.color }}>
                            {item.code}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-steel-700 leading-snug">{item.descripcion}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-steel-800">{fmt(item.costo)}</td>
                        <td className="px-3 py-2.5 text-right text-steel-600">{fmt(item.venta)}</td>
                        <td className={clsx('px-3 py-2.5 text-right font-bold', isNeg ? 'text-red-600' : 'text-emerald-600')}>
                          {isNeg ? '' : '+'}{margenItem.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <div className="w-12 bg-steel-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(pctGrupo, 100)}%`, backgroundColor: g.color }} />
                            </div>
                            <span className="text-steel-500 font-mono text-[10px] w-8 text-right">{pctGrupo.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2" style={{ borderColor: g.color + '40', backgroundColor: g.color + '08' }}>
                    <td colSpan={2} className="px-3 py-2.5 font-bold text-steel-800">Total {g.nombre}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-steel-900">{fmt(g.costo)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-steel-900">{fmt(g.venta)}</td>
                    <td className={clsx('px-3 py-2.5 text-right font-bold', (g.venta - g.costo) < 0 ? 'text-red-600' : 'text-emerald-600')}>
                      {((g.venta - g.costo) / g.venta * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-steel-600">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Alerta si hay margen negativo */}
            {g.items.some(i => i.venta > 0 && i.venta < i.costo) && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-700">
                  <strong>Atención:</strong> Este grupo contiene partidas con margen negativo. La Compensación Reactiva tiene un costo ({fmt(751864128)}) que supera su venta ({fmt(547200000)}) en <strong>{fmt(204664128)}</strong>. Se recomienda renegociar con el proveedor o revisar el alcance.
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Estructura de Precio Final ── */}
      <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-card">
        <h4 className="text-sm font-bold text-steel-800 mb-4">Estructura de Precio Final — De Costo Directo a Oferta Total</h4>
        <div className="space-y-2">
          {[
            { label: 'Costo Directo (15 capítulos)', valor: TOTAL_COSTO, subtotal: false, color: '#1b5eab', pctOferta: TOTAL_COSTO / TOTAL_OFERTA * 100 },
            { label: 'AIU — Administración (11%) + Imprevistos (2%) + Utilidad (4%)', valor: AIU_COSTO, subtotal: false, color: '#7c3aed', pctOferta: AIU_COSTO / TOTAL_OFERTA * 100 },
            { label: 'Financiación (Crédito puente $17B — IBR+2.85%, 9 meses)', valor: FIN_COSTO, subtotal: false, color: '#f59e0b', pctOferta: FIN_COSTO / TOTAL_OFERTA * 100 },
            { label: 'IVA sobre Utilidad (19%)', valor: IVA_UTIL, subtotal: false, color: '#94a3b8', pctOferta: IVA_UTIL / TOTAL_OFERTA * 100 },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: row.color }} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs text-steel-700">{row.label}</span>
                  <span className="text-xs font-bold text-steel-900 ml-4">{fmt(row.valor)}</span>
                </div>
                <div className="w-full bg-steel-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pctOferta}%`, backgroundColor: row.color }} />
                </div>
              </div>
              <span className="text-[10px] font-mono text-steel-400 w-10 text-right">{row.pctOferta.toFixed(1)}%</span>
            </div>
          ))}
          <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-primary-200">
            <span className="text-sm font-bold text-primary-800">TOTAL OFERTA (Precio Global Fijo)</span>
            <span className="text-lg font-black text-primary-800">{fmt(TOTAL_OFERTA)}</span>
          </div>
        </div>
      </div>

      {/* ── Fuente de datos ── */}
      <div className="rounded-xl bg-primary-50 border border-primary-100 p-3 text-[10px] text-primary-700">
        <strong>Fuente:</strong> Hoja "PS USD4000costo" — <em>Detallado caso de negocio_220126.xlsx</em> | Costo Directo Total: {fmt(TOTAL_COSTO)} | Fecha: Jul 2025 | AIU y financiación: hojas "Admon Patios" y "CREDITO" del archivo de Pagos.
      </div>
    </div>
  );
}

export default BudgetPageContent;
