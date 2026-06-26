import { DodgeWorld } from '../engine/dodgeWorld';
import type { GameModule } from '../types';

export const dodgerunner: GameModule = {
  id: 'dodgerunner',
  title: 'Dodge Runner',
  icon: '☄️',
  tagline: 'Weave through the falling rocks',
  accent: '#ff7a5d',
  howTo:
    'Move your finger to fly your ship and dodge the falling rocks. The ' +
    'longer you survive the higher your score — and the faster it gets.',
  create: (width, height) => new DodgeWorld(width, height),
};
