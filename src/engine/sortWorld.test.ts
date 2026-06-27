import { describe, it, expect } from 'vitest';
import { SortWorld, type SortFallItem } from './sortWorld';
import { FRUITS, ANIMALS, type Item } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const CONFIG = {
  leftPack: FRUITS,
  rightPack: ANIMALS,
  leftBin: '🧺',
  rightBin: '🏠',
  leftName: 'fruit',
  rightName: 'animals',
};

const handLeft: HandPosition = { x: 0.25, y: 0.85, confidence: 1, available: true };
const handRight: HandPosition = { x: 0.75, y: 0.85, confidence: 1, available: true };

function dropOnBin(w: SortWorld, item: Item, side: 'left' | 'right') {
  const bin = side === 'left' ? w.leftBin : w.rightBin;
  w.activeSide = side;
  w.items = [
    {
      id: 1,
      x: bin.x,
      y: bin.y,
      vy: 0,
      r: 24,
      item,
      side,
    } satisfies SortFallItem,
  ];
}

describe('SortWorld', () => {
  it('starts at level 1 with progress badge and bin prompt', () => {
    const w = new SortWorld(W, H, CONFIG);
    const hud = w.hud();
    expect(hud.level).toBe(1);
    expect(hud.prompt).toBe('🧺 | 🏠');
    expect(hud.badges?.[0].label).toBe(`0/${levelGoal(1)}`);
  });

  it('sorting into the correct bin scores +10', () => {
    const w = new SortWorld(W, H, CONFIG);
    dropOnBin(w, FRUITS[0], 'left');
    w.update(handLeft);
    expect(w.score).toBe(10);
    expect(w.correct).toBe(1);
  });

  it('sorting into the wrong bin does not score and does not end the game', () => {
    const w = new SortWorld(W, H, CONFIG);
    dropOnBin(w, ANIMALS[0], 'right');
    w.activeSide = 'left';
    w.items[0].side = 'right';
    w.update(handLeft);
    expect(w.score).toBe(0);
    expect(w.correct).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('advances to the next level after clearing the level goal', () => {
    const w = new SortWorld(W, H, CONFIG);
    for (let i = 0; i < levelGoal(1); i++) {
      dropOnBin(w, FRUITS[0], 'left');
      w.update(handLeft);
    }
    expect(w.level).toBe(2);
    expect(w.correct).toBe(0);
  });

  it('wins only after clearing every level', () => {
    const w = new SortWorld(W, H, CONFIG);
    let guard = 0;
    while (!w.gameOver && guard++ < 500) {
      dropOnBin(w, FRUITS[0], 'left');
      w.update(handLeft);
    }
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('switches active side based on finger position', () => {
    const w = new SortWorld(W, H, CONFIG);
    w.update(handRight);
    expect(w.activeSide).toBe('right');
    w.update(handLeft);
    expect(w.activeSide).toBe('left');
  });
});
