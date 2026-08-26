'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastMessage {
  id?: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (!toast || toast.type === 'loading') return;

    const duration = toast.duration || 4500;
    const interval = 20;
    const step = (interval / duration) * 100;

    setProgress(100);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    const dismissTimer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        );
      case 'loading':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 text-[#0040e0] animate-spin" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
        );
    }
  };

  const getCardStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-emerald-500 shadow-xl shadow-emerald-950/10 ring-1 ring-emerald-500/30';
      case 'error':
        return 'bg-white border-rose-500 shadow-xl shadow-rose-950/10 ring-1 ring-rose-500/30';
      case 'loading':
        return 'bg-white border-blue-500 shadow-xl shadow-blue-950/10 ring-1 ring-blue-500/30';
      case 'info':
      default:
        return 'bg-white border-slate-400 shadow-xl shadow-slate-950/10 ring-1 ring-slate-400/30';
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-rose-500';
      case 'loading':
        return 'bg-[#0040e0]';
      case 'info':
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[9999] top-3 sm:top-auto sm:bottom-6 left-3 sm:left-auto right-3 sm:right-6 sm:max-w-md w-auto pointer-events-auto transition-all animate-in fade-in slide-in-from-top-3 sm:slide-in-from-bottom-5 duration-300"
    >
      <div
        className={cn(
          'relative overflow-hidden flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border transition-all',
          getCardStyles()
        )}
      >
        {/* Animated Progress Bar */}
        {toast.type !== 'loading' && (
          <div
            className={cn('absolute bottom-0 left-0 h-1 transition-all ease-linear', getProgressBarColor())}
            style={{ width: `${progress}%` }}
          />
        )}

        {getIcon()}

        <div className="flex-1 min-w-0 pr-1">
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
            {toast.title}
          </div>
          {toast.description && (
            <div className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug break-words font-medium">
              {toast.description}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0 mt-0.5"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
