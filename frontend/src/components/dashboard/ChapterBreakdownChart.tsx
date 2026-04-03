import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList, ReferenceLine,
} from 'recharts';
import { formatCOP, formatCOPFull } from '@/utils/formatNumbers';

// ── Actividades por grupo (Excel: PATIO SUR RESUMEN - CASO DE NEGOCIO) ──
const GRUPOS: Record<string, { color: string; actividades: { nombre: string; v: number; c: number }[] }> = {
  Suministro: {
    color: '#1b5eab',
    actividades: [
      { nombre: 'Redes MT / Interconexión SE', v: 2893959054 + 3406137000, c: 2046582157 + 2692179338 },
      { nombre: 'Transformadores y BT',        v: 2338037308 + 3856386116, c: 2115002279 + 2864635880 },
      { nombre: 'SPE y SPT',                   v: 262823529,               c: 257800000               },
      { nombre: 'Comunicaciones',               v: 701469115,               c: 264839198               },
      { nombre: 'Suministro Cargadores',        v: 6743603237,              c: 5330376000              },
      { nombre: 'Detección Incendios',          v: 270082618,               c: 227943849               },
      { nombre: 'Obras Civiles y Redes',        v: 8177142400,              c: 6537881527              },
    ],
  },
  ManoObra: {
    color: '#059669',
    actividades: [
      { nombre: 'Estudios y Diseños',     v: 419047180,  c: 312727205  },
      { nombre: 'Conexión a la Red',      v: 519268407,  c: 369435063  },
      { nombre: 'Instalación Cargadores', v: 261567164,  c: 191000000  },
      { nombre: 'ILU y Servicios Aux',    v: 147984032,  c: 125786428  },
    ],
  },
  Administracion: {
    color: '#7c3aed',
    actividades: [
      { nombre: 'Trámites y Certificaciones', v: 679896358,   c: 186229084   },
      { nombre: 'IVA Cargadores',             v: 337180162,   c: 247981000   },
      { nombre: 'ITS',                        v: 444548919,   c: 382907200   },
      { nombre: 'Administración (11%)',        v: 3734163668,  c: 2444728897  },
      { nombre: 'Imprevistos (2%)',            v: 649419768,   c: 485485643   },
      { nombre: 'Utilidad (4%)',               v: 1298839537,  c: 0           },
      { nombre: 'IVA sobre Utilidad (19%)',    v: 246779512,   c: 246779512   },
    ],
  },
  Intereses: {
    color: '#f59e0b',
    actividades: [
      { nombre: 'Compensación Reactiva', v: 547200000,  c: 751864128  },
      { nombre: 'Financiación 9 meses',  v: 3077349397, c: 1375000000 },
    ],
  },
};

// ── Totales ──
const sum = (key: 'v' | 'c', grupo: string) =>
  GRUPOS[grupo].actividades.reduce((s, a) => s + a[key], 0);

const sumV = {
  Suministro:     sum('v', 'Suministro'),
  ManoObra:       sum('v', 'ManoObra'),
  Administracion: sum('v', 'Administracion'),
  Intereses:      sum('v', 'Intereses'),
};
const sumC = {
  Suministro:     sum('c', 'Suministro'),
  ManoObra:       sum('c', 'ManoObra'),
  Administracion: sum('c', 'Administracion'),
  Intereses:      sum('c', 'Intereses'),
};

const totalV   = sumV.Suministro + sumV.ManoObra + sumV.Administracion + sumV.Intereses;
const totalC   = sumC.Suministro + sumC.ManoObra + sumC.Administracion + sumC.Intereses;
const utilidad = totalV - totalC;

const chartData = [
  {
    tipo: 'Venta (Oferta)',
    Suministro:     sumV.Suministro,
    ManoObra:       sumV.ManoObra,
    Administracion: sumV.Administracion,
    Intereses:      sumV.Intereses,
    Utilidad:       0,
  },
  {
    tipo: 'Costo (Caso Neg.)',
    Suministro:     sumC.Suministro,
    ManoObra:       sumC.ManoObra,
    Administracion: sumC.Administracion,
    Intereses:      sumC.Intereses,
    Utilidad:       utilidad,
  },
];

// ── Tooltip ──
interface TPayload { name: string; value: number; fill: string }
const NOMBRE_GRUPO: Record<string, string> = {
  Suministro: 'Suministro', ManoObra: 'ManoObra',
  'Administración': 'Administracion', Intereses: 'Intereses',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const esVenta = label?.includes('Venta');
  const total   = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-steel-200 p-4 min-w-[300px] max-w-sm">
      <p className="text-xs font-bold text-steel-900 mb-3 border-b border-steel-100 pb-2">{label}</p>
      {[...payload].reverse().map((p) => {
        if (!p.value) return null;
        const pct      = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0';
        const grupoKey = NOMBRE_GRUPO[p.name] ?? p.name;
        const grupo    = GRUPOS[grupoKey];
        return (
          <div key={p.name} className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-steel-800">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: p.fill }} />
                {p.name === 'ManoObra' ? 'Mano de Obra' : p.name === 'Administracion' ? 'Administración' : p.name}
              </span>
              <span className="text-xs font-bold text-steel-900">
                {formatCOP(p.value)} <span className="text-steel-400 font-normal">({pct}%)</span>
              </span>
            </div>
            {grupo && (
              <div className="ml-4 space-y-0.5 border-l-2 pl-2" style={{ borderColor: p.fill + '50' }}>
                {grupo.actividades.map((act) => {
                  const val = esVenta ? act.v : act.c;
                  if (!val) return null;
                  return (
                    <div key={act.nombre} className="flex justify-between text-[10px] text-steel-500">
                      <span className="truncate mr-2">{act.nombre}</span>
                      <span className="font-mono text-steel-600">{formatCOP(val)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <div className="border-t border-steel-100 mt-2 pt-2 flex justify-between text-xs">
        <span className="font-bold text-steel-700">Total {esVenta ? 'Oferta' : 'Costo'}</span>
        <span className="font-bold text-steel-900">{formatCOPFull(total)}</span>
      </div>
    </div>
  );
};

// ── Labels en segmentos ──
type LabelProps = { x?: number; y?: number; width?: number; height?: number; index?: number; segKey?: string };

function SegLabel({ x = 0, y = 0, width = 0, height = 0, index = 0, segKey = '' }: LabelProps) {
  if (height < 28) return null;
  const entry = chartData[index] as Record<string, number>;
  const value = entry[segKey] ?? 0;
  if (!value) return null;
  const total = index === 0 ? totalV : totalC;
  const pct   = ((value / total) * 100).toFixed(1);
  return (
    <g>
      <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">
        {formatCOP(value)}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={9}>
        {pct}%
      </text>
    </g>
  );
}

function UtilidadLabel({ x = 0, y = 0, width = 0, height = 0, index = 0 }: LabelProps) {
  if (index !== 1 || height < 24) return null;
  const pct = ((utilidad / totalV) * 100).toFixed(1);
  return (
    <g>
      <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#14532d" fontSize={9} fontWeight="bold">UTILIDAD</text>
      <text x={x + width / 2} y={y + height / 2 + 5} textAnchor="middle" fill="#14532d" fontSize={9} fontWeight="bold">{formatCOP(utilidad)}</text>
      <text x={x + width / 2} y={y + height / 2 + 17} textAnchor="middle" fill="#166534" fontSize={8}>{pct}% margen</text>
    </g>
  );
}

// ── Componente principal ──
const ChapterBreakdownChart = () => {
  const margen = (((totalV - totalC) / totalV) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-steel-800">Estructura General — Venta vs Costo por Capítulo</h3>
        <p className="text-xs text-steel-500 mt-1">Composición financiera del caso de negocio: oferta mercantil vs costo directo por categoría</p>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 10 }} barCategoryGap="40%" barSize={110}>
          <CartesianGrid strokeDasharray="6 4" stroke="#c8ccd4" strokeWidth={1} vertical={false} />
          <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => formatCOP(v)} tick={{ fontSize: 10, fill: '#6e7179' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            formatter={(value: string) => (
              <span className="text-xs font-medium text-steel-600">
                {value === 'ManoObra' ? 'Mano de Obra' : value === 'Administracion' ? 'Administración' : value}
              </span>
            )}
          />

          <Bar dataKey="Suministro" name="Suministro" stackId="a" fill="#1b5eab" radius={[0, 0, 0, 0]}>
            <LabelList content={(p: LabelProps) => <SegLabel {...p} segKey="Suministro" />} />
          </Bar>
          <Bar dataKey="ManoObra" name="ManoObra" stackId="a" fill="#059669" radius={[0, 0, 0, 0]}>
            <LabelList content={(p: LabelProps) => <SegLabel {...p} segKey="ManoObra" />} />
          </Bar>
          <Bar dataKey="Administracion" name="Administracion" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]}>
            <LabelList content={(p: LabelProps) => <SegLabel {...p} segKey="Administracion" />} />
          </Bar>
          <Bar dataKey="Intereses" name="Intereses" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]}>
            <LabelList content={(p: LabelProps) => <SegLabel {...p} segKey="Intereses" />} />
          </Bar>
          <Bar dataKey="Utilidad" name="Utilidad" stackId="a" fill="#86efac" radius={[5, 5, 0, 0]}>
            <LabelList content={(p: LabelProps) => <UtilidadLabel {...p} />} />
          </Bar>

          <ReferenceLine
            y={totalV}
            stroke="#ef4444"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: `Oferta Total: ${formatCOP(totalV)}`, position: 'insideTopLeft', fill: '#ef4444', fontSize: 10, fontWeight: 'bold', dy: -8 }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-steel-100">
        <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Total Oferta</p>
          <p className="text-xs font-bold text-primary-700 mt-0.5">{formatCOPFull(totalV)}</p>
        </div>
        <div className="bg-steel-50 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Total Costo</p>
          <p className="text-xs font-bold text-steel-800 mt-0.5">{formatCOPFull(totalC)}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Utilidad</p>
          <p className="text-xs font-bold text-emerald-600 mt-0.5">{formatCOPFull(utilidad)}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
          <p className="text-[10px] text-steel-500 font-semibold uppercase tracking-wide">Margen</p>
          <p className="text-xs font-bold text-emerald-600 mt-0.5">{margen}%</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterBreakdownChart;
