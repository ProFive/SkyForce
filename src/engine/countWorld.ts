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
import { MAX_LEVEL } from './levels';
import { drawCount } from './countRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;

const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five'];

export interface Star {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
}

export class CountWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  stars: Star[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  level = 1; // each level asks the child to count up to a bigger number
  target = 1; // how many stars to catch this level (== level)
  caught = 0; // stars caught so far this level
  score = 0;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

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
    this.stars = [];
    this.particles = [];
    this.popups = [];
    this.level = 1;
    this.caught = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 20;
    this.startLevel('');
  }

  private startLevel(announce: string) {
    this.target = Math.min(this.level, NUMBER_WORDS.length);
    this.caught = 0;
    const noun = this.target === 1 ? 'star' : 'stars';
    this.onSpeak?.(`${announce}Catch ${this.target} ${noun}`);
  }

  // Stars fall faster and a touch more often as the level climbs.
  private spawnEvery() {
    return Math.max(28, 50 - this.level * 4);
  }
  private fallSpeed() {
    return 1.5 + this.level * 0.3 + Math.random() * 0.6;
  }

  private spawn() {
    const r = 26;
    this.stars.push({
      id: this.nextId++,
      x: r + 6 + Math.random() * (this.width - 2 * (r + 6)),
      y: -r,
      vy: this.fallSpeed(),
      r,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    if (hand.available) {
      this.basket.x += (hand.x * this.width - this.basket.x) * SMOOTH;
      this.basket.y += (hand.y * this.height - this.basket.y) * SMOOTH * 0.6;
    }
    this.basket.x = clamp(this.basket.x, this.basket.w / 2, this.width - this.basket.w / 2);
    this.basket.y = clamp(this.basket.y, this.height * 0.45, this.height - 60);

    if (++this.spawnTimer >= this.spawnEvery()) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const s of this.stars) s.y += s.vy;

    const caughtIds = new Set<number>();
    const rimY = this.basket.y - this.basket.h / 2;
    for (const s of this.stars) {
      const inX = Math.abs(s.x - this.basket.x) < this.basket.w / 2 + s.r * 0.4;
      const inY = s.y + s.r >= rimY && s.y <= this.basket.y + this.basket.h / 2;
      if (!inX || !inY) continue;
      caughtIds.add(s.id);
      this.score += 5;
      this.caught += 1;
      burst(this.particles, s.x, s.y, '#ffe45e', 16);
      const word = NUMBER_WORDS[Math.min(this.caught, NUMBER_WORDS.length) - 1];
      popup(this.popups, s.x, s.y, String(this.caught), '#ffe45e');

      if (this.caught >= this.target) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.(`${word}! You did it! Well done!`);
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.onSfx?.('level');
          this.startLevel(`${word}! Level ${this.level}! `);
        }
      } else {
        // Count aloud as each star lands.
        this.onSfx?.('hit');
        this.onSpeak?.(word);
      }
      break; // one catch per frame keeps the count in sync
    }

    this.stars = this.stars.filter(
      (s) => !caughtIds.has(s.id) && s.y - s.r < this.height
    );
    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawCount(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: String(this.target),
      badges: [
        { key: 'progress', label: `${this.caught}/${this.target}`, color: '#ffd25e' },
      ],
    };
  }
}
