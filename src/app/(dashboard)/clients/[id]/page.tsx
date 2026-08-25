import * as React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { ClientDetailView } from '@/features/clients/components/ClientDetailView';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: true,
      services: {
        include: {
          renewals: { orderBy: { scheduledDate: 'desc' } },
        },
        orderBy: { expiryDate: 'asc' },
      },
      proformas: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      },
      followUps: {
        orderBy: { dueDate: 'asc' },
      },
      activityLogs: {
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!client) {
    notFound();
  }

  return <ClientDetailView client={JSON.parse(JSON.stringify(client))} />;
}
