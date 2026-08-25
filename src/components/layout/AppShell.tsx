'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { NotificationDrawer, NotificationItem } from '@/components/notifications/NotificationDrawer';
import { NewInquiryDialog } from '@/features/inquiries/components/NewInquiryDialog';
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
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(initialNotifications);

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

  return (
    <div className="min-h-screen bg-[#fbf9fa] flex flex-col antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onOpenNewInquiry={() => setIsNewInquiryOpen(true)}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-[280px] bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Regulato CRM</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={() => {}}
                onOpenNewInquiry={() => {
                  setIsMobileMenuOpen(false);
                  setIsNewInquiryOpen(true);
                }}
              />
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
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

        <main className="flex-1 px-4 md:px-8 py-6 max-w-[1440px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

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
