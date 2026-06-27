import { SpellWorld } from '../engine/spellWorld';
import type { GameModule } from '../types';

export const spellword: GameModule = {
  id: 'spellword',
  title: 'Spell the Word',
  icon: '🔡',
  tagline: 'Slice the letters in order to spell',
  accent: '#7dff9b',
  category: 'learn',
  howTo:
    'Look at the picture and listen to the word. Swipe your finger to slice ' +
    'the flying letters in the right order to spell it (C-A-T). Spell 6 words ' +
    'to win — wrong letters never hurt you!',
  legend: [{ symbol: '🔠', color: '#5cd2ff', text: 'slice in order' }],
  create: (width, height) => new SpellWorld(width, height),
};
