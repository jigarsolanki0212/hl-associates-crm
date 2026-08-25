'use client';

import * as React from 'react';
import { Search, Bell, HelpCircle, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewInquiry: () => void;
  onOpenNotifications: () => void;
  onToggleMobileMenu: () => void;
  unreadNotificationsCount?: number;
  user?: {
    fullName: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export function Header({
  onOpenSearch,
  onOpenNewInquiry,
  onOpenNotifications,
  onToggleMobileMenu,
  unreadNotificationsCount = 1,
  user = { fullName: 'Alex Mercer', role: 'ADMIN' },
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded text-slate-600 hover:bg-slate-100 md:hidden flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3 rounded border border-slate-200 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-normal">Search inquiries, clients, services...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* + New Inquiry Primary Action (Stitch Screenshots 1, 2) */}
        <Button
          onClick={onOpenNewInquiry}
          variant="primary"
          size="sm"
          className="font-medium text-xs h-8.5 px-3.5 shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>New Inquiry</span>
        </Button>

        {/* Compliance Suite Label (Screenshot 2) */}
        <div className="hidden lg:flex items-center">
          <span className="text-xs font-semibold text-slate-700">Compliance Suite</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Help Circle */}
        <button
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none hidden sm:flex"
          title="Help & Guidelines"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Profile Avatar / Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block leading-tight">
            <div className="text-xs font-semibold text-slate-900">{user.fullName}</div>
            <div className="text-[10px] text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</div>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-700">{user.fullName.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
