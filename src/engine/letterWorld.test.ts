import { describe, it, expect } from 'vitest';
import { LetterWorld } from './letterWorld';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropOnBasket(w: LetterWorld, char: string) {
  w.letters = [
    { id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 26, char },
  ];
}

describe('LetterWorld', () => {
  it('exposes the target as the HUD prompt and starts at 0/8', () => {
    const w = new LetterWorld(W, H);
    const hud = w.hud();
    expect(hud.prompt).toBe(w.target);
    expect(hud.badges?.[0].label).toBe('0/8');
  });

  it('catching the target scores and advances to a new target', () => {
    const w = new LetterWorld(W, H);
    const first = w.target;
    dropOnBasket(w, w.target);
    w.update(NO_HAND);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
    expect(w.target).not.toBe(first); // new round
  });

  it('catching a wrong letter does not score (no penalty)', () => {
    const w = new LetterWorld(W, H);
    const wrong = w.target === 'A' ? 'B' : 'A';
    dropOnBasket(w, wrong);
    w.update(NO_HAND);
    expect(w.score).toBe(0);
    expect(w.correct).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('wins after 8 correct catches', () => {
    const w = new LetterWorld(W, H);
    for (let i = 0; i < 8; i++) {
      dropOnBasket(w, w.target);
      w.update(NO_HAND);
    }
    expect(w.correct).toBe(8);
    expect(w.gameOver).toBe(true);
  });
});
