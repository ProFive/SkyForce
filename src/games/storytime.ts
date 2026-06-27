import { StoryWorld } from '../engine/storyWorld';
import type { GameModule } from '../types';

export const storytime: GameModule = {
  id: 'storytime',
  title: 'Story Time',
  icon: '📖',
  tagline: 'Touch the characters — hear an English story',
  accent: '#da77f2',
  category: 'learn',
  group: 'age3to5',
  howTo:
    'Listen to the story, then touch a character to choose what happens next. ' +
    'Pick the kind choice to continue. Clear 10 chapters to finish the tale!',
  create: (width, height) => new StoryWorld(width, height),
};
