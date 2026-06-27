import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import type { HandGesture } from './gestures';
import {
  type Particle,
  type Popup,
  burst,
  stepParticles,
  stepPopups,
} from './fx';
import { THUMB_FACTS, pick, type ThumbFact } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawThumbQuiz } from './thumbQuizRenderer';

const GESTURE_HOLD = 14;

/**
 * True/false quiz answered with 👍 / 👎 gestures. Requires MediaPipe gesture
 * classification on HandPosition.gesture.
 */
export class ThumbQuizWorld implements GameInstance {
  width: number;
  height: number;

  fact: ThumbFact = THUMB_FACTS[0];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  holdGesture: HandGesture = 'none';
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
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.holdGesture = 'none';
    this.holdFrames = 0;
    this.feedback = '';
    this.pickFact();
    this.onSpeak?.('Thumbs up for true. Thumbs down for false.');
  }

  private pickFact(announce = '') {
    let next = this.fact;
    while (next.text === this.fact.text) next = pick(THUMB_FACTS);
    this.fact = next;
    this.feedback = '';
    this.onSpeak?.(`${announce}${next.text}`);
  }

  private resolve(answer: boolean) {
    if (answer === this.fact.answer) {
      this.score += 10;
      this.correct += 1;
      this.feedback = '✓ Correct!';
      burst(this.particles, this.width / 2, this.height * 0.5, '#7dff9b', 18);
      this.onSfx?.('powerup');
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
          this.pickFact(`Level ${this.level}! `);
        }
      } else {
        this.pickFact();
      }
    } else {
      this.feedback = 'Try again!';
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
    }
    this.holdFrames = 0;
    this.holdGesture = 'none';
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    const g = hand.gesture ?? 'none';
    if (g === 'thumbUp' || g === 'thumbDown') {
      if (g === this.holdGesture) this.holdFrames++;
      else {
        this.holdGesture = g;
        this.holdFrames = 1;
      }
      if (this.holdFrames >= GESTURE_HOLD) {
        this.resolve(g === 'thumbUp');
      }
    } else {
      this.holdGesture = 'none';
      this.holdFrames = 0;
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawThumbQuiz(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.fact.text,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'hint', label: '👍 / 👎', color: '#5cd2ff' },
      ],
    };
  }
}
