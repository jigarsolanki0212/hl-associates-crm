import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { FollowUpStatus, FollowUpType } from '@prisma/client';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const followUps = await db.followUp.findMany({
      include: {
        inquiry: { select: { id: true, inquiryNumber: true, companyName: true, email: true } },
        client: { select: { id: true, clientNumber: true, companyName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: followUps });
  } catch (error) {
    console.error('Follow-ups list error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const followUp = await db.followUp.create({
      data: {
        inquiryId: body.inquiryId || null,
        clientId: body.clientId || null,
        assignedToId: body.assignedToId || user.id,
        type: body.type || FollowUpType.CALL,
        title: body.title,
        notes: body.notes || null,
        dueDate: new Date(body.dueDate),
        status: FollowUpStatus.SCHEDULED,
      },
    });

    return NextResponse.json({ success: true, data: followUp }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create follow-up';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
