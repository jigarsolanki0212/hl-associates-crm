import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const services = await db.service.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('Services list error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const service = await db.service.create({
      data: {
        code: body.code.toUpperCase().trim(),
        name: body.name.trim(),
        category: body.category || 'General Compliance',
        description: body.description || '',
        detailedScope: body.detailedScope || '',
        suggestedPriceMin: body.suggestedPriceMin ? Number(body.suggestedPriceMin) : null,
        suggestedPriceMax: body.suggestedPriceMax ? Number(body.suggestedPriceMax) : null,
        pricingType: body.pricingType || 'RANGE',
        defaultDuration: body.defaultDuration ? Number(body.defaultDuration) : 12,
        durationUnit: body.durationUnit || 'MONTHS',
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create service';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
