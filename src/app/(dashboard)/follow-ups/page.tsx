import * as React from 'react';
import { db } from '@/db/client';
import { FollowUpsView } from '@/features/follow-ups/components/FollowUpsView';

export const dynamic = 'force-dynamic';

export default async function FollowUpsPage() {
  const followUps = await db.followUp.findMany({
    include: {
      inquiry: true,
      client: true,
      assignedTo: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  return <FollowUpsView initialFollowUps={JSON.parse(JSON.stringify(followUps))} />;
}
