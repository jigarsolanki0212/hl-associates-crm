import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export function Skeleton({ className, variant = 'rectangular', ...props }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-lg',
    card: 'rounded-xl border border-slate-200/80 p-4 shadow-card',
  };

  return (
    <div
      className={cn(
        'shimmer bg-slate-200/70',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Standard table loading skeleton with smooth shimmer rows
 */
export function TableSkeleton({
  rows = 5,
  cols = 6,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <tbody className={cn('divide-y divide-slate-100 animate-fade-in', className)}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={`skel-row-${rIdx}`} className="hover:bg-slate-50/50">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={`skel-cell-${rIdx}-${cIdx}`} className="py-3.5 px-4">
              {cIdx === 0 ? (
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-28 max-w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ) : cIdx === cols - 1 ? (
                <div className="flex justify-end gap-1.5">
                  <Skeleton className="h-7 w-16 rounded" />
                </div>
              ) : (
                <Skeleton className={`h-3.5 ${cIdx % 2 === 0 ? 'w-24' : 'w-16'}`} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * KPI Grid loading skeleton
 */
export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-3 sm:gap-4 animate-fade-in`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`kpi-skel-${i}`} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-card space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16 sm:w-24" />
          <Skeleton className="h-2.5 w-32 mt-1" />
        </div>
      ))}
    </div>
  );
}
