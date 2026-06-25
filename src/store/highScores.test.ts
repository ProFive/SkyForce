import { describe, it, expect, beforeEach } from 'vitest';
import { addHighScore, loadHighScores } from './highScores';

beforeEach(() => {
  localStorage.clear();
});

describe('high scores', () => {
  it('returns an empty list when none are stored', () => {
    expect(loadHighScores()).toEqual([]);
  });

  it('keeps the top 5 sorted descending and drops the rest', () => {
    [100, 500, 300, 50, 900, 700].forEach((s, i) => addHighScore(s, i + 1));
    const { scores } = addHighScore(600, 7);

    expect(scores).toHaveLength(5);
    const points = scores.map((s) => s.score);
    expect(points).toEqual([900, 700, 600, 500, 300]);
    expect(points).not.toContain(50);
    expect(points).not.toContain(100);
  });

  it('reports the rank of a qualifying entry', () => {
    addHighScore(900, 9);
    addHighScore(700, 7);
    const { rank } = addHighScore(800, 8); // sits between -> index 1
    expect(rank).toBe(1);
  });

  it('reports rank -1 when the entry does not make the cut', () => {
    [900, 800, 700, 600, 500].forEach((s) => addHighScore(s, 1));
    const { rank } = addHighScore(10, 1);
    expect(rank).toBe(-1);
  });

  it('persists across loads', () => {
    addHighScore(420, 4);
    expect(loadHighScores()[0].score).toBe(420);
  });
});
