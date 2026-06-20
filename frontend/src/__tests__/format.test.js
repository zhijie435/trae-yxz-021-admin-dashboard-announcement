import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatRevenue,
  formatPercent,
  formatCurrency,
  getBarHeight,
  padZero
} from '../utils/format';

describe('formatNumber', () => {
  it('should format numbers less than 10000 with locale string', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(9999)).toBe('9,999');
  });

  it('should format numbers >= 10000 in 万 unit', () => {
    expect(formatNumber(10000)).toBe('1.0万');
    expect(formatNumber(15000)).toBe('1.5万');
    expect(formatNumber(99999)).toBe('10.0万');
  });

  it('should format numbers >= 100000000 in 亿 unit', () => {
    expect(formatNumber(100000000)).toBe('1.00亿');
    expect(formatNumber(150000000)).toBe('1.50亿');
  });

  it('should return original value if NaN', () => {
    expect(formatNumber('abc')).toBe('abc');
    expect(formatNumber(NaN)).toBeNaN();
  });

  it('should handle zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatRevenue', () => {
  it('should format revenue less than 10000 with locale string', () => {
    expect(formatRevenue(5000)).toBe('5,000');
  });

  it('should format revenue >= 10000 in 万 unit', () => {
    expect(formatRevenue(10000)).toBe('1.0万');
    expect(formatRevenue(25000)).toBe('2.5万');
  });
});

describe('formatPercent', () => {
  it('should format percentage with default 1 decimal', () => {
    expect(formatPercent(12.345)).toBe('12.3%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercent(12.345, 2)).toBe('12.35%');
    expect(formatPercent(12.345, 0)).toBe('12%');
  });
});

describe('formatCurrency', () => {
  it('should format currency with ¥ prefix', () => {
    expect(formatCurrency(1000)).toBe('¥1,000.00');
  });

  it('should format currency with custom decimals', () => {
    expect(formatCurrency(1000, 0)).toBe('¥1,000');
    expect(formatCurrency(1000.5, 1)).toBe('¥1,000.5');
  });
});

describe('getBarHeight', () => {
  it('should calculate bar height percentage', () => {
    expect(getBarHeight(50, [0, 50, 100])).toBe(50);
    expect(getBarHeight(100, [0, 50, 100])).toBe(100);
  });

  it('should return minHeight when value is very small', () => {
    expect(getBarHeight(1, [100])).toBeGreaterThanOrEqual(4);
  });

  it('should handle empty array with max fallback of 1', () => {
    expect(getBarHeight(0, [])).toBe(4);
  });
});

describe('padZero', () => {
  it('should pad single digit numbers with leading zero', () => {
    expect(padZero(5)).toBe('05');
    expect(padZero(9)).toBe('09');
  });

  it('should not pad numbers with sufficient length', () => {
    expect(padZero(10)).toBe('10');
    expect(padZero(123)).toBe('123');
  });

  it('should pad with custom length', () => {
    expect(padZero(5, 3)).toBe('005');
    expect(padZero(42, 4)).toBe('0042');
  });
});
