import { calculateExpiryDate, getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { ValidityUnit } from '@prisma/client';
import { addDays, addMonths, addYears } from 'date-fns';

describe('Expiry Calculator', () => {
  const baseDate = new Date('2026-01-01T00:00:00.000Z');

  it('should calculate expiry correctly for MONTHS', () => {
    const result = calculateExpiryDate(baseDate, 12, ValidityUnit.MONTHS, 'Asia/Kolkata');
    const expected = addMonths(baseDate, 12);
    expect(result.getFullYear()).toBe(expected.getFullYear());
    expect(result.getMonth()).toBe(expected.getMonth());
  });

  it('should calculate expiry correctly for YEARS', () => {
    const result = calculateExpiryDate(baseDate, 3, ValidityUnit.YEARS, 'Asia/Kolkata');
    const expected = addYears(baseDate, 3);
    expect(result.getFullYear()).toBe(expected.getFullYear());
  });

  it('should calculate expiry correctly for DAYS', () => {
    const result = calculateExpiryDate(baseDate, 90, ValidityUnit.DAYS, 'Asia/Kolkata');
    const expected = addDays(baseDate, 90);
    expect(result.getDate()).toBe(expected.getDate());
  });

  it('should calculate remaining days accurately', () => {
    const futureDate = addDays(new Date(), 45);
    const daysRemaining = getDaysRemaining(futureDate);
    expect(daysRemaining).toBe(45);
  });
});
