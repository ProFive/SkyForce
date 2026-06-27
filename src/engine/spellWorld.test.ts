import { describe, it, expect } from 'vitest';
import { SpellWorld } from './spellWorld';
import { ANIMALS, type Item } from './content';
import type { HandPosition } from '../types';

const W = 480;
const H = 720;
const HX = 240;
const HY = 360;
const handAt = (px: number, py: number): HandPosition => ({
  x: px / W,
  y: py / H,
  confidence: 1,
  available: true,
});

const CAT = ANIMALS.find((a) => a.en === 'cat') as Item;
const DOG = ANIMALS.find((a) => a.en === 'dog') as Item;

// Drop a single letter on the blade point and swipe through it.
function slice(w: SpellWorld, char: string) {
  w.letters = [{ id: 99, x: HX, y: HY, vx: 0, vy: 0, r: 24, char, spin: 0, spinV: 0 }];
  w.prevBlade = { x: HX, y: HY };
  w.update(handAt(HX, HY));
}

function spellWord(w: SpellWorld, word: Item) {
  w.word = word;
  w.progress = 0;
  for (const ch of word.en.toUpperCase()) slice(w, ch);
}

describe('SpellWorld', () => {
  it('exposes the picture as the prompt and the needed letter', () => {
    const w = new SpellWorld(W, H);
    w.word = CAT;
    w.progress = 0;
    expect(w.hud().prompt).toBe(CAT.emoji);
    expect(w.needed).toBe('C');
  });

  it('slicing the needed letter advances progress and scores', () => {
    const w = new SpellWorld(W, H);
    w.word = CAT;
    w.progress = 0;
    slice(w, 'C');
    expect(w.progress).toBe(1);
    expect(w.score).toBe(10);
    expect(w.needed).toBe('A');
  });

  it('slicing a wrong letter does not advance and does not end the game', () => {
    const w = new SpellWorld(W, H);
    w.word = CAT;
    w.progress = 0;
    slice(w, 'X');
    expect(w.progress).toBe(0);
    expect(w.score).toBe(0);
    expect(w.gameOver).toBe(false);
  });

  it('finishing a word increments the completed count', () => {
    const w = new SpellWorld(W, H);
    spellWord(w, CAT);
    expect(w.done).toBe(1);
  });

  it('wins after spelling 6 words', () => {
    const w = new SpellWorld(W, H);
    let guard = 0;
    while (!w.gameOver && guard++ < 20) {
      spellWord(w, guard % 2 === 0 ? CAT : DOG);
    }
    expect(w.done).toBe(6);
    expect(w.gameOver).toBe(true);
  });
});
