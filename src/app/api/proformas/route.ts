import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { CreateProformaUseCase } from '@/server/use-cases/proformas/CreateProformaUseCase';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const proformas = await db.proforma.findMany({
      include: {
        items: true,
        inquiry: { select: { id: true, inquiryNumber: true, companyName: true, email: true } },
        client: { select: { id: true, clientNumber: true, companyName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: proformas });
  } catch (error) {
    console.error('Proformas list error:', error);
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
    const proforma = await CreateProformaUseCase.execute(body, user.id);
    return NextResponse.json({ success: true, data: proforma }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create proforma';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
