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
import { drawMath } from './mathRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;

export interface MathProblem {
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  prompt: string;
}

export interface MathFallItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  value: number;
}

/** Build a kid-friendly addition/subtraction problem scaled to the level. */
export function makeProblem(level: number): MathProblem {
  const max = level <= 3 ? 9 : level <= 6 ? 15 : 20;
  const useSub = level >= 5 && Math.random() < 0.45;
  let a = 1 + ((Math.random() * max) | 0);
  let b = 1 + ((Math.random() * max) | 0);
  if (useSub) {
    if (b > a) [a, b] = [b, a];
    return { a, b, op: '-', answer: a - b, prompt: `${a} - ${b} = ?` };
  }
  return { a, b, op: '+', answer: a + b, prompt: `${a} + ${b} = ?` };
}

export function speakProblem(p: MathProblem): string {
  const op = p.op === '+' ? 'plus' : 'minus';
  return `${p.a} ${op} ${p.b} equals what?`;
}

function distractors(answer: number, count = 5): number[] {
  const vals = new Set<number>([answer]);
  let guard = 0;
  while (vals.size < count && guard++ < 40) {
    const d = answer + ((Math.random() * 9) | 0) - 4;
    if (d >= 0 && d <= 30) vals.add(d);
  }
  while (vals.size < count) vals.add(answer + vals.size);
  return [...vals];
}

/**
 * Falling-number catch game: read the equation, catch the correct answer in
 * the basket. No-fail — wrong catches just nudge. Ten levels, faster falls.
 */
export class MathWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  items: MathFallItem[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  problem: MathProblem = makeProblem(1);
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
    this.pickProblem();
  }

  private pickProblem(announce = '') {
    this.problem = makeProblem(this.level);
    this.pool = distractors(this.problem.answer);
    this.onSpeak?.(`${announce}${speakProblem(this.problem)}`);
  }

  private spawnEvery() {
    return Math.max(22, 48 - this.level * 4);
  }

  private fallSpeed() {
    return 1.8 + this.level * 0.28 + Math.random() * 0.5;
  }

  private answerBias() {
    return Math.max(0.3, 0.55 - this.level * 0.04);
  }

  private spawn() {
    const r = 24;
    const value =
      Math.random() < this.answerBias()
        ? this.problem.answer
        : this.pool[(Math.random() * this.pool.length) | 0];
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
      if (it.value === this.problem.answer) {
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
            this.pickProblem(`Level ${this.level}! `);
          }
        } else {
          this.onSfx?.('powerup');
          this.pickProblem();
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
    drawMath(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.problem.prompt,
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
