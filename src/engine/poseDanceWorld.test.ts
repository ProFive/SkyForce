import { describe, it, expect } from 'vitest';
import { PoseDanceWorld } from './poseDanceWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition, Vec2 } from '../types';

const W = 480;
const H = 720;

function armsUpPose(): Vec2[] {
  const lm: Vec2[] = [];
  for (let i = 0; i < 33; i++) lm.push({ x: 0.5, y: 0.5 });
  lm[11] = { x: 0.4, y: 0.4 };
  lm[12] = { x: 0.6, y: 0.4 };
  lm[15] = { x: 0.35, y: 0.2 };
  lm[16] = { x: 0.65, y: 0.2 };
  lm[23] = { x: 0.42, y: 0.7 };
  lm[24] = { x: 0.58, y: 0.7 };
  return lm;
}

const poseHand = (landmarks: Vec2[]): HandPosition => ({
  x: 0.5,
  y: 0.5,
  confidence: 1,
  available: false,
  pose: { available: true, landmarks },
});

describe('PoseDanceWorld', () => {
  it('starts with a pose prompt', () => {
    const w = new PoseDanceWorld(W, H);
    expect(w.hud().prompt).toBeTruthy();
    expect(w.hud().badges?.[1].label).toBeTruthy();
  });

  it('scores after holding the matching pose', () => {
    const w = new PoseDanceWorld(W, H);
    w.challenge = { id: 'armsUp', emoji: '🙌', speak: 'Up', label: 'Arms up' };
    for (let i = 0; i < 18; i++) w.update(poseHand(armsUpPose()));
    expect(w.score).toBe(10);
  });

  it('wins when the final level goal is cleared', () => {
    const w = new PoseDanceWorld(W, H);
    w.challenge = { id: 'armsUp', emoji: '🙌', speak: 'Up', label: 'Arms up' };
    w.level = MAX_LEVEL;
    w.correct = levelGoal(MAX_LEVEL) - 1;
    for (let i = 0; i < 18; i++) w.update(poseHand(armsUpPose()));
    expect(w.gameOver).toBe(true);
  });

  it('advances level after clearing the level goal', () => {
    const w = new PoseDanceWorld(W, H);
    const challenge = { id: 'armsUp' as const, emoji: '🙌', speak: 'Up', label: 'Arms up' };
    for (let n = 0; n < levelGoal(1); n++) {
      w.challenge = challenge;
      for (let i = 0; i < 18; i++) w.update(poseHand(armsUpPose()));
    }
    expect(w.level).toBe(2);
  });
});
