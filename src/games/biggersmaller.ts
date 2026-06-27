import { SizeTouchWorld } from '../engine/sizeTouchWorld';
import { ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const biggersmaller: GameModule = {
  id: 'biggersmaller',
  title: 'Bigger or Smaller',
  icon: '🐘',
  tagline: 'Touch the bigger or smaller animal',
  accent: '#ffb86b',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Listen — "Touch the bigger one" or "Touch the smaller one" — then reach ' +
    'out and touch the right size. Same animal, different sizes! ' +
    'Clear 10 levels to win. Wrong touches never stop you.',
  create: (width, height) => new SizeTouchWorld(width, height, ANIMALS),
};
