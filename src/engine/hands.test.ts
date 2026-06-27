import { describe, it, expect } from 'vitest';
import { trackedHands } from './hands';
import type { HandPosition } from '../types';

describe('trackedHands', () => {
  it('returns left then right sorted by x', () => {
    const hand: HandPosition = {
      x: 0.7,
      y: 0.5,
      confidence: 1,
      available: true,
      other: { x: 0.3, y: 0.5, confidence: 1, available: true },
    };
    const players = trackedHands(hand);
    expect(players).toHaveLength(2);
    expect(players[0].side).toBe('left');
    expect(players[0].hand.x).toBe(0.3);
    expect(players[1].side).toBe('right');
  });
});
