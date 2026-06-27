import { RpsWorld } from '../engine/rpsWorld';
import type { GameModule } from '../types';

export const rps: GameModule = {
  id: 'rps',
  title: 'Rock Paper Scissors',
  icon: '✊',
  tagline: 'Beat the computer with your hand',
  accent: '#ff8787',
  category: 'learn',
  group: 'advanced',
  howTo:
    'The computer picks rock, paper, or scissors. Show the same gesture with ' +
    'your hand — ✊ rock, ✋ paper, ✌️ scissors — and hold it briefly. ' +
    'Win enough rounds to clear 10 levels!',
  create: (width, height) => new RpsWorld(width, height),
};
