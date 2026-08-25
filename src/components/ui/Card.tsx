import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentBorder?: 'none' | 'yellow' | 'red' | 'blue' | 'green';
}

export function Card({ className, accentBorder = 'none', children, ...props }: CardProps) {
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
        'bg-white rounded-lg border border-slate-200 p-5 shadow-card transition-shadow',
        accentClasses[accentBorder],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-slate-100 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-slate-700', className)} {...props}>
      {children}
    </div>
  );
}
