import { TwoHandWorld } from '../engine/twoHandWorld';
import type { GameModule } from '../types';

export const twohand: GameModule = {
  id: 'twohand',
  title: 'Clap to the Beat',
  icon: '👏',
  tagline: 'Show both hands — clap when the circle glows',
  accent: '#ffd25e',
  category: 'learn',
  group: 'advanced',
  howTo:
    'Hold both hands in front of the camera. When the big circle glows and says ' +
    'CLAP, bring your hands together for a clap! Clear 10 levels — the beat ' +
    'gets faster.',
  create: (width, height) => new TwoHandWorld(width, height),
};
