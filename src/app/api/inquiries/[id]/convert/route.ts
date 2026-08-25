import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ConvertInquiryToClientUseCase } from '@/server/use-cases/inquiries/ConvertInquiryToClientUseCase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await ConvertInquiryToClientUseCase.execute(
      {
        inquiryId: params.id,
        startDate: body.startDate,
        durationValue: body.durationValue,
        durationUnit: body.durationUnit,
        customFee: body.customFee,
        currency: body.currency,
        certificateNumber: body.certificateNumber,
      },
      user.id
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
