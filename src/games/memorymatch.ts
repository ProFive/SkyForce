import { MemoryWorld } from '../engine/memoryWorld';
import { ANIMALS } from '../engine/content';
import type { GameModule } from '../types';

export const memorymatch: GameModule = {
  id: 'memorymatch',
  title: 'Memory Match',
  icon: '🃏',
  tagline: 'Flip two cards — find the matching animals',
  accent: '#da77f2',
  category: 'learn',
  howTo:
    'Touch a card to flip it, then touch another. When two cards show the same ' +
    'animal, they stay matched. Find enough pairs to clear each level — ' +
    'higher levels add more cards. Wrong guesses flip back — keep trying!',
  create: (width, height) =>
    new MemoryWorld(width, height, { pack: ANIMALS, mode: 'same' }),
};
