import { describe, it, expect } from 'vitest';
import {
  NumberHuntWorld,
  makeChallenge,
  matchesRule,
} from './numberHuntWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function dropOnBasket(w: NumberHuntWorld, value: number) {
  w.items = [{ id: 1, x: w.basket.x, y: w.basket.y, vy: 0, r: 24, value }];
}

describe('matchesRule', () => {
  it('matches even and odd', () => {
    expect(matchesRule(4, { rule: 'even', threshold: 0, prompt: '', speak: '' })).toBe(
      true
    );
    expect(matchesRule(3, { rule: 'odd', threshold: 0, prompt: '', speak: '' })).toBe(
      true
    );
  });
});

describe('NumberHuntWorld', () => {
  it('starts with a hunt prompt', () => {
    const w = new NumberHuntWorld(W, H);
    expect(w.hud().prompt).toBeTruthy();
    expect(w.hud().level).toBe(1);
  });

  it('catching a matching number scores +10', () => {
    const w = new NumberHuntWorld(W, H);
    const c = makeChallenge(1);
    w.challenge = c;
    let v = 4;
    if (!matchesRule(v, c)) v = 5;
    dropOnBasket(w, v);
    w.update(NO_HAND);
    if (matchesRule(v, c)) expect(w.score).toBe(10);
  });

  it('wins after clearing every level', () => {
    const w = new NumberHuntWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 600) {
      let v = 0;
      while (!matchesRule(v, w.challenge) && v < 20) v++;
      dropOnBasket(w, v);
      w.update(NO_HAND);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new NumberHuntWorld(W, H);
    for (let i = 0; i < levelGoal(1); i++) {
      let v = 0;
      while (!matchesRule(v, w.challenge) && v < 20) v++;
      dropOnBasket(w, v);
      w.update(NO_HAND);
    }
    expect(w.level).toBe(2);
  });
});
