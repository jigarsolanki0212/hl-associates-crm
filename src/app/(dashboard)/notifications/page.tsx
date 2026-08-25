import * as React from 'react';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
      case 'WARNING':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Stay informed on assignments, expiry alerts, and client proposals.</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-card divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No notifications found.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.readAt ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
              }`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-900">{n.title}</span>
                  <Badge variant={n.type === 'URGENT' ? 'urgent' : n.type === 'SUCCESS' ? 'accepted' : 'new'}>
                    {n.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.message}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatFriendlyDate(n.createdAt)}</span>
                  {n.link && (
                    <Link href={n.link} className="text-[#0040e0] font-semibold hover:underline">
                      View Associated Record →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
