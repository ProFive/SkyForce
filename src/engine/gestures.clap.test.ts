import { describe, it, expect } from 'vitest';
import { areHandsClapping } from './gestures';

describe('areHandsClapping', () => {
  it('is true when both hands are close', () => {
    expect(
      areHandsClapping(
        { x: 0.4, y: 0.5, available: true },
        { x: 0.42, y: 0.51, available: true }
      )
    ).toBe(true);
  });

  it('is false when hands are far apart', () => {
    expect(
      areHandsClapping(
        { x: 0.2, y: 0.5, available: true },
        { x: 0.8, y: 0.5, available: true }
      )
    ).toBe(false);
  });
});
