'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { NotificationDrawer, NotificationItem } from '@/components/notifications/NotificationDrawer';
import { NewInquiryDialog } from '@/features/inquiries/components/NewInquiryDialog';
import { LayoutDashboard, Inbox, Users, RefreshCw, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    fullName: string;
    role: string;
    avatarUrl?: string | null;
  };
  initialNotifications?: NotificationItem[];
  servicesList?: { id: string; name: string; code: string }[];
  usersList?: { id: string; fullName: string }[];
}

export function AppShell({
  children,
  user = { fullName: 'Alex Mercer', role: 'ADMIN' },
  initialNotifications = [],
  servicesList = [],
  usersList = [],
}: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(initialNotifications);

  // Close mobile drawer when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard shortcut listener for CMD+K / CTRL+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const mobileNavTabs = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inquiries', href: '/inquiries', icon: Inbox },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Renewals', href: '/renewals', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen min-h-dvh bg-[#fbf9fa] flex flex-col antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
        />
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[290px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
            <Sidebar
              isCollapsed={false}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
              onOpenNewInquiry={() => {
                setIsMobileMenuOpen(false);
                setIsNewInquiryOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-w-0',
          isCollapsed ? 'md:pl-[72px]' : 'md:pl-[280px]'
        )}
      >
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          unreadNotificationsCount={unreadCount}
          user={user}
        />

        <main className="flex-1 px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-6 max-w-[1600px] w-full mx-auto animate-fade-in pb-24 md:pb-8 touch-scroll landscape-compact-padding ultrawide-container">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for quick thumb navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around pb-safe shadow-lg">
        {mobileNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded text-[10px] font-medium transition-colors min-w-[56px]',
                isActive ? 'text-[#0040e0] font-bold' : 'text-slate-500 hover:text-slate-900 active:bg-slate-100'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-[#0040e0]' : 'text-slate-500')} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2.5 rounded text-[10px] font-medium text-slate-500 hover:text-slate-900 active:bg-slate-100 min-w-[56px] cursor-pointer',
            isMobileMenuOpen && 'text-[#0040e0] font-bold'
          )}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Modals and Drawers */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      <NewInquiryDialog
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
        services={servicesList}
        users={usersList}
      />
    </div>
  );
}
