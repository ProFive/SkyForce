import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import { COUNTRIES, pick } from '../engine/content';
import type { GameModule } from '../types';

const flagRound: QuizGenerator = (_level, count) => {
  const chosen: typeof COUNTRIES = [];
  while (chosen.length < Math.min(count, COUNTRIES.length)) {
    const c = pick(COUNTRIES);
    if (!chosen.some((x) => x.en === c.en)) chosen.push(c);
  }
  const target = chosen[0];
  const options: QuizOption[] = chosen
    .map((c) => ({
      kind: 'emoji' as const,
      emoji: c.flag,
      correct: c.en === target.en,
    }))
    .sort(() => Math.random() - 0.5);

  return {
    promptText: `Find ${target.en}`,
    speak: `Find the flag of ${target.en}`,
    options,
  };
};

export const flags: GameModule = {
  id: 'flags',
  title: 'Flags & Countries',
  icon: '🇻🇳',
  tagline: 'Find the right flag',
  accent: '#ff8787',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Listen to the country name, then touch its flag. Clear 10 levels to win — ' +
    'more flags to choose from as you go. Wrong answers never stop you!',
  create: (width, height) => new QuizWorld(width, height, flagRound),
};
