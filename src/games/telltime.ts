import { QuizWorld, type QuizGenerator, type QuizOption } from '../engine/quizWorld';
import type { GameModule } from '../types';

interface ClockTime {
  hour: number;
  minute: number;
  speak: string;
  label: string;
}

function randomTime(): ClockTime {
  const hour = 1 + ((Math.random() * 12) | 0);
  const half = Math.random() < 0.4;
  if (half) {
    return {
      hour,
      minute: 30,
      speak: `Half past ${hour}`,
      label: `${hour}:30`,
    };
  }
  return {
    hour,
    minute: 0,
    speak: `It's ${hour} o'clock`,
    label: `${hour}:00`,
  };
}

function randomWrongTime(target: ClockTime): ClockTime {
  let t = randomTime();
  let guard = 0;
  while (
    (t.hour === target.hour && t.minute === target.minute) &&
    guard++ < 20
  ) {
    t = randomTime();
  }
  return t;
}

const tellTimeRound: QuizGenerator = (_level, count) => {
  const target = randomTime();
  const times: ClockTime[] = [target];
  while (times.length < Math.min(count, 4)) {
    const t = randomWrongTime(target);
    if (!times.some((x) => x.hour === t.hour && x.minute === t.minute)) times.push(t);
  }

  const options: QuizOption[] = times
    .map((t) => ({
      kind: 'clock' as const,
      hour: t.hour,
      minute: t.minute,
      correct: t.hour === target.hour && t.minute === target.minute,
    }))
    .sort(() => Math.random() - 0.5);

  return {
    promptText: target.speak,
    speak: target.speak,
    options,
  };
};

export const telltime: GameModule = {
  id: 'telltime',
  title: 'Tell the Time',
  icon: '🕐',
  tagline: "Listen, then touch the right clock",
  accent: '#ffd25e',
  category: 'learn',
  group: 'age6to10',
  howTo:
    'Listen — "It\'s 3 o\'clock" or "Half past 4" — then touch the matching ' +
    'clock face. Clear 10 levels to win!',
  create: (width, height) => new QuizWorld(width, height, tellTimeRound),
};
