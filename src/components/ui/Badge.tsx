import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'new'
    | 'proforma'
    | 'pending'
    | 'accepted'
    | 'converted'
    | 'active'
    | 'lost'
    | 'reopened'
    | 'urgent'
    | 'actionNeeded'
    | 'normal'
    | 'expired'
    | 'outline'
    | 'secondary';
}

export function Badge({ className, variant = 'normal', children, ...props }: BadgeProps) {
  const variants = {
    new: 'bg-[#e5eeff] text-[#0040e0]',
    proforma: 'bg-[#f3e8ff] text-[#7c3aed]',
    pending: 'bg-[#fef3c7] text-[#b45309]',
    accepted: 'bg-[#dcfce7] text-[#15803d]',
    converted: 'bg-[#dcfce7] text-[#15803d]',
    active: 'bg-[#dcfce7] text-[#15803d]',
    lost: 'bg-gray-100 text-gray-700',
    reopened: 'bg-sky-100 text-sky-800',
    urgent: 'bg-[#fee2e2] text-[#ba1a1a]',
    actionNeeded: 'bg-[#fef3c7] text-[#b45309]',
    normal: 'bg-[#e0f2fe] text-[#0284c7]',
    expired: 'bg-[#fee2e2] text-[#ba1a1a]',
    outline: 'border border-slate-300 text-slate-700 bg-white',
    secondary: 'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold tracking-wide uppercase leading-tight select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
