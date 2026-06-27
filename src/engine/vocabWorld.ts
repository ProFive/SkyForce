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
import { type Item, FRUITS, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawVocab } from './vocabRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;

export interface FallItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  item: Item;
}

export class VocabWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  items: FallItem[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  pack: Item[] = FRUITS;
  target: Item = FRUITS[0];
  level = 1;
  correct = 0; // correct catches within the current level
  score = 0;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number, pack: Item[] = FRUITS) {
    this.width = width;
    this.height = height;
    this.pack = pack;
    this.target = pack[0];
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
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 20;
    this.pickTarget();
  }

  private pickTarget(announce = '') {
    let next = this.target;
    while (next === this.target) next = pick(this.pack);
    this.target = next;
    this.onSpeak?.(`${announce}Catch the ${next.en}`);
  }

  // Difficulty knobs scale with the current level.
  private spawnEvery() {
    return Math.max(24, 50 - this.level * 5);
  }
  private fallSpeed() {
    return 1.5 + this.level * 0.3 + Math.random() * 0.6;
  }
  private targetBias() {
    // Higher levels show the right answer less often (more distractors).
    return Math.max(0.28, 0.52 - this.level * 0.05);
  }

  private spawn() {
    const r = 26;
    const item = Math.random() < this.targetBias() ? this.target : pick(this.pack);
    this.items.push({
      id: this.nextId++,
      x: r + 6 + Math.random() * (this.width - 2 * (r + 6)),
      y: -r,
      vy: this.fallSpeed(),
      r,
      item,
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

    for (const it of this.items) it.y += it.vy;

    const caught = new Set<number>();
    const rimY = this.basket.y - this.basket.h / 2;
    for (const it of this.items) {
      const inX = Math.abs(it.x - this.basket.x) < this.basket.w / 2 + it.r * 0.4;
      const inY = it.y + it.r >= rimY && it.y <= this.basket.y + this.basket.h / 2;
      if (!inX || !inY) continue;
      caught.add(it.id);
      if (it.item.en === this.target.en) {
        this.score += 10;
        this.correct += 1;
        burst(this.particles, it.x, it.y, '#ffe45e', 16);
        popup(this.popups, it.x, it.y, '✓', '#7dff9b');
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
            this.pickTarget(`Level ${this.level}! `);
          }
        } else {
          this.onSfx?.('powerup');
          this.pickTarget();
        }
        break; // one catch per frame keeps targets in sync
      } else {
        // Gentle: no penalty, just a nudge.
        this.shake = Math.min(10, this.shake + 6);
        this.onSfx?.('hurt');
      }
    }

    this.items = this.items.filter(
      (it) => !caught.has(it.id) && it.y - it.r < this.height
    );
    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawVocab(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.target.emoji ?? this.target.en,
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
