import { toZonedTime, format as formatZoned } from 'date-fns-tz';
import { format as formatLocal } from 'date-fns';

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export function getZonedDate(date: Date | string = new Date(), timezone: string = DEFAULT_TIMEZONE): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(d, timezone);
}

export function formatDateZoned(
  date: Date | string,
  formatPattern: string = 'yyyy-MM-dd',
  timezone: string = DEFAULT_TIMEZONE
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zoned = toZonedTime(d, timezone);
    return formatZoned(zoned, formatPattern, { timeZone: timezone });
  } catch (err) {
    console.error('Date formatting error:', err);
    return String(date);
  }
}

export function formatFriendlyDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatLocal(d, 'MMM dd, yyyy');
  } catch {
    return String(date);
  }
}
