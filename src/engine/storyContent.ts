/** One touchable choice on a story scene. */
export interface StoryChoice {
  emoji: string;
  speak: string;
  correct: boolean;
}

/** A short interactive story beat with narration and 2–3 choices. */
export interface StoryScene {
  narration: string;
  choices: StoryChoice[];
}

/**
 * Ten short English story beats for ages 3–5. Each level uses one scene; only the
 * correct choice advances the tale.
 */
export const STORY_SCENES: StoryScene[] = [
  {
    narration: 'Bunny wakes up hungry. Where should Bunny go?',
    choices: [
      { emoji: '🥕', speak: 'Go to the garden for carrots.', correct: true },
      { emoji: '🛏️', speak: 'Go back to sleep.', correct: false },
    ],
  },
  {
    narration: 'In the garden, Bunny sees a big carrot and a tiny sprout. Which one?',
    choices: [
      { emoji: '🥕', speak: 'Pick the big carrot.', correct: true },
      { emoji: '🌱', speak: 'Water the tiny sprout instead.', correct: false },
    ],
  },
  {
    narration: 'A friendly duck waddles over. What should Bunny say?',
    choices: [
      { emoji: '👋', speak: 'Hello, Duck!', correct: true },
      { emoji: '😴', speak: 'Go away, I am sleepy.', correct: false },
    ],
  },
  {
    narration: 'Dark clouds appear. Bunny needs shelter. Where?',
    choices: [
      { emoji: '🏡', speak: 'Run to the little house.', correct: true },
      { emoji: '🌧️', speak: 'Stay in the rain.', correct: false },
    ],
  },
  {
    narration: 'Inside, Bunny finds a book and a ball. What is fun to do?',
    choices: [
      { emoji: '📖', speak: 'Read a story together.', correct: true },
      { emoji: '📺', speak: 'Watch TV all day.', correct: false },
    ],
  },
  {
    narration: 'After the rain, a rainbow shines. What color do you like?',
    choices: [
      { emoji: '🌈', speak: 'I love the rainbow!', correct: true },
      { emoji: '⬛', speak: 'I only like black.', correct: false },
    ],
  },
  {
    narration: 'Bunny meets a kitten stuck in a bush. How can Bunny help?',
    choices: [
      { emoji: '🤝', speak: 'Help the kitten out gently.', correct: true },
      { emoji: '🏃', speak: 'Run away fast.', correct: false },
    ],
  },
  {
    narration: 'It is snack time. What is a healthy snack?',
    choices: [
      { emoji: '🍎', speak: 'An apple is yummy.', correct: true },
      { emoji: '🍬', speak: 'Only candy forever.', correct: false },
    ],
  },
  {
    narration: 'The sun sets. Bunny is tired. What should Bunny do?',
    choices: [
      { emoji: '🌙', speak: 'Say good night and rest.', correct: true },
      { emoji: '⚽', speak: 'Play soccer in the dark.', correct: false },
    ],
  },
  {
    narration: 'Morning again! Bunny dreams of adventure. Where next?',
    choices: [
      { emoji: '🌲', speak: 'Explore the sunny forest!', correct: true },
      { emoji: '📦', speak: 'Hide in a box all day.', correct: false },
    ],
  },
];
