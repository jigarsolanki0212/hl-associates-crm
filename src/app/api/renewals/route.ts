import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
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

    return NextResponse.json({ success: true, data: clientServices });
  } catch (error) {
    console.error('Renewals list error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
