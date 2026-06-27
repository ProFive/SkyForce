import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  clamp,
  dist,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { type Item, ANIMALS, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawPinchPuzzle } from './pinchPuzzleRenderer';

const TILE_R = 34;
const SLOT_W = 50;
const SLOT_H = 56;

const WORDS: Item[] = ANIMALS.filter(
  (a) => a.en.length >= 3 && a.en.length <= 5 && /^[a-z]+$/i.test(a.en)
);

export interface PuzzleTile {
  id: number;
  char: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  r: number;
  placed: boolean;
}

export interface PuzzleSlot {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  expected: string;
  filled: boolean;
}

/**
 * Pinch (thumb+index) to grab letter tiles and drop them into slots to spell
 * the pictured word. No-fail — wrong drops bounce back.
 */
export class PinchPuzzleWorld implements GameInstance {
  width: number;
  height: number;

  word: Item = WORDS[0];
  tiles: PuzzleTile[] = [];
  slots: PuzzleSlot[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  dragId: number | null = null;
  wasPinching = false;
  pinching = false;

  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.dragId = null;
    this.wasPinching = false;
    this.pinching = false;
    this.setupRound();
    this.onSpeak?.('Pinch and drag the letters to spell the word.');
  }

  private distractorCount() {
    return clamp(this.level - 1, 0, 3);
  }

  private setupRound(announce = '') {
    let next = this.word;
    while (next.en === this.word.en && WORDS.length > 1) next = pick(WORDS);
    this.word = next;
    this.dragId = null;

    const letters = next.en.toUpperCase().split('');
    const used = new Set(letters);
    const extras: string[] = [];
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((c) => !used.has(c));
    while (extras.length < this.distractorCount() && pool.length > 0) {
      const c = pick(pool);
      extras.push(c);
      pool.splice(pool.indexOf(c), 1);
    }

    const chars = [...letters, ...extras].sort(() => Math.random() - 0.5);

    const gap = 10;
    const totalSlotW = letters.length * SLOT_W + (letters.length - 1) * gap;
    const slotY = this.height * 0.76;
    const slotStart = (this.width - totalSlotW) / 2 + SLOT_W / 2;

    this.slots = letters.map((ch, i) => ({
      index: i,
      x: slotStart + i * (SLOT_W + gap),
      y: slotY,
      w: SLOT_W,
      h: SLOT_H,
      expected: ch,
      filled: false,
    }));

    const margin = TILE_R + 20;
    const top = this.height * 0.38;
    const bottom = this.height * 0.58;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < chars.length; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 50 && !ok; tries++) {
        x = margin + Math.random() * (this.width - 2 * margin);
        y = top + Math.random() * (bottom - top);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > TILE_R * 2.4);
      }
      spots.push({ x, y });
    }

    this.tiles = chars.map((ch, i) => ({
      id: this.nextId++,
      char: ch,
      x: spots[i].x,
      y: spots[i].y,
      homeX: spots[i].x,
      homeY: spots[i].y,
      r: TILE_R,
      placed: false,
    }));

    const speakWord = next.en;
    this.onSpeak?.(`${announce}Spell ${speakWord}.`);
  }

  private tileAt(x: number, y: number): PuzzleTile | null {
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const t = this.tiles[i];
      if (!t.placed && dist(x, y, t.x, t.y) < t.r + 6) return t;
    }
    return null;
  }

  private slotAt(x: number, y: number): PuzzleSlot | null {
    for (const s of this.slots) {
      if (
        x >= s.x - s.w / 2 &&
        x <= s.x + s.w / 2 &&
        y >= s.y - s.h / 2 &&
        y <= s.y + s.h / 2
      ) {
        return s;
      }
    }
    return null;
  }

  private returnHome(tile: PuzzleTile) {
    tile.x = tile.homeX;
    tile.y = tile.homeY;
  }

  private tryDrop(tile: PuzzleTile) {
    const slot = this.slotAt(tile.x, tile.y);
    if (slot && !slot.filled && tile.char === slot.expected) {
      tile.placed = true;
      tile.x = slot.x;
      tile.y = slot.y;
      slot.filled = true;
      burst(this.particles, slot.x, slot.y, '#7dff9b', 12);
      popup(this.popups, slot.x, slot.y - 24, tile.char, '#7dff9b');
      this.onSfx?.('powerup');

      if (this.slots.every((s) => s.filled)) {
        this.onWordComplete();
      }
    } else {
      this.returnHome(tile);
      this.shake = Math.min(10, this.shake + 5);
      this.onSfx?.('hurt');
    }
  }

  private onWordComplete() {
    this.score += 10;
    this.correct += 1;

    if (this.correct >= levelGoal(this.level)) {
      if (this.level >= MAX_LEVEL) {
        this.gameOver = true;
        this.onSfx?.('level');
        this.onSpeak?.('You spelled them all! Amazing!');
        this.onGameOver?.();
      } else {
        this.level += 1;
        this.correct = 0;
        this.onSfx?.('level');
        this.setupRound(`Level ${this.level}! `);
      }
    } else {
      this.setupRound('Great! ');
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    this.pinching = hand.pinching ?? false;
    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    if (this.pinching && !this.wasPinching && this.dragId === null && hand.available) {
      const hit = this.tileAt(this.finger.x, this.finger.y);
      if (hit) this.dragId = hit.id;
    }

    if (this.pinching && this.dragId !== null) {
      const tile = this.tiles.find((t) => t.id === this.dragId);
      if (tile && !tile.placed) {
        tile.x = this.finger.x;
        tile.y = this.finger.y;
      }
    }

    if (!this.pinching && this.wasPinching && this.dragId !== null) {
      const tile = this.tiles.find((t) => t.id === this.dragId);
      if (tile && !tile.placed) this.tryDrop(tile);
      this.dragId = null;
    }

    this.wasPinching = this.pinching;
    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawPinchPuzzle(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.word.emoji ?? this.word.en,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'hint', label: '🤏 drag', color: '#5cd2ff' },
      ],
    };
  }
}
