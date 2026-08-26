import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { getNextSequenceNumber } from '@/lib/sequences/sequenceGenerator';
import { ClientStatus, Prisma } from '@prisma/client';
import { addDays } from 'date-fns';

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status') as ClientStatus | null;
  const serviceId = searchParams.get('serviceId');
  const assignedToId = searchParams.get('assignedToId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const isExport = searchParams.get('export') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = isExport ? 0 : (page - 1) * limit;
  const take = isExport ? 5000 : limit;

  const where: Prisma.ClientWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (assignedToId) {
    where.assignedToId = assignedToId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      where.createdAt.gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      where.createdAt.lte = e;
    }
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
      { clientNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (serviceId) {
    where.services = {
      some: { serviceId },
    };
  }

  try {
    const [total, clients] = await Promise.all([
      db.client.count({ where }),
      db.client.findMany({
        where,
        include: {
          services: {
            orderBy: { expiryDate: 'asc' },
          },
          assignedTo: {
            select: { id: true, fullName: true, avatarUrl: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    // KPI Metrics for Clients Page (Screenshot 4)
    const now = new Date();
    const in30Days = addDays(now, 30);

    const [totalClients, activeServicesCount, expiringSoonCount, expiredCount] = await Promise.all([
      db.client.count(),
      db.clientService.count({ where: { status: 'ACTIVE' } }),
      db.clientService.count({
        where: {
          status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
          expiryDate: { gte: now, lte: in30Days },
        },
      }),
      db.clientService.count({
        where: {
          expiryDate: { lt: now },
          status: { not: 'RENEWED' },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clients,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalClients,
          activeServices: activeServicesCount,
          expiringSoon: expiringSoonCount,
          expired: expiredCount,
        },
      },
    });
  } catch (error) {
    console.error('Clients GET error:', error);
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
    const clientNumber = await getNextSequenceNumber('CLIENT');

    const client = await db.client.create({
      data: {
        clientNumber,
        companyName: body.companyName.trim(),
        logoUrl: body.logoUrl?.trim() || null,
        contactName: body.contactName.trim(),
        contactTitle: body.contactTitle || null,
        email: body.email.toLowerCase().trim(),
        phone: body.phone || null,
        address: body.address || null,
        taxId: body.taxId || null,
        status: body.status || ClientStatus.ACTIVE,
        assignedToId: body.assignedToId || user.id,
      },
    });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
