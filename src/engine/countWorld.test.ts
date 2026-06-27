import { describe, it, expect } from 'vitest';
import { CountWorld } from './countWorld';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropStarOnBasket(w: CountWorld) {
  w.stars = [{ id: w.stars.length + 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 26 }];
}

describe('CountWorld', () => {
  it('exposes the target count as the HUD prompt and starts at 0/target', () => {
    const w = new CountWorld(W, H);
    const hud = w.hud();
    expect(hud.prompt).toBe(String(w.target));
    expect(hud.badges?.[0].label).toBe(`0/${w.target}`);
  });

  it('catching a star increments the count', () => {
    const w = new CountWorld(W, H);
    w.target = 3;
    w.caught = 0;
    dropStarOnBasket(w);
    w.update(NO_HAND);
    expect(w.caught).toBe(1);
    expect(w.score).toBe(5);
  });

  it('reaching the target completes a round and picks a new target', () => {
    const w = new CountWorld(W, H);
    w.target = 2;
    w.caught = 0;
    dropStarOnBasket(w);
    w.update(NO_HAND); // caught = 1
    dropStarOnBasket(w);
    w.update(NO_HAND); // caught = 2 -> round complete
    expect(w.rounds).toBe(1);
    expect(w.caught).toBe(0); // reset for the next round
  });

  it('wins after 5 completed rounds', () => {
    const w = new CountWorld(W, H);
    for (let r = 0; r < 5; r++) {
      const goal = w.target;
      for (let i = 0; i < goal; i++) {
        dropStarOnBasket(w);
        w.update(NO_HAND);
      }
    }
    expect(w.rounds).toBe(5);
    expect(w.gameOver).toBe(true);
  });
});
