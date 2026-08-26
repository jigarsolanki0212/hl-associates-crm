'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { formatCurrency } from '@/lib/utils/currency';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Download,
  FileText,
  History,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ClientDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
}

export function ClientDetailView({ client }: ClientDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'services' | 'proformas' | 'renewals' | 'followups' | 'activity'
  >('overview');

  // Renew Service Modal
  const [renewingServiceId, setRenewingServiceId] = React.useState<string | null>(null);
  const [renewDuration, setRenewDuration] = React.useState(12);
  const [renewFee, setRenewFee] = React.useState(200000);
  const [isRenewing, setIsRenewing] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  const handleRenewService = async () => {
    if (!renewingServiceId) return;
    setIsRenewing(true);
    try {
      const res = await fetch(`/api/client-services/${renewingServiceId}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMonths: Number(renewDuration),
          fee: Number(renewFee),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRenewingServiceId(null);
        setFeedbackMsg('Service renewed successfully! Expiry extended.');
        router.refresh();
      }
    } catch (err) {
      console.error('Renew error:', err);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleSendRenewalReminder = async (clientServiceId: string) => {
    try {
      const res = await fetch(`/api/renewals/${clientServiceId}/send`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFeedbackMsg('Renewal reminder email dispatched to client.');
        router.refresh();
      }
    } catch (err) {
      console.error('Reminder dispatch error:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clients</span>
        </Link>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {client.companyName}
            </h1>
            <Badge variant="active">{client.status}</Badge>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Client ID: <span className="font-semibold text-slate-700">{client.clientNumber}</span> •
            Primary Contact: <span className="font-semibold text-slate-700">{client.contactName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="md" className="flex-1 sm:flex-initial">
            Edit Contact
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial"
            onClick={() => {
              if (client.services?.[0]) {
                setRenewingServiceId(client.services[0].id);
                setRenewFee(Number(client.services[0].fee) || 200000);
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Renew Engagement
          </Button>
        </div>
      </div>

      {/* Navigation Tabs with smooth mobile swipe */}
      <div className="bg-white rounded-lg border border-slate-200 p-1.5 sm:p-2 shadow-card flex items-center gap-1 overflow-x-auto no-scrollbar touch-scroll text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'services', label: `Active Services (${client.services?.length || 0})`, icon: Briefcase },
          { id: 'proformas', label: `Proformas (${client.proformas?.length || 0})`, icon: FileText },
          { id: 'renewals', label: 'Renewals & Reminders', icon: RefreshCw },
          { id: 'followups', label: `Follow-ups (${client.followUps?.length || 0})`, icon: Clock },
          { id: 'activity', label: 'Activity & Audit', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'bg-[#e5eeff] text-[#0040e0]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Company & Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Corporate Email</div>
                  <a href={`mailto:${client.email}`} className="text-[#0040e0] font-semibold hover:underline flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{client.email}</span>
                  </a>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Phone</div>
                  <div className="font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {client.phone || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Tax ID / GSTIN</div>
                  <div className="font-mono text-slate-800">{client.taxId || 'GSTIN-27AABCH1234F1Z5'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Assigned Rep</div>
                  <div className="font-semibold text-slate-800">{client.assignedTo?.fullName || 'Unassigned'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-500 font-semibold mb-0.5">Registered Address</div>
                  <div className="text-slate-700">{client.address || 'Plot 42, Electronic City, Bengaluru 560100'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Compliance Health & Status
              </h2>
              <div className="space-y-3 text-xs">
                {client.services?.map((s: any) => {
                  const daysLeft = getDaysRemaining(s.expiryDate);
                  return (
                    <div key={s.id} className="p-3 rounded border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1 gap-2">
                        <span className="truncate">{s.serviceNameSnapshot}</span>
                        <Badge variant={daysLeft <= 15 ? 'urgent' : daysLeft <= 30 ? 'actionNeeded' : 'normal'}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Expires: <strong>{formatFriendlyDate(s.expiryDate)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Regulatory Licenses & Services
            </h2>
          </div>
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Fee (Snapshotted)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.services?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.serviceNameSnapshot}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{s.certificateNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(s.startDate)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatFriendlyDate(s.expiryDate)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(s.fee, s.currency)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="active">{s.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        onClick={() => {
                          setRenewingServiceId(s.id);
                          setRenewFee(Number(s.fee));
                        }}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Renew
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Proformas */}
      {activeTab === 'proformas' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Proforma #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.proformas?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-[#0040e0]">
                      <Link href={`/proformas/${p.id}`} className="hover:underline">
                        {p.proformaNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.issueDate)}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatFriendlyDate(p.validUntil)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.totalAmount, p.currency)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="proforma">{p.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/proformas/${p.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0040e0] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Renewals & Reminders */}
      {activeTab === 'renewals' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4 sm:space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Scheduled Renewal Reminder Pipeline
          </h2>
          <div className="space-y-4 text-xs">
            {client.services?.map((s: any) => (
              <div key={s.id} className="p-3.5 sm:p-4 rounded border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-sm text-slate-900">{s.serviceNameSnapshot}</div>
                  <Button
                    onClick={() => handleSendRenewalReminder(s.id)}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send Reminder Email
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                  {['SIXTY_DAYS', 'THIRTY_DAYS', 'SEVEN_DAYS', 'EXPIRY_DAY'].map((stage) => {
                    const renewal = s.renewals?.find((r: any) => r.stage === stage);
                    const isSent = renewal?.status === 'REMINDER_SENT';
                    return (
                      <div key={stage} className={`p-2 sm:p-2.5 rounded border ${isSent ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                        <div className="font-bold text-[10px] sm:text-[11px] uppercase truncate">{stage.replace('_', ' ')}</div>
                        <div className="text-[10px] mt-0.5">{isSent ? '✓ Sent' : 'Pending'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Follow-ups */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            Client Follow-ups & Tasks
          </h2>
          <div className="space-y-2.5 sm:space-y-3 text-xs">
            {client.followUps?.map((f: any) => (
              <div key={f.id} className="p-3 sm:p-3.5 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div>
                  <div className="font-bold text-slate-900">{f.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Due: {formatFriendlyDate(f.dueDate)} • Type: {f.type}</div>
                </div>
                <Badge variant={f.status === 'COMPLETED' ? 'accepted' : 'actionNeeded'} className="self-start sm:self-auto">{f.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 mb-6">
            Client Audit History
          </h2>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {client.activityLogs?.map((log: any, idx: number) => (
              <div key={log.id} className="relative">
                <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-[#0040e0]' : 'bg-slate-300'}`} />
                <div className="text-xs font-bold text-slate-900">{log.description || log.action}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{log.user?.fullName ? `By ${log.user.fullName} • ` : ''}{formatFriendlyDate(log.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renew Service Modal */}
      <Modal
        isOpen={!!renewingServiceId}
        onClose={() => setRenewingServiceId(null)}
        title="Renew Regulatory Engagement"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Renewal Duration (Months)</label>
            <Input
              type="number"
              value={renewDuration}
              onChange={(e) => setRenewDuration(Number(e.target.value))}
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

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setRenewingServiceId(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={isRenewing} onClick={handleRenewService}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Execute Renewal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
