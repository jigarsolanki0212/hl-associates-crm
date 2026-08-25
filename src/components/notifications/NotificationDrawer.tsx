'use client';

import * as React from 'react';
import Link from 'next/link';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Bell, CheckCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { formatFriendlyDate } from '@/lib/dates/timezone';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT';
  readAt?: Date | string | null;
  createdAt: Date | string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead?: () => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}: NotificationDrawerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'URGENT': return 'urgent';
      case 'WARNING': return 'actionNeeded';
      case 'SUCCESS': return 'accepted';
      default: return 'new';
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications" width="w-[420px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {notifications.length} Total Alerts
        </span>
        {onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-[#0040e0] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded border transition-colors ${
                !n.readAt ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                    <Badge variant={getBadgeVariant(n.type) as any}>{n.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatFriendlyDate(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="text-[#0040e0] font-semibold hover:underline"
                      >
                        View Record →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
}
