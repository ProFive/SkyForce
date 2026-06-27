import { describe, it, expect } from 'vitest';
import { ThumbQuizWorld } from './thumbQuizWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const thumbUp = (): HandPosition => ({
  x: 0.5,
  y: 0.5,
  confidence: 1,
  available: true,
  gesture: 'thumbUp',
});

describe('ThumbQuizWorld', () => {
  it('starts with a fact prompt and gesture hint badge', () => {
    const w = new ThumbQuizWorld(W, H);
    expect(w.hud().prompt).toBe(w.fact.text);
    expect(w.hud().badges?.[1].label).toBe('👍 / 👎');
  });

  it('scores after holding the correct gesture', () => {
    const w = new ThumbQuizWorld(W, H);
    w.fact = { text: 'Test', answer: true };
    for (let i = 0; i < 14; i++) w.update(thumbUp());
    expect(w.score).toBe(10);
  });

  it('wins after clearing every level', () => {
    const w = new ThumbQuizWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 600) {
      w.fact = { text: 'T', answer: true };
      for (let i = 0; i < 14; i++) w.update(thumbUp());
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new ThumbQuizWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      w.fact = { text: 'T', answer: true };
      for (let i = 0; i < 14; i++) w.update(thumbUp());
    }
    expect(w.level).toBe(2);
  });
});
