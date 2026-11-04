import { describe, it, expect } from 'vitest';
import { formatClock } from './useClock';

describe('formatClock', () => {
  it('renders an em-dash clock for unlimited (null)', () => {
    expect(formatClock(null)).toBe('—:—');
  });
  it('formats seconds with a leading zero', () => {
    expect(formatClock(5000)).toBe('0:05');
    expect(formatClock(65000)).toBe('1:05');
  });
  it('ceils partial seconds so time only hits 0 at expiry', () => {
    expect(formatClock(1)).toBe('0:01');
    expect(formatClock(0)).toBe('0:00');
  });
  it('switches to H:MM:SS at an hour or more', () => {
    expect(formatClock(3600000)).toBe('1:00:00');
  });
});
