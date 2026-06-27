import { describe, it, expect } from 'vitest';
import { PinchPuzzleWorld } from './pinchPuzzleWorld';
import { MAX_LEVEL, levelGoal } from './levels';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;

const hand = (x: number, y: number, pinching: boolean): HandPosition => ({
  x: x / W,
  y: y / H,
  confidence: 1,
  available: true,
  pinching,
});

/** Pinch-grab a tile, move to slot, release. */
function placeLetter(
  w: PinchPuzzleWorld,
  tileIndex: number,
  slotIndex: number
) {
  const tile = w.tiles[tileIndex];
  const slot = w.slots[slotIndex];
  if (!tile || !slot) return;
  w.update(hand(tile.x, tile.y, true));
  w.update(hand(slot.x, slot.y, true));
  w.update(hand(slot.x, slot.y, false));
}

function spellCurrentWord(w: PinchPuzzleWorld) {
  const word = w.word.en.toUpperCase();
  for (let i = 0; i < word.length; i++) {
    const tileIdx = w.tiles.findIndex((t) => !t.placed && t.char === word[i]);
    if (tileIdx < 0) return;
    placeLetter(w, tileIdx, i);
    if (w.gameOver) return;
  }
}

describe('PinchPuzzleWorld', () => {
  it('starts with letter tiles and empty slots', () => {
    const w = new PinchPuzzleWorld(W, H);
    expect(w.tiles.length).toBeGreaterThan(0);
    expect(w.slots.length).toBe(w.word.en.length);
    expect(w.hud().badges?.[1].label).toBe('🤏 drag');
  });

  it('places a tile when dropped on the matching slot', () => {
    const w = new PinchPuzzleWorld(W, H);
    const word = w.word.en.toUpperCase();
    const tileIdx = w.tiles.findIndex((t) => t.char === word[0])!;
    placeLetter(w, tileIdx, 0);
    expect(w.slots[0].filled).toBe(true);
  });

  it('returns a tile home when dropped on the wrong slot', () => {
    const w = new PinchPuzzleWorld(W, H);
    const word = w.word.en.toUpperCase();
    const wrongTile = w.tiles.find((t) => t.char !== word[0])!;
    const idx = w.tiles.indexOf(wrongTile);
    const homeX = wrongTile.homeX;
    placeLetter(w, idx, 0);
    expect(w.slots[0].filled).toBe(false);
    expect(wrongTile.x).toBe(homeX);
  });

  it('wins when the final level goal is cleared', () => {
    const w = new PinchPuzzleWorld(W, H);
    w.level = MAX_LEVEL;
    w.correct = levelGoal(MAX_LEVEL) - 1;
    spellCurrentWord(w);
    expect(w.gameOver).toBe(true);
    expect(w.level).toBe(MAX_LEVEL);
  });

  it('advances level after clearing the level goal', () => {
    const w = new PinchPuzzleWorld(W, H);
    for (let n = 0; n < levelGoal(1); n++) {
      spellCurrentWord(w);
    }
    expect(w.level).toBe(2);
  });
});
