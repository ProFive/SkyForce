import { KeysWorld } from '../engine/keysWorld';
import type { GameModule } from '../types';

export const keys: GameModule = {
  id: 'keys',
  title: 'Piano Keys',
  icon: '🎹',
  tagline: 'Touch the glowing keys — play Twinkle Twinkle',
  accent: '#ffd25e',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Watch the glowing key and touch it on the piano to play the next note of ' +
    'Twinkle Twinkle Little Star. Clear 10 levels to finish the song!',
  create: (width, height) => new KeysWorld(width, height),
};
