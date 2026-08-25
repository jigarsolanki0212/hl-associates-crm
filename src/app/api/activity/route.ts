import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const action = searchParams.get('action');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  try {
    const logs = await db.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        inquiry: { select: { id: true, inquiryNumber: true, companyName: true } },
        client: { select: { id: true, clientNumber: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Activity logs query error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
