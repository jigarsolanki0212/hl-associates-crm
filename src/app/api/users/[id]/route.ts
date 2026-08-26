import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { RoleName } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const updateData: {
      fullName?: string;
      email?: string;
      role?: RoleName;
      isActive?: boolean;
      avatarUrl?: string | null;
      passwordHash?: string;
    } = {};

    if (body.fullName) updateData.fullName = body.fullName.trim();
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.role) updateData.role = body.role === 'ADMIN' ? RoleName.ADMIN : RoleName.SALES;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl || null;

    // Safety: Prevent suspending primary admin or self account
    if (updateData.isActive === false) {
      const target = await db.user.findUnique({ where: { id: params.id } });
      if (target?.email === 'admin@hlassociates.com' || user.id === params.id) {
        return NextResponse.json(
          { success: false, error: { code: 'BAD_REQUEST', message: 'Cannot suspend the primary administrator or your own active session.' } },
          { status: 400 }
        );
      }
    }

    if (body.password && body.password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(body.password.trim());
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    );
  }

  // Prevent admin from deleting their own active account
  if (user.id === params.id) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Cannot delete your own active session account.' } },
      { status: 400 }
    );
  }

  try {
    // Delete session tokens & unassign or cascade
    await db.session.deleteMany({ where: { userId: params.id } });
    await db.user.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      data: { message: 'User deleted successfully', id: params.id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
