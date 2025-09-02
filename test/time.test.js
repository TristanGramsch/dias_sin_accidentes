import { describe, it, expect } from 'vitest';
import path from 'node:path';

const time = require(path.join(__dirname, '..', 'lib', 'time.js'));

describe('Chile time helpers', () => {
  it('computes next midnight correctly across normal day', () => {
    const base = new Date(Date.UTC(2025, 2, 10, 15, 30)); // arbitrary UTC
    const ms = time.msUntilNextChileMidnight(base);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThan(36 * 60 * 60 * 1000);
  });

  it('returns ISO date for Chile today', () => {
    const iso = time.getChileTodayISODate(new Date());
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});


