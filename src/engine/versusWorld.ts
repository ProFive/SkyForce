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
import { trackedHands } from './hands';
import { pick, FRUITS } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawVersus } from './versusRenderer';

const TARGET_R = 48;
const TOUCH_COOLDOWN = 18;

/**
 * Two-player race: left hand (blue) vs right hand (red). Touch the star first
 * to score. Needs two hands visible — great for two kids side by side.
 */
export class VersusWorld implements GameInstance {
  width: number;
  height: number;

  target = { x: 0, y: 0, r: TARGET_R, emoji: '⭐' };
  particles: Particle[] = [];
  popups: Popup[] = [];
  level = 1;
  correct = 0;
  score = 0;
  leftScore = 0;
  rightScore = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;
  lastWinner: 'left' | 'right' | null = null;
  leftFinger = { x: 0, y: 0, active: false };
  rightFinger = { x: 0, y: 0, active: false };

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
    this.leftScore = 0;
    this.rightScore = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.lastWinner = null;
    this.leftFinger = { x: 0, y: 0, active: false };
    this.rightFinger = { x: 0, y: 0, active: false };
    this.moveTarget();
    this.onSpeak?.('Left hand blue, right hand red. Touch the star first!');
  }

  private moveTarget() {
    const margin = TARGET_R + 28;
    this.target.x = margin + Math.random() * (this.width - 2 * margin);
    this.target.y = this.height * 0.28 + Math.random() * (this.height * 0.42);
    this.target.emoji = pick(FRUITS).emoji ?? '⭐';
  }

  private tryTouch(hand: HandPosition) {
    if (this.cooldown > 0) return;
    const players = trackedHands(hand);
    if (players.length < 2) return;

    for (const { side, hand: h } of players) {
      const x = h.x * this.width;
      const y = h.y * this.height;
      if (dist(x, y, this.target.x, this.target.y) > this.target.r + 10) continue;

      this.lastWinner = side;
      if (side === 'left') this.leftScore += 10;
      else this.rightScore += 10;
      this.score += 10;
      this.correct += 1;
      burst(this.particles, this.target.x, this.target.y, side === 'left' ? '#5cd2ff' : '#ff8787', 18);
      popup(
        this.popups,
        this.target.x,
        this.target.y - 20,
        side === 'left' ? 'Blue!' : 'Red!',
        side === 'left' ? '#5cd2ff' : '#ff8787'
      );
      this.onSfx?.('powerup');
      this.cooldown = TOUCH_COOLDOWN;

      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          const lead =
            this.leftScore === this.rightScore
              ? 'It is a tie!'
              : this.leftScore > this.rightScore
                ? 'Blue wins!'
                : 'Red wins!';
          this.onSpeak?.(`Game over! ${lead}`);
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.onSpeak?.(`Level ${this.level}!`);
        }
      }
      this.moveTarget();
      return;
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.cooldown > 0) this.cooldown--;

    this.leftFinger.active = false;
    this.rightFinger.active = false;
    for (const { side, hand: h } of trackedHands(hand)) {
      const finger = side === 'left' ? this.leftFinger : this.rightFinger;
      finger.x = h.x * this.width;
      finger.y = h.y * this.height;
      finger.active = true;
    }

    this.tryTouch(hand);

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawVersus(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.target.emoji,
      badges: [
        { key: 'blue', label: `🔵 ${this.leftScore}`, color: '#5cd2ff' },
        { key: 'red', label: `🔴 ${this.rightScore}`, color: '#ff8787' },
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
      ],
    };
  }
}
