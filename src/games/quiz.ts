import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import { MORE_QUIZZES, pick } from '../engine/content';
import type { GameModule } from '../types';

const quizRound: QuizGenerator = () => {
  const q = pick(MORE_QUIZZES);
  const options: QuizOption[] = q.options
    .map((text, i) => ({
      kind: 'text' as const,
      text,
      correct: i === q.answer,
    }))
    .sort(() => Math.random() - 0.5);

  return { promptText: q.q, speak: q.q, options };
};

export const quiz: GameModule = {
  id: 'quiz',
  title: 'Quiz Time',
  icon: '🧠',
  tagline: 'Listen, then touch the right answer',
  accent: '#da77f2',
  category: 'learn',
  howTo:
    'Listen to the question, then touch the answer you think is right. ' +
    'Questions cover animals, the body, and nature. ' +
    'Clear 10 levels to win — wrong answers never stop you, so keep thinking!',
  create: (width, height) => new QuizWorld(width, height, quizRound),
};
