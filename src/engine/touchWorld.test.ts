import { describe, it, expect } from 'vitest';
import { TouchWorld } from './touchWorld';
import { ANIMALS, COLORS, type Item } from './content';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const handAt = (px: number, py: number): HandPosition => ({
  x: px / W,
  y: py / H,
  confidence: 1,
  available: true,
});

// Lay out a deterministic round: target at (100,100), a distractor at (300,300).
function setRound(w: TouchWorld, target: Item, other: Item) {
  w.target = target;
  w.cooldown = 0;
  w.choices = [
    { id: 1, x: 100, y: 100, r: 56, item: target },
    { id: 2, x: 300, y: 300, r: 56, item: other },
  ];
}

describe('TouchWorld', () => {
  it('exposes the target as the HUD prompt and starts at 0/6', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    const hud = w.hud();
    expect(hud.prompt).toBe(w.target.emoji ?? w.target.en);
    expect(hud.badges?.[0].label).toBe('0/6');
  });

  it('touching the target scores +10 and starts a new round', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    setRound(w, ANIMALS[0], ANIMALS[1]);
    w.update(handAt(100, 100));
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('touching a wrong item does not score and does not end the game', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    setRound(w, ANIMALS[0], ANIMALS[1]);
    w.update(handAt(300, 300));
    expect(w.score).toBe(0);
    expect(w.correct).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('wins after 6 correct touches', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    for (let i = 0; i < 6; i++) {
      setRound(w, ANIMALS[0], ANIMALS[1]);
      w.update(handAt(100, 100));
    }
    expect(w.correct).toBe(6);
    expect(w.gameOver).toBe(true);
  });

  it('works with the COLORS pack in color mode', () => {
    const w = new TouchWorld(W, H, COLORS, 'color', 'Find');
    setRound(w, COLORS[0], COLORS[1]);
    w.update(handAt(100, 100));
    expect(w.score).toBe(10);
  });
});
