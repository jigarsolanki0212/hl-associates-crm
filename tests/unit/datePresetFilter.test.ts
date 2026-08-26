import { describe, it, expect } from 'vitest';
import { getDateRangeFromPreset } from '@/components/ui/DatePresetFilter';

describe('Date Preset Filter Utility', () => {
  it('should return undefined for ALL preset', () => {
    const range = getDateRangeFromPreset('ALL');
    expect(range.startDate).toBeUndefined();
    expect(range.endDate).toBeUndefined();
  });

  it('should return valid date strings for TODAY', () => {
    const range = getDateRangeFromPreset('TODAY');
    expect(range.startDate).toBeDefined();
    expect(range.endDate).toBeDefined();
    expect(range.startDate).toBe(range.endDate);
  });

  it('should return valid date intervals for THIS_WEEK and THIS_MONTH', () => {
    const weekRange = getDateRangeFromPreset('THIS_WEEK');
    expect(weekRange.startDate).toBeDefined();
    expect(weekRange.endDate).toBeDefined();

    const monthRange = getDateRangeFromPreset('THIS_MONTH');
    expect(monthRange.startDate).toBeDefined();
    expect(monthRange.endDate).toBeDefined();
  });

  it('should return valid date intervals for THIS_YEAR', () => {
    const yearRange = getDateRangeFromPreset('THIS_YEAR');
    expect(yearRange.startDate?.endsWith('-01-01')).toBe(true);
    expect(yearRange.endDate?.endsWith('-12-31')).toBe(true);
  });
});
