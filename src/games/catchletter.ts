import { LetterWorld } from '../engine/letterWorld';
import type { GameModule } from '../types';

export const catchletter: GameModule = {
  id: 'catchletter',
  title: 'Catch the Letter',
  icon: '🔤',
  tagline: 'Learn the ABCs and their sounds',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Listen to the letter and the sound it makes (“B says buh”), then slide ' +
    'the basket to catch that letter as it falls. Catch 8 to win — no wrong ' +
    'answers hurt you!',
  create: (width, height) => new LetterWorld(width, height),
};
