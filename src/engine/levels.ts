// Shared difficulty progression for the kids' learning games. Levels get
// harder and each one needs more correct answers than the one before it, so
// finishing the game means reaching a higher and higher target.

export const MAX_LEVEL = 10;

/** Correct answers required to clear a given (1-indexed) level: 4, 5, … 13. */
export const levelGoal = (level: number): number => 3 + level;

/** Total correct answers needed to win (sum of every level's goal). */
export const totalGoal = (): number => {
  let sum = 0;
  for (let l = 1; l <= MAX_LEVEL; l++) sum += levelGoal(l);
  return sum;
};
