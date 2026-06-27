import { TouchWorld } from '../engine/touchWorld';
import { ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const wordmatch: GameModule = {
  id: 'wordmatch',
  title: 'Picture & Word',
  icon: '🖼️',
  tagline: 'See the picture, touch the right word',
  accent: '#5cd2ff',
  category: 'learn',
  howTo:
    'Look at the picture, then read the words and touch the one that matches. ' +
    'Clear 10 levels to win — higher levels add more words and smaller targets.',
  create: (width, height) => new TouchWorld(width, height, ANIMALS, 'word', 'Find the word'),
};
