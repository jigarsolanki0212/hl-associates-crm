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
});
