export interface HighScore {
  score: number;
  date: number; // epoch ms
}

const MAX = 5;
const keyFor = (gameId: string) => `arcade.scores.${gameId}`;

export function loadHighScores(gameId: string): HighScore[] {
  try {
    const raw = localStorage.getItem(keyFor(gameId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is HighScore => e && typeof e.score === 'number')
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/**
 * Record a finished run for a game. Returns the updated top-5 list plus the
 * 0-based rank of the new entry within it, or -1 if it didn't make the cut.
 */
export function addHighScore(
  gameId: string,
  score: number
): { scores: HighScore[]; rank: number } {
  const entry: HighScore = { score, date: Date.now() };
  const all = [...loadHighScores(gameId), entry].sort((a, b) => b.score - a.score);
  const scores = all.slice(0, MAX);
  try {
    localStorage.setItem(keyFor(gameId), JSON.stringify(scores));
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
  return { scores, rank: scores.indexOf(entry) };
}

/** Best score for a game, or 0 if none yet — used on the menu cards. */
export function bestScore(gameId: string): number {
  return loadHighScores(gameId)[0]?.score ?? 0;
}
