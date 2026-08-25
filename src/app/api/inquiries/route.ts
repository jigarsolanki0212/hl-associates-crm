import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { CreateInquiryUseCase } from '@/server/use-cases/inquiries/CreateInquiryUseCase';
import { InquiryStatus, Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status') as InquiryStatus | null;
  const serviceId = searchParams.get('serviceId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  const where: Prisma.InquiryWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (serviceId) {
    where.serviceId = serviceId;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
      { inquiryNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [total, inquiries] = await Promise.all([
      db.inquiry.count({ where }),
      db.inquiry.findMany({
        where,
        include: {
          service: true,
          assignedTo: {
            select: { id: true, fullName: true, avatarUrl: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Aggregate counts for summary KPI cards
    const [totalCount, newCount, proformaSentCount, acceptedCount] = await Promise.all([
      db.inquiry.count(),
      db.inquiry.count({ where: { status: InquiryStatus.NEW } }),
      db.inquiry.count({ where: { status: InquiryStatus.PROFORMA_SENT } }),
      db.inquiry.count({ where: { status: InquiryStatus.ACCEPTED } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          total: totalCount,
          new: newCount,
          proformaSent: proformaSentCount,
          accepted: acceptedCount,
        },
      },
    });
  } catch (error) {
    console.error('Inquiries GET error:', error);
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
    const inquiry = await CreateInquiryUseCase.execute(body, user.id);
    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create inquiry';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
