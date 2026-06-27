import { TouchWorld } from '../engine/touchWorld';
import { COLORS } from '../engine/content';
import type { GameModule } from '../types';

export const learncolors: GameModule = {
  id: 'learncolors',
  title: 'Learn Colors',
  icon: '🎨',
  tagline: 'Listen, then find the right color',
  accent: '#b07dff',
  category: 'learn',
  howTo:
    'Listen to the color, then reach out and touch the matching blob. ' +
    'Clear 10 levels to win — higher levels add more colors and smaller blobs. ' +
    'Every guess is welcome!',
  create: (width, height) => new TouchWorld(width, height, COLORS, 'color', 'Find'),
};
