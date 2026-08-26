import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Notifications query error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body implies mark all as read
    }

    if (body.id) {
      // Toggle or set specific notification
      const readAt = body.read === false ? null : new Date();
      await db.notification.updateMany({
        where: { id: body.id, userId: user.id },
        data: { readAt },
      });
      return NextResponse.json({ success: true, message: 'Notification status updated' });
    }

    // Mark all as read for this user
    await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await db.notification.deleteMany({
        where: { id, userId: user.id },
      });
      return NextResponse.json({ success: true, message: 'Notification deleted' });
    }

    // If no id, delete all read notifications
    await db.notification.deleteMany({
      where: { userId: user.id, readAt: { not: null } },
    });

    return NextResponse.json({ success: true, message: 'All read notifications cleared' });
  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
