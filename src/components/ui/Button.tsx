import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-focusBlue disabled:opacity-50 disabled:pointer-events-none rounded select-none cursor-pointer';

    const variants = {
      primary: 'bg-brand-navy text-white hover:bg-brand-lightNavy active:bg-brand-dark shadow-sm',
      secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-sm',
      outline: 'border border-brand-navy text-brand-navy bg-transparent hover:bg-surface-hover active:bg-blue-100',
      tertiary: 'text-brand-navy hover:text-brand-blue hover:underline bg-transparent p-0',
      destructive: 'bg-destructive text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
