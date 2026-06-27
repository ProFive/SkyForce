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
import { MAX_LEVEL, levelGoal } from './levels';
import { drawNumberCatch, type MathFallItem } from './mathRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;

export type HuntRule = 'even' | 'odd' | 'greater' | 'less';

export interface HuntChallenge {
  rule: HuntRule;
  threshold: number;
  prompt: string;
  speak: string;
}

export function makeChallenge(level: number): HuntChallenge {
  if (level <= 4) {
    const even = Math.random() < 0.5;
    return {
      rule: even ? 'even' : 'odd',
      threshold: 0,
      prompt: even ? 'Catch EVEN numbers' : 'Catch ODD numbers',
      speak: even ? 'Catch the even numbers' : 'Catch the odd numbers',
    };
  }
  const threshold = 3 + ((Math.random() * 6) | 0);
  const greater = level <= 7 ? true : Math.random() < 0.5;
  return greater
    ? {
        rule: 'greater',
        threshold,
        prompt: `Catch numbers > ${threshold}`,
        speak: `Catch numbers greater than ${threshold}`,
      }
    : {
        rule: 'less',
        threshold,
        prompt: `Catch numbers < ${threshold}`,
        speak: `Catch numbers less than ${threshold}`,
      };
}

export function matchesRule(value: number, c: HuntChallenge): boolean {
  switch (c.rule) {
    case 'even':
      return value % 2 === 0;
    case 'odd':
      return value % 2 === 1;
    case 'greater':
      return value > c.threshold;
    case 'less':
      return value < c.threshold;
  }
}

function randomValue(): number {
  return (Math.random() * 21) | 0;
}

function valuePool(challenge: HuntChallenge, count = 6): number[] {
  const vals = new Set<number>();
  let guard = 0;
  while (vals.size < count && guard++ < 80) {
    const v = randomValue();
    if (matchesRule(v, challenge)) vals.add(v);
  }
  while (vals.size < count) vals.add(randomValue());
  return [...vals];
}

/**
 * Catch falling numbers that match a rule (even, odd, greater than, less than).
 * No-fail basket game for ages 6–10.
 */
export class NumberHuntWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  items: MathFallItem[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  challenge: HuntChallenge = makeChallenge(1);
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;
  private pool: number[] = [];

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
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 18;
    this.pickChallenge();
  }

  private pickChallenge(announce = '') {
    this.challenge = makeChallenge(this.level);
    this.pool = valuePool(this.challenge);
    this.onSpeak?.(`${announce}${this.challenge.speak}`);
  }

  private spawnEvery() {
    return Math.max(20, 46 - this.level * 4);
  }

  private fallSpeed() {
    return 2 + this.level * 0.25 + Math.random() * 0.5;
  }

  private targetBias() {
    return Math.max(0.28, 0.52 - this.level * 0.04);
  }

  private spawn() {
    const r = 24;
    const matching = Math.random() < this.targetBias();
    let value = this.pool[(Math.random() * this.pool.length) | 0];
    if (matching) {
      let guard = 0;
      while (!matchesRule(value, this.challenge) && guard++ < 20) {
        value = randomValue();
      }
    } else {
      let guard = 0;
      while (matchesRule(value, this.challenge) && guard++ < 20) {
        value = randomValue();
      }
    }
    this.items.push({
      id: this.nextId++,
      x: r + 6 + Math.random() * (this.width - 2 * (r + 6)),
      y: -r,
      vy: this.fallSpeed(),
      r,
      value,
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
      if (matchesRule(it.value, this.challenge)) {
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
            this.pickChallenge(`Level ${this.level}! `);
          }
        } else {
          this.onSfx?.('powerup');
          this.pickChallenge();
        }
        break;
      } else {
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
    drawNumberCatch(ctx, {
      width: this.width,
      height: this.height,
      shake: this.shake,
      prompt: this.challenge.prompt,
      items: this.items,
      basket: this.basket,
      particles: this.particles,
      popups: this.popups,
    });
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.challenge.prompt,
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
