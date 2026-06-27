import { ThumbQuizWorld } from '../engine/thumbQuizWorld';
import type { GameModule } from '../types';

export const thumbquiz: GameModule = {
  id: 'thumbquiz',
  title: 'Thumbs Up or Down',
  icon: '👍',
  tagline: 'True or false — answer with your thumb',
  accent: '#7dff9b',
  category: 'learn',
  group: 'advanced',
  howTo:
    'Listen to the sentence. Thumbs up 👍 if it is TRUE. Thumbs down 👎 if it is ' +
    'FALSE. Hold your gesture for a moment to answer. Clear 10 levels to win!',
  create: (width, height) => new ThumbQuizWorld(width, height),
};
