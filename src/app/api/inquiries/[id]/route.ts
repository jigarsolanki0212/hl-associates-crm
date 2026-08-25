import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { UpdateInquiryUseCase } from '@/server/use-cases/inquiries/UpdateInquiryUseCase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const inquiry = await db.inquiry.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        assignedTo: {
          select: { id: true, fullName: true, avatarUrl: true, email: true, role: true },
        },
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
    });

    if (!inquiry) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Inquiry not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Inquiry detail error:', error);
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
    const updated = await UpdateInquiryUseCase.execute(params.id, body, user.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
