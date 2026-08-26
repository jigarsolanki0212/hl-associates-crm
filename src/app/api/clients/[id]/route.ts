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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required to delete clients' } },
      { status: 403 }
    );
  }

  try {
    // Delete renewals belonging to client's services
    const clientServices = await db.clientService.findMany({
      where: { clientId: params.id },
      select: { id: true },
    });
    const serviceIds = clientServices.map((s) => s.id);
    if (serviceIds.length > 0) {
      await db.renewal.deleteMany({ where: { clientServiceId: { in: serviceIds } } });
      await db.clientService.deleteMany({ where: { clientId: params.id } });
    }

    // Delete follow-ups, notes, and activity logs
    await db.followUp.deleteMany({ where: { clientId: params.id } });
    await db.activityLog.deleteMany({ where: { clientId: params.id } });

    await db.client.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Client and associated records deleted successfully', id: params.id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete client';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
