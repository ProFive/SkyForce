import { GameWorld } from '../engine/gameWorld';
import type { GameModule } from '../types';

export const skyforce: GameModule = {
  id: 'skyforce',
  title: 'Sky Force',
  icon: '🚀',
  tagline: 'Finger-controlled flight',
  accent: '#3affd0',
  howTo:
    'Move your index finger to fly. Your ship fires automatically. Grab ' +
    'power-ups, clear each wave, and survive the boss every 5 levels.',
  legend: [
    { symbol: 'W', color: '#7dff9b', text: 'spread' },
    { symbol: 'R', color: '#ffd25e', text: 'rapid' },
    { symbol: 'S', color: '#5cd2ff', text: 'shield' },
    { symbol: '+', color: '#ff5d7a', text: 'life' },
  ],
  create: (width, height) => new GameWorld(width, height),
};
