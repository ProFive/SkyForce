import { describe, it, expect } from 'vitest';
import { StoryWorld } from './storyWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const handAt = (x: number, y: number): HandPosition => ({
  x: x / W,
  y: y / H,
  confidence: 1,
  available: true,
});

describe('StoryWorld', () => {
  it('starts with narration and touch choices', () => {
    const w = new StoryWorld(W, H);
    expect(w.narration.length).toBeGreaterThan(0);
    expect(w.hotspots.length).toBeGreaterThanOrEqual(2);
  });

  it('scores when the correct choice is touched', () => {
    const w = new StoryWorld(W, H);
    const right = w.hotspots.find((h) => h.choice.correct)!;
    w.update(handAt(right.x, right.y));
    expect(w.score).toBe(10);
  });

  it('does not score on a wrong choice', () => {
    const w = new StoryWorld(W, H);
    const wrong = w.hotspots.find((h) => !h.choice.correct)!;
    for (let i = 0; i < 16; i++) w.update(handAt(wrong.x, wrong.y));
    expect(w.score).toBe(0);
  });

  it('wins after clearing every level', () => {
    const w = new StoryWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 600) {
      const right = w.hotspots.find((h) => h.choice.correct)!;
      for (let i = 0; i < 16; i++) w.update(handAt(right.x, right.y));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new StoryWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      const right = w.hotspots.find((h) => h.choice.correct)!;
      for (let i = 0; i < 16; i++) w.update(handAt(right.x, right.y));
    }
    expect(w.level).toBe(2);
  });
});
