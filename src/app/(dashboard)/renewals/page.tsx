import * as React from 'react';
import { db } from '@/db/client';
import { RenewalsView } from '@/features/renewals/components/RenewalsView';

export const dynamic = 'force-dynamic';

export default async function RenewalsPage() {
  const clientServices = await db.clientService.findMany({
    where: {
      status: { in: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'] },
    },
    include: {
      client: {
        select: {
          id: true,
          clientNumber: true,
          companyName: true,
          email: true,
          phone: true,
          assignedTo: { select: { fullName: true } },
        },
      },
      renewals: {
        orderBy: { scheduledDate: 'desc' },
      },
    },
    orderBy: { expiryDate: 'asc' },
  });

  return <RenewalsView initialServices={JSON.parse(JSON.stringify(clientServices))} />;
}
