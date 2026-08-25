import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { RoleName } from '@prisma/client';

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Users query error:', error);
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
    const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'User with this email already exists' } }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password || 'Password123!');

    const newUser = await db.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        fullName: body.fullName.trim(),
        passwordHash,
        role: body.role === 'ADMIN' ? RoleName.ADMIN : RoleName.SALES,
        avatarUrl: body.avatarUrl || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'User creation failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
