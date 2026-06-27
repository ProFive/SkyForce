import { describe, it, expect } from 'vitest';
import { TwoHandWorld } from './twoHandWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const clapHands = (x = 0.45, y = 0.5): HandPosition => ({
  x,
  y,
  confidence: 1,
  available: true,
  other: { x: x + 0.03, y, confidence: 1, available: true },
});

describe('TwoHandWorld', () => {
  it('starts with clap prompt badge', () => {
    const w = new TwoHandWorld(W, H);
    expect(w.hud().badges?.[1].label).toBe('2 hands');
  });

  it('scores a clap on the beat', () => {
    const w = new TwoHandWorld(W, H);
    w.beatPulse = 10;
    w.update(clapHands());
    expect(w.score).toBe(10);
  });

  it('does not score a clap off the beat', () => {
    const w = new TwoHandWorld(W, H);
    w.beatPulse = 0;
    w.update(clapHands());
    expect(w.score).toBe(0);
  });

  it('wins when the final level goal is cleared', () => {
    const w = new TwoHandWorld(W, H);
    w.level = MAX_LEVEL;
    w.correct = levelGoal(MAX_LEVEL) - 1;
    w.beatPulse = 10;
    w.update(clapHands());
    expect(w.gameOver).toBe(true);
  });

  it('advances level after clearing the level goal', () => {
    const w = new TwoHandWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      w.beatPulse = 10;
      w.clapCooldown = 0;
      w.update(clapHands());
    }
    expect(w.level).toBe(2);
  });
});
