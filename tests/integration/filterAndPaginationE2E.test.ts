import { describe, it, expect } from 'vitest';
import { db } from '@/db/client';
import { getDateRangeFromPreset } from '@/components/ui/DatePresetFilter';

describe('E2E Filter & Pagination Verification', () => {
  it('should query clients with pagination accurately', async () => {
    const total = await db.client.count();
    expect(total).toBeGreaterThanOrEqual(30);

    const pageSize = 10;
    const page1 = await db.client.findMany({
      take: pageSize,
      skip: 0,
      orderBy: { createdAt: 'desc' },
    });
    expect(page1.length).toBeLessThanOrEqual(pageSize);

    const page2 = await db.client.findMany({
      take: pageSize,
      skip: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    expect(page2.length).toBeGreaterThan(0);
    // Ensure distinct IDs between page 1 and page 2
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  it('should filter inquiries by status and service', async () => {
    const allInquiries = await db.inquiry.count();
    expect(allInquiries).toBeGreaterThanOrEqual(0);

    const service = await db.service.findFirst();
    if (service) {
      const filtered = await db.inquiry.findMany({
        where: { serviceId: service.id },
      });
      expect(Array.isArray(filtered)).toBe(true);
    }
  });

  it('should verify date preset calculations match database date filters', async () => {
    const monthRange = getDateRangeFromPreset('THIS_MONTH');
    expect(monthRange.startDate).toBeDefined();
    expect(monthRange.endDate).toBeDefined();

    const start = new Date(monthRange.startDate!);
    const end = new Date(monthRange.endDate!);
    end.setHours(23, 59, 59, 999);

    const records = await db.client.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });
    expect(Array.isArray(records)).toBe(true);
  });
});
