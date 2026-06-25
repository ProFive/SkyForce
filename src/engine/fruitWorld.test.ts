import { describe, it, expect } from 'vitest';
import { FruitWorld, type Fruit } from './fruitWorld';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const handAt = (nx: number, ny: number): HandPosition => ({
  x: nx,
  y: ny,
  confidence: 1,
  available: true,
});
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function fruit(over: Partial<Fruit> = {}): Fruit {
  return {
    id: 1,
    x: W / 2,
    y: H / 2,
    vx: 0,
    vy: 0,
    r: 30,
    emoji: '🍉',
    color: '#0f0',
    bomb: false,
    spin: 0,
    spinV: 0,
    ...over,
  };
}

describe('FruitWorld', () => {
  it('starts with 10 lives, no score, not over', () => {
    const w = new FruitWorld(W, H);
    expect(w.lives).toBe(10);
    expect(w.score).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('slices a fruit the blade passes through and scores', () => {
    const w = new FruitWorld(W, H);
    w.fruits = [fruit()];
    // Two frames with the finger on the fruit: first sets the blade, second slices.
    const onFruit = handAt(0.5, 0.5);
    w.update(onFruit);
    w.update(onFruit);
    expect(w.score).toBeGreaterThanOrEqual(10);
    expect(w.fruits.some((f) => f.id === 1)).toBe(false);
  });

  it('ends the game when a bomb is sliced', () => {
    const w = new FruitWorld(W, H);
    w.fruits = [fruit({ bomb: true })];
    const onBomb = handAt(0.5, 0.5);
    w.update(onBomb);
    w.update(onBomb);
    expect(w.gameOver).toBe(true);
  });

  it('costs a life when a fruit falls past the bottom', () => {
    const w = new FruitWorld(W, H);
    // A fruit already below the bottom, moving down -> a miss.
    w.fruits = [fruit({ x: 50, y: H + 40, vy: 4 })];
    w.update(NO_HAND);
    expect(w.lives).toBe(9);
  });

  it('does not penalize a dodged bomb that falls off', () => {
    const w = new FruitWorld(W, H);
    w.fruits = [fruit({ bomb: true, x: 50, y: H + 40, vy: 4 })];
    w.update(NO_HAND);
    expect(w.lives).toBe(10);
    expect(w.gameOver).toBe(false);
  });

  it('reaching 0 lives ends the game', () => {
    const w = new FruitWorld(W, H);
    w.lives = 1;
    w.fruits = [fruit({ x: 50, y: H + 40, vy: 4 })];
    w.update(NO_HAND);
    expect(w.lives).toBe(0);
    expect(w.gameOver).toBe(true);
  });
});
