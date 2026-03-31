import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCOP } from '@/utils/formatNumbers';

const ChapterBreakdownChart = () => {
  const data = [
    {
      chapter: 'Est. y Conexiones',
      oferta: 938,
      costo: 681,
    },
    {
      chapter: 'Redes MT / SE',
      oferta: 6300,
      costo: 4738,
    },
    {
      chapter: 'Transformadores / BT',
      oferta: 6194,
      costo: 4979,
    },
    {
      chapter: 'SPE y SPT',
      oferta: 262,
      costo: 257,
    },
    {
      chapter: 'Comunicaciones',
      oferta: 701,
      costo: 264,
    },
    {
      chapter: 'Suministro Cargadores',
      oferta: 6743,
      costo: 5330,
    },
    {
      chapter: 'Logistica',
      oferta: 261,
      costo: 191,
    },
    {
      chapter: 'ILLI y Servicios',
      oferta: 147,
      costo: 125,
    },
    {
      chapter: 'Compensación',
      oferta: 547,
      costo: 751,
    },
    {
      chapter: 'Detección Incendios',
      oferta: 270,
      costo: 227,
    },
    {
      chapter: 'Obras Civiles',
      oferta: 8177,
      costo: 1156,
    },
    {
      chapter: 'Tramites',
      oferta: 679,
      costo: 186,
    },
  ];

  // Data is in millions, convert to pesos for formatCOP
  const formatTooltip = (value: number) => formatCOP(value * 1_000_000);
  const formatYAxis = (value: number) => formatCOP(value * 1_000_000);

  return (
    <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-steel-800">
          Estructura General — Venta vs Costo por Capítulo
        </h3>
        <p className="text-xs text-steel-500 mt-1">
          Análisis ejecutivo de oferta mercantil vs costo del caso de negocio por capítulo del proyecto
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="chapter"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11, fill: '#71717a' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#71717a' }}
            label={{ value: 'Millones COP', angle: -90, position: 'insideLeft', offset: 20 }}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            iconType="square"
          />
          <Bar dataKey="oferta" fill="#1B5EAB" name="Oferta Mercantil" radius={[4, 4, 0, 0]} />
          <Bar dataKey="costo" fill="#9CA3AF" name="Costo Caso Negocio" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Quick Stats Footer */}
      <div className="mt-4 pt-3 border-t border-steel-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <p className="text-steel-500">Total Oferta</p>
          <p className="font-bold text-steel-800">$31.224 B</p>
        </div>
        <div>
          <p className="text-steel-500">Total Costo</p>
          <p className="font-bold text-steel-800">$24.274 B</p>
        </div>
        <div>
          <p className="text-steel-500">Diferencia</p>
          <p className="font-bold text-emerald-600">$6.950 B</p>
        </div>
        <div>
          <p className="text-steel-500">Margen</p>
          <p className="font-bold text-emerald-600">22.26%</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterBreakdownChart;
