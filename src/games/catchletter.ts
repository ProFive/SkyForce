import { LetterWorld } from '../engine/letterWorld';
import type { GameModule } from '../types';

export const catchletter: GameModule = {
  id: 'catchletter',
  title: 'Catch the Letter',
  icon: '🔤',
  tagline: 'Learn the ABCs — catch the right letter',
  accent: '#5cd2ff',
  category: 'learn',
  howTo:
    'Listen and look at the letter to find, then slide the basket to catch ' +
    'that letter as it falls. Catch 8 to win — no wrong answers hurt you!',
  create: (width, height) => new LetterWorld(width, height),
};
