import { describe, it, expect } from 'vitest';
import { KeysWorld } from './keysWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const handAt = (x: number, y: number): HandPosition => ({
  x: x / W,
  y: y / H,
  confidence: 1,
  available: true,
});

describe('KeysWorld', () => {
  it('starts with eight piano keys and a lit target', () => {
    const w = new KeysWorld(W, H);
    expect(w.keys).toHaveLength(8);
    expect(w.hud().prompt).toBeTruthy();
  });

  it('scores when the expected key is touched', () => {
    const w = new KeysWorld(W, H);
    const note = w.expectedNote();
    const key = w.keys.find((k) => k.note === note)!;
    w.update(handAt(key.x, key.y));
    expect(w.score).toBe(10);
  });

  it('does not score on the wrong key', () => {
    const w = new KeysWorld(W, H);
    const wrong = w.keys.find((k) => k.note !== w.expectedNote())!;
    for (let i = 0; i < 12; i++) w.update(handAt(wrong.x, wrong.y));
    expect(w.score).toBe(0);
  });

  it('wins after clearing every level', () => {
    const w = new KeysWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 800) {
      const key = w.keys.find((k) => k.note === w.expectedNote())!;
      for (let i = 0; i < 12; i++) w.update(handAt(key.x, key.y));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new KeysWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      const key = w.keys.find((k) => k.note === w.expectedNote())!;
      for (let i = 0; i < 12; i++) w.update(handAt(key.x, key.y));
    }
    expect(w.level).toBe(2);
  });
});
