import { describe, it, expect } from 'vitest';
import { RpsWorld } from './rpsWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const gesture = (g: 'rock' | 'paper' | 'scissors'): HandPosition => ({
  x: 0.5,
  y: 0.5,
  confidence: 1,
  available: true,
  gesture: g,
});

describe('RpsWorld', () => {
  it('starts with computer move in prompt', () => {
    const w = new RpsWorld(W, H);
    expect(w.hud().prompt).toContain('vs');
    expect(w.level).toBe(1);
  });

  it('resolves after holding a gesture', () => {
    const w = new RpsWorld(W, H);
    w.computer = 'rock';
    for (let i = 0; i < 14; i++) w.update(gesture('paper'));
    expect(w.score).toBe(10);
  });

  it('wins after enough round wins', () => {
    const w = new RpsWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 800) {
      w.computer = 'rock';
      for (let i = 0; i < 14; i++) w.update(gesture('paper'));
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new RpsWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      w.computer = 'scissors';
      for (let i = 0; i < 14; i++) w.update(gesture('rock'));
    }
    expect(w.level).toBe(2);
  });
});
