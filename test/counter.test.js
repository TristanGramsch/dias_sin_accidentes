import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';

const counter = require(path.join(__dirname, '..', 'lib', 'counter.js'));
const time = require(path.join(__dirname, '..', 'lib', 'time.js'));

const TEMP_DATA = path.join(__dirname, 'tmp-data.json');

async function withTempData(content) {
  await fs.writeFile(TEMP_DATA, JSON.stringify(content, null, 2));
  process.env.DATA_FILE_PATH = TEMP_DATA;
}

describe('Counter idempotency', () => {
  beforeEach(async () => {
    try { await fs.unlink(TEMP_DATA); } catch {}
    delete process.env.DATA_FILE_PATH;
  });

  it('does not increment twice on same Chile day', async () => {
    const todayCl = time.getChileTodayISODate(new Date());
    await withTempData({
      diasSinAccidentes: 10,
      ultimaActualizacion: new Date().toISOString(),
      lastRunChileDate: todayCl
    });

    const a = await counter.ensureDailyIncrement();
    const b = await counter.ensureDailyIncrement();
    expect(a.incrementsApplied).toBe(0);
    expect(b.incrementsApplied).toBe(0);
    const data = await counter.loadData();
    expect(data.diasSinAccidentes).toBe(10);
  });

  it('increments by the number of elapsed Chile days', async () => {
    const todayCl = time.getChileTodayISODate(new Date());
    const twoDaysAgo = require('luxon').DateTime
      .fromISO(todayCl, { zone: time.CHILE_TZ })
      .minus({ days: 2 })
      .toISODate();

    await withTempData({
      diasSinAccidentes: 5,
      ultimaActualizacion: new Date().toISOString(),
      lastRunChileDate: twoDaysAgo
    });

    const { incrementsApplied } = await counter.ensureDailyIncrement();
    const data = await counter.loadData();
    expect(incrementsApplied).toBeGreaterThanOrEqual(1);
    expect(data.diasSinAccidentes).toBeGreaterThanOrEqual(6);
  });
});


