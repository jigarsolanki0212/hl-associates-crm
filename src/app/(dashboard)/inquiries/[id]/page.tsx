import * as React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { InquiryDetailView } from '@/features/inquiries/components/InquiryDetailView';

export const dynamic = 'force-dynamic';

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const [inquiry, services, users] = await Promise.all([
    db.inquiry.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        assignedTo: true,
        proformas: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        activityLogs: {
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        convertedClient: true,
      },
    }),
    db.service.findMany({ where: { isActive: true }, select: { id: true, name: true, code: true, suggestedPriceMin: true } }),
    db.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true } }),
  ]);

  if (!inquiry) {
    notFound();
  }

  return (
    <InquiryDetailView
      inquiry={JSON.parse(JSON.stringify(inquiry))}
      services={JSON.parse(JSON.stringify(services))}
      users={JSON.parse(JSON.stringify(users))}
    />
  );
}
