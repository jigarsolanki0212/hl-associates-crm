import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { processRenewalReminders } from '@/server/jobs/processRenewalReminders';

export async function POST(request: Request) {
  // Check authorization via header or session
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'hl-associates-crm-cron-secure-token-2026';
  const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;

  let isUserAuthorized = false;
  if (!isCronAuthorized) {
    const user = await getSession();
    if (user && user.role === 'ADMIN') {
      isUserAuthorized = true;
    }
  }

  if (!isCronAuthorized && !isUserAuthorized) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin or CRON_SECRET authorization required' } }, { status: 401 });
  }

  try {
    const result = await processRenewalReminders();
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Job execution failed';
    return NextResponse.json({ success: false, error: { code: 'JOB_FAILED', message } }, { status: 500 });
  }
}
