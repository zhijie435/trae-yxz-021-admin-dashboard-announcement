import { vi } from 'vitest';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.confirm = vi.fn(() => true);
