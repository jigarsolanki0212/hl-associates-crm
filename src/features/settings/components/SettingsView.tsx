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
  Unlock,
  Plus,
  Send,
  Sparkles,
  AlertCircle,
  Loader2,
  Save,
  Edit,
  X,
  ShieldCheck,
  Check,
  Trash2,
  UserCheck,
  UserX,
  Key,
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<ToastMessage | null>(null);

  // Form states
  const [companyName, setCompanyName] = React.useState(initialSettings.companyName || 'HL Associates');
  const [brandTagline, setBrandTagline] = React.useState(initialSettings.brandTagline || 'Enterprise Regulatory Compliance Suite');
  const [email, setEmail] = React.useState(initialSettings.email || 'bdm@hl-associates.in');
  const [phone, setPhone] = React.useState(initialSettings.phone || '+91 98988 96585');
  const [address, setAddress] = React.useState(initialSettings.address || '602, 603 & 606 Rashmi Growth Hub, Odhav to Vastral Road, S.P. Ring Road, Odhav, Ahmedabad, Gujarat 382415');
  const [taxId, setTaxId] = React.useState(initialSettings.taxId || 'GSTIN-24AABCH1234F1Z5');
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

  // User edit / amend modal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [editUserName, setEditUserName] = React.useState('');
  const [editUserEmail, setEditUserEmail] = React.useState('');
  const [editUserRole, setEditUserRole] = React.useState<'ADMIN' | 'SALES'>('SALES');
  const [editUserPassword, setEditUserPassword] = React.useState('');
  const [isUpdatingUser, setIsUpdatingUser] = React.useState(false);

  // User deletion confirmation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingUser, setDeletingUser] = React.useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = React.useState(false);

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

  const handleCancelEditing = () => {
    setCompanyName(settings.companyName || 'HL Associates');
    setBrandTagline(settings.brandTagline || 'Enterprise Regulatory Compliance Suite');
    setEmail(settings.email || 'bdm@hl-associates.in');
    setPhone(settings.phone || '+91 98988 96585');
    setAddress(settings.address || '602, 603 & 606 Rashmi Growth Hub, Odhav to Vastral Road, S.P. Ring Road, Odhav, Ahmedabad, Gujarat 382415');
    setTaxId(settings.taxId || 'GSTIN-24AABCH1234F1Z5');
    setCurrency(settings.currency || 'INR');
    setDefaultTaxRate(settings.defaultTaxRate ?? 18);
    setSmtpPass('');
    setIsEditing(false);
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
        setIsEditing(false);

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

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUsers((prev) => prev.map((u: any) => (u.id === userId ? { ...u, isActive: !currentActive } : u)));
        setToast({
          type: 'success',
          title: !currentActive ? 'Account Activated' : 'Account Suspended/Deactivated',
          description: `User status changed to ${!currentActive ? 'Active' : 'Inactive'}.`,
        });
      } else {
        setToast({
          type: 'error',
          title: 'Status Update Failed',
          description: json.error?.message || 'Could not update user status.',
        });
      }
    } catch (err) {
      console.error('Toggle user active error:', err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditUserClick = (u: any) => {
    setEditingUser(u);
    setEditUserName(u.fullName || '');
    setEditUserEmail(u.email || '');
    setEditUserRole(u.role === 'ADMIN' ? 'ADMIN' : 'SALES');
    setEditUserPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdatingUser(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        fullName: editUserName,
        email: editUserEmail,
        role: editUserRole,
      };
      if (editUserPassword.trim().length >= 6) {
        payload.password = editUserPassword.trim();
      }
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUsers((prev) => prev.map((u: any) => (u.id === editingUser.id ? json.data : u)));
        setEditingUser(null);
        setToast({
          type: 'success',
          title: 'User Profile Updated',
          description: 'Team member details and permissions amended successfully.',
        });
      } else {
        setToast({
          type: 'error',
          title: 'Update Failed',
          description: json.error?.message || 'Could not update user profile.',
        });
      }
    } catch (err) {
      console.error('Update user error:', err);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeletingUser(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUsers((prev) => prev.filter((u: any) => u.id !== userId));
        setDeletingUser(null);
        setToast({
          type: 'success',
          title: 'User Account Deleted',
          description: 'Team member account removed successfully.',
        });
      } else {
        setToast({
          type: 'error',
          title: 'Deletion Failed',
          description: json.error?.message || 'Could not delete user account.',
        });
      }
    } catch (err) {
      console.error('Delete user error:', err);
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full max-w-6xl">
      {/* Floating Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              System & Company Settings
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border ${
              isEditing ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isEditing ? <Unlock className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3 text-slate-500" />}
              {isEditing ? 'Editing Enabled' : 'View Mode (Protected)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure company branding, encrypted email credentials, regional taxes, and team permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold shadow-xs"
            >
              <Edit className="w-4 h-4 mr-1.5" /> Edit Settings
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelEditing}
                disabled={isSaving}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                isLoading={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save All Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-6">
        {/* Company Branding & Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0040e0] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Company Branding & Regulatory Identity
              </h2>
            </div>
            {isEditing && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Editable
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!isEditing}
                required
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Mission</label>
              <Input
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Company Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                required
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                required
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Address (Printed on Proformas & Official Communications)
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
                required
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax Identification</label>
              <Input
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                disabled={!isEditing}
                required
                className={!isEditing ? 'bg-slate-50 text-slate-700 font-medium cursor-not-allowed' : ''}
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Localization */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
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
                disabled={!isEditing}
                className={`h-9 w-full rounded-lg border border-slate-300 px-2.5 text-xs text-slate-900 transition-all focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20 shadow-xs ${
                  !isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : 'bg-white'
                }`}
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
                disabled={!isEditing}
                min="0"
                max="100"
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Timezone (Milestone Engine)</label>
              <Input value={companyTimezone} disabled className="bg-slate-50 text-slate-500 font-mono cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Encrypted SMTP & Real Email Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0040e0] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Real Email Connection (SMTP)
              </h2>
            </div>
            <Badge variant={settings.isSmtpConfigured ? 'accepted' : 'actionNeeded'} className="self-start sm:self-auto">
              {settings.isSmtpConfigured ? '✓ Real Email Connected' : 'Mock Delivery Mode'}
            </Badge>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-slate-700 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Connect Your Real Email to Send Real Proformas & Reminders to Anyone</span>
            </div>
            <p className="text-[11px] text-slate-600">
              For Gmail, generate an <strong>App Password</strong> at Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
            </p>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quick Email Provider Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              {[
                { id: 'GMAIL', label: 'Gmail' },
                { id: 'RESEND', label: 'Resend' },
                { id: 'SENDGRID', label: 'SendGrid' },
                { id: 'BREVO', label: 'Brevo' },
                { id: 'OUTLOOK', label: 'Outlook / 365' },
                { id: 'CUSTOM', label: 'Custom SMTP' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  disabled={!isEditing}
                  onClick={() => handleProviderSelect(p.id)}
                  className={`p-2 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                    emailProvider === p.id
                      ? 'bg-[#0040e0] text-white border-[#0040e0] font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Server Host</label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                disabled={!isEditing}
                placeholder="smtp.gmail.com"
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Port</label>
              <Input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                disabled={!isEditing}
                placeholder="465 (SSL) or 587 (TLS)"
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SMTP Username / Email</label>
              <Input
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                disabled={!isEditing}
                placeholder="you@yourdomain.com"
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                SMTP App Password {settings.isSmtpConfigured && !smtpPass && '(Encrypted in Database)'}
              </label>
              <Input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                disabled={!isEditing}
                placeholder={settings.isSmtpConfigured ? '•••••••••••••••• (Leave blank to keep current)' : 'Enter App Password'}
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Sender &ldquo;From&rdquo; Header</label>
              <Input
                value={smtpFrom}
                onChange={(e) => setSmtpFrom(e.target.value)}
                disabled={!isEditing}
                placeholder={`"HL Associates" <${smtpUser || email}>`}
                className={!isEditing ? 'bg-slate-50 text-slate-700 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          {/* Test Real Email Box */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <label className="block font-semibold text-slate-800 text-xs">Verify Real Email Dispatch</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Enter any destination email (e.g. your personal email)"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="flex-1 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleTestEmailConnection}
                isLoading={isTestingEmail}
                className="shrink-0"
              >
                <Send className="w-3.5 h-3.5 mr-1.5 text-[#0040e0]" /> Send Test Verification
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Members & RBAC */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Team Members & Access Control
                </h2>
                <p className="text-xs text-slate-500">Manage CRM user logins and role-based permissions.</p>
              </div>
            </div>

            {currentUserRole === 'ADMIN' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsNewUserOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Team Member
              </Button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0040e0]/10 text-[#0040e0] font-bold flex items-center justify-center shrink-0 text-sm">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{u.fullName}</span>
                      <Badge variant={u.role === 'ADMIN' ? 'accepted' : 'normal'}>{u.role}</Badge>
                    </div>
                    <div className="text-slate-500 text-[11px]">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleUserActive(u.id, u.isActive)}
                    disabled={currentUserRole !== 'ADMIN'}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                      u.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Click to toggle user status"
                  >
                    {u.isActive ? <UserCheck className="w-3 h-3 text-emerald-600" /> : <UserX className="w-3 h-3 text-slate-500" />}
                    <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                  </button>

                  {currentUserRole === 'ADMIN' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditUserClick(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit user details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete user account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Bar when Editing */}
        {isEditing && (
          <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <Save className="w-4 h-4 text-[#0040e0]" />
              <span>You have unsaved changes in settings</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelEditing}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Settings Now
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Add User Modal */}
      <Modal
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        title="Add New Team Member"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <Input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="ramesh@hlassociates.com"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role *</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'ADMIN' | 'SALES')}
              className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
            >
              <option value="SALES">SALES - Commercial Rep (Inquiries, Quotes, Clients)</option>
              <option value="ADMIN">ADMIN - Full System & Financial Access</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Temporary Initial Password *</label>
            <Input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewUserOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingUser}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit / Amend User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit Team Member: ${editingUser.fullName}` : 'Edit Team Member'}
        size="md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-3 sm:space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <Input
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <Input
              type="email"
              value={editUserEmail}
              onChange={(e) => setEditUserEmail(e.target.value)}
              placeholder="ramesh@hlassociates.com"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role *</label>
            <select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value as 'ADMIN' | 'SALES')}
              className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
            >
              <option value="SALES">SALES - Commercial Rep (Inquiries, Quotes, Clients)</option>
              <option value="ADMIN">ADMIN - Full System & Financial Access</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
            </label>
            <Input
              type="password"
              value={editUserPassword}
              onChange={(e) => setEditUserPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingUser}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Confirm User Account Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to permanently delete account <strong className="text-slate-900">{deletingUser?.fullName}</strong> ({deletingUser?.email})?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
            This will terminate their active sessions. Any inquiries or clients assigned to them will remain safe.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setDeletingUser(null)}
              disabled={isDeletingUser}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deletingUser && handleDeleteUser(deletingUser.id)}
              isLoading={isDeletingUser}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
