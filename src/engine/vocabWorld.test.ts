import { describe, it, expect } from 'vitest';
import { VocabWorld } from './vocabWorld';
import { FRUITS, type Item } from './content';
import { MAX_LEVEL, levelGoal, totalGoal } from './levels';
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
  it('starts at level 1 with a 0/3 progress badge and an emoji prompt', () => {
    const w = new VocabWorld(W, H);
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(hud.prompt).toBe(w.target.emoji ?? w.target.en);
    expect(hud.badges?.[0].label).toBe(`0/${levelGoal(1)}`);
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

  it('advances to the next level after clearing the level goal', () => {
    const w = new VocabWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) {
      dropOnBasket(w, w.target);
      w.update(NO_HAND);
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0); // progress resets each level
  });

  it('wins only after clearing every level', () => {
    const w = new VocabWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 200) {
      dropOnBasket(w, w.target);
      w.update(NO_HAND);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
    expect(w.score).toBe(totalGoal() * 10);
  });
});
