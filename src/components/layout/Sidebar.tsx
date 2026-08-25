'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileText,
  Briefcase,
  RefreshCw,
  Clock,
  History,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNewInquiry?: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, onOpenNewInquiry }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inquiries', href: '/inquiries', icon: Inbox },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Proformas', href: '/proformas', icon: FileText },
    { label: 'Services', href: '/services', icon: Briefcase },
    { label: 'Renewals', href: '/renewals', icon: RefreshCw },
    { label: 'Follow-ups', href: '/follow-ups', icon: Clock },
    { label: 'Activity Log', href: '/activity', icon: History },
  ];

  const secondaryNavItems = [
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-[#0040e0] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">
            HL
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">Regulato CRM</span>
              <span className="text-[11px] text-slate-500 font-medium leading-tight">Compliance Suite</span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden md:flex items-center justify-center"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Button in Sidebar (Screenshot 5) */}
      {!isCollapsed && onOpenNewInquiry && (
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenNewInquiry}
            className="w-full h-9 bg-brand-navy hover:bg-brand-lightNavy text-white rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Record</span>
          </button>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-[#e5eeff] text-[#0040e0] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                isCollapsed && 'justify-center px-0'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[#0040e0]' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isCollapsed && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0040e0] rounded-r" />
              )}
            </Link>
          );
        })}

        <div className="pt-4 pb-2">
          <div className="border-t border-slate-100" />
        </div>

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-[#e5eeff] text-[#0040e0] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                isCollapsed && 'justify-center px-0'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[#0040e0]' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions (Support & Logout - Screenshot 5) */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          href="/support"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Support' : undefined}
        >
          <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
          {!isCollapsed && <span>Support</span>}
        </Link>

        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
