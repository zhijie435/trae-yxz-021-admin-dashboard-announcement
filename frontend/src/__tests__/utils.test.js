import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getDaySeed,
  seededRandom,
  randomFluctuate,
  debounce,
  throttle,
  deepClone
} from '../utils/index';

describe('getDaySeed', () => {
  it('should return a number seed', () => {
    const seed = getDaySeed();
    expect(typeof seed).toBe('number');
    expect(seed).toBeGreaterThanOrEqual(0);
  });

  it('should return same seed for same date', () => {
    const date = new Date(2024, 0, 15);
    const seed1 = getDaySeed(date);
    const seed2 = getDaySeed(date);
    expect(seed1).toBe(seed2);
  });

  it('should return different seeds for different dates', () => {
    const seed1 = getDaySeed(new Date(2024, 0, 15));
    const seed2 = getDaySeed(new Date(2024, 0, 16));
    expect(seed1).not.toBe(seed2);
  });
});

describe('seededRandom', () => {
  it('should generate deterministic random numbers', () => {
    const rand = seededRandom(12345);
    const first = rand();
    const second = rand();
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(1);
    expect(second).not.toBe(first);
  });

  it('should generate same sequence with same seed', () => {
    const rand1 = seededRandom(12345);
    const rand2 = seededRandom(12345);
    expect(rand1()).toBe(rand2());
    expect(rand1()).toBe(rand2());
  });
});

describe('randomFluctuate', () => {
  it('should return value within range', () => {
    const base = 100;
    const range = 10;
    const result = randomFluctuate(base, range);
    expect(result).toBeGreaterThanOrEqual(base - range);
    expect(result).toBeLessThanOrEqual(base + range);
  });

  it('should return integer value', () => {
    const result = randomFluctuate(100, 10);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should have default delay of 300ms', () => {
    const fn = vi.fn();
    const debounced = debounce(fn);

    debounced();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should throttle function calls', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow call after delay', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should have default delay of 300ms', () => {
    const fn = vi.fn();
    const throttled = throttle(fn);

    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(deepClone(true)).toBe(true);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3, { a: 1 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[3]).not.toBe(arr[3]);
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('should clone dates', () => {
    const date = new Date(2024, 0, 15);
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
    expect(cloned instanceof Date).toBe(true);
  });

  it('should handle nested structures', () => {
    const nested = {
      a: [1, { b: 2 }],
      c: { d: [3, 4] }
    };
    const cloned = deepClone(nested);
    expect(cloned).toEqual(nested);
    expect(cloned.a[1]).not.toBe(nested.a[1]);
    expect(cloned.c.d).not.toBe(nested.c.d);
  });
});
