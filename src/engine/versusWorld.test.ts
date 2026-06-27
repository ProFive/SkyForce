import { describe, it, expect } from 'vitest';
import { VersusWorld } from './versusWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const twoHands = (leftX: number, rightX: number, y = 0.5): HandPosition => ({
  x: leftX,
  y,
  confidence: 1,
  available: true,
  other: { x: rightX, y, confidence: 1, available: true },
});

describe('VersusWorld', () => {
  it('starts with blue and red score badges', () => {
    const w = new VersusWorld(W, H);
    expect(w.hud().badges?.[0].label).toContain('🔵');
    expect(w.hud().badges?.[1].label).toContain('🔴');
  });

  it('awards blue when the left hand touches the target', () => {
    const w = new VersusWorld(W, H);
    w.target.x = W * 0.25;
    w.target.y = H * 0.4;
    const tx = w.target.x / W;
    const ty = w.target.y / H;
    w.update(twoHands(tx, 0.9, ty));
    expect(w.leftScore).toBe(10);
    expect(w.lastWinner).toBe('left');
  });

  it('awards red when the right hand touches the target', () => {
    const w = new VersusWorld(W, H);
    w.target.x = W * 0.75;
    w.target.y = H * 0.4;
    const tx = w.target.x / W;
    const ty = w.target.y / H;
    w.update(twoHands(0.1, tx, ty));
    expect(w.rightScore).toBe(10);
    expect(w.lastWinner).toBe('right');
  });

  it('wins when the final level goal is cleared', () => {
    const w = new VersusWorld(W, H);
    w.level = MAX_LEVEL;
    w.correct = levelGoal(MAX_LEVEL) - 1;
    const tx = w.target.x / W;
    const ty = w.target.y / H;
    w.update(twoHands(tx, 0.9, ty));
    expect(w.gameOver).toBe(true);
  });

  it('advances level after clearing the level goal', () => {
    const w = new VersusWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      w.cooldown = 0;
      const tx = w.target.x / W;
      const ty = w.target.y / H;
      w.update(twoHands(tx, 0.9, ty));
    }
    expect(w.level).toBe(2);
  });
});
