import { describe, it, expect } from 'vitest';
import { MemoryWorld } from './memoryWorld';
import { ANIMALS } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const CONFIG = { pack: ANIMALS, mode: 'same' as const };

const handAt = (px: number, py: number): HandPosition => ({
  x: px / W,
  y: py / H,
  confidence: 1,
  available: true,
});

function flipPair(w: MemoryWorld) {
  const byPair = new Map<string, typeof w.cards>();
  for (const c of w.cards) {
    if (c.matched) continue;
    if (!byPair.has(c.pairId)) byPair.set(c.pairId, []);
    byPair.get(c.pairId)!.push(c);
  }
  const pair = [...byPair.values()].find((g) => g.length === 2);
  if (!pair) return;
  w.cooldown = 0;
  w.update(handAt(pair[0].x, pair[0].y));
  w.cooldown = 0;
  w.update(handAt(pair[1].x, pair[1].y));
  // Let mismatch timer finish if needed.
  for (let i = 0; i < 60; i++) w.update({ x: 0, y: 0, confidence: 0, available: false });
}

describe('MemoryWorld', () => {
  it('starts at level 1 with progress badge', () => {
    const w = new MemoryWorld(W, H, CONFIG);
    expect(w.hud().level).toBe(1);
    expect(w.hud().badges?.[0].label).toBe(`0/${levelGoal(1)}`);
    expect(w.cards.length).toBeGreaterThanOrEqual(4);
  });

  it('matching a pair scores +10', () => {
    const w = new MemoryWorld(W, H, CONFIG);
    flipPair(w);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('a mismatch does not score and does not end the game', () => {
    const w = new MemoryWorld(W, H, CONFIG);
    const ids = new Set(w.cards.map((c) => c.pairId));
    const [idA, idB] = [...ids].slice(0, 2);
    const a = w.cards.find((c) => c.pairId === idA)!;
    const b = w.cards.find((c) => c.pairId === idB)!;
    w.cooldown = 0;
    w.update(handAt(a.x, a.y));
    w.cooldown = 0;
    w.update(handAt(b.x, b.y));
    expect(w.score).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('advances level after clearing the level goal', () => {
    const w = new MemoryWorld(W, H, CONFIG);
    for (let i = 0; i < levelGoal(1); i++) {
      flipPair(w);
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0);
  });

  it('wins after clearing every level', () => {
    const w = new MemoryWorld(W, H, CONFIG);
    let guard = 0;
    while (!w.gameOver && guard++ < 800) {
      flipPair(w);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
