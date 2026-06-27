import { GrowWorld } from '../engine/growWorld';
import type { GameModule } from '../types';

export const growplant: GameModule = {
  id: 'growplant',
  title: 'Grow a Flower',
  icon: '🌸',
  tagline: 'Touch to water — watch it bloom',
  accent: '#7dff9b',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Touch the plant to water it. Watch it grow from a sprout to a beautiful ' +
    'flower! Bloom enough times to clear 10 levels. There are no wrong answers — ' +
    'just keep watering.',
  create: (width, height) => new GrowWorld(width, height),
};
