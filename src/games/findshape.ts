import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import { SHAPES, pick, type Shape } from '../engine/content';
import type { GameModule } from '../types';

const findShapeRound: QuizGenerator = (_level, count) => {
  const chosen: Shape[] = [];
  while (chosen.length < Math.min(count, SHAPES.length)) {
    const s = pick(SHAPES);
    if (!chosen.some((c) => c.kind === s.kind)) chosen.push(s);
  }
  const target = chosen[0];
  const options: QuizOption[] = chosen
    .map((s) => ({
      kind: 'shape' as const,
      shape: s.kind,
      hex: s.hex,
      correct: s.kind === target.kind,
    }))
    .sort(() => Math.random() - 0.5);

  return {
    promptText: `Find the ${target.en}`,
    speak: `Find the ${target.en}`,
    options,
  };
};

export const findshape: GameModule = {
  id: 'findshape',
  title: 'Find the Shape',
  icon: '🔷',
  tagline: 'Listen, then touch the right shape',
  accent: '#4dabf7',
  category: 'learn',
  howTo:
    'Listen to the shape name, then reach out and touch the matching shape. ' +
    'Clear 10 levels to win — higher levels add more shapes and smaller targets. ' +
    'No wrong answers stop you — try as many times as you like!',
  create: (width, height) => new QuizWorld(width, height, findShapeRound),
};
