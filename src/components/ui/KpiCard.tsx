import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  accentBorder?: 'none' | 'yellow' | 'red' | 'blue' | 'green';
  valueColor?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtext,
  trend,
  icon,
  accentBorder = 'none',
  valueColor = 'text-slate-900',
  className,
}: KpiCardProps) {
  const accentClasses = {
    none: '',
    yellow: 'border-l-4 border-l-amber-500',
    red: 'border-l-4 border-l-red-500',
    blue: 'border-l-4 border-l-blue-600',
    green: 'border-l-4 border-l-emerald-600',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-5 shadow-card flex flex-col justify-between min-h-[110px]',
        accentClasses[accentBorder],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className={cn('text-3xl font-bold tracking-tight', valueColor)}>{value}</div>

        {trend && (
          <div
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-sm gap-1',
              trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
            )}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>

      {subtext && <div className="text-xs text-slate-500 mt-1 font-medium">{subtext}</div>}
    </div>
  );
}
