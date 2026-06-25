import { describe, it, expect, beforeEach } from 'vitest';
import { addHighScore, loadHighScores, bestScore } from './highScores';

const G = 'testgame';

beforeEach(() => {
  localStorage.clear();
});

describe('high scores', () => {
  it('returns an empty list when none are stored', () => {
    expect(loadHighScores(G)).toEqual([]);
    expect(bestScore(G)).toBe(0);
  });

  it('keeps the top 5 sorted descending and drops the rest', () => {
    [100, 500, 300, 50, 900, 700].forEach((s) => addHighScore(G, s));
    const { scores } = addHighScore(G, 600);

    expect(scores).toHaveLength(5);
    const points = scores.map((s) => s.score);
    expect(points).toEqual([900, 700, 600, 500, 300]);
    expect(points).not.toContain(50);
    expect(points).not.toContain(100);
  });

  it('reports the rank of a qualifying entry', () => {
    addHighScore(G, 900);
    addHighScore(G, 700);
    const { rank } = addHighScore(G, 800); // sits between -> index 1
    expect(rank).toBe(1);
  });

  it('reports rank -1 when the entry does not make the cut', () => {
    [900, 800, 700, 600, 500].forEach((s) => addHighScore(G, s));
    const { rank } = addHighScore(G, 10);
    expect(rank).toBe(-1);
  });

  it('keeps scores separate per game', () => {
    addHighScore('a', 100);
    addHighScore('b', 200);
    expect(bestScore('a')).toBe(100);
    expect(bestScore('b')).toBe(200);
    expect(loadHighScores('a')).toHaveLength(1);
  });

  it('persists across loads', () => {
    addHighScore(G, 420);
    expect(loadHighScores(G)[0].score).toBe(420);
  });
});
