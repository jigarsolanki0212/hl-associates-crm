'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
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
  Trash2,
  AlertTriangle,
} from 'lucide-react';

import { Toast, ToastMessage } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Edit, Edit3 } from 'lucide-react';

interface ClientDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  availableServices?: Array<{
    id: string;
    name: string;
    code: string;
    suggestedPriceMin?: number | null;
    suggestedPriceMax?: number | null;
    defaultDuration?: number | null;
    description?: string | null;
  }>;
}

export function ClientDetailView({ client, availableServices = [] }: ClientDetailProps) {
  const router = useRouter();
  const [currentClient, setCurrentClient] = React.useState(client);
  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'services' | 'proformas' | 'renewals' | 'followups' | 'activity'
  >('overview');

  // Edit Client Modal State
  const [isEditClientOpen, setIsEditClientOpen] = React.useState(false);
  const [editCompany, setEditCompany] = React.useState(client.companyName || '');
  const [editLogoUrl, setEditLogoUrl] = React.useState(client.logoUrl || '');
  const [editContact, setEditContact] = React.useState(client.contactName || '');
  const [editTitle, setEditTitle] = React.useState(client.contactTitle || '');
  const [editEmail, setEditEmail] = React.useState(client.email || '');
  const [editPhone, setEditPhone] = React.useState(client.phone || '');
  const [editAddress, setEditAddress] = React.useState(client.address || '');
  const [editTaxId, setEditTaxId] = React.useState(client.taxId || '');
  const [editStatus, setEditStatus] = React.useState(client.status || 'ACTIVE');
  const [isSavingClient, setIsSavingClient] = React.useState(false);

  // Add New Service Engagement Modal State
  const [isAddServiceOpen, setIsAddServiceOpen] = React.useState(false);
  const [newServiceId, setNewServiceId] = React.useState(availableServices[0]?.id || '');
  const [newServiceStartDate, setNewServiceStartDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newServiceDuration, setNewServiceDuration] = React.useState(12);
  const [newServiceFee, setNewServiceFee] = React.useState(
    availableServices[0]?.suggestedPriceMin || 200000
  );
  const [newServiceScope, setNewServiceScope] = React.useState('');
  const [newServiceRemarks, setNewServiceRemarks] = React.useState('');
  const [isAddingService, setIsAddingService] = React.useState(false);

  // Renew Service Modal
  const [renewingServiceId, setRenewingServiceId] = React.useState<string | null>(null);
  const [renewDuration, setRenewDuration] = React.useState(12);
  const [renewFee, setRenewFee] = React.useState(200000);
  const [isRenewing, setIsRenewing] = React.useState(false);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  // Edit / Amend Engagement Modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingEngagement, setEditingEngagement] = React.useState<any | null>(null);
  const [editEngagementName, setEditEngagementName] = React.useState('');
  const [editEngagementScope, setEditEngagementScope] = React.useState('');
  const [editEngagementFee, setEditEngagementFee] = React.useState<number | ''>('');
  const [editEngagementStartDate, setEditEngagementStartDate] = React.useState('');
  const [editEngagementExpiryDate, setEditEngagementExpiryDate] = React.useState('');
  const [editEngagementStatus, setEditEngagementStatus] = React.useState('ACTIVE');
  const [isSavingEngagement, setIsSavingEngagement] = React.useState(false);

  // Auto-fill price & duration when selected service changes
  const handleServiceChange = (id: string) => {
    setNewServiceId(id);
    const found = availableServices.find((s) => s.id === id);
    if (found) {
      if (found.suggestedPriceMin) setNewServiceFee(found.suggestedPriceMin);
      if (found.defaultDuration) setNewServiceDuration(found.defaultDuration);
    }
  };

  const handleAddServiceEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceId) {
      setToast({ type: 'error', title: 'Service Required', description: 'Please select a regulatory service.' });
      return;
    }

    setIsAddingService(true);
    try {
      const selectedObj = availableServices.find((s) => s.id === newServiceId);
      const res = await fetch(`/api/clients/${currentClient.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: newServiceId,
          serviceNameSnapshot: selectedObj?.name || 'Regulatory Compliance Service',
          startDate: newServiceStartDate,
          durationMonths: Number(newServiceDuration),
          fee: Number(newServiceFee),
          serviceScope: newServiceScope.trim() || undefined,
          remarks: newServiceRemarks.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAddServiceOpen(false);
        setNewServiceScope('');
        setNewServiceRemarks('');
        setCurrentClient((prev: any) => ({
          ...prev,
          services: [json.data, ...(prev.services || [])],
        }));
        setToast({
          type: 'success',
          title: 'New Service Engagement Added',
          description: `"${json.data.serviceNameSnapshot}" engagement activated for ${currentClient.companyName}. Renewal milestones scheduled.`,
        });
        router.refresh();
      } else {
        setToast({
          type: 'error',
          title: 'Failed to Add Service',
          description: json.error?.message || 'Failed to add service engagement',
        });
      }
    } catch (err: any) {
      console.error('Add service error:', err);
      setToast({ type: 'error', title: 'Error', description: err.message });
    } finally {
      setIsAddingService(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingClient(true);
    try {
      const res = await fetch(`/api/clients/${currentClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: editCompany.trim(),
          logoUrl: editLogoUrl.trim() || null,
          contactName: editContact.trim(),
          contactTitle: editTitle.trim() || null,
          email: editEmail.trim().toLowerCase(),
          phone: editPhone.trim() || null,
          address: editAddress.trim() || null,
          taxId: editTaxId.trim() || null,
          status: editStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCurrentClient((prev: any) => ({ ...prev, ...json.data }));
        setIsEditClientOpen(false);
        setToast({
          type: 'success',
          title: 'Client Updated Successfully',
          description: `Updated profile details for ${editCompany}.`,
        });
        router.refresh();
      } else {
        setToast({
          type: 'error',
          title: 'Update Failed',
          description: json.error?.message || 'Failed to update client profile',
        });
      }
    } catch (err: any) {
      console.error('Update client error:', err);
      setToast({ type: 'error', title: 'Error', description: err.message });
    } finally {
      setIsSavingClient(false);
    }
  };

  // Compose Email Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [emailSubject, setEmailSubject] = React.useState(`Regulatory Update for ${client.companyName}`);
  const [emailBody, setEmailBody] = React.useState(`Dear ${client.contactName},\n\nWe are writing to provide an update regarding your ongoing regulatory compliance services with HL Associates.\n\nBest regards,\nHL Associates Compliance Operations`);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

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
        setToast({
          type: 'success',
          title: 'Engagement Renewed',
          description: 'Service expiry has been extended and logged in audit history.',
        });
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
        setToast({
          type: 'success',
          title: 'Renewal Notice Dispatched',
          description: `Milestone reminder sent to ${client.email}`,
        });
        router.refresh();
      }
    } catch (err) {
      console.error('Reminder dispatch error:', err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEditEngagement = (s: any) => {
    setEditingEngagement(s);
    setEditEngagementName(s.serviceNameSnapshot || '');
    setEditEngagementScope(s.scopeSnapshot || '');
    setEditEngagementFee(s.fee !== undefined ? Number(s.fee) : '');
    setEditEngagementStartDate(s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '');
    setEditEngagementExpiryDate(s.expiryDate ? new Date(s.expiryDate).toISOString().slice(0, 10) : '');
    setEditEngagementStatus(s.status || 'ACTIVE');
  };

  const handleUpdateEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEngagement) return;
    setIsSavingEngagement(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        serviceNameSnapshot: editEngagementName.trim(),
        scopeSnapshot: editEngagementScope.trim() || null,
        status: editEngagementStatus,
      };
      if (editEngagementFee !== '') payload.fee = Number(editEngagementFee);
      if (editEngagementStartDate) payload.startDate = new Date(editEngagementStartDate);
      if (editEngagementExpiryDate) payload.expiryDate = new Date(editEngagementExpiryDate);

      const res = await fetch(`/api/client-services/${editingEngagement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCurrentClient((prev: any) => ({
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          services: (prev.services || []).map((s: any) => (s.id === editingEngagement.id ? { ...s, ...json.data } : s)),
        }));
        setEditingEngagement(null);
        setToast({
          type: 'success',
          title: 'Engagement Amended',
          description: 'Regulatory service scope and timeline updated.',
        });
        router.refresh();
      } else {
        setToast({
          type: 'error',
          title: 'Update Failed',
          description: json.error?.message || 'Could not update engagement.',
        });
      }
    } catch (err) {
      console.error('Update engagement error:', err);
    } finally {
      setIsSavingEngagement(false);
    }
  };

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: client.email,
          subject: emailSubject,
          message: emailBody,
          entityType: 'CLIENT',
          entityId: client.id,
          category: 'FOLLOW_UP',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEmailModalOpen(false);
        setToast({
          type: 'success',
          title: 'Email Delivered',
          description: `Direct message dispatched to ${client.email}`,
        });
        router.refresh();
      } else {
        setToast({
          type: 'error',
          title: 'Failed to Send Email',
          description: json.error?.message || 'Email dispatch failed',
        });
      }
    } catch (err) {
      console.error('Send custom email error:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

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

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentClient.logoUrl ? (
            <div className="h-16 sm:h-20 min-w-[76px] max-w-[180px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={currentClient.logoUrl}
                alt={currentClient.companyName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/20 text-[#0040e0] font-extrabold text-2xl flex items-center justify-center shrink-0 border border-blue-200/50 shadow-sm">
              {currentClient.companyName.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentClient.companyName}
              </h1>
              <Badge variant="active">{currentClient.status}</Badge>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Client ID: <span className="font-semibold text-slate-700">{currentClient.clientNumber}</span> •
              Primary Contact: <span className="font-semibold text-slate-700">{currentClient.contactName}</span>
              {currentClient.contactTitle && <span className="text-slate-400"> ({currentClient.contactTitle})</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial bg-[#0040e0] hover:bg-[#0030b0] text-white"
            onClick={() => {
              if (availableServices.length > 0) {
                handleServiceChange(availableServices[0].id);
              }
              setIsAddServiceOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Service Engagement
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-initial"
            onClick={() => {
              setEditCompany(currentClient.companyName || '');
              setEditLogoUrl(currentClient.logoUrl || '');
              setEditContact(currentClient.contactName || '');
              setEditTitle(currentClient.contactTitle || '');
              setEditEmail(currentClient.email || '');
              setEditPhone(currentClient.phone || '');
              setEditAddress(currentClient.address || '');
              setEditTaxId(currentClient.taxId || '');
              setEditStatus(currentClient.status || 'ACTIVE');
              setIsEditClientOpen(true);
            }}
          >
            <Edit className="w-4 h-4 mr-1.5 text-slate-600" /> Edit Details
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-initial"
            onClick={() => setIsEmailModalOpen(true)}
          >
            <Mail className="w-4 h-4 mr-1.5 text-[#0040e0]" /> Send Email
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-initial"
            onClick={() => {
              if (currentClient.services?.[0]) {
                setRenewingServiceId(currentClient.services[0].id);
                setRenewFee(Number(currentClient.services[0].fee) || 200000);
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Renew
          </Button>
        </div>
      </div>

      {/* Navigation Tabs with smooth mobile swipe */}
      <div className="bg-white rounded-lg border border-slate-200 p-1.5 sm:p-2 shadow-card flex items-center gap-1 overflow-x-auto no-scrollbar touch-scroll text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: ShieldCheck },
          { id: 'services', label: `Active Services (${currentClient.services?.length || 0})`, icon: Briefcase },
          { id: 'proformas', label: `Proformas (${currentClient.proformas?.length || 0})`, icon: FileText },
          { id: 'renewals', label: 'Renewals & Reminders', icon: RefreshCw },
          { id: 'followups', label: `Follow-ups (${currentClient.followUps?.length || 0})`, icon: Clock },
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
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="text-[#0040e0] font-semibold hover:underline flex items-center gap-1 text-left"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{currentClient.email}</span>
                  </button>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Phone</div>
                  <div className="font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {currentClient.phone || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Tax ID / GSTIN</div>
                  <div className="font-mono text-slate-800">{currentClient.taxId || 'GSTIN-24AABCH1234F1Z5'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold mb-0.5">Assigned Rep</div>
                  <div className="font-semibold text-slate-800">{currentClient.assignedTo?.fullName || 'Unassigned'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-500 font-semibold mb-0.5">Registered Address</div>
                  <div className="text-slate-700">{currentClient.address || 'Address not registered'}</div>
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
                {(!currentClient.services || currentClient.services.length === 0) ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No active compliance services registered yet.
                  </div>
                ) : (
                  currentClient.services.map((s: any) => {
                    const daysLeft = s.expiryDate ? getDaysRemaining(s.expiryDate) : 0;
                    return (
                      <div key={s.id} className="p-3 rounded border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-1 gap-2">
                          <span className="truncate">{s.serviceNameSnapshot || 'Regulatory Service'}</span>
                          <Badge variant={daysLeft <= 15 ? 'urgent' : daysLeft <= 30 ? 'actionNeeded' : 'normal'}>
                            {daysLeft < 0 ? 'Expired' : `${daysLeft}d left`}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Expires: <strong>{s.expiryDate ? formatFriendlyDate(s.expiryDate) : 'N/A'}</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Regulatory Licenses & Service Engagements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage all concurrent regulatory services, certificates, validity timelines, and milestones for {currentClient.companyName}.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (availableServices.length > 0) {
                  handleServiceChange(availableServices[0].id);
                }
                setIsAddServiceOpen(true);
              }}
              className="shrink-0 bg-[#0040e0] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Service Engagement
            </Button>
          </div>
          <div className="table-container">
            {(!currentClient.services || currentClient.services.length === 0) ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0040e0] flex items-center justify-center mx-auto">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800">No Service Engagements Active</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This client does not have any regulatory compliance services registered yet.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddServiceOpen(true)}
                  className="bg-[#0040e0] text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add First Service Engagement
                </Button>
              </div>
            ) : (
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Certificate #</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentClient.services.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.serviceNameSnapshot || 'Regulatory Service'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{s.certificateNumber || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{s.startDate ? formatFriendlyDate(s.startDate) : 'N/A'}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{s.expiryDate ? formatFriendlyDate(s.expiryDate) : 'N/A'}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(s.fee || 0, s.currency || 'INR')}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="active">{s.status || 'ACTIVE'}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => {
                              setRenewingServiceId(s.id);
                              setRenewFee(Number(s.fee) || 200000);
                            }}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Renew
                          </Button>
                          <Button
                            onClick={() => handleOpenEditEngagement(s)}
                            variant="secondary"
                            size="sm"
                            className="text-xs px-2 text-slate-600 hover:text-slate-900"
                            title="Edit Engagement Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Proformas */}
      {activeTab === 'proformas' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
          <div className="table-container">
            {(!currentClient.proformas || currentClient.proformas.length === 0) ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No proforma invoices generated for this client yet.
              </div>
            ) : (
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
                  {currentClient.proformas.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-[#0040e0]">
                        <Link href={`/proformas/${p.id}`} className="hover:underline">
                          {p.proformaNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.issueDate ? formatFriendlyDate(p.issueDate) : 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.validUntil ? formatFriendlyDate(p.validUntil) : 'N/A'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(p.totalAmount || 0, p.currency || 'INR')}</td>
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
            )}
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
            {(!currentClient.services || currentClient.services.length === 0) ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                No active services to track renewals.
              </div>
            ) : (
              currentClient.services.map((s: any) => (
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
              ))
            )}
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
            {(!currentClient.followUps || currentClient.followUps.length === 0) ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                No follow-up tasks scheduled for this client.
              </div>
            ) : (
              currentClient.followUps.map((f: any) => (
                <div key={f.id} className="p-3 sm:p-3.5 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                  <div>
                    <div className="font-bold text-slate-900">{f.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Due: {f.dueDate ? formatFriendlyDate(f.dueDate) : 'N/A'} • Type: {f.type}</div>
                  </div>
                  <Badge variant={f.status === 'COMPLETED' ? 'accepted' : 'actionNeeded'} className="self-start sm:self-auto">{f.status}</Badge>
                </div>
              ))
            )}
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
            {(!currentClient.activityLogs || currentClient.activityLogs.length === 0) ? (
              <div className="text-slate-500 text-xs">No audit records logged yet.</div>
            ) : (
              currentClient.activityLogs.map((log: any, idx: number) => (
                <div key={log.id} className="relative">
                  <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-[#0040e0]' : 'bg-slate-300'}`} />
                  <div className="text-xs font-bold text-slate-900">{log.description || log.action}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{log.user?.fullName ? `By ${log.user.fullName} • ` : ''}{log.createdAt ? formatFriendlyDate(log.createdAt) : ''}</div>
                </div>
              ))
            )}
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

      {/* Compose & Send Direct Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title={`Compose Email to ${client.companyName}`}
        size="md"
      >
        <form onSubmit={handleSendCustomEmail} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recipient Email</label>
            <Input value={client.email} disabled className="bg-slate-50 text-slate-600" />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Body *</label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSendingEmail}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Send Email Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Profile Modal */}
      <Modal
        isOpen={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        title={`Edit Profile - ${currentClient.companyName}`}
        size="lg"
      >
        <form onSubmit={handleUpdateClient} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <Input
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                required
                placeholder="e.g. MedTech Solutions Ltd"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status *</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
              >
                <option value="ACTIVE">ACTIVE (In Good Standing)</option>
                <option value="EXPIRING_SOON">EXPIRING_SOON (Audit Due)</option>
                <option value="LAPSED">LAPSED (Non-Renewed)</option>
                <option value="LEAD">LEAD (Pre-Conversion)</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <ImageUpload
            value={editLogoUrl}
            onChange={setEditLogoUrl}
            label="Company Logo / Brand Photo"
            fallbackText={editCompany || 'Company'}
            shape="circle"
            size="lg"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Contact Name *</label>
              <Input
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                required
                placeholder="e.g. Dr. Ramesh Patel"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Head of Regulatory Affairs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98200 12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
              <Input
                value={editTaxId}
                onChange={(e) => setEditTaxId(e.target.value)}
                placeholder="e.g. GSTIN-24AABCM1234F1Z5"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="City, State, Country"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditClientOpen(false)}
              disabled={isSavingClient}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingClient}
            >
              Save Client Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add New Service Engagement Modal */}
      <Modal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        title={`Add Service Engagement - ${currentClient.companyName}`}
        size="lg"
      >
        <form onSubmit={handleAddServiceEngagement} className="space-y-3.5 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-Service Lifecycle for Existing Client</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Activate an additional regulatory compliance engagement. This service will run concurrently with existing licenses and automatically generate scheduled 60-day and 30-day renewal alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Select Regulatory Service *</label>
              <select
                value={newServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                required
                className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
              >
                {availableServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code}) - ₹{(s.suggestedPriceMin || 200000).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commencement / Start Date *</label>
              <Input
                type="date"
                value={newServiceStartDate}
                onChange={(e) => setNewServiceStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Validity Duration *</label>
              <select
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
              >
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commercial Engagement Fee (INR) *</label>
              <Input
                type="number"
                value={newServiceFee}
                onChange={(e) => setNewServiceFee(Number(e.target.value))}
                required
                min="0"
                placeholder="200000"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Scope / Product Classification</label>
              <Input
                value={newServiceScope}
                onChange={(e) => setNewServiceScope(e.target.value)}
                placeholder="e.g. Class IIb Catheter & Stent regulatory filings"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Internal Milestone / Compliance Remarks</label>
              <Textarea
                value={newServiceRemarks}
                onChange={(e) => setNewServiceRemarks(e.target.value)}
                placeholder="e.g. Client expanded product lines 6 months after initial ISO engagement."
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddServiceOpen(false)}
              disabled={isAddingService}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAddingService}
              className="bg-[#0040e0] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Activate Engagement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit / Amend Service Engagement Modal */}
      <Modal
        isOpen={!!editingEngagement}
        onClose={() => setEditingEngagement(null)}
        title={editingEngagement ? `Amend Engagement: ${editingEngagement.serviceNameSnapshot}` : 'Amend Engagement'}
        size="md"
      >
        <form onSubmit={handleUpdateEngagement} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
            <Input
              value={editEngagementName}
              onChange={(e) => setEditEngagementName(e.target.value)}
              placeholder="e.g. CDSCO Medical Device Registration"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commercial Fee (₹) *</label>
              <Input
                type="number"
                value={editEngagementFee}
                onChange={(e) => setEditEngagementFee(e.target.value ? Number(e.target.value) : '')}
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Engagement Status *</label>
              <select
                value={editEngagementStatus}
                onChange={(e) => setEditEngagementStatus(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
              >
                <option value="ACTIVE">ACTIVE - Compliant & Operating</option>
                <option value="EXPIRING_SOON">EXPIRING_SOON - In Renewal Window</option>
                <option value="LAPSED">LAPSED - Grace Period</option>
                <option value="CANCELLED">CANCELLED - Terminated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={editEngagementStartDate}
                onChange={(e) => setEditEngagementStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <Input
                type="date"
                value={editEngagementExpiryDate}
                onChange={(e) => setEditEngagementExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Regulatory Scope Deliverables</label>
            <Textarea
              value={editEngagementScope}
              onChange={(e) => setEditEngagementScope(e.target.value)}
              placeholder="e.g. Dossier preparation, Class B/C devices, testing certificates..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditingEngagement(null)}
              disabled={isSavingEngagement}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSavingEngagement}
              className="bg-[#0040e0] text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
