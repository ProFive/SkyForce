import { describe, it, expect } from 'vitest';
import { OrderWorld } from './orderWorld';
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

function popInOrder(w: OrderWorld) {
  const sorted = [...w.bubbles].filter((b) => !b.popped).sort((a, b) => a.order - b.order);
  for (const b of sorted) {
    w.cooldown = 0;
    w.update(handAt(b.x, b.y));
  }
}

describe('OrderWorld', () => {
  it('starts with a next-bubble prompt and progress badge', () => {
    const w = new OrderWorld(W, H);
    expect(w.hud().level).toBe(1);
    expect(w.hud().prompt).toBe('1');
    expect(w.hud().badges?.[0].label).toBe(`0/${levelGoal(1)}`);
  });

  it('popping in order scores after a full round', () => {
    const w = new OrderWorld(W, H);
    popInOrder(w);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('popping out of order does not score', () => {
    const w = new OrderWorld(W, H);
    const wrong = w.bubbles.find((b) => b.order !== 0)!;
    w.cooldown = 0;
    w.update(handAt(wrong.x, wrong.y));
    expect(w.score).toBe(0);
  });

  it('advances level after clearing the level goal', () => {
    const w = new OrderWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) popInOrder(w);
    expect(w.level).toBe(2);
  });

  it('wins after clearing every level', () => {
    const w = new OrderWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 800) popInOrder(w);
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
