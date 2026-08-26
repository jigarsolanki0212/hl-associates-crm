'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import {
  Building2,
  Mail,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Send,
  Sparkles,
  AlertCircle,
  Loader2,
  Save,
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
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  // Form states
  const [companyName, setCompanyName] = React.useState(initialSettings.companyName || 'HL Associates');
  const [brandTagline, setBrandTagline] = React.useState(initialSettings.brandTagline || 'Enterprise Regulatory Compliance Suite');
  const [email, setEmail] = React.useState(initialSettings.email || 'compliance@hlassociates.com');
  const [phone, setPhone] = React.useState(initialSettings.phone || '+91 98765 43210');
  const [address, setAddress] = React.useState(initialSettings.address || 'Suite 400, Regulatory Tower, BKC, Mumbai 400051');
  const [taxId, setTaxId] = React.useState(initialSettings.taxId || 'GSTIN-27AABCH1234F1Z5');
  const [currency, setCurrency] = React.useState(initialSettings.currency || 'INR');
  const [defaultTaxRate, setDefaultTaxRate] = React.useState(initialSettings.defaultTaxRate ?? 18);
  const [companyTimezone, setCompanyTimezone] = React.useState(initialSettings.companyTimezone || 'Asia/Kolkata');

  // Detect initial provider from host
  const detectProvider = (host: string) => {
    if (!host) return 'GMAIL';
    if (host.includes('gmail')) return 'GMAIL';
    if (host.includes('resend')) return 'RESEND';
    if (host.includes('sendgrid')) return 'SENDGRID';
    if (host.includes('brevo')) return 'BREVO';
    if (host.includes('office365') || host.includes('outlook')) return 'OUTLOOK';
    return 'CUSTOM';
  };

  // SMTP Settings
  const [emailProvider, setEmailProvider] = React.useState(detectProvider(initialSettings.smtpHost));
  const [smtpHost, setSmtpHost] = React.useState(initialSettings.smtpHost || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = React.useState(initialSettings.smtpPort || 465);
  const [smtpUser, setSmtpUser] = React.useState(initialSettings.smtpUser || '');
  const [smtpPass, setSmtpPass] = React.useState('');
  const [smtpFrom, setSmtpFrom] = React.useState(initialSettings.smtpFrom || '');

  // Test Email
  const [testRecipient, setTestRecipient] = React.useState('');
  const [isTestingEmail, setIsTestingEmail] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);

  // User creation modal
  const [isNewUserOpen, setIsNewUserOpen] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState('');
  const [newUserEmail, setNewUserEmail] = React.useState('');
  const [newUserRole, setNewUserRole] = React.useState<'ADMIN' | 'SALES'>('SALES');
  const [newUserPassword, setNewUserPassword] = React.useState('Password123!');
  const [isCreatingUser, setIsCreatingUser] = React.useState(false);

  const handleProviderSelect = (prov: string) => {
    setEmailProvider(prov);
    switch (prov) {
      case 'GMAIL':
        setSmtpHost('smtp.gmail.com');
        setSmtpPort(465);
        break;
      case 'RESEND':
        setSmtpHost('smtp.resend.com');
        setSmtpPort(465);
        setSmtpUser((prev: string) => prev || 'resend');
        break;
      case 'SENDGRID':
        setSmtpHost('smtp.sendgrid.net');
        setSmtpPort(587);
        setSmtpUser((prev: string) => prev || 'apikey');
        break;
      case 'BREVO':
        setSmtpHost('smtp-relay.brevo.com');
        setSmtpPort(587);
        break;
      case 'OUTLOOK':
        setSmtpHost('smtp.office365.com');
        setSmtpPort(587);
        break;
      default:
        break;
    }
  };

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

      if (smtpHost && smtpUser) {
        payload.smtpHost = smtpHost;
        payload.smtpPort = Number(smtpPort);
        payload.smtpUser = smtpUser;
        if (smtpPass) {
          payload.smtpPass = smtpPass;
        }
        payload.smtpFrom = smtpFrom || email;
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        if (json.data.smtpHost) setSmtpHost(json.data.smtpHost);
        if (json.data.smtpPort) setSmtpPort(json.data.smtpPort);
        if (json.data.smtpUser) setSmtpUser(json.data.smtpUser);
        if (json.data.smtpFrom) setSmtpFrom(json.data.smtpFrom);
        setSmtpPass('');

        setToast({
          type: 'success',
          title: 'Settings Saved Successfully',
          description: 'Company branding, regional rates, and email configuration are up to date.',
        });
      } else {
        setToast({
          type: 'error',
          title: 'Failed to Save Settings',
          description: json.error?.message || 'An error occurred during save.',
        });
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setToast({
        type: 'error',
        title: 'Connection Error',
        description: 'Unable to reach the server. Please check your connection.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmailConnection = async () => {
    if (!testRecipient) {
      setToast({
        type: 'error',
        title: 'Recipient Required',
        description: 'Please enter a valid destination email to send the test verification.',
      });
      return;
    }

    setIsTestingEmail(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testRecipient,
          host: smtpHost || undefined,
          port: Number(smtpPort) || undefined,
          user: smtpUser || undefined,
          pass: smtpPass || undefined,
          from: smtpFrom || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, message: json.data.message });
        setToast({
          type: 'success',
          title: 'Real Email Dispatched!',
          description: `Test email was delivered to ${testRecipient}. Check your inbox!`,
        });
      } else {
        const errorMsg = json.error?.message || 'Email test failed';
        setTestResult({ success: false, message: errorMsg });
        setToast({
          type: 'error',
          title: 'Email Delivery Failed',
          description: errorMsg,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test request error';
      setTestResult({ success: false, message: msg });
      setToast({
        type: 'error',
        title: 'Test Error',
        description: msg,
      });
    } finally {
      setIsTestingEmail(false);
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
        setToast({
          type: 'success',
          title: 'Team Member Added',
          description: `${json.data.fullName} can now log in with their credentials.`,
        });
      } else {
        setToast({
          type: 'error',
          title: 'Failed to Create User',
          description: json.error?.message || 'User creation error.',
        });
      }
    } catch (err) {
      console.error('Create user error:', err);
      setToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create team member.',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Floating Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System & Company Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure company branding, encrypted email credentials, regional taxes, and team permissions.
          </p>
        </div>
      </div>

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
              <label className="block font-semibold text-slate-700 mb-1">Official Company Email</label>
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
                className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-900 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs"
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

        {/* Encrypted SMTP & Real Email Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0040e0]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Real Email Connection (SMTP)
              </h2>
            </div>
            <Badge variant={settings.isSmtpConfigured ? 'accepted' : 'actionNeeded'} className="self-start sm:self-auto">
              {settings.isSmtpConfigured ? '✓ Real Email Connected' : 'Mock Delivery Mode'}
            </Badge>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded text-xs text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Connect Your Real Email to Send Real Proformas & Reminders to Anyone</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Select your email provider below. Your configuration is saved directly to the database and encrypted with AES-256-GCM.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">Choose Email Provider Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'GMAIL', name: 'Gmail / Workspace' },
                { id: 'RESEND', name: 'Resend' },
                { id: 'SENDGRID', name: 'SendGrid' },
                { id: 'BREVO', name: 'Brevo (Sendinblue)' },
                { id: 'OUTLOOK', name: 'Outlook / Office 365' },
                { id: 'CUSTOM', name: 'Custom SMTP' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleProviderSelect(p.id)}
                  className={`p-2 rounded text-xs font-semibold border transition-all text-center cursor-pointer ${
                    emailProvider === p.id
                      ? 'border-[#0040e0] bg-[#e5eeff] text-[#0040e0] ring-2 ring-[#0040e0]/20 shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Host</label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Port</label>
              <Input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="465 (SSL) or 587 (TLS)"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {emailProvider === 'GMAIL' ? 'Your Gmail Address' : 'SMTP Username / API Key'}
              </label>
              <Input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder={emailProvider === 'GMAIL' ? 'youremail@gmail.com' : 'username or apikey'}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {emailProvider === 'GMAIL'
                  ? 'Google App Password (16 letters)'
                  : 'SMTP Password / API Token'}
              </label>
              <Input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={settings.isSmtpConfigured && !smtpPass ? '•••••••••••••••• (Encrypted in DB)' : 'Enter password / app token'}
              />
              {emailProvider === 'GMAIL' && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Tip: Generate a 16-letter App Password at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#0040e0] underline font-semibold">Google App Passwords</a>.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Sender "From" Display Header (Optional)</label>
              <Input
                value={smtpFrom}
                onChange={(e) => setSmtpFrom(e.target.value)}
                placeholder={`"HL Associates" <${smtpUser || email}>`}
              />
            </div>
          </div>

          {/* Test SMTP & Send Real Test Email Box */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 mt-4">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#0040e0]" />
              <span>Verify & Send Real Test Email</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Enter recipient email (e.g. your personal email)..."
                className="h-9 flex-1 rounded border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestEmailConnection}
                isLoading={isTestingEmail}
                className="shrink-0"
              >
                Send Test Email
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded text-xs font-medium flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {currentUserRole === 'ADMIN' && (
          <div className="flex justify-end sticky bottom-4 z-10 bg-surface-app/90 backdrop-blur-sm p-2 rounded-lg">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="w-full sm:w-auto shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>Save Settings & Connect Email</span>
                </>
              )}
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
              className="h-9 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-900 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs"
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
