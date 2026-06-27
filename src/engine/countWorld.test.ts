import { describe, it, expect } from 'vitest';
import { CountWorld } from './countWorld';
import { MAX_LEVEL } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropStarOnBasket(w: CountWorld) {
  w.stars = [{ id: w.stars.length + 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 26 }];
}

describe('CountWorld', () => {
  it('starts at level 1 counting up to 1', () => {
    const w = new CountWorld(W, H);
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(w.target).toBe(1);
    expect(hud.prompt).toBe('1');
    expect(hud.badges?.[0].label).toBe('0/1');
  });

  it('catching a star increments the count', () => {
    const w = new CountWorld(W, H);
    w.level = 3;
    w.target = 3;
    w.caught = 0;
    dropStarOnBasket(w);
    w.update(NO_HAND);
    expect(w.caught).toBe(1);
    expect(w.score).toBe(5);
  });

  it('reaching the target advances to the next level with a bigger count', () => {
    const w = new CountWorld(W, H);
    w.level = 2;
    w.target = 2;
    w.caught = 0;
    dropStarOnBasket(w);
    w.update(NO_HAND); // caught = 1
    dropStarOnBasket(w);
    w.update(NO_HAND); // caught = 2 -> level complete
    expect(w.level).toBe(3);
    expect(w.target).toBe(3);
    expect(w.caught).toBe(0);
  });

  it('wins only after clearing every level', () => {
    const w = new CountWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 100) {
      dropStarOnBasket(w);
      w.update(NO_HAND);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
