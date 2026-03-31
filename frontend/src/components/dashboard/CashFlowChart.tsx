import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { CashFlowEntry } from '@/types';
import { formatCOP } from '@/utils/formatNumbers';

interface CashFlowChartProps {
  entries: CashFlowEntry[];
}

export default function CashFlowChart({ entries }: CashFlowChartProps) {
  const chartData = entries.map((e) => ({
    period: e.period_label,
    'Ingreso Proyectado': e.projected_income,
    'Egreso Proyectado': e.projected_expense,
    'Ingreso Real': e.actual_income,
    'Egreso Real': e.actual_expense,
    'Neto Proyectado': e.projected_net,
    'Neto Real': e.actual_net,
  }));

  // Format for tooltip and Y-axis labels in millions/billions
  const formatForChart = (value: number) => formatCOP(value);

  return (
    <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-card">
      <h3 className="text-base font-bold text-steel-800 mb-4">
        Flujo de Caja Mensual
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ecedef" />
          <XAxis dataKey="period" tick={{ fill: '#6e7179', fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatCOP(v)} tick={{ fill: '#6e7179', fontSize: 11 }} />
          <Tooltip formatter={(v: number) => formatForChart(v)} />
          <Legend />
          <ReferenceLine y={0} stroke="#8b8e96" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="Ingreso Proyectado"
            stroke="#a9c8eb"
            strokeDasharray="5 5"
          />
          <Line type="monotone" dataKey="Ingreso Real" stroke="#1b5eab" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="Egreso Proyectado"
            stroke="#fbbf24"
            strokeDasharray="5 5"
          />
          <Line type="monotone" dataKey="Egreso Real" stroke="#dc2626" strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="Neto Proyectado"
            stroke="#86efac"
            strokeDasharray="5 5"
          />
          <Line type="monotone" dataKey="Neto Real" stroke="#16a34a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
