import { BrickWorld } from '../engine/brickWorld';
import type { GameModule } from '../types';

export const brickbreaker: GameModule = {
  id: 'brickbreaker',
  title: 'Brick Breaker',
  icon: '🧱',
  tagline: 'Bounce the ball, clear the wall',
  accent: '#5cd2ff',
  howTo:
    'Move your finger to slide the paddle and keep the ball alive. Clear all ' +
    'the bricks to advance; the ball speeds up each level.',
  create: (width, height) => new BrickWorld(width, height),
};
