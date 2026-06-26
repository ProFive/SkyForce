import { describe, it, expect } from 'vitest';
import { CatchWorld } from './catchWorld';
import { BrickWorld } from './brickWorld';
import { DodgeWorld } from './dodgeWorld';
import { SquashWorld } from './squashWorld';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };
const handAt = (px: number, py: number): HandPosition => ({
  x: px / W,
  y: py / H,
  confidence: 1,
  available: true,
});

describe('CatchWorld', () => {
  it('catching a good item scores and keeps lives', () => {
    const w = new CatchWorld(W, H);
    w.items = [
      { id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 22, emoji: '🍎', good: true },
    ];
    w.update(NO_HAND);
    expect(w.score).toBe(10);
    expect(w.lives).toBe(5);
  });

  it('catching a bad item costs a life', () => {
    const w = new CatchWorld(W, H);
    w.items = [
      { id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 22, emoji: '💣', good: false },
    ];
    w.update(NO_HAND);
    expect(w.lives).toBe(4);
  });

  it('ends at 0 lives', () => {
    const w = new CatchWorld(W, H);
    w.lives = 1;
    w.items = [
      { id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 22, emoji: '💣', good: false },
    ];
    w.update(NO_HAND);
    expect(w.gameOver).toBe(true);
  });
});

describe('BrickWorld', () => {
  it('hitting a brick scores and removes it', () => {
    const w = new BrickWorld(W, H);
    const brick = w.bricks[0];
    w.ball = { x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vx: 0, vy: -1, r: 8 };
    const before = w.score;
    w.update(NO_HAND);
    expect(w.bricks[0].alive).toBe(false);
    expect(w.score).toBeGreaterThan(before);
  });

  it('losing the ball costs a life', () => {
    const w = new BrickWorld(W, H);
    w.ball = { x: 100, y: H + 50, vx: 0, vy: 4, r: 8 };
    w.update(NO_HAND);
    expect(w.lives).toBe(2);
  });
});

describe('DodgeWorld', () => {
  it('score climbs while surviving', () => {
    const w = new DodgeWorld(W, H);
    w.update(NO_HAND);
    expect(w.score).toBeGreaterThan(0);
  });

  it('hitting a rock costs a life and grants brief invulnerability', () => {
    const w = new DodgeWorld(W, H);
    w.rocks = [{ id: 1, x: w.player.x, y: w.player.y, vy: 0, r: 24, spin: 0, spinV: 0 }];
    w.update(NO_HAND);
    expect(w.lives).toBe(2);
    expect(w.invuln).toBeGreaterThan(0);
  });
});

describe('SquashWorld', () => {
  it('touching a bug scores', () => {
    const w = new SquashWorld(W, H);
    w.targets = [{ id: 1, x: 100, y: 100, r: 30, bomb: false, life: 60, maxLife: 60 }];
    w.update(handAt(100, 100));
    expect(w.score).toBe(10);
  });

  it('touching a bomb costs a life', () => {
    const w = new SquashWorld(W, H);
    w.targets = [{ id: 1, x: 100, y: 100, r: 30, bomb: true, life: 60, maxLife: 60 }];
    w.update(handAt(100, 100));
    expect(w.lives).toBe(4);
  });

  it('a bug that times out unsquashed is a miss', () => {
    const w = new SquashWorld(W, H);
    w.targets = [{ id: 1, x: 100, y: 100, r: 30, bomb: false, life: 1, maxLife: 60 }];
    w.update(NO_HAND);
    expect(w.lives).toBe(4);
  });
});
