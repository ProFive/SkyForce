import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import {
  type PoseChallenge,
  checkPose,
  pickChallenge,
} from './poseMatch';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawPoseDance } from './poseDanceRenderer';

const HOLD_FRAMES = 18;

/**
 * Copy the on-screen pose when your body matches. Uses PoseLandmarker via
 * HandPosition.pose.landmarks.
 */
export class PoseDanceWorld implements GameInstance {
  width: number;
  height: number;

  challenge: PoseChallenge = pickChallenge();
  particles: Particle[] = [];
  popups: Popup[] = [];
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  holdFrames = 0;
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
    this.holdFrames = 0;
    this.feedback = '';
    this.pickChallenge();
    this.onSpeak?.('Stand back so the camera sees your whole body!');
  }

  private pickChallenge(announce = '') {
    this.challenge = pickChallenge(this.challenge?.id);
    this.holdFrames = 0;
    this.feedback = '';
    this.onSpeak?.(`${announce}${this.challenge.speak}`);
  }

  private onMatch() {
    this.score += 10;
    this.correct += 1;
    this.feedback = '✓ Great pose!';
    burst(this.particles, this.width / 2, this.height * 0.45, '#7dff9b', 20);
    popup(this.popups, this.width / 2, this.height * 0.4, this.challenge.emoji, '#ffd25e');
    this.onSfx?.('powerup');

    if (this.correct >= levelGoal(this.level)) {
      if (this.level >= MAX_LEVEL) {
        this.gameOver = true;
        this.onSfx?.('level');
        this.onSpeak?.('You nailed every pose! Amazing!');
        this.onGameOver?.();
      } else {
        this.level += 1;
        this.correct = 0;
        this.onSfx?.('level');
        this.pickChallenge(`Level ${this.level}! `);
      }
    } else {
      this.pickChallenge();
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    const pose = hand.pose;
    if (!pose?.available || !pose.landmarks) {
      this.holdFrames = 0;
      this.feedback = 'Step back — show your whole body';
      return;
    }

    if (checkPose(this.challenge.id, pose.landmarks)) {
      this.holdFrames++;
      this.feedback = 'Hold it…';
      if (this.holdFrames >= HOLD_FRAMES) this.onMatch();
    } else {
      if (this.holdFrames > 0) {
        this.shake = Math.min(8, this.shake + 4);
        this.onSfx?.('hurt');
      }
      this.holdFrames = 0;
      this.feedback = '';
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawPoseDance(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.challenge.emoji,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'pose', label: this.challenge.label, color: '#5cd2ff' },
      ],
    };
  }
}
