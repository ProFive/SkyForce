import { describe, it, expect } from 'vitest';
import { HeadSteerWorld } from './headSteerWorld';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const headAt = (x: number): HandPosition => ({
  x: 0.5,
  y: 0.5,
  confidence: 1,
  available: false,
  headSteer: { available: true, x },
});

describe('HeadSteerWorld', () => {
  it('starts with head-steer badge', () => {
    const w = new HeadSteerWorld(W, H);
    expect(w.hud().badges?.[0].label).toBe('↔ head');
  });

  it('moves the player toward head tilt', () => {
    const w = new HeadSteerWorld(W, H);
    w.update(headAt(0.9));
    expect(w.player.x).toBeGreaterThan(W / 2);
  });

  it('collects stars that overlap the player', () => {
    const w = new HeadSteerWorld(W, H);
    w.player.x = W / 2;
    w.player.y = H * 0.72;
    w.stars = [{ id: 1, x: w.player.x, y: w.player.y, vy: 0, r: 16 }];
    w.update(headAt(0.5));
    expect(w.score).toBe(10);
  });
});
