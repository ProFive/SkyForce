import { CatchWorld } from '../engine/catchWorld';
import type { GameModule } from '../types';

export const catchit: GameModule = {
  id: 'catchit',
  title: 'Catch It',
  icon: '🧺',
  tagline: 'Catch the goodies, dodge the bombs',
  accent: '#ffd25e',
  howTo:
    'Move your finger to slide the basket. Catch fruit, stars, and gems for ' +
    'points — but let the bombs and rocks fall past you.',
  legend: [
    { symbol: '⭐', color: '#ffe45e', text: 'catch' },
    { symbol: '💣', color: '#ff4d4d', text: 'avoid' },
  ],
  create: (width, height) => new CatchWorld(width, height),
};
