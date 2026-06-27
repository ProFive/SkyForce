import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import { OPPOSITES, pick } from '../engine/content';
import type { GameModule } from '../types';

const oppositeRound: QuizGenerator = (_level, count) => {
  const pair = pick(OPPOSITES);
  const askA = Math.random() < 0.5;
  const answer = askA ? pair.b : pair.a;
  const prompt = askA ? `${pair.a.en} goes with?` : `${pair.b.en} goes with?`;

  const distractors: string[] = [];
  while (distractors.length < Math.min(count, OPPOSITES.length) - 1) {
    const other = pick(OPPOSITES);
    const word = other.a.en === pair.a.en ? other.b.en : other.a.en;
    if (word !== pair.a.en && word !== pair.b.en && !distractors.includes(word)) {
      distractors.push(word);
    }
  }

  const words = [pair.a.en, pair.b.en, ...distractors].slice(0, count);
  const options: QuizOption[] = words
    .map((text) => ({
      kind: 'text' as const,
      text,
      correct: text === answer.en,
    }))
    .sort(() => Math.random() - 0.5);

  return {
    promptText: prompt,
    speak: prompt,
    options,
  };
};

export const opposites: GameModule = {
  id: 'opposites',
  title: 'Opposites',
  icon: '↔️',
  tagline: 'Match hot with cold, big with small…',
  accent: '#da77f2',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Read the word, then touch its opposite — hot ↔ cold, big ↔ small. ' +
    'Clear 10 levels to win. Keep trying if you miss!',
  create: (width, height) => new QuizWorld(width, height, oppositeRound),
};
