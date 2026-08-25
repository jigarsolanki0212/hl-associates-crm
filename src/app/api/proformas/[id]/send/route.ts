import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { CreateProformaUseCase } from '@/server/use-cases/proformas/CreateProformaUseCase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await CreateProformaUseCase.send(params.id, user.id, body.recipientEmail);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send proforma';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
