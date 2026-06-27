import { PoseDanceWorld } from '../engine/poseDanceWorld';
import type { GameModule } from '../types';

export const posedance: GameModule = {
  id: 'posedance',
  title: 'Pose Dance',
  icon: '🤸',
  tagline: 'Copy the pose with your whole body',
  accent: '#7dff9b',
  category: 'learn',
  group: 'advanced',
  input: 'pose',
  howTo:
    'Step back so the camera sees you from head to hips. Listen, then copy ' +
    'the pose — arms up, T-pose, hands on hips, or wave! Hold it briefly to ' +
    'score. Clear 10 levels to win.',
  create: (width, height) => new PoseDanceWorld(width, height),
};
