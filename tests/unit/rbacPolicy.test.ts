import { hasPermission } from '@/server/policies/rbac';
import { Permissions } from '@/server/policies/permissions';
import { RoleName } from '@prisma/client';

describe('RBAC Permission Matrix', () => {
  it('should grant all administrative and configuration permissions to ADMIN', () => {
    expect(hasPermission(RoleName.ADMIN, Permissions.SETTINGS_MANAGE)).toBe(true);
    expect(hasPermission(RoleName.ADMIN, Permissions.USERS_MANAGE)).toBe(true);
    expect(hasPermission(RoleName.ADMIN, Permissions.SERVICES_MANAGE)).toBe(true);
    expect(hasPermission(RoleName.ADMIN, Permissions.INQUIRIES_CREATE)).toBe(true);
    expect(hasPermission(RoleName.ADMIN, Permissions.INQUIRIES_CONVERT)).toBe(true);
  });

  it('should grant sales permissions to SALES role while prohibiting system settings changes', () => {
    expect(hasPermission(RoleName.SALES, Permissions.INQUIRIES_VIEW)).toBe(true);
    expect(hasPermission(RoleName.SALES, Permissions.INQUIRIES_CREATE)).toBe(true);
    expect(hasPermission(RoleName.SALES, Permissions.PROFORMAS_CREATE)).toBe(true);
    expect(hasPermission(RoleName.SALES, Permissions.INQUIRIES_CONVERT)).toBe(true);

    // Forbidden for SALES
    expect(hasPermission(RoleName.SALES, Permissions.SETTINGS_MANAGE)).toBe(false);
    expect(hasPermission(RoleName.SALES, Permissions.USERS_MANAGE)).toBe(false);
    expect(hasPermission(RoleName.SALES, Permissions.SERVICES_MANAGE)).toBe(false);
  });
});
