import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { ClientServiceStatus } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: {
      serviceNameSnapshot?: string;
      scopeSnapshot?: string | null;
      fee?: number;
      startDate?: Date;
      expiryDate?: Date;
      status?: ClientServiceStatus;
    } = {};

    if (body.serviceNameSnapshot) updateData.serviceNameSnapshot = body.serviceNameSnapshot.trim();
    if (body.scopeSnapshot !== undefined) updateData.scopeSnapshot = body.scopeSnapshot ? body.scopeSnapshot.trim() : null;
    if (body.fee !== undefined) updateData.fee = Number(body.fee);
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);
    if (body.status) updateData.status = body.status as ClientServiceStatus;

    const updated = await db.clientService.update({
      where: { id: params.id },
      data: updateData,
      include: {
        renewals: { orderBy: { scheduledDate: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update service engagement';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    );
  }

  try {
    // Delete associated renewal schedules
    await db.renewal.deleteMany({ where: { clientServiceId: params.id } });
    await db.clientService.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Service engagement deleted successfully', id: params.id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete service engagement';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
