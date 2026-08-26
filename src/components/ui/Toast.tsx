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
  React.useEffect(() => {
    if (!toast || toast.type === 'loading' || toast.duration === 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-[#0040e0] animate-spin shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-900/10 ring-1 ring-emerald-500/20';
      case 'error':
        return 'bg-white/95 border-red-300 text-slate-900 shadow-red-900/10 ring-1 ring-red-500/20';
      case 'loading':
        return 'bg-white/95 border-blue-300 text-slate-900 shadow-blue-900/10 ring-1 ring-blue-500/20';
      case 'info':
      default:
        return 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-900/10';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] max-w-sm w-[calc(100%-2.5rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all',
          getStyles()
        )}
      >
        {getIcon()}
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-xs font-bold text-slate-900 leading-tight">{toast.title}</div>
          {toast.description && (
            <div className="text-[11px] text-slate-600 mt-1 leading-normal break-words">
              {toast.description}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
