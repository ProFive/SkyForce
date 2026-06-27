import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import { ANIMALS, ANIMAL_SOUNDS, pick, type Item } from '../engine/content';
import type { GameModule } from '../types';

// Only animals we have an English sound for can appear in this game.
const POOL: Item[] = ANIMALS.filter((a) => ANIMAL_SOUNDS[a.en]);

const animalSoundRound: QuizGenerator = (_level, count) => {
  const chosen: Item[] = [];
  while (chosen.length < Math.min(count, POOL.length)) {
    const a = pick(POOL);
    if (!chosen.some((c) => c.en === a.en)) chosen.push(a);
  }
  const target = chosen[0];
  const sound = ANIMAL_SOUNDS[target.en];
  const options: QuizOption[] = chosen
    .map((a) => ({
      kind: 'emoji' as const,
      emoji: a.emoji,
      correct: a.en === target.en,
    }))
    .sort(() => Math.random() - 0.5);

  return {
    promptText: `Who says "${sound}"?`,
    speak: `I say ${sound}. Who am I?`,
    options,
  };
};

export const animalsound: GameModule = {
  id: 'animalsound',
  title: 'Animal Sounds',
  icon: '🔊',
  tagline: 'Hear the sound, touch the animal',
  accent: '#ffb86b',
  category: 'learn',
  howTo:
    'Listen — "I say meow, who am I?" — then touch the animal that makes that sound. ' +
    'Clear 10 levels to win, with more animals to choose from as you go. ' +
    'No wrong answers stop you — keep trying!',
  create: (width, height) => new QuizWorld(width, height, animalSoundRound),
};
