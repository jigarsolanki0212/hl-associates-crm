import * as React from 'react';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { NotificationsView } from '@/features/notifications/components/NotificationsView';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const now = new Date();
  const in60Days = addDays(now, 60);

  // 1. Query Real Notifications from Database
  const [dbNotifications, expiringServices, recentInquiries] = await Promise.all([
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.clientService.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
        expiryDate: { lte: in60Days },
      },
      include: { client: true },
      orderBy: { expiryDate: 'asc' },
      take: 5,
    }),
    db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  // Combine with live compliance alerts if database notification count is small
  const generatedAlerts = [
    ...dbNotifications.map((n) => ({
      id: n.id,
      type: n.type as 'URGENT' | 'WARNING' | 'SUCCESS' | 'INFO',
      title: n.title,
      message: n.message,
      link: n.link,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    })),
  ];

  // If few records exist, supplement with live database compliance milestone alerts
  if (generatedAlerts.length <= 2) {
    expiringServices.forEach((s) => {
      const isUrgent = s.expiryDate <= addDays(now, 15);
      generatedAlerts.push({
        id: `gen-exp-${s.id}`,
        type: isUrgent ? 'URGENT' : 'WARNING',
        title: isUrgent ? 'Urgent Compliance Expiration Alert' : 'Upcoming Service Renewal Notice',
        message: `${s.client.companyName} (${s.serviceNameSnapshot}) regulatory certification expires on ${s.expiryDate.toISOString().slice(0, 10)}. Immediate audit liaison recommended.`,
        link: `/clients/${s.clientId}`,
        readAt: null,
        createdAt: s.createdAt.toISOString(),
      });
    });

    recentInquiries.forEach((inq) => {
      generatedAlerts.push({
        id: `gen-inq-${inq.id}`,
        type: inq.status === 'ACCEPTED' ? 'SUCCESS' : 'INFO',
        title: inq.status === 'ACCEPTED' ? 'Commercial Proposal Accepted' : 'New Regulatory Inquiry Logged',
        message: `Inquiry ${inq.inquiryNumber} for ${inq.companyName} is in ${inq.status} status. Assigned for compliance review.`,
        link: `/inquiries/${inq.id}`,
        readAt: null,
        createdAt: inq.createdAt.toISOString(),
      });
    });
  }

  // Deduplicate and sort by date
  const finalNotifications = generatedAlerts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return <NotificationsView initialNotifications={finalNotifications} />;
}
