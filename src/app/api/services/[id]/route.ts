import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await db.service.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update service';
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
    // Check if linked to client services
    const activeCount = await db.clientService.count({ where: { serviceId: params.id } });
    if (activeCount > 0) {
      // Soft-deactivate instead of hard deleting to preserve historical client records
      await db.service.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        data: { message: `Service has ${activeCount} active client engagement(s) and was deactivated to preserve compliance history.`, deactivated: true },
      });
    }

    await db.service.delete({ where: { id: params.id } });
    return NextResponse.json({
      success: true,
      data: { message: 'Service deleted successfully', id: params.id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete service';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
