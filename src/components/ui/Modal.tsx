'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-[560px]', // Standard Stitch width 560px
    lg: 'max-w-3xl',
    xl: 'max-w-[900px]', // Large Stitch PDF preview width 900px
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-modal border border-slate-200 duration-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto',
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              {title && <DialogPrimitive.Title className="text-lg font-bold text-slate-900">{title}</DialogPrimitive.Title>}
              {description && (
                <DialogPrimitive.Description className="text-xs text-slate-500 mt-0.5">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div>{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
