import { TouchWorld } from '../engine/touchWorld';
import { ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const touchanimal: GameModule = {
  id: 'touchanimal',
  title: 'Touch the Animal',
  icon: '🐱',
  tagline: 'Listen, then touch the right animal',
  accent: '#7dff9b',
  category: 'learn',
  howTo:
    'Listen to the animal name, then reach out and touch the matching animal. ' +
    'Get 6 right to win — try as many times as you like!',
  create: (width, height) => new TouchWorld(width, height, ANIMALS, 'emoji', 'Touch the'),
};
