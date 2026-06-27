import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { type Item, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawMemory } from './memoryRenderer';

const TOUCH_COOLDOWN = 14;
const MISMATCH_FRAMES = 48;

export type MemoryMode = 'same' | 'picture-word';

export interface MemoryConfig {
  pack: Item[];
  mode: MemoryMode;
}

export interface MemoryCard {
  id: number;
  pairId: string;
  face: string;
  x: number;
  y: number;
  w: number;
  h: number;
  flipped: boolean;
  matched: boolean;
}

function pairCountForLevel(level: number) {
  return Math.min(6, 2 + Math.floor((level + 1) / 2));
}

function buildDeck(pack: Item[], mode: MemoryMode, pairCount: number): MemoryCard[] {
  const chosen: Item[] = [];
  while (chosen.length < Math.min(pairCount, pack.length)) {
    const it = pick(pack);
    if (!chosen.some((c) => c.en === it.en)) chosen.push(it);
  }

  const faces: { pairId: string; face: string }[] = [];
  for (const it of chosen) {
    if (mode === 'same') {
      faces.push({ pairId: it.en, face: it.emoji ?? it.en });
      faces.push({ pairId: it.en, face: it.emoji ?? it.en });
    } else {
      faces.push({ pairId: it.en, face: it.emoji ?? '?' });
      faces.push({ pairId: it.en, face: it.en });
    }
  }

  // Fisher–Yates shuffle.
  for (let i = faces.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [faces[i], faces[j]] = [faces[j], faces[i]];
  }

  return faces.map((f, idx) => ({
    id: idx + 1,
    pairId: f.pairId,
    face: f.face,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    flipped: false,
    matched: false,
  }));
}

/**
 * Concentration / memory grid: touch a card to flip it, find matching pairs.
 * No-fail — mismatches flip back after a short pause. Ten levels add more pairs.
 */
export class MemoryWorld implements GameInstance {
  width: number;
  height: number;

  cards: MemoryCard[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;
  firstPick: number | null = null;
  mismatchTimer = 0;

  private config: MemoryConfig;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number, config: MemoryConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
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
    this.cooldown = 0;
    this.firstPick = null;
    this.mismatchTimer = 0;
    this.dealBoard();
    this.onSpeak?.('Find the matching pairs.');
  }

  private dealBoard(announce = '') {
    const pairs = pairCountForLevel(this.level);
    this.cards = buildDeck(this.config.pack, this.config.mode, pairs);
    this.layoutCards();
    this.firstPick = null;
    this.mismatchTimer = 0;
    if (announce) this.onSpeak?.(announce);
  }

  private layoutCards() {
    const n = this.cards.length;
    const cols = n <= 8 ? 3 : 4;
    const rows = Math.ceil(n / cols);
    const top = this.height * 0.16;
    const bottom = this.height * 0.9;
    const side = 20;
    const gap = 10;
    const cellW = (this.width - 2 * side - gap * (cols - 1)) / cols;
    const cellH = (bottom - top - gap * (rows - 1)) / rows;
    const cardW = cellW * 0.92;
    const cardH = cellH * 0.92;

    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = (i / cols) | 0;
      const c = this.cards[i];
      c.w = cardW;
      c.h = cardH;
      c.x = side + col * (cellW + gap) + cellW / 2;
      c.y = top + row * (cellH + gap) + cellH / 2;
    }
  }

  private cardAt(px: number, py: number): MemoryCard | undefined {
    for (const c of this.cards) {
      if (c.matched) continue;
      if (
        px >= c.x - c.w / 2 &&
        px <= c.x + c.w / 2 &&
        py >= c.y - c.h / 2 &&
        py <= c.y + c.h / 2
      ) {
        return c;
      }
    }
    return undefined;
  }

  private resolveMatch(a: MemoryCard, b: MemoryCard) {
    if (a.pairId === b.pairId) {
      a.matched = true;
      b.matched = true;
      this.score += 10;
      this.correct += 1;
      burst(this.particles, (a.x + b.x) / 2, (a.y + b.y) / 2, '#ffe45e', 18);
      popup(this.popups, (a.x + b.x) / 2, (a.y + b.y) / 2, '✓', '#7dff9b');
      this.onSfx?.('powerup');
      a.flipped = false;
      b.flipped = false;
      this.firstPick = null;

      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('You did it! Well done!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.dealBoard(`Level ${this.level}! `);
        }
      } else if (this.cards.every((c) => c.matched)) {
        // Board cleared early — reshuffle with the same level goal.
        this.dealBoard();
      }
    } else {
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
      this.mismatchTimer = MISMATCH_FRAMES;
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.cooldown > 0) this.cooldown--;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    if (this.mismatchTimer > 0) {
      this.mismatchTimer--;
      if (this.mismatchTimer === 0) {
        for (const c of this.cards) {
          if (!c.matched) c.flipped = false;
        }
        this.firstPick = null;
      }
      this.particles = stepParticles(this.particles);
      this.popups = stepPopups(this.popups);
      return;
    }

    if (hand.available && this.cooldown === 0) {
      const card = this.cardAt(this.finger.x, this.finger.y);
      if (card && !card.flipped && !card.matched) {
        this.cooldown = TOUCH_COOLDOWN;
        card.flipped = true;
        this.onSfx?.('hit');
        if (this.firstPick === null) {
          this.firstPick = card.id;
        } else {
          const first = this.cards.find((c) => c.id === this.firstPick);
          if (first && first.id !== card.id) {
            this.resolveMatch(first, card);
          }
        }
      }
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawMemory(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
      ],
    };
  }
}
