import * as React from 'react';
import { db } from '@/db/client';
import { ServicesView } from '@/features/services/components/ServicesView';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return <ServicesView initialServices={JSON.parse(JSON.stringify(services))} />;
}
