import { describe, it, expect } from 'vitest';
import { GrowWorld } from './growWorld';
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

function waterUntilBloom(w: GrowWorld) {
  const before = w.correct;
  let guard = 0;
  while (w.correct === before && !w.gameOver && guard++ < 30) {
    w.cooldown = 0;
    w.update(handAt(w.plant.x, w.plant.y));
  }
}

describe('GrowWorld', () => {
  it('starts at level 1 with growth badge', () => {
    const w = new GrowWorld(W, H);
    expect(w.hud().level).toBe(1);
    expect(w.hud().badges?.[1].label).toBe('0%');
  });

  it('watering increases growth', () => {
    const w = new GrowWorld(W, H);
    w.cooldown = 0;
    w.update(handAt(w.plant.x, w.plant.y));
    expect(w.growth).toBeGreaterThan(0);
  });

  it('a full bloom scores +10', () => {
    const w = new GrowWorld(W, H);
    waterUntilBloom(w);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('advances level after clearing the level goal', () => {
    const w = new GrowWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) waterUntilBloom(w);
    expect(w.level).toBe(2);
  });

  it('wins after clearing every level', () => {
    const w = new GrowWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 800) waterUntilBloom(w);
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
