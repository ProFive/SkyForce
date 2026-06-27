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
import { MAX_LEVEL, levelGoal } from './levels';
import { drawOrder } from './orderRenderer';

const TOUCH_COOLDOWN = 12;

export type OrderMode = 'number' | 'letter';

export interface OrderBubble {
  id: number;
  x: number;
  y: number;
  r: number;
  label: string;
  order: number; // 0, 1, 2…
  popped: boolean;
  life: number;
  maxLife: number;
}

const LETTERS = 'ABCDEFGHIJ';

/**
 * Pop bubbles in the right order (1-2-3 or A-B-C). No-fail — wrong pops just
 * shake. Ten levels add more bubbles and shorter lifetimes.
 */
export class OrderWorld implements GameInstance {
  width: number;
  height: number;

  bubbles: OrderBubble[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  mode: OrderMode = 'number';
  nextIndex = 0;
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;

  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number, mode: OrderMode = 'number') {
    this.width = width;
    this.height = height;
    this.mode = mode;
    this.reset();
  }

  reset() {
    this.bubbles = [];
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.spawnRound();
    this.onSpeak?.('Pop the bubbles in order.');
  }

  private bubbleCount() {
    return clamp(2 + Math.floor(this.level / 2), 3, 5);
  }

  private lifetime() {
    return Math.max(90, 150 - this.level * 8);
  }

  private spawnRound(announce = '') {
    const count = this.bubbleCount();
    const useLetters = this.mode === 'letter' || this.level >= 4;
    this.mode = useLetters ? 'letter' : 'number';
    this.nextIndex = 0;

    const r = 34;
    const margin = r + 20;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < count; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 60 && !ok; tries++) {
        x = margin + Math.random() * (this.width - 2 * margin);
        y = this.height * 0.25 + Math.random() * (this.height * 0.5);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > r * 2.4);
      }
      spots.push({ x, y });
    }

    const life = this.lifetime();
    this.bubbles = spots.map((s, i) => ({
      id: this.nextId++,
      x: s.x,
      y: s.y,
      r,
      label: useLetters ? LETTERS[i] : String(i + 1),
      order: i,
      popped: false,
      life,
      maxLife: life,
    }));

    const hint = useLetters
      ? this.bubbles.map((b) => b.label).join(', ')
      : '1, 2, 3';
    this.onSpeak?.(`${announce}Pop in order: ${hint}`);
  }

  private roundComplete() {
    this.score += 10;
    this.correct += 1;
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
        this.spawnRound(`Level ${this.level}! `);
      }
    } else {
      this.onSfx?.('powerup');
      this.spawnRound();
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

    for (const b of this.bubbles) {
      if (!b.popped) b.life--;
    }

    if (hand.available && this.cooldown === 0) {
      for (const b of this.bubbles) {
        if (b.popped || dist(this.finger.x, this.finger.y, b.x, b.y) >= b.r) continue;
        this.cooldown = TOUCH_COOLDOWN;
        if (b.order === this.nextIndex) {
          b.popped = true;
          this.nextIndex += 1;
          burst(this.particles, b.x, b.y, '#7dff9b', 14);
          popup(this.popups, b.x, b.y, '✓', '#7dff9b');
          this.onSfx?.('hit');
          if (this.bubbles.every((x) => x.popped)) this.roundComplete();
        } else {
          this.shake = Math.min(10, this.shake + 6);
          this.onSfx?.('hurt');
        }
        break;
      }
    }

    // Expired bubbles respawn the round (no penalty).
    if (this.bubbles.some((b) => !b.popped && b.life <= 0)) {
      this.spawnRound();
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawOrder(ctx, this);
  }

  hud(): HudState {
    const next = this.bubbles.find((b) => !b.popped && b.order === this.nextIndex);
    return {
      score: this.score,
      level: this.level,
      prompt: next?.label ?? '✓',
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
