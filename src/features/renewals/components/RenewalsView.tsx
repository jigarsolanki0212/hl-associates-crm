'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { formatCurrency } from '@/lib/utils/currency';
import { RefreshCw, Send, Play, CheckCircle2, Clock } from 'lucide-react';

interface RenewalsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialServices: any[];
}

export function RenewalsView({ initialServices }: RenewalsViewProps) {
  const router = useRouter();
  const [services, setServices] = React.useState(initialServices);
  const [renewingId, setRenewingId] = React.useState<string | null>(null);
  const [renewMonths, setRenewMonths] = React.useState(12);
  const [renewFee, setRenewFee] = React.useState(200000);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const urgentList = services.filter((s) => {
    const d = getDaysRemaining(s.expiryDate);
    return d >= 0 && d <= 15;
  });

  const actionList = services.filter((s) => {
    const d = getDaysRemaining(s.expiryDate);
    return d > 15 && d <= 30;
  });

  const upcomingList = services.filter((s) => {
    const d = getDaysRemaining(s.expiryDate);
    return d > 30 && d <= 60;
  });

  const expiredList = services.filter((s) => {
    const d = getDaysRemaining(s.expiryDate);
    return d < 0;
  });

  const handleSendReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/renewals/${id}/send`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback('Renewal reminder dispatched via email and logged.');
        router.refresh();
      }
    } catch (err) {
      console.error('Send reminder error:', err);
    }
  };

  const handleTriggerBackgroundJob = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/jobs/renewals', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Automated scan finished. Sent ${json.data.remindersSent} milestone reminders.`);
        router.refresh();
      }
    } catch (err) {
      console.error('Job error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteRenew = async () => {
    if (!renewingId) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/client-services/${renewingId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMonths: Number(renewMonths), fee: Number(renewFee) }),
      });
      const json = await res.json();
      if (json.success) {
        setRenewingId(null);
        setFeedback('Engagement renewal executed successfully.');
        router.refresh();
      }
    } catch (err) {
      console.error('Renew error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderServiceRow = (s: any) => {
    const daysLeft = getDaysRemaining(s.expiryDate);
    return (
      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
        <td className="py-3.5 px-4">
          <Link href={`/clients/${s.clientId}`} className="font-bold text-slate-900 hover:text-[#0040e0]">
            {s.client.companyName}
          </Link>
          <div className="text-[11px] text-slate-500">{s.client.email}</div>
        </td>
        <td className="py-3.5 px-4 font-semibold text-slate-700">{s.serviceNameSnapshot}</td>
        <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(s.expiryDate)}</td>
        <td className="py-3.5 px-4 font-bold">
          <span className={daysLeft <= 15 ? 'text-red-600' : daysLeft <= 30 ? 'text-amber-600' : 'text-slate-700'}>
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft} days`}
          </span>
        </td>
        <td className="py-3.5 px-4">
          <Badge variant={daysLeft <= 15 ? 'urgent' : daysLeft <= 30 ? 'actionNeeded' : 'normal'}>
            {daysLeft < 0 ? 'Expired' : daysLeft <= 15 ? 'Urgent' : daysLeft <= 30 ? 'Action Needed' : 'Normal'}
          </Badge>
        </td>
        <td className="py-3.5 px-4 text-right space-x-2">
          <Button onClick={() => handleSendReminder(s.id)} variant="secondary" size="sm">
            <Send className="w-3.5 h-3.5 mr-1 text-[#0040e0]" /> Remind
          </Button>
          <Button
            onClick={() => {
              setRenewingId(s.id);
              setRenewFee(Number(s.fee));
            }}
            variant="primary"
            size="sm"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Renew
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Renewal Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated milestone monitoring (60d, 30d, 7d, 0d) for regulatory licenses.
          </p>
        </div>

        <Button onClick={handleTriggerBackgroundJob} variant="secondary" size="md" isLoading={isProcessing}>
          <Play className="w-4 h-4 mr-1.5 text-emerald-600" /> Run Automated Reminder Scan
        </Button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Tier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-card border-l-4 border-l-red-500">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URGENT (&le;15 DAYS)</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{urgentList.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-card border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTION NEEDED (&le;30 DAYS)</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{actionList.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-card border-l-4 border-l-blue-600">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UPCOMING (&le;60 DAYS)</div>
          <div className="text-3xl font-bold text-[#0040e0] mt-2">{upcomingList.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EXPIRED OVERDUE</div>
          <div className="text-3xl font-bold text-slate-700 mt-2">{expiredList.length}</div>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active compliance services in pipeline.
                  </td>
                </tr>
              ) : (
                services.map(renderServiceRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Modal */}
      <Modal isOpen={!!renewingId} onClose={() => setRenewingId(null)} title="Execute Engagement Renewal" size="sm">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Validity Extension (Months)</label>
            <Input
              type="number"
              value={renewMonths}
              onChange={(e) => setRenewMonths(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Commercial Renewal Fee (INR)</label>
            <Input
              type="number"
              value={renewFee}
              onChange={(e) => setRenewFee(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setRenewingId(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={isProcessing} onClick={handleExecuteRenew}>
              Confirm Renewal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
