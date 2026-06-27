import { describe, it, expect } from 'vitest';
import { TouchWorld } from './touchWorld';
import { ANIMALS, COLORS, type Item } from './content';
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
  it('starts at level 1 with a 0/3 progress badge and an emoji prompt', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(hud.prompt).toBe(w.target.emoji ?? w.target.en);
    expect(hud.badges?.[0].label).toBe(`0/${levelGoal(1)}`);
  });

  it('touching the target scores +10', () => {
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

  it('advances to the next level after clearing the level goal', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    for (let i = 0; i < levelGoal(1); i++) {
      setRound(w, ANIMALS[0], ANIMALS[1]);
      w.update(handAt(100, 100));
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0);
  });

  it('wins only after clearing every level', () => {
    const w = new TouchWorld(W, H, ANIMALS, 'emoji');
    let guard = 0;
    while (!w.gameOver && guard++ < 200) {
      setRound(w, ANIMALS[0], ANIMALS[1]);
      w.update(handAt(100, 100));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('works with the COLORS pack in color mode', () => {
    const w = new TouchWorld(W, H, COLORS, 'color', 'Find');
    setRound(w, COLORS[0], COLORS[1]);
    w.update(handAt(100, 100));
    expect(w.score).toBe(10);
  });
});
