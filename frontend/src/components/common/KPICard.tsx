import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white border-steel-200 hover:border-primary-300',
  success: 'bg-white border-l-4 border-l-emerald-500 border-steel-200',
  warning: 'bg-white border-l-4 border-l-amber-500 border-steel-200',
  danger: 'bg-white border-l-4 border-l-red-500 border-steel-200',
};

const iconStyles = {
  default: 'bg-primary-50 text-primary-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  onClick,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border p-5 shadow-card transition-all hover:shadow-card-hover',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:ring-2 hover:ring-primary-200 active:scale-[0.98]',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-steel-400 uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-steel-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-steel-400">{subtitle}</p>}
          {trendValue && (
            <p
              className={clsx(
                'mt-1 text-sm font-semibold',
                trend === 'up' && 'text-emerald-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-steel-500',
              )}
            >
              {trend === 'up' && '+'}{trendValue}
            </p>
          )}
        </div>
        <div className={clsx('rounded-xl p-3', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
