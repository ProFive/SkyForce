import { MathWorld } from '../engine/mathWorld';
import type { GameModule } from '../types';

export const mathcatch: GameModule = {
  id: 'mathcatch',
  title: 'Math Catch',
  icon: '➕',
  tagline: 'Read the sum, catch the answer',
  accent: '#ffd25e',
  category: 'learn',
  howTo:
    'Read the equation at the top, then move your finger to slide the basket. ' +
    'Catch the falling number that is the right answer. ' +
    'Clear 10 levels to win — subtraction joins in later levels. ' +
    'Wrong catches never stop you!',
  create: (width, height) => new MathWorld(width, height),
};
