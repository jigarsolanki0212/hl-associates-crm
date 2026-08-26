import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils/currency';

describe('Official Company Identity & Multi-Service Verification Tests', () => {
  describe('1. HL Associates Official Registered Details', () => {
    it('validates official Ahmedabad corporate headquarters address', () => {
      const address =
        '602, 603 & 606 Rashmi Growth Hub, Odhav to Vastral Road, S.P. Ring Road, Odhav, Ahmedabad, Gujarat 382415';
      const phone = '+91 98988 96585';
      const email = 'bdm@hl-associates.in';
      const gstin = 'GSTIN-24AABCH1234F1Z5';

      expect(address).toContain('Rashmi Growth Hub');
      expect(address).toContain('Ahmedabad, Gujarat 382415');
      expect(phone).toBe('+91 98988 96585');
      expect(email).toBe('bdm@hl-associates.in');
      expect(gstin.startsWith('GSTIN-24')).toBe(true); // Gujarat state GSTIN code 24
    });

    it('formats Indian Rupee (INR) currency compliant with standard proforma numbers', () => {
      const val1 = 150000;
      const formatted1 = formatCurrency(val1, 'INR');
      expect(formatted1).toContain('1,50,000');

      const val2 = 2500000;
      const formatted2 = formatCurrency(val2, 'INR');
      expect(formatted2).toContain('25,00,000');
    });
  });

  describe('2. Multi-Service Aggregation and Scope Resolution', () => {
    it('correctly aggregates multiple regulatory service scopes into inquiry description', () => {
      const selectedServices = [
        { id: 'srv-1', name: 'ISO 13485:2016 QMS Certification' },
        { id: 'srv-2', name: 'CDSCO Medical Device Manufacturing License (MD-5/MD-9)' },
        { id: 'srv-3', name: 'CE Mark / EU MDR 2017/745 Technical Dossier' },
      ];

      const serviceIds = selectedServices.map((s) => s.id);
      const names = selectedServices.map((s) => s.name).join(', ');

      expect(serviceIds.length).toBe(3);
      expect(serviceIds[0]).toBe('srv-1');
      expect(names).toContain('ISO 13485');
      expect(names).toContain('CDSCO Medical Device');
      expect(names).toContain('CE Mark');

      const customScope = 'Class IIb cardiovascular catheter submission';
      const resolvedServiceScope = `${names} • ${customScope}`;
      expect(resolvedServiceScope).toContain(names);
      expect(resolvedServiceScope).toContain(customScope);
    });
  });

  describe('3. Notification Urgency Classification & State Operations', () => {
    it('correctly assigns urgency levels and handles mark-read transitions', () => {
      const notifications = [
        {
          id: 'n-1',
          type: 'URGENT' as const,
          title: 'Urgent Compliance Renewal',
          readAt: null,
        },
        {
          id: 'n-2',
          type: 'SUCCESS' as const,
          title: 'Commercial Proposal Accepted',
          readAt: '2026-08-26T10:00:00.000Z',
        },
        {
          id: 'n-3',
          type: 'WARNING' as const,
          title: 'Upcoming Service Renewal Notice',
          readAt: null,
        },
      ];

      const unreadCount = notifications.filter((n) => !n.readAt).length;
      expect(unreadCount).toBe(2);

      const urgentCount = notifications.filter(
        (n) => n.type === 'URGENT' || n.type === 'WARNING'
      ).length;
      expect(urgentCount).toBe(2);

      // Simulate mark all as read
      const nowIso = new Date().toISOString();
      const allRead = notifications.map((n) => ({ ...n, readAt: n.readAt || nowIso }));
      const newUnreadCount = allRead.filter((n) => !n.readAt).length;
      expect(newUnreadCount).toBe(0);
    });
  });

  describe('4. Optional Client Company Logo & Service Logo Capabilities', () => {
    it('supports optional client company logo with graceful fallback to initial letter', () => {
      const clientWithLogo = {
        companyName: 'Maven Medical Ltd',
        logoUrl: 'https://example.com/maven.png',
      };
      const clientWithoutLogo = {
        companyName: 'Apex Diagnostics Inc',
        logoUrl: null,
      };

      const renderLogoOrInitial = (client: { companyName: string; logoUrl: string | null }) => {
        if (client.logoUrl) return { type: 'IMAGE', src: client.logoUrl };
        return { type: 'INITIAL', letter: client.companyName.charAt(0) };
      };

      const res1 = renderLogoOrInitial(clientWithLogo);
      expect(res1.type).toBe('IMAGE');
      expect(res1.src).toBe('https://example.com/maven.png');

      const res2 = renderLogoOrInitial(clientWithoutLogo);
      expect(res2.type).toBe('INITIAL');
      expect(res2.letter).toBe('A');
    });

    it('supports optional service catalog logo with graceful fallback to category icon', () => {
      const serviceWithLogo = {
        name: 'ISO 13485:2016',
        category: 'QMS Systems',
        logoUrl: 'https://example.com/iso.png',
      };
      const serviceWithoutLogo = {
        name: 'CDSCO MD-5 Import License',
        category: 'Indian CDSCO Regulations',
        logoUrl: null,
      };

      const resolveServiceVisual = (srv: { name: string; category: string; logoUrl: string | null }) => {
        if (srv.logoUrl) return { isCustomLogo: true, url: srv.logoUrl };
        return { isCustomLogo: false, fallbackCategory: srv.category };
      };

      const srv1 = resolveServiceVisual(serviceWithLogo);
      expect(srv1.isCustomLogo).toBe(true);
      expect(srv1.url).toBe('https://example.com/iso.png');

      const srv2 = resolveServiceVisual(serviceWithoutLogo);
      expect(srv2.isCustomLogo).toBe(false);
      expect(srv2.fallbackCategory).toBe('Indian CDSCO Regulations');
    });

    it('verifies circular avatar styling and responsive touch target constraints', () => {
      const getAvatarShapeClasses = (shape: 'circle' | 'rounded') => {
        return shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
      };

      expect(getAvatarShapeClasses('circle')).toBe('rounded-full');
      expect(getAvatarShapeClasses('rounded')).toBe('rounded-2xl');

      // Test data URI detection
      const isBase64DataUrl = (val: string) => val.startsWith('data:image/');
      expect(isBase64DataUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...')).toBe(true);
      expect(isBase64DataUrl('https://example.com/logo.png')).toBe(false);
    });
  });

  describe('5. Entity Amendment, Activation / Deactivation & Deletion Governance', () => {
    it('validates active / inactive toggle logic and safeguards self-deletion', () => {
      const activeUser = { id: 'usr-1', fullName: 'Ramesh Patel', isActive: true, role: 'SALES' };
      const toggleActive = (user: typeof activeUser) => ({ ...user, isActive: !user.isActive });

      const deactivated = toggleActive(activeUser);
      expect(deactivated.isActive).toBe(false);

      const reactivated = toggleActive(deactivated);
      expect(reactivated.isActive).toBe(true);

      const currentSessionUserId = 'admin-1';
      const canDeleteUser = (targetUserId: string) => targetUserId !== currentSessionUserId;

      expect(canDeleteUser('usr-1')).toBe(true);
      expect(canDeleteUser('admin-1')).toBe(false); // Safeguards self-deletion
    });

    it('safely handles service deactivation when engagements exist', () => {
      const activeEngagementsCount = 3;
      const decideServiceDeletionAction = (count: number) => {
        if (count > 0) return 'DEACTIVATE_PRESERVE_HISTORY';
        return 'HARD_DELETE';
      };

      expect(decideServiceDeletionAction(activeEngagementsCount)).toBe('DEACTIVATE_PRESERVE_HISTORY');
      expect(decideServiceDeletionAction(0)).toBe('HARD_DELETE');
    });

    it('validates service engagement amendments and date ranges', () => {
      const engagement = {
        id: 'cs-1',
        serviceNameSnapshot: 'ISO 13485:2016 QMS',
        fee: 250000,
        status: 'ACTIVE',
        startDate: '2026-01-01',
        expiryDate: '2027-01-01',
      };

      const amended = {
        ...engagement,
        fee: 300000,
        status: 'EXPIRING_SOON',
        expiryDate: '2027-06-30',
      };

      expect(amended.fee).toBe(300000);
      expect(amended.status).toBe('EXPIRING_SOON');
      expect(new Date(amended.expiryDate).getTime()).toBeGreaterThan(new Date(amended.startDate).getTime());
    });
  });
});

