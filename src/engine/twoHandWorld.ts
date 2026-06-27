import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { areHandsClapping } from './gestures';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawTwoHand } from './twoHandRenderer';

const BASE_BEAT = 72;
const BEAT_WINDOW = 16;
const CLAP_COOLDOWN = 24;

/**
 * Clap both hands together on the beat. Two hands must be visible; clap when
 * the ring pulses at the center.
 */
export class TwoHandWorld implements GameInstance {
  width: number;
  height: number;

  particles: Particle[] = [];
  popups: Popup[] = [];
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  beatTimer = 0;
  beatPulse = 0;
  clapCooldown = 0;
  feedback = '';

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.particles = [];
    this.popups = [];
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.beatTimer = 0;
    this.beatPulse = 0;
    this.clapCooldown = 0;
    this.feedback = '';
    this.onSpeak?.('Clap both hands when the circle glows!');
  }

  private beatInterval() {
    return Math.max(36, BASE_BEAT - (this.level - 1) * 4);
  }

  private tryClap(hand: HandPosition) {
    if (!hand.other?.available) {
      this.feedback = 'Show both hands!';
      return;
    }
    if (!areHandsClapping(hand, hand.other)) return;
    if (this.clapCooldown > 0) return;

    if (this.beatPulse > 0) {
      this.score += 10;
      this.correct += 1;
      this.feedback = '✓ Clap!';
      burst(this.particles, this.width / 2, this.height * 0.45, '#ffd25e', 20);
      popup(this.popups, this.width / 2, this.height * 0.4, '👏', '#7dff9b');
      this.onSfx?.('powerup');
      this.clapCooldown = CLAP_COOLDOWN;

      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Great rhythm! You did it!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.onSpeak?.(`Level ${this.level}! Faster beats now.`);
        }
      }
    } else {
      this.feedback = 'Wait for the beat…';
      this.shake = Math.min(8, this.shake + 4);
      this.onSfx?.('hurt');
      this.clapCooldown = 12;
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.clapCooldown > 0) this.clapCooldown--;
    if (this.beatPulse > 0) this.beatPulse--;

    this.beatTimer++;
    if (this.beatTimer >= this.beatInterval()) {
      this.beatTimer = 0;
      this.beatPulse = BEAT_WINDOW;
      this.onSfx?.('hit');
    }

    this.tryClap(hand);

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawTwoHand(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: '👏',
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'hint', label: '2 hands', color: '#5cd2ff' },
      ],
    };
  }
}
