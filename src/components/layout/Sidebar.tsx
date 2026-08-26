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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenNewInquiry?: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  onOpenNewInquiry,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: SidebarProps) {
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

  const handleLinkClick = () => {
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-slate-200 transition-all duration-300 select-none touch-scroll',
        isMobileDrawer
          ? 'relative w-full h-full border-r-0'
          : cn(
              'fixed top-0 bottom-0 left-0 z-30',
              isCollapsed ? 'w-[72px]' : 'w-[280px]'
            )
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 justify-between shrink-0 pt-safe">
        <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-[#0040e0] flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 shadow-sm">
            HL
          </div>
          {(!isCollapsed || isMobileDrawer) && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">HL Associates CRM</span>
              <span className="text-[11px] text-slate-500 font-medium leading-tight">Regulatory Compliance Suite</span>
            </div>
          )}
        </Link>

        {isMobileDrawer ? (
          <button
            onClick={onCloseMobileDrawer}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors hidden md:flex items-center justify-center cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Quick Action Button in Sidebar */}
      {(!isCollapsed || isMobileDrawer) && onOpenNewInquiry && (
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 shrink-0">
          <button
            onClick={() => {
              if (isMobileDrawer && onCloseMobileDrawer) onCloseMobileDrawer();
              onOpenNewInquiry();
            }}
            className="w-full h-10 sm:h-9 bg-brand-navy hover:bg-brand-lightNavy active:scale-[0.99] text-white rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Inquiry</span>
          </button>
        </div>
      )}

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 sm:py-4 space-y-1 touch-scroll">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded text-sm font-medium transition-all group relative min-h-[40px] sm:min-h-0',
                isActive
                  ? 'bg-[#e5eeff] text-[#0040e0] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
                isCollapsed && !isMobileDrawer && 'justify-center px-0'
              )}
              title={isCollapsed && !isMobileDrawer ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[#0040e0]' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              {(!isCollapsed || isMobileDrawer) && <span className="truncate">{item.label}</span>}
              {isCollapsed && !isMobileDrawer && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0040e0] rounded-r" />
              )}
            </Link>
          );
        })}

        <div className="pt-3 pb-2">
          <div className="border-t border-slate-100" />
        </div>

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded text-sm font-medium transition-all group relative min-h-[40px] sm:min-h-0',
                isActive
                  ? 'bg-[#e5eeff] text-[#0040e0] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
                isCollapsed && !isMobileDrawer && 'justify-center px-0'
              )}
              title={isCollapsed && !isMobileDrawer ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[#0040e0]' : 'text-slate-500 group-hover:text-slate-700'
                )}
              />
              {(!isCollapsed || isMobileDrawer) && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-1 shrink-0 pb-safe">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer min-h-[36px] sm:min-h-0',
            isCollapsed && !isMobileDrawer && 'justify-center px-0'
          )}
          title={isCollapsed && !isMobileDrawer ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
          {(!isCollapsed || isMobileDrawer) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
