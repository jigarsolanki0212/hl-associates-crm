import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import { getZonedDate, DEFAULT_TIMEZONE } from './timezone';

export type ValidityUnitType = 'DAYS' | 'MONTHS' | 'YEARS';

export function calculateExpiryDate(
  startDate: Date | string,
  durationValue: number,
  durationUnit: ValidityUnitType,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const zonedStart = getZonedDate(startDate, timezone);

  if (durationUnit === 'DAYS') {
    return addDays(zonedStart, durationValue);
  }
  if (durationUnit === 'MONTHS') {
    return addMonths(zonedStart, durationValue);
  }
  if (durationUnit === 'YEARS') {
    return addYears(zonedStart, durationValue);
  }
  return addMonths(zonedStart, durationValue);
}

export function getDaysRemaining(
  expiryDate: Date | string,
  referenceDate: Date | string = new Date(),
  timezone: string = DEFAULT_TIMEZONE
): number {
  const zonedExpiry = getZonedDate(expiryDate, timezone);
  const zonedRef = getZonedDate(referenceDate, timezone);
  return differenceInDays(zonedExpiry, zonedRef);
}

export function getRenewalUrgencyStatus(daysRemaining: number): 'URGENT' | 'ACTION_NEEDED' | 'NORMAL' | 'EXPIRED' {
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= 15) return 'URGENT';
  if (daysRemaining <= 30) return 'ACTION_NEEDED';
  return 'NORMAL';
}
