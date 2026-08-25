import { getSession, SessionUser } from '@/lib/auth/session';
import { Permission } from './permissions';
import { assertPermission } from './rbac';

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth();
  assertPermission(user.role, permission);
  return user;
}
