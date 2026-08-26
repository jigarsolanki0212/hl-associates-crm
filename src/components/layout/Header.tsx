'use client';

import * as React from 'react';
import Link from 'next/link';
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
    <header className="h-14 sm:h-16 landscape-compact-header bg-white border-b border-slate-200 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Mobile Toggle & Brand Icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded text-slate-700 hover:bg-slate-100 active:bg-slate-200 md:hidden flex items-center justify-center cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded bg-[#0040e0] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            HL
          </div>
          <span className="font-bold text-xs text-slate-900 truncate max-w-[120px] sm:max-w-none">
            Regulato CRM
          </span>
        </Link>
      </div>

      {/* Center: Global Search Bar (Tablet/Desktop) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3 rounded border border-slate-200 bg-slate-50 hover:bg-white active:bg-white text-slate-400 hover:text-slate-600 flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-focusBlue cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-normal truncate">Search inquiries, clients, services...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
        {/* Mobile Search Button (Visible only on mobile < sm) */}
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 sm:hidden flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* + New Inquiry Primary Action */}
        <Button
          onClick={onOpenNewInquiry}
          variant="primary"
          size="sm"
          className="font-semibold text-xs h-8 sm:h-8.5 px-2.5 sm:px-3.5 shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
          <span className="hidden xs:inline sm:inline">New Inquiry</span>
          <span className="inline xs:hidden sm:hidden">New</span>
        </Button>

        {/* Compliance Suite Label (Desktop only) */}
        <div className="hidden lg:flex items-center">
          <span className="text-xs font-semibold text-slate-700">Compliance Suite</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Help Circle (Tablet/Desktop) */}
        <button
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none hidden md:flex items-center justify-center cursor-pointer"
          title="Help & Guidelines"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Profile Avatar / Info */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block leading-tight">
            <div className="text-xs font-semibold text-slate-900">{user.fullName}</div>
            <div className="text-[10px] text-slate-500 font-medium capitalize">{user.role.toLowerCase()}</div>
          </div>

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex items-center justify-center shrink-0">
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
