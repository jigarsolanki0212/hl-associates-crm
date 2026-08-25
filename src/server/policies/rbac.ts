import { RoleName } from '@prisma/client';
import { Permission, Permissions } from './permissions';

const ROLE_PERMISSIONS: Record<RoleName, readonly Permission[]> = {
  ADMIN: Object.values(Permissions),
  SALES: [
    Permissions.DASHBOARD_VIEW,
    Permissions.INQUIRIES_VIEW,
    Permissions.INQUIRIES_CREATE,
    Permissions.INQUIRIES_EDIT,
    Permissions.INQUIRIES_ACCEPT,
    Permissions.INQUIRIES_LOSE,
    Permissions.INQUIRIES_REOPEN,
    Permissions.INQUIRIES_CONVERT,
    Permissions.PROFORMAS_VIEW,
    Permissions.PROFORMAS_CREATE,
    Permissions.PROFORMAS_SEND,
    Permissions.PROFORMAS_DOWNLOAD,
    Permissions.CLIENTS_VIEW,
    Permissions.CLIENTS_EDIT,
    Permissions.CLIENTS_EXPORT,
    Permissions.SERVICES_VIEW,
    Permissions.RENEWALS_VIEW,
    Permissions.RENEWALS_SEND,
    Permissions.RENEWALS_EXECUTE,
    Permissions.FOLLOWUPS_MANAGE,
    Permissions.ACTIVITY_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
  ],
};

export function hasPermission(role: RoleName, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function assertPermission(role: RoleName, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: Role '${role}' lacks permission '${permission}'`);
  }
}
