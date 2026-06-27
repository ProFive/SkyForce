import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  dist,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawGrow } from './growRenderer';

const TOUCH_COOLDOWN = 10;
const STAGES = ['🌱', '🌿', '🪴', '🌸', '🌺'];

/**
 * Calm cause-and-effect toy: touch to water the plant and watch it grow.
 * No-fail — every touch helps. Win after enough growth across 10 levels.
 */
export class GrowWorld implements GameInstance {
  width: number;
  height: number;

  plant = { x: 0, y: 0, r: 80 };
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  growth = 0; // 0..100 within the current level stage
  level = 1;
  correct = 0; // waters that completed a growth stage
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;
  sparkle = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.plant = { x: this.width / 2, y: this.height * 0.52, r: 80 };
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.growth = 0;
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.sparkle = 0;
    this.onSpeak?.('Touch to water the flower.');
  }

  private growthPerTouch() {
    return 14 + this.level;
  }

  /** Current growth-stage emoji (for renderer). */
  stageEmoji(): string {
    const idx = Math.min(
      STAGES.length - 1,
      Math.floor((this.growth / 100) * STAGES.length)
    );
    return STAGES[idx];
  }

  private onWater(x: number, y: number) {
    this.growth = Math.min(100, this.growth + this.growthPerTouch());
    this.sparkle = 20;
    burst(this.particles, x, y - 30, '#5cd2ff', 10);
    popup(this.popups, x, y - 50, '💧', '#5cd2ff');
    this.onSfx?.('powerup');

    if (this.growth >= 100) {
      this.growth = 0;
      this.score += 10;
      this.correct += 1;
      burst(this.particles, this.plant.x, this.plant.y, '#ffe45e', 20);
      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Beautiful! You grew a garden!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.onSpeak?.(`Level ${this.level}! Keep watering.`);
        }
      } else {
        this.onSpeak?.('It bloomed! Water again.');
      }
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.cooldown > 0) this.cooldown--;
    if (this.sparkle > 0) this.sparkle--;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    if (hand.available && this.cooldown === 0) {
      const { x, y, r } = this.plant;
      if (dist(this.finger.x, this.finger.y, x, y) < r * 1.1) {
        this.cooldown = TOUCH_COOLDOWN;
        this.onWater(x, y);
      }
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawGrow(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.stageEmoji(),
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#7dff9b',
        },
        {
          key: 'grow',
          label: `${this.growth}%`,
          color: '#5cd2ff',
        },
      ],
    };
  }
}
