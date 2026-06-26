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
import { drawCatch } from './catchRenderer';

const BASKET_W = 96;
const BASKET_H = 42;
const SMOOTH = 0.4;
const LIVES = 5;

const GOOD = ['🍎', '🍊', '🍌', '🍒', '⭐', '💎'];
const BAD = ['💣', '🪨'];

export interface Item {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  emoji: string;
  good: boolean;
}

export class CatchWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  items: Item[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  score = 0;
  lives = LIVES;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.basket = {
      x: this.width / 2,
      y: this.height - 90,
      w: BASKET_W,
      h: BASKET_H,
    };
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.score = 0;
    this.lives = LIVES;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 30;
  }

  private spawnInterval() {
    return Math.max(24, 60 - Math.floor(this.score / 50) * 3);
  }

  private spawn() {
    const bad = Math.random() < 0.26;
    const r = 20 + Math.random() * 8;
    this.items.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: -r,
      vy: 2.6 + Math.random() * 1.4 + this.score / 400,
      r,
      emoji: bad
        ? BAD[(Math.random() * BAD.length) | 0]
        : GOOD[(Math.random() * GOOD.length) | 0],
      good: !bad,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    if (hand.available) {
      const tx = hand.x * this.width;
      this.basket.x += (tx - this.basket.x) * SMOOTH;
      const ty = hand.y * this.height;
      this.basket.y += (ty - this.basket.y) * SMOOTH * 0.6;
    }
    this.basket.x = clamp(this.basket.x, this.basket.w / 2, this.width - this.basket.w / 2);
    this.basket.y = clamp(this.basket.y, this.height * 0.45, this.height - 60);

    if (++this.spawnTimer >= this.spawnInterval()) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const it of this.items) it.y += it.vy;

    const caught = new Set<number>();
    let lostLife = false;
    const rimY = this.basket.y - this.basket.h / 2;
    for (const it of this.items) {
      const inX = Math.abs(it.x - this.basket.x) < this.basket.w / 2 + it.r * 0.4;
      const inY = it.y + it.r >= rimY && it.y <= this.basket.y + this.basket.h / 2;
      if (inX && inY) {
        caught.add(it.id);
        if (it.good) {
          this.score += 10;
          burst(this.particles, it.x, it.y, '#ffe45e', 12);
          popup(this.popups, it.x, it.y, '+10', '#ffe45e');
          this.onSfx?.('hit');
        } else {
          lostLife = true;
          burst(this.particles, it.x, it.y, '#ff5d7a', 16);
          popup(this.popups, it.x, it.y, '-1', '#ff5d7a');
          this.shake = Math.min(16, this.shake + 10);
          this.onSfx?.('hurt');
        }
      }
    }

    // Drop caught items and anything that fell past the bottom (good misses are free).
    this.items = this.items.filter(
      (it) => !caught.has(it.id) && it.y - it.r < this.height
    );

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);

    if (lostLife) {
      this.lives -= 1;
      this.onSfx?.('hurt');
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.onGameOver?.();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawCatch(ctx, this);
  }

  hud(): HudState {
    return { score: this.score, lives: Math.max(0, this.lives), maxLives: LIVES };
  }
}
