import { HeadSteerWorld } from '../engine/headSteerWorld';
import type { GameModule } from '../types';

export const headsteer: GameModule = {
  id: 'headsteer',
  title: 'Head Steer',
  icon: '🚀',
  tagline: 'Tilt your head to fly and catch stars',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'advanced',
  input: 'head',
  howTo:
    'Tilt your head left and right to steer the rocket. Catch falling stars ' +
    'to score! Great if your hands are busy — use a finger at the top of the ' +
    'screen to return to the menu.',
  create: (width, height) => new HeadSteerWorld(width, height),
};
