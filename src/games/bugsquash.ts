import { SquashWorld } from '../engine/squashWorld';
import type { GameModule } from '../types';

export const bugsquash: GameModule = {
  id: 'bugsquash',
  title: 'Bug Squash',
  icon: '🐛',
  tagline: 'Squash the bugs, skip the bombs',
  accent: '#7dff9b',
  howTo:
    'Move your finger over the bugs to squash them before they vanish. ' +
    'Touch a bomb and you lose a life — let those tick away on their own.',
  legend: [
    { symbol: '🐛', color: '#7dff9b', text: 'squash' },
    { symbol: '💣', color: '#ff4d4d', text: 'avoid' },
  ],
  create: (width, height) => new SquashWorld(width, height),
};
