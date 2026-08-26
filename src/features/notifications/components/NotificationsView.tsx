'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  CheckCheck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  Users,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'URGENT' | 'WARNING' | 'SUCCESS' | 'INFO';
  title: string;
  message: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationsViewProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsView({ initialNotifications }: NotificationsViewProps) {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD' | 'URGENT' | 'PROFORMA' | 'RENEWAL'>('ALL');
  const [search, setSearch] = React.useState('');
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        );
        setToast({
          type: 'success',
          title: 'All Notifications Read',
          description: 'All pending notifications marked as read.',
        });
        router.refresh();
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: currentRead ? null : new Date().toISOString() } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    // Filter by category
    if (filter === 'UNREAD' && n.readAt) return false;
    if (filter === 'URGENT' && n.type !== 'URGENT' && n.type !== 'WARNING') return false;
    if (filter === 'PROFORMA' && !n.title.toLowerCase().includes('proforma') && !n.message.toLowerCase().includes('proforma') && !n.link?.includes('proforma')) return false;
    if (filter === 'RENEWAL' && !n.title.toLowerCase().includes('renewal') && !n.message.toLowerCase().includes('expir') && !n.link?.includes('renewal')) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }

    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return (
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
        );
      case 'WARNING':
        return (
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        );
      case 'INFO':
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-[#0040e0]" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl pb-8">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e5eeff] text-[#0040e0]">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance alerts, renewal milestones, assignment updates, and proposal triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="secondary"
              size="sm"
              isLoading={isMarkingAll}
              className="text-xs font-semibold shrink-0"
            >
              <CheckCheck className="w-4 h-4 mr-1.5 text-[#0040e0]" /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter notifications by keyword or client..."
            className="h-9 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-scroll text-xs font-semibold">
          {[
            { id: 'ALL', label: `All (${notifications.length})` },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'URGENT', label: 'Urgent Expirations' },
            { id: 'PROFORMA', label: 'Proposals' },
            { id: 'RENEWAL', label: 'Renewals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0040e0] text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">No notifications found</div>
            <p>You are all caught up on regulatory compliance milestones and notifications.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-colors ${
                  isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                }`}
              >
                {getIcon(n.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 leading-snug">{n.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#0040e0] ring-4 ring-blue-100 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          n.type === 'URGENT'
                            ? 'urgent'
                            : n.type === 'WARNING'
                            ? 'actionNeeded'
                            : n.type === 'SUCCESS'
                            ? 'accepted'
                            : 'normal'
                        }
                      >
                        {n.type}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                        {formatFriendlyDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed my-1.5 font-medium">{n.message}</p>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    {n.link ? (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0040e0] hover:underline"
                      >
                        <span>View Associated Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">System event</span>
                    )}

                    <button
                      onClick={() => handleToggleRead(n.id, !isUnread)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      {isUnread ? 'Mark as read' : 'Mark as unread'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
