import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { RoleName } from '@prisma/client';

export const SESSION_COOKIE_NAME = 'hl_session';
export const SESSION_DURATION_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  avatarUrl: string | null;
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
    },
  });

  return sessionToken;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    if (!session.user.isActive) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function destroySession(token?: string): Promise<void> {
  try {
    const cookieStore = cookies();
    const activeToken = token || cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (activeToken) {
      await db.session.deleteMany({
        where: { sessionToken: activeToken },
      });
    }
  } catch (err) {
    console.error('Error destroying session:', err);
  }
}
