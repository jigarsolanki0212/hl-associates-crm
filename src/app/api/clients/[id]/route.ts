import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const client = await db.client.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
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
        inquiries: {
          orderBy: { createdAt: 'desc' },
        },
        activityLogs: {
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('Client detail error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await db.client.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
