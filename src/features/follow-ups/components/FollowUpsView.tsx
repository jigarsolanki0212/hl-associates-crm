'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { Phone, Mail, MessageSquare, Users, CheckCircle2, Clock, Plus } from 'lucide-react';

interface FollowUpsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFollowUps: any[];
}

export function FollowUpsView({ initialFollowUps }: FollowUpsViewProps) {
  const [followUps, setFollowUps] = React.useState(initialFollowUps);
  const [filterType, setFilterType] = React.useState('ALL');

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED';
    try {
      const res = await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setFollowUps((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
        );
      }
    } catch (err) {
      console.error('Toggle follow-up error:', err);
    }
  };

  const filtered = followUps.filter((f) => {
    if (filterType === 'ALL') return true;
    return f.type === filterType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-purple-600" />;
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'MEETING': return <Users className="w-4 h-4 text-amber-600" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sales Follow-ups</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage scheduled calls, meetings, and prospect checkpoints.
          </p>
        </div>
      </div>

      {/* Filter Chips with touch scrolling */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold overflow-x-auto no-scrollbar touch-scroll py-1">
        {['ALL', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterType === t
                ? 'bg-[#041627] text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No follow-ups found.</div>
        ) : (
          filtered.map((f) => {
            const isCompleted = f.status === 'COMPLETED';
            const relatedEntity = f.client?.companyName || f.inquiry?.companyName || 'General';

            return (
              <div
                key={f.id}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                  isCompleted ? 'bg-slate-50/50 opacity-60' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(f.id, f.status)}
                    className="p-1 rounded text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
                    aria-label="Toggle completed"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${isCompleted ? 'text-emerald-600 fill-emerald-50' : 'text-slate-300'}`}
                    />
                  </button>

                  <div className="p-2 rounded bg-slate-100 shrink-0 hidden xs:flex sm:flex">{getTypeIcon(f.type)}</div>

                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {f.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Target: <strong className="text-slate-700">{relatedEntity}</strong> • Rep:{' '}
                      {f.assignedTo?.fullName || 'Unassigned'}
                    </div>
                    {f.notes && <div className="text-[11px] text-slate-600 mt-1 italic line-clamp-2">{f.notes}</div>}
                  </div>
                </div>

                <div className="flex items-center sm:flex-col justify-between sm:justify-center sm:text-right shrink-0 pl-8 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-xs font-semibold text-slate-800">{formatFriendlyDate(f.dueDate)}</div>
                  <Badge variant={isCompleted ? 'accepted' : 'actionNeeded'} className="mt-0 sm:mt-1">
                    {f.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
