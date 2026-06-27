import { MemoryWorld } from '../engine/memoryWorld';
import { ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const memoword: GameModule = {
  id: 'memoword',
  title: 'Picture & Word',
  icon: '🖼️',
  tagline: 'Match the animal picture to its English word',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Flip a card to see a picture or a word. Find the picture and the English ' +
    'word that go together — for example 🐱 and cat. Clear 10 levels to win; ' +
    'more pairs appear as you go. Mismatches flip back — no penalty!',
  create: (width, height) =>
    new MemoryWorld(width, height, { pack: ANIMALS, mode: 'picture-word' }),
};
