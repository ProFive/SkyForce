import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  clamp,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { type Item, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawSort } from './sortRenderer';

const BIN_W = 92;
const BIN_H = 42;
const SMOOTH = 0.45;

export type SortSide = 'left' | 'right';

export interface SortConfig {
  leftPack: Item[];
  rightPack: Item[];
  leftBin: string; // emoji drawn for the left basket
  rightBin: string;
  leftName: string; // spoken label, e.g. "fruit"
  rightName: string; // e.g. "animal"
}

export interface SortFallItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  item: Item;
  side: SortSide;
}

export interface SortBin {
  x: number;
  y: number;
  w: number;
  h: number;
  emoji: string;
  side: SortSide;
}

/**
 * Two-basket catch game: move your finger to the left or right half of the
 * screen to activate that basket, then catch falling items in the correct bin.
 * No-fail — wrong sorts just shake; clearing every level wins.
 */
export class SortWorld implements GameInstance {
  width: number;
  height: number;

  leftBin: SortBin;
  rightBin: SortBin;
  activeSide: SortSide = 'left';
  items: SortFallItem[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;

  private config: SortConfig;
  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number, config: SortConfig) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.leftBin = {
      x: width * 0.28,
      y: height - 88,
      w: BIN_W,
      h: BIN_H,
      emoji: config.leftBin,
      side: 'left',
    };
    this.rightBin = {
      x: width * 0.72,
      y: height - 88,
      w: BIN_W,
      h: BIN_H,
      emoji: config.rightBin,
      side: 'right',
    };
    this.reset();
  }

  reset() {
    this.leftBin.x = this.width * 0.28;
    this.rightBin.x = this.width * 0.72;
    this.activeSide = 'left';
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 18;
    this.speakIntro();
  }

  private speakIntro(announce = '') {
    const { leftName, rightName } = this.config;
    this.onSpeak?.(
      `${announce}Move left for ${leftName}. Move right for ${rightName}.`
    );
  }

  private spawnEvery() {
    return Math.max(22, 52 - this.level * 3);
  }

  private fallSpeed() {
    return 2.1 + this.level * 0.14;
  }

  private spawn() {
    const left = Math.random() < 0.5;
    const side: SortSide = left ? 'left' : 'right';
    const item = pick(left ? this.config.leftPack : this.config.rightPack);
    const r = 22 + Math.random() * 6;
    this.items.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: -r,
      vy: this.fallSpeed() + Math.random() * 0.8,
      r,
      item,
      side,
    });
  }

  private activeBin() {
    return this.activeSide === 'left' ? this.leftBin : this.rightBin;
  }

  private catchItem(bin: SortBin, it: SortFallItem) {
    if (it.side === bin.side) {
      this.score += 10;
      this.correct += 1;
      burst(this.particles, it.x, it.y, '#ffe45e', 14);
      popup(this.popups, it.x, it.y, '✓', '#7dff9b');
      this.onSfx?.('powerup');
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
          this.speakIntro(`Level ${this.level}! `);
        }
      }
    } else {
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    if (hand.available) {
      this.activeSide = hand.x < 0.5 ? 'left' : 'right';
      const bin = this.activeBin();
      const tx = hand.x * this.width;
      const ty = hand.y * this.height;
      bin.x += (tx - bin.x) * SMOOTH;
      bin.y += (ty - bin.y) * SMOOTH * 0.55;
      const margin = bin.w / 2 + 8;
      if (bin.side === 'left') {
        bin.x = clamp(bin.x, margin, this.width * 0.5 - margin);
      } else {
        bin.x = clamp(bin.x, this.width * 0.5 + margin, this.width - margin);
      }
      bin.y = clamp(bin.y, this.height * 0.42, this.height - 56);
    }

    if (++this.spawnTimer >= this.spawnEvery()) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const it of this.items) it.y += it.vy;

    const caught = new Set<number>();
    const bin = this.activeBin();
    const rimY = bin.y - bin.h / 2;
    for (const it of this.items) {
      const inX = Math.abs(it.x - bin.x) < bin.w / 2 + it.r * 0.35;
      const inY = it.y + it.r >= rimY && it.y <= bin.y + bin.h / 2;
      if (inX && inY) {
        caught.add(it.id);
        this.catchItem(bin, it);
      }
    }

    // Drop caught items and anything that fell past the bottom (misses are free).
    this.items = this.items.filter(
      (it) => !caught.has(it.id) && it.y - it.r < this.height
    );

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawSort(ctx, this);
  }

  hud(): HudState {
    const { leftBin, rightBin } = this.config;
    return {
      score: this.score,
      level: this.level,
      prompt: `${leftBin} | ${rightBin}`,
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
