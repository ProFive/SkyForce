import { describe, it, expect } from 'vitest';
import { MathWorld, makeProblem, speakProblem } from './mathWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropOnBasket(w: MathWorld, value: number) {
  w.items = [{ id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 24, value }];
}

describe('makeProblem', () => {
  it('produces valid addition answers', () => {
    for (let i = 0; i < 20; i++) {
      const p = makeProblem(2);
      if (p.op === '+') expect(p.answer).toBe(p.a + p.b);
    }
  });

  it('produces non-negative subtraction answers from level 5+', () => {
    for (let i = 0; i < 20; i++) {
      const p = makeProblem(6);
      if (p.op === '-') {
        expect(p.answer).toBe(p.a - p.b);
        expect(p.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('speakProblem uses plus/minus words', () => {
    expect(speakProblem({ a: 2, b: 3, op: '+', answer: 5, prompt: '2 + 3 = ?' })).toContain(
      'plus'
    );
    expect(speakProblem({ a: 5, b: 2, op: '-', answer: 3, prompt: '5 - 2 = ?' })).toContain(
      'minus'
    );
  });
});

describe('MathWorld', () => {
  it('starts with equation prompt and level progress', () => {
    const w = new MathWorld(W, H);
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(hud.prompt).toBe(w.problem.prompt);
    expect(hud.badges?.[0].label).toBe(`0/${levelGoal(1)}`);
  });

  it('catching the correct answer scores +10', () => {
    const w = new MathWorld(W, H);
    dropOnBasket(w, w.problem.answer);
    w.update(NO_HAND);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('catching a wrong number does not score', () => {
    const w = new MathWorld(W, H);
    const wrong = w.problem.answer === 0 ? 9 : w.problem.answer - 1;
    dropOnBasket(w, wrong);
    w.update(NO_HAND);
    expect(w.score).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('advances level after clearing the level goal', () => {
    const w = new MathWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) {
      dropOnBasket(w, w.problem.answer);
      w.update(NO_HAND);
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0);
  });

  it('wins after clearing every level', () => {
    const w = new MathWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 500) {
      dropOnBasket(w, w.problem.answer);
      w.update(NO_HAND);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
