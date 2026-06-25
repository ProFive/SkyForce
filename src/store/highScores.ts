export interface HighScore {
  score: number;
  level: number;
  date: number; // epoch ms
}

const KEY = 'skyforce.highscores';
const MAX = 5;

export function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is HighScore =>
          e && typeof e.score === 'number' && typeof e.level === 'number'
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/**
 * Record a finished run. Returns the updated top-5 list plus the 0-based rank
 * of the new entry within that list, or -1 if it didn't make the cut.
 */
export function addHighScore(
  score: number,
  level: number
): { scores: HighScore[]; rank: number } {
  const entry: HighScore = { score, level, date: Date.now() };
  const all = [...loadHighScores(), entry].sort((a, b) => b.score - a.score);
  const scores = all.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(scores));
  } catch {
    /* ignore storage failures (private mode, quota) */
  }
  const rank = scores.indexOf(entry);
  return { scores, rank };
}
