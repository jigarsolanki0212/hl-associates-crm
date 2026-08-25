import * as React from 'react';
import { db } from '@/db/client';
import { ClientsView } from '@/features/clients/components/ClientsView';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const [services, users] = await Promise.all([
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
  ]);

  return <ClientsView initialServices={services} initialUsers={users} />;
}
