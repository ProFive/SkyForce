import { PinchPuzzleWorld } from '../engine/pinchPuzzleWorld';
import type { GameModule } from '../types';

export const pinchpuzzle: GameModule = {
  id: 'pinchpuzzle',
  title: 'Pinch & Spell',
  icon: '🤏',
  tagline: 'Pinch letter tiles — drag them into place',
  accent: '#5cd2ff',
  category: 'learn',
  group: 'advanced',
  howTo:
    'Pinch your thumb and finger together 🤏 to grab a letter tile, move it to ' +
    'the matching slot, then open your hand to drop. Spell the animal name to ' +
    'clear 10 levels!',
  create: (width, height) => new PinchPuzzleWorld(width, height),
};
