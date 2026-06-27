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
import { drawCount } from './countRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;
const ROUNDS = 5; // completed counts to win
const MAX_TARGET = 5; // counts only go up to five for this age group

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
  target = 1; // how many stars to catch this round
  caught = 0; // stars caught so far this round
  rounds = 0; // completed rounds
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
    this.target = 1;
    this.caught = 0;
    this.rounds = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 20;
    this.pickTarget();
  }

  private pickTarget() {
    let next = this.target;
    while (next === this.target) next = 1 + ((Math.random() * MAX_TARGET) | 0);
    this.target = next;
    this.caught = 0;
    this.onSpeak?.(`Catch ${next} ${next === 1 ? 'star' : 'stars'}`);
  }

  private spawn() {
    const r = 26;
    this.stars.push({
      id: this.nextId++,
      x: r + 6 + Math.random() * (this.width - 2 * (r + 6)),
      y: -r,
      vy: 1.9 + Math.random() * 0.7,
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

    if (++this.spawnTimer >= 46) {
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
      // Count aloud as each star lands.
      const word = NUMBER_WORDS[Math.min(this.caught, MAX_TARGET) - 1];
      popup(this.popups, s.x, s.y, String(this.caught), '#ffe45e');

      if (this.caught >= this.target) {
        this.rounds += 1;
        this.onSpeak?.(`${word}! Great!`);
        if (this.rounds >= ROUNDS) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Well done!');
          this.onGameOver?.();
        } else {
          this.onSfx?.('powerup');
          this.pickTarget();
        }
      } else {
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
      prompt: String(this.target),
      badges: [
        { key: 'progress', label: `${this.caught}/${this.target}`, color: '#ffd25e' },
      ],
    };
  }
}
