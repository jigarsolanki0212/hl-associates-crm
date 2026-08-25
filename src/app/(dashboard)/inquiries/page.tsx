import * as React from 'react';
import { db } from '@/db/client';
import { InquiriesView } from '@/features/inquiries/components/InquiriesView';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; serviceId?: string; page?: string };
}) {
  const [services, users] = await Promise.all([
    db.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, avatarUrl: true },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  return <InquiriesView initialServices={services} initialUsers={users} searchParams={searchParams} />;
}
