import { describe, it, expect } from 'vitest';
import { calculateExpiryDate, getDaysRemaining, getRenewalUrgencyStatus } from '@/lib/dates/expiryCalculator';
import { encryptString, decryptString } from '@/lib/crypto/encryption';
import { hasPermission } from '@/server/policies/rbac';
import { Permissions } from '@/server/policies/permissions';
import { RoleName } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

describe('Comprehensive CRM Workflows & Integration Tests', () => {
  describe('1. Regulatory Expiry & Milestone Calculation Engine', () => {
    it('calculates future expiry correctly based on validity duration', () => {
      const start = new Date('2026-01-01T00:00:00.000Z');
      const expiry = calculateExpiryDate(start, 12, 'MONTHS');
      expect(expiry.getUTCFullYear()).toBe(2027);
      expect(expiry.getUTCMonth()).toBe(0);
    });

    it('categorizes urgency tiers correctly for automated scan', () => {
      expect(getRenewalUrgencyStatus(10)).toBe('URGENT');
      expect(getRenewalUrgencyStatus(25)).toBe('ACTION_NEEDED');
      expect(getRenewalUrgencyStatus(50)).toBe('NORMAL');
      expect(getRenewalUrgencyStatus(-5)).toBe('EXPIRED');
    });

    it('accurately computes positive and overdue remaining days', () => {
      const now = new Date();
      const future = addDays(now, 45);
      const past = subDays(now, 15);

      expect(getDaysRemaining(future.toISOString())).toBeGreaterThanOrEqual(44);
      expect(getDaysRemaining(past.toISOString())).toBeLessThanOrEqual(-14);
    });
  });

  describe('2. Security, Encryption & Credential Protection', () => {
    it('encrypts and recovers arbitrary SMTP JSON credentials with AES-256-GCM', () => {
      const payload = JSON.stringify({
        host: 'smtp.gmail.com',
        port: 465,
        user: 'compliance@hlassociates.com',
        pass: 'abcd-efgh-ijkl-mnop',
      });

      const encrypted = encryptString(payload);
      expect(encrypted).not.toContain('compliance@hlassociates.com');
      expect(encrypted).not.toContain('abcd-efgh-ijkl-mnop');

      const decrypted = decryptString(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed.host).toBe('smtp.gmail.com');
      expect(parsed.user).toBe('compliance@hlassociates.com');
      expect(parsed.pass).toBe('abcd-efgh-ijkl-mnop');
    });
  });

  describe('3. Role-Based Access Control (RBAC) Governance', () => {
    it('allows ADMIN full access to system configuration and user management', () => {
      expect(hasPermission(RoleName.ADMIN, Permissions.SETTINGS_MANAGE)).toBe(true);
      expect(hasPermission(RoleName.ADMIN, Permissions.USERS_MANAGE)).toBe(true);
      expect(hasPermission(RoleName.ADMIN, Permissions.INQUIRIES_CREATE)).toBe(true);
      expect(hasPermission(RoleName.ADMIN, Permissions.SERVICES_MANAGE)).toBe(true);
    });

    it('restricts SALES role from modifying core system settings or managing user permissions', () => {
      expect(hasPermission(RoleName.SALES, Permissions.SETTINGS_MANAGE)).toBe(false);
      expect(hasPermission(RoleName.SALES, Permissions.USERS_MANAGE)).toBe(false);
      expect(hasPermission(RoleName.SALES, Permissions.INQUIRIES_VIEW)).toBe(true);
      expect(hasPermission(RoleName.SALES, Permissions.INQUIRIES_CREATE)).toBe(true);
    });
  });
});
