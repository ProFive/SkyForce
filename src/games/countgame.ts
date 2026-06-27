import { CountWorld } from '../engine/countWorld';
import type { GameModule } from '../types';

export const countgame: GameModule = {
  id: 'countgame',
  title: 'Count With Me',
  icon: '🔢',
  tagline: 'Catch the stars and count along',
  accent: '#ffe45e',
  category: 'learn',
  howTo:
    'Listen for how many stars to catch, then slide the basket to catch them ' +
    'while we count together. Count higher and faster each level — clear 10 to win!',
  create: (width, height) => new CountWorld(width, height),
};
