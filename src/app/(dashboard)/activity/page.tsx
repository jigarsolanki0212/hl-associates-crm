import * as React from 'react';
import { db } from '@/db/client';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { History, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const logs = await db.activityLog.findMany({
    include: {
      user: true,
      inquiry: true,
      client: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Activity & Audit Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail of all regulatory actions, status changes, and conversions.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-card divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No activity logs recorded.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 leading-snug">{log.description || log.action}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Actor: <strong className="text-slate-700">{log.user?.fullName || 'System Automated'}</strong> •
                    Entity: {log.entityType} ({log.entityId.slice(0, 8)}...)
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <Badge variant="outline">{log.action}</Badge>
                <div className="text-[10px] text-slate-400 mt-1">{formatFriendlyDate(log.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
