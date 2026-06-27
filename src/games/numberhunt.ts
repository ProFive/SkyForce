import { NumberHuntWorld } from '../engine/numberHuntWorld';
import type { GameModule } from '../types';

export const numberhunt: GameModule = {
  id: 'numberhunt',
  title: 'Number Hunt',
  icon: '🔢',
  tagline: 'Catch even, odd, or bigger numbers',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Read the rule at the top — catch EVEN numbers, ODD numbers, or numbers ' +
    'greater/less than a target. Slide the basket to catch the right ones. ' +
    'Clear 10 levels to win!',
  create: (width, height) => new NumberHuntWorld(width, height),
};
