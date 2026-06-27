import { VersusWorld } from '../engine/versusWorld';
import type { GameModule } from '../types';

export const versus: GameModule = {
  id: 'versus',
  title: 'Two-Hand Race',
  icon: '🏁',
  tagline: 'Blue vs red — who touches the star first?',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'advanced',
  howTo:
    'Two players (or both your hands): left hand is blue, right hand is red. ' +
    'When a star appears, race to touch it first! Clear 10 levels to win.',
  create: (width, height) => new VersusWorld(width, height),
};
