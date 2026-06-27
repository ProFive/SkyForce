import { describe, it, expect } from 'vitest';
import { QuizWorld, type QuizGenerator } from './quizWorld';
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

// A trivial generator so pickRound() always succeeds (one correct option).
const stubGen: QuizGenerator = () => ({
  promptText: 'pick A',
  speak: 'pick A',
  options: [
    { kind: 'text', text: 'A', correct: true },
    { kind: 'text', text: 'B', correct: false },
  ],
});

// Deterministic round: correct option at (100,100), wrong at (300,300).
function setRound(w: QuizWorld) {
  w.cooldown = 0;
  w.choices = [
    { id: 1, x: 100, y: 100, r: 56, option: { kind: 'text', text: 'A', correct: true } },
    { id: 2, x: 300, y: 300, r: 56, option: { kind: 'text', text: 'B', correct: false } },
  ];
}

describe('QuizWorld', () => {
  it('starts at level 1 with a 0/goal progress badge', () => {
    const w = new QuizWorld(W, H, stubGen);
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(hud.badges?.[0].label).toBe(`0/${levelGoal(1)}`);
  });

  it('touching the correct option scores +10', () => {
    const w = new QuizWorld(W, H, stubGen);
    setRound(w);
    w.update(handAt(100, 100));
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('touching a wrong option does not score and does not end the game', () => {
    const w = new QuizWorld(W, H, stubGen);
    setRound(w);
    w.update(handAt(300, 300));
    expect(w.score).toBe(0);
    expect(w.correct).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('advances to the next level after clearing the level goal', () => {
    const w = new QuizWorld(W, H, stubGen);
    for (let i = 0; i < levelGoal(1); i++) {
      setRound(w);
      w.update(handAt(100, 100));
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0);
  });

  it('wins only after clearing every level', () => {
    const w = new QuizWorld(W, H, stubGen);
    let guard = 0;
    while (!w.gameOver && guard++ < 500) {
      setRound(w);
      w.update(handAt(100, 100));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });
});
