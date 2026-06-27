import { describe, it, expect } from 'vitest';
import { classifyGesture, countExtendedFingers, type Landmark } from './gestures';

/** Build a neutral flat-hand pose (all landmarks at origin-ish). */
function flatHand(): Landmark[] {
  const lm: Landmark[] = [];
  for (let i = 0; i < 21; i++) lm.push({ x: 0.5, y: 0.5 });
  return lm;
}

describe('gestures', () => {
  it('returns none for too few landmarks', () => {
    expect(classifyGesture([{ x: 0, y: 0 }])).toBe('none');
  });

  it('detects thumb up when thumb tip is high and fingers curled', () => {
    const lm = flatHand();
    lm[0] = { x: 0.5, y: 0.7 }; // wrist
    lm[4] = { x: 0.5, y: 0.2 }; // thumb tip up
    lm[3] = { x: 0.5, y: 0.35 };
    lm[8] = { x: 0.55, y: 0.55 }; // index curled
    lm[6] = { x: 0.55, y: 0.5 };
    expect(classifyGesture(lm)).toBe('thumbUp');
  });

  it('counts extended fingers', () => {
    const lm = flatHand();
    lm[0] = { x: 0.5, y: 0.7 };
    // Extend index: tip farther from wrist than pip.
    lm[8] = { x: 0.5, y: 0.2 };
    lm[6] = { x: 0.5, y: 0.45 };
    expect(countExtendedFingers(lm)).toBeGreaterThanOrEqual(1);
  });
});
