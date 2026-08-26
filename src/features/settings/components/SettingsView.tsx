'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Building2,
  Mail,
  Shield,
  Clock,
  Users,
  Play,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';

interface SettingsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSettings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialUsers: any[];
  currentUserRole: string;
}

export function SettingsView({ initialSettings, initialUsers, currentUserRole }: SettingsViewProps) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [users, setUsers] = React.useState(initialUsers);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = React.useState(settings.companyName || 'HL Associates');
  const [brandTagline, setBrandTagline] = React.useState(settings.brandTagline || 'Enterprise Regulatory Compliance Suite');
  const [email, setEmail] = React.useState(settings.email || 'compliance@hlassociates.com');
  const [phone, setPhone] = React.useState(settings.phone || '+91 98765 43210');
  const [address, setAddress] = React.useState(settings.address || 'Suite 400, Regulatory Tower, BKC, Mumbai 400051');
  const [taxId, setTaxId] = React.useState(settings.taxId || 'GSTIN-27AABCH1234F1Z5');
  const [currency, setCurrency] = React.useState(settings.currency || 'INR');
  const [defaultTaxRate, setDefaultTaxRate] = React.useState(settings.defaultTaxRate || 18);
  const [companyTimezone, setCompanyTimezone] = React.useState(settings.companyTimezone || 'Asia/Kolkata');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = React.useState('');
  const [smtpPort, setSmtpPort] = React.useState(587);
  const [smtpUser, setSmtpUser] = React.useState('');
  const [smtpPass, setSmtpPass] = React.useState('');

  // User creation modal
  const [isNewUserOpen, setIsNewUserOpen] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserEmail, setNewUserEmail] = React.useState('');
  const [newUserRole, setNewUserRole] = React.useState<'ADMIN' | 'SALES'>('SALES');
  const [newUserPassword, setNewUserPassword] = React.useState('Password123!');
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        companyName,
        brandTagline,
        email,
        phone,
        address,
        taxId,
        currency,
        defaultTaxRate: Number(defaultTaxRate),
        companyTimezone,
      };

      if (smtpHost && smtpUser && smtpPass) {
        payload.smtpHost = smtpHost;
        payload.smtpPort = Number(smtpPort);
        payload.smtpUser = smtpUser;
        payload.smtpPass = smtpPass;
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        setFeedback('Company settings saved successfully.');
        setSmtpPass('');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUsers((prev) => [...prev, json.data]);
        setIsNewUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('Password123!');
        setFeedback(`User ${json.data.fullName} created successfully.`);
      }
    } catch (err) {
      console.error('Create user error:', err);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System & Company Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company branding, encrypted email credentials, regional taxes, and team permissions.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-6">
        {/* Company Branding & Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-[#0040e0]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Company Branding & Regulatory Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Mission</label>
              <Input value={brandTagline} onChange={(e) => setBrandTagline(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Address (Printed on Proformas)</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax Identification</label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Currency & Tax Localization */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-[#0040e0]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial & Regional Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-9 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900"
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default GST / Tax Rate (%)</label>
              <Input
                type="number"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone (Milestone Engine)</label>
              <Input value={companyTimezone} disabled className="bg-slate-50 text-slate-500 font-mono" />
            </div>
          </div>
        </div>

        {/* Encrypted SMTP Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0040e0]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Encrypted SMTP Credentials
              </h2>
            </div>
            <Badge variant={settings.isSmtpConfigured ? 'accepted' : 'actionNeeded'} className="self-start sm:self-auto">
              {settings.isSmtpConfigured ? 'Configured & Encrypted' : 'Mock Delivery Mode'}
            </Badge>
          </div>

          <p className="text-xs text-slate-500">
            When configured, SMTP credentials are encrypted with AES-256-GCM before saving to PostgreSQL. If left empty, the CRM utilizes high-fidelity simulated email delivery with full event logs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Host</label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.mailgun.org / smtp.sendgrid.net"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Port</label>
              <Input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Username</label>
              <Input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="postmaster@hlassociates.com"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Password / Token</label>
              <Input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="••••••••••••••••"
              />
            </div>
          </div>
        </div>

        {currentUserRole === 'ADMIN' && (
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSaving} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </div>
        )}
      </form>

      {/* User Management & RBAC */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0040e0]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              User & RBAC Permissions
            </h2>
          </div>

          {currentUserRole === 'ADMIN' && (
            <Button onClick={() => setIsNewUserOpen(true)} variant="secondary" size="sm" className="w-full sm:w-auto">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Team Member
            </Button>
          )}
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 px-3 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3">
                    <Badge variant={u.role === 'ADMIN' ? 'proforma' : 'new'}>{u.role}</Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={u.isActive ? 'accepted' : 'lost'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      <Modal isOpen={isNewUserOpen} onClose={() => setIsNewUserOpen(false)} title="Add Team Member" size="sm">
        <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
            <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">RBAC Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900"
            >
              <option value="SALES">SALES - Sales Representative</option>
              <option value="ADMIN">ADMIN - System Administrator</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
            <Input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreatingUser}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
