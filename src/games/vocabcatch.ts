import { VocabWorld } from '../engine/vocabWorld';
import type { GameModule } from '../types';

export const vocabcatch: GameModule = {
  id: 'vocabcatch',
  title: 'Catch the Word',
  icon: '🍎',
  tagline: 'Hear it, catch it — learn words',
  accent: '#ffd25e',
  category: 'learn',
  howTo:
    'Listen to the word, then slide the basket to catch the matching picture. ' +
    'Catch 8 to win — no wrong answers hurt you!',
  create: (width, height) => new VocabWorld(width, height),
};
