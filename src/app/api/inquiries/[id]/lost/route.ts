import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { UpdateInquiryUseCase } from '@/server/use-cases/inquiries/UpdateInquiryUseCase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const updated = await UpdateInquiryUseCase.markLost(params.id, user.id, body.reason);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark inquiry lost';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
