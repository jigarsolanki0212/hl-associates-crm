'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Users, ShieldCheck, Clock, AlertTriangle, Download, Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';

interface ClientItem {
  id: string;
  clientNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  status: string;
  assignedTo?: { id: string; fullName: string; avatarUrl?: string | null } | null;
  services: {
    id: string;
    serviceNameSnapshot: string;
    expiryDate: string;
    status: string;
  }[];
}

interface ClientsViewProps {
  initialServices: { id: string; name: string; code: string }[];
  initialUsers: { id: string; fullName: string }[];
}

export function ClientsView({ initialServices, initialUsers }: ClientsViewProps) {
  const [clients, setClients] = React.useState<ClientItem[]>([]);
  const [stats, setStats] = React.useState({ totalClients: 312, activeServices: 142, expiringSoon: 12, expired: 3 });
  const [pagination, setPagination] = React.useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState('');
  const [serviceId, setServiceId] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);

  // New Client Modal
  const [isNewClientOpen, setIsNewClientOpen] = React.useState(false);
  const [newCompany, setNewCompany] = React.useState('');
  const [newContact, setNewContact] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newAssigned, setNewAssigned] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchClients = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (serviceId) params.set('serviceId', serviceId);
      params.set('page', String(page));

      const res = await fetch(`/api/clients?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setClients(json.data.clients || []);
        setPagination(json.data.pagination);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err) {
      console.error('Fetch clients error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, serviceId, page]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newCompany,
          contactName: newContact,
          email: newEmail,
          phone: newPhone,
          assignedToId: newAssigned || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsNewClientOpen(false);
        setNewCompany('');
        setNewContact('');
        setNewEmail('');
        setNewPhone('');
        fetchClients();
      }
    } catch (err) {
      console.error('Create client error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCsv = () => {
    if (clients.length === 0) return;
    const headers = ['Client ID', 'Company', 'Contact', 'Email', 'Status', 'Active Service', 'Expiry Date'];
    const rows = clients.map((c) => [
      c.clientNumber,
      `"${c.companyName.replace(/"/g, '""')}"`,
      `"${c.contactName.replace(/"/g, '""')}"`,
      c.email,
      c.status,
      `"${(c.services[0]?.serviceNameSnapshot || 'None').replace(/"/g, '""')}"`,
      c.services[0]?.expiryDate ? new Date(c.services[0].expiryDate).toISOString().slice(0, 10) : 'N/A',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HL_Associates_Clients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage active engagements and monitor compliance renewals.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Button onClick={exportCsv} variant="secondary" size="md" className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
          <Button onClick={() => setIsNewClientOpen(true)} variant="primary" size="md" className="flex-1 sm:flex-initial">
            <Plus className="w-4 h-4 mr-1.5" /> New Client
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL CLIENTS</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.totalClients}</div>
          <div className="text-[11px] sm:text-xs text-emerald-600 font-semibold mt-1">↑ +12 this month</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">ACTIVE SERVICES</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.activeServices}</div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">Stable load</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">EXPIRING SOON</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1 sm:mt-2">{stats.expiringSoon}</div>
          <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">Within 30 days</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3.5 sm:p-5 shadow-card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">EXPIRED</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1 sm:mt-2">{stats.expired}</div>
          <div className="text-[11px] sm:text-xs text-red-600 font-medium mt-1">Requires action</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-card flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter clients..."
            className="h-9 w-full rounded border border-slate-200 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-9 rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue flex-1 sm:flex-initial min-w-[130px]"
          >
            <option value="">All Services</option>
            {initialServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue flex-1 sm:flex-initial min-w-[120px]"
          >
            <option value="">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CHURNED">Churned</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((c) => {
                  const primaryService = c.services?.[0];
                  const daysLeft = primaryService ? getDaysRemaining(primaryService.expiryDate) : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/clients/${c.id}`} className="hover:underline">
                          <div className="font-bold text-slate-900">{c.companyName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{c.contactName}</div>
                        </Link>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium max-w-[200px] truncate">
                        {primaryService?.serviceNameSnapshot || 'No active service'}
                      </td>

                      <td className="py-3 px-4">
                        {primaryService ? (
                          <div>
                            <div className="font-semibold text-slate-900">{formatFriendlyDate(primaryService.expiryDate)}</div>
                            <div
                              className={`text-[10px] font-medium ${
                                (daysLeft ?? 0) <= 15
                                  ? 'text-red-600'
                                  : (daysLeft ?? 0) <= 30
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {(daysLeft ?? 0) < 0 ? 'Expired' : `${daysLeft} days remain`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="active">{c.status}</Badge>
                      </td>

                      <td className="py-3 px-4">
                        {c.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {c.assignedTo.fullName.charAt(0)}
                            </div>
                            <span className="text-slate-700 truncate max-w-[120px]">{c.assignedTo.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/clients/${c.id}`}
                          className="text-xs font-semibold text-[#0040e0] hover:underline"
                        >
                          View 360°
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 sm:p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing 1 to {clients.length} of {pagination.total || stats.totalClients} entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      <Modal isOpen={isNewClientOpen} onClose={() => setIsNewClientOpen(false)} title="Create New Client Profile" size="md">
        <form onSubmit={handleCreateClient} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
            <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Contact *</label>
              <Input value={newContact} onChange={(e) => setNewContact(e.target.value)} required />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Rep</label>
              <select
                value={newAssigned}
                onChange={(e) => setNewAssigned(e.target.value)}
                className="flex h-9 w-full rounded border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-focusBlue"
              >
                <option value="">Select Rep...</option>
                {initialUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewClientOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Create Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
