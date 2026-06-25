import { describe, it, expect, beforeEach } from 'vitest';
import * as calibration from './calibration';

beforeEach(() => {
  localStorage.clear();
  calibration.resetCalibration();
});

describe('calibration', () => {
  it('maps a traced box so its corners reach the full field', () => {
    calibration.beginRecording();
    // Trace a sub-rectangle x[0.3,0.7], y[0.25,0.75].
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      calibration.observe(0.3 + 0.4 * t, 0.25 + 0.5 * t);
    }
    calibration.finishRecording();

    const lo = calibration.apply(0.3, 0.25);
    const hi = calibration.apply(0.7, 0.75);
    const mid = calibration.apply(0.5, 0.5);

    expect(lo.x).toBeLessThan(0.15);
    expect(lo.y).toBeLessThan(0.15);
    expect(hi.x).toBeGreaterThan(0.85);
    expect(hi.y).toBeGreaterThan(0.85);
    expect(mid.x).toBeCloseTo(0.5, 1);
    expect(mid.y).toBeCloseTo(0.5, 1);
  });

  it('clamps results to the 0..1 range', () => {
    const out = calibration.apply(-1, 2);
    expect(out.x).toBeGreaterThanOrEqual(0);
    expect(out.x).toBeLessThanOrEqual(1);
    expect(out.y).toBeGreaterThanOrEqual(0);
    expect(out.y).toBeLessThanOrEqual(1);
  });

  it('ignores a too-small traced area', () => {
    calibration.beginRecording();
    calibration.observe(0.5, 0.5);
    calibration.observe(0.51, 0.51); // tiny range -> rejected
    calibration.finishRecording();
    // Falls back to the centred default, so 0.5 maps near 0.5.
    const mid = calibration.apply(0.5, 0.5);
    expect(mid.x).toBeCloseTo(0.5, 1);
  });

  it('persists calibration to localStorage', () => {
    calibration.beginRecording();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      calibration.observe(0.1 + 0.8 * t, 0.1 + 0.8 * t);
    }
    calibration.finishRecording();
    expect(localStorage.getItem('skyforce.calibration')).not.toBeNull();
  });
});
