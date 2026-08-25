import * as React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/db/client';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Preload services & users for global "+ New Inquiry" modal
  const [services, users, notifications] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <AppShell
      user={user}
      servicesList={services}
      usersList={users}
      initialNotifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        link: n.link,
        type: n.type as 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT',
        readAt: n.readAt,
        createdAt: n.createdAt,
      }))}
    >
      {children}
    </AppShell>
  );
}
