import { describe, it, expect } from 'vitest';
import { VocabWorld } from './vocabWorld';
import { FRUITS, type Item } from './content';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropOnBasket(w: VocabWorld, item: Item) {
  w.items = [{ id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 26, item }];
}

const other = (item: Item): Item =>
  FRUITS.find((f) => f.en !== item.en) ?? FRUITS[0];

describe('VocabWorld', () => {
  it('exposes the target emoji as the HUD prompt and starts at 0/8', () => {
    const w = new VocabWorld(W, H);
    const hud = w.hud();
    expect(hud.prompt).toBe(w.target.emoji ?? w.target.en);
    expect(hud.badges?.[0].label).toBe('0/8');
  });

  it('catching the target scores +10 and advances to a new target', () => {
    const w = new VocabWorld(W, H);
    const first = w.target;
    dropOnBasket(w, w.target);
    w.update(NO_HAND);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
    expect(w.target).not.toBe(first); // new round
  });

  it('catching a non-target does not score and does not end the game', () => {
    const w = new VocabWorld(W, H);
    dropOnBasket(w, other(w.target));
    w.update(NO_HAND);
    expect(w.score).toBe(0);
    expect(w.correct).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('wins after 8 correct catches', () => {
    const w = new VocabWorld(W, H);
    for (let i = 0; i < 8; i++) {
      dropOnBasket(w, w.target);
      w.update(NO_HAND);
    }
    expect(w.correct).toBe(8);
    expect(w.gameOver).toBe(true);
  });
});
