import { FruitWorld } from '../engine/fruitWorld';
import type { GameModule } from '../types';

export const fruitslash: GameModule = {
  id: 'fruitslash',
  title: 'Fruit Slash',
  icon: '🍉',
  tagline: 'Slice the fruit, dodge the bombs',
  accent: '#ff5d7a',
  howTo:
    'Swipe your finger across the screen to slice the flying fruit. Chain ' +
    'slices for combos, avoid the bombs, and don’t let fruit fall.',
  legend: [
    { symbol: '🍉', color: '#ff5d7a', text: 'slice' },
    { symbol: '💣', color: '#ff4d4d', text: 'avoid' },
  ],
  create: (width, height) => new FruitWorld(width, height),
};
