import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  centered?: boolean;
}

const variantStyles = {
  default:  'bg-white border-steel-200 hover:border-primary-300',
  primary:  'bg-white border-l-4 border-l-primary-600 border-steel-200',
  success:  'bg-white border-l-4 border-l-emerald-500 border-steel-200',
  warning:  'bg-white border-l-4 border-l-amber-500 border-steel-200',
  danger:   'bg-white border-l-4 border-l-red-500 border-steel-200',
};

const iconStyles = {
  default: 'bg-primary-50 text-primary-600',
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger:  'bg-red-50 text-red-600',
};

const detailBadgeStyles = {
  default: 'text-primary-500 border-primary-100 bg-primary-50/60',
  primary: 'text-primary-600 border-primary-100 bg-primary-50/60',
  success: 'text-emerald-600 border-emerald-100 bg-emerald-50/60',
  warning: 'text-amber-600 border-amber-100 bg-amber-50/60',
  danger:  'text-red-500 border-red-100 bg-red-50/60',
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
  centered = false,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border shadow-card transition-all hover:shadow-card-hover flex flex-col',
        variantStyles[variant],
        onClick
          ? 'cursor-pointer hover:ring-2 hover:ring-primary-200 active:scale-[0.98] shadow-[0_4px_18px_-2px_rgba(27,94,171,0.10)]'
          : '',
      )}
    >
      {/* Main content */}
      <div className={clsx('p-5 flex-1', centered && 'flex flex-col items-center justify-center text-center')}>
        <div className={clsx('flex items-start', centered ? 'flex-col gap-2 items-center' : 'justify-between')}>
          {/* Icon — top for centered, right for default */}
          {centered && (
            <div className={clsx('rounded-xl p-3', iconStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className={clsx('flex-1', centered && 'flex flex-col items-center')}>
            <p className="text-xs font-medium text-steel-400 uppercase tracking-wide">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-steel-900">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-steel-400">{subtitle}</p>}
            {trendValue && (
              <p
                className={clsx(
                  'mt-1 text-sm font-semibold',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-red-600',
                  trend === 'neutral' && variant === 'primary' && 'text-primary-600',
                  trend === 'neutral' && variant !== 'primary' && 'text-steel-500',
                )}
              >
                {trend === 'up' && '+'}{trendValue}
              </p>
            )}
          </div>
          {/* Icon — right for default layout */}
          {!centered && (
            <div className={clsx('rounded-xl p-3', iconStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>

      {/* Clickable indicator strip */}
      {onClick && (
        <div
          className={clsx(
            'flex items-center px-5 py-2 rounded-b-xl border-t text-[10px] font-semibold tracking-wide',
            centered ? 'justify-center gap-1' : 'justify-between',
            detailBadgeStyles[variant],
          )}
        >
          <span>Ver detalle</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
