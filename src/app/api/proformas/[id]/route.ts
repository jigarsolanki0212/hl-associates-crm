import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const proforma = await db.proforma.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        inquiry: true,
        client: true,
        emailEvents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!proforma) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Proforma not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: proforma });
  } catch (error) {
    console.error('Proforma detail error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
