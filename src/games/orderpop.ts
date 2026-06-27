import { OrderWorld } from '../engine/orderWorld';
import type { GameModule } from '../types';

export const orderpop: GameModule = {
  id: 'orderpop',
  title: 'Pop in Order',
  icon: '🫧',
  tagline: 'Pop the bubbles 1-2-3 or A-B-C',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Listen for the order, then pop each bubble in sequence — 1, then 2, then 3 ' +
    '(letters come at higher levels). Clear 10 levels to win. ' +
    'Pop the wrong one and it just wiggles — try again!',
  create: (width, height) => new OrderWorld(width, height, 'number'),
};
