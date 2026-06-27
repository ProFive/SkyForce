import { describe, it, expect } from 'vitest';
import { SizeTouchWorld } from './sizeTouchWorld';
import { ANIMALS } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const handAt = (px: number, py: number): HandPosition => ({
  x: px / W,
  y: py / H,
  confidence: 1,
  available: true,
});

describe('SizeTouchWorld', () => {
  it('starts at level 1 with a size prompt', () => {
    const w = new SizeTouchWorld(W, H);
    expect(w.hud().level).toBe(1);
    expect(w.hud().prompt).toMatch(/Bigger|Smaller/);
  });

  it('touching the correct choice scores +10', () => {
    const w = new SizeTouchWorld(W, H);
    const correct = w.choices.find((c) => c.correct)!;
    w.cooldown = 0;
    w.update(handAt(correct.x, correct.y));
    expect(w.score).toBe(10);
  });

  it('touching the wrong choice does not score', () => {
    const w = new SizeTouchWorld(W, H);
    const wrong = w.choices.find((c) => !c.correct)!;
    w.cooldown = 0;
    w.update(handAt(wrong.x, wrong.y));
    expect(w.score).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('wins after clearing every level', () => {
    const w = new SizeTouchWorld(W, H, ANIMALS);
    let guard = 0;
    while (!w.gameOver && guard++ < 500) {
      const correct = w.choices.find((c) => c.correct)!;
      w.cooldown = 0;
      w.update(handAt(correct.x, correct.y));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new SizeTouchWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) {
      const correct = w.choices.find((c) => c.correct)!;
      w.cooldown = 0;
      w.update(handAt(correct.x, correct.y));
    }
    expect(w.level).toBe(2);
  });
});
