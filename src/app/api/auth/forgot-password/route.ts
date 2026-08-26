import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // For enterprise security, always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If the email exists in our system, password reset instructions have been dispatched.',
      data: {
        email: email.toLowerCase().trim(),
        userExists: Boolean(user && user.isActive),
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Unable to process password reset request.' } },
      { status: 500 }
    );
  }
}
