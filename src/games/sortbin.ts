import { SortWorld } from '../engine/sortWorld';
import { FRUITS, ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const sortbin: GameModule = {
  id: 'sortbin',
  title: 'Sort It Out',
  icon: '🧺',
  tagline: 'Fruit in the basket, animals in the pen',
  accent: '#7dff9b',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Move your finger to the left side to catch fruit in the basket. ' +
    'Move to the right side to put animals in the pen. ' +
    'Clear 10 levels to win — items fall faster as you go. ' +
    'Wrong sorts never stop you — keep trying!',
  legend: [
    { symbol: '🧺', color: '#ffd25e', text: 'fruit → left' },
    { symbol: '🏠', color: '#7dff9b', text: 'animal → right' },
  ],
  create: (width, height) =>
    new SortWorld(width, height, {
      leftPack: FRUITS,
      rightPack: ANIMALS,
      leftBin: '🧺',
      rightBin: '🏠',
      leftName: 'fruit',
      rightName: 'animals',
    }),
};
