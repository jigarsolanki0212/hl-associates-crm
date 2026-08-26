import * as React from 'react';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { decryptString } from '@/lib/crypto/encryption';
import { redirect } from 'next/navigation';
import { SettingsView } from '@/features/settings/components/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const [rawSettings, users] = await Promise.all([
    db.companySettings.findUnique({ where: { id: 'default' } }),
    db.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  let smtpHost = '';
  let smtpPort = 587;
  let smtpUser = '';
  let smtpFrom = '';

  if (rawSettings?.smtpEncryptedConfig) {
    try {
      const decrypted = decryptString(rawSettings.smtpEncryptedConfig);
      const parsed = JSON.parse(decrypted);
      smtpHost = parsed.host || '';
      smtpPort = Number(parsed.port) || 587;
      smtpUser = parsed.user || '';
      smtpFrom = parsed.from || '';
    } catch (e) {
      console.error('Failed to decrypt SMTP on settings page load:', e);
    }
  }

  const initialSettings = {
    id: rawSettings?.id || 'default',
    companyName: rawSettings?.companyName || 'HL Associates',
    brandTagline: rawSettings?.brandTagline || 'Enterprise Regulatory Compliance Suite',
    email: rawSettings?.email || 'compliance@hlassociates.com',
    phone: rawSettings?.phone || '+91 98765 43210',
    address: rawSettings?.address || 'Suite 400, Regulatory Tower, BKC, Mumbai 400051',
    taxId: rawSettings?.taxId || 'GSTIN-27AABCH1234F1Z5',
    currency: rawSettings?.currency || 'INR',
    defaultTaxRate: rawSettings?.defaultTaxRate ?? 18,
    companyTimezone: rawSettings?.companyTimezone || 'Asia/Kolkata',
    isSmtpConfigured: !!(rawSettings?.isSmtpConfigured && smtpUser),
    smtpHost,
    smtpPort,
    smtpUser,
    smtpFrom,
    renewalReminderDays: rawSettings?.renewalReminderDays || [60, 30, 7, 0],
    updatedAt: rawSettings?.updatedAt,
  };

  return (
    <SettingsView
      initialSettings={initialSettings}
      initialUsers={JSON.parse(JSON.stringify(users || []))}
      currentUserRole={user.role}
    />
  );
}
