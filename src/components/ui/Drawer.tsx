'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
  width?: string;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  width = 'w-full max-w-[88vw] sm:max-w-[400px]',
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-0 bottom-0 z-50 bg-white p-4 sm:p-6 shadow-2xl border-slate-200 duration-300 animate-in overflow-hidden flex flex-col',
            side === 'right' ? 'right-0 border-l slide-in-from-right' : 'left-0 border-r slide-in-from-left',
            width,
            className
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0 pt-safe">
            <div className="pr-3 min-w-0">
              {title && <DialogPrimitive.Title className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</DialogPrimitive.Title>}
              {description && (
                <DialogPrimitive.Description className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="rounded p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none shrink-0 cursor-pointer">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto touch-scroll pb-safe">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
