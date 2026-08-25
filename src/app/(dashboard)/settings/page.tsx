import * as React from 'react';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { SettingsView } from '@/features/settings/components/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const [settings, users] = await Promise.all([
    db.companySettings.findUnique({ where: { id: 'default' } }),
    db.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return (
    <SettingsView
      initialSettings={JSON.parse(JSON.stringify(settings || {}))}
      initialUsers={JSON.parse(JSON.stringify(users || []))}
      currentUserRole={user.role}
    />
  );
}
