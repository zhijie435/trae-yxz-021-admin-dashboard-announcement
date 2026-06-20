import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TIME_RANGES,
  TIME_RANGE_OPTIONS,
  formatDateStr,
  formatShortDate,
  formatTime,
  formatRelativeTime,
  getTodayDate,
  getDateRangeFromTimeRange,
  getDaysBetween,
  getTimeRangeFactor,
  generateDateArray
} from '../utils/date';

describe('TIME_RANGES', () => {
  it('should have correct time range constants', () => {
    expect(TIME_RANGES.TODAY).toBe('today');
    expect(TIME_RANGES.WEEK_7).toBe('7d');
    expect(TIME_RANGES.WEEK_14).toBe('14d');
    expect(TIME_RANGES.MONTH_30).toBe('30d');
    expect(TIME_RANGES.CUSTOM).toBe('custom');
  });
});

describe('TIME_RANGE_OPTIONS', () => {
  it('should have 5 time range options', () => {
    expect(TIME_RANGE_OPTIONS).toHaveLength(5);
  });

  it('should have correct labels and values', () => {
    const labels = TIME_RANGE_OPTIONS.map(o => o.label);
    const values = TIME_RANGE_OPTIONS.map(o => o.value);
    expect(labels).toContain('今日');
    expect(labels).toContain('近7天');
    expect(labels).toContain('近14天');
    expect(labels).toContain('近30天');
    expect(labels).toContain('自定义');
    expect(values).toContain('today');
    expect(values).toContain('7d');
    expect(values).toContain('14d');
    expect(values).toContain('30d');
    expect(values).toContain('custom');
  });
});

describe('formatDateStr', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15);
    expect(formatDateStr(date)).toBe('2024-01-15');
  });

  it('should handle date string input', () => {
    expect(formatDateStr('2024-01-15')).toBe('2024-01-15');
  });
});

describe('formatShortDate', () => {
  it('should format date as M/D', () => {
    const date = new Date(2024, 0, 15);
    expect(formatShortDate(date)).toBe('1/15');
  });
});

describe('formatTime', () => {
  it('should format ISO string to time', () => {
    const date = new Date(2024, 0, 15, 10, 30, 45);
    const result = formatTime(date.toISOString());
    expect(result).toContain('10');
    expect(result).toContain('30');
    expect(result).toContain('45');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
  });

  it('should return 刚刚 for less than 1 minute', () => {
    const date = new Date(2024, 0, 15, 11, 59, 30);
    expect(formatRelativeTime(date.toISOString())).toBe('刚刚');
  });

  it('should return minutes ago for less than 1 hour', () => {
    const date = new Date(2024, 0, 15, 11, 30, 0);
    expect(formatRelativeTime(date.toISOString())).toBe('30分钟前');
  });

  it('should return hours ago for less than 1 day', () => {
    const date = new Date(2024, 0, 15, 8, 0, 0);
    expect(formatRelativeTime(date.toISOString())).toBe('4小时前');
  });

  it('should return days ago for less than 7 days', () => {
    const date = new Date(2024, 0, 12, 12, 0, 0);
    expect(formatRelativeTime(date.toISOString())).toBe('3天前');
  });

  it('should return formatted date for more than 7 days', () => {
    const date = new Date(2024, 0, 1, 10, 30, 0);
    const result = formatRelativeTime(date.toISOString());
    expect(result).toContain('1/1');
    expect(result).toContain('10');
    expect(result).toContain('30');
  });
});

describe('getTodayDate', () => {
  it('should return today\'s date in Chinese format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15));
    expect(getTodayDate()).toBe('2024年1月15日');
    vi.useRealTimers();
  });
});

describe('getDateRangeFromTimeRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15));
  });

  it('should return today range for today', () => {
    const result = getDateRangeFromTimeRange('today');
    expect(result.startDate).toBe('2024-01-15');
    expect(result.endDate).toBe('2024-01-15');
  });

  it('should return 7 days range for 7d', () => {
    const result = getDateRangeFromTimeRange('7d');
    expect(result.endDate).toBe('2024-01-15');
    expect(result.startDate).toBe('2024-01-09');
  });

  it('should return 14 days range for 14d', () => {
    const result = getDateRangeFromTimeRange('14d');
    expect(result.endDate).toBe('2024-01-15');
    expect(result.startDate).toBe('2024-01-02');
  });

  it('should return 30 days range for 30d', () => {
    const result = getDateRangeFromTimeRange('30d');
    expect(result.endDate).toBe('2024-01-15');
    expect(result.startDate).toBe('2023-12-17');
  });

  it('should return custom range for custom with dates', () => {
    const result = getDateRangeFromTimeRange('custom', '2024-01-01', '2024-01-10');
    expect(result.startDate).toBe('2024-01-01');
    expect(result.endDate).toBe('2024-01-10');
  });

  it('should return empty object for custom without dates', () => {
    const result = getDateRangeFromTimeRange('custom');
    expect(result).toEqual({});
  });

  it('should return empty object for unknown time range', () => {
    const result = getDateRangeFromTimeRange('unknown');
    expect(result).toEqual({});
  });
});

describe('getDaysBetween', () => {
  it('should calculate days between two dates', () => {
    expect(getDaysBetween('2024-01-01', '2024-01-10')).toBe(9);
  });

  it('should return at least 1 day', () => {
    expect(getDaysBetween('2024-01-01', '2024-01-01')).toBe(1);
  });
});

describe('getTimeRangeFactor', () => {
  it('should return 1 when no dates provided', () => {
    expect(getTimeRangeFactor()).toBe(1);
  });

  it('should calculate factor based on 14 days baseline', () => {
    expect(getTimeRangeFactor('2024-01-01', '2024-01-14')).toBeCloseTo(13 / 14, 1);
  });

  it('should clamp between 0.3 and 2', () => {
    expect(getTimeRangeFactor('2024-01-01', '2024-01-02')).toBe(0.3);
    expect(getTimeRangeFactor('2024-01-01', '2024-02-15')).toBe(2);
  });
});

describe('generateDateArray', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15));
  });

  it('should generate array of short dates', () => {
    const result = generateDateArray(3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('1/13');
    expect(result[1]).toBe('1/14');
    expect(result[2]).toBe('1/15');
  });

  it('should generate array of full dates', () => {
    const result = generateDateArray(3, 'full');
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('2024-01-13');
    expect(result[2]).toBe('2024-01-15');
  });
});
