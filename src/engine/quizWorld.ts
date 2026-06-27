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
import type { ShapeKind } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawQuiz } from './quizRenderer';

const BASE_R = 60; // generous hitbox for little fingers at level 1
const MIN_R = 40; // never shrink below this
const TOUCH_COOLDOWN = 12; // frames before a fresh touch can register

export type QuizOptionKind = 'emoji' | 'text' | 'color' | 'shape';

/** One answer the child can touch. Exactly one option per round is correct. */
export interface QuizOption {
  kind: QuizOptionKind;
  correct: boolean;
  text?: string; // for 'text'
  emoji?: string; // for 'emoji'
  hex?: string; // fill for 'color' / 'shape'
  shape?: ShapeKind; // for 'shape'
}

/** A question + its answer options, produced fresh each round by a generator. */
export interface QuizRound {
  promptEmoji?: string; // big emoji shown at the top (optional)
  promptText?: string; // question/label shown at the top (optional)
  speak: string; // spoken aloud when the round begins
  options: QuizOption[];
}

/**
 * Builds one round. `count` is the suggested number of options for the current
 * level; a generator may honor it (shapes/animals) or ignore it (fixed quizzes).
 */
export type QuizGenerator = (level: number, count: number) => QuizRound;

export interface QuizChoice {
  id: number;
  x: number;
  y: number;
  r: number;
  option: QuizOption;
}

/**
 * Generic "listen / read the question, then touch the right answer" engine.
 * No-fail and voice-guided: a wrong touch just nudges, the round stays. Clearing
 * every level (each needing more correct answers than the last) wins the game.
 */
export class QuizWorld implements GameInstance {
  width: number;
  height: number;

  choices: QuizChoice[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  promptEmoji?: string;
  promptText?: string;
  level = 1;
  correct = 0; // correct touches within the current level
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0; // debounce a held finger

  private gen: QuizGenerator;
  private maxOptions: number;
  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(
    width: number,
    height: number,
    gen: QuizGenerator,
    maxOptions = 4
  ) {
    this.width = width;
    this.height = height;
    this.gen = gen;
    this.maxOptions = maxOptions;
    this.reset();
  }

  reset() {
    this.choices = [];
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.pickRound();
  }

  // More options and slightly smaller targets as the level climbs.
  private optionCount() {
    return clamp(2 + this.level, 3, this.maxOptions);
  }
  private radius() {
    return clamp(BASE_R - (this.level - 1) * 3, MIN_R, BASE_R);
  }

  private pickRound(announce = '') {
    const round = this.gen(this.level, this.optionCount());
    this.promptEmoji = round.promptEmoji;
    this.promptText = round.promptText;

    const opts = round.options;
    const r = this.radius();

    // Place options at spaced, non-overlapping spots in a comfortable band
    // below the prompt at the top of the screen.
    const marginX = r + 24;
    const top = this.height * 0.34;
    const bottom = this.height * 0.84;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < opts.length; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 80 && !ok; tries++) {
        x = marginX + Math.random() * (this.width - 2 * marginX);
        y = top + Math.random() * (bottom - top);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > r * 2.2);
      }
      spots.push({ x, y });
    }

    this.choices = opts.map((option, i) => ({
      id: this.nextId++,
      x: spots[i].x,
      y: spots[i].y,
      r,
      option,
    }));

    this.onSpeak?.(`${announce}${round.speak}`);
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

    if (hand.available && this.cooldown === 0) {
      for (const c of this.choices) {
        if (dist(this.finger.x, this.finger.y, c.x, c.y) >= c.r) continue;
        this.cooldown = TOUCH_COOLDOWN;
        if (c.option.correct) {
          this.score += 10;
          this.correct += 1;
          burst(this.particles, c.x, c.y, '#ffe45e', 16);
          popup(this.popups, c.x, c.y, '✓', '#7dff9b');
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
              this.pickRound(`Level ${this.level}! `);
            }
          } else {
            this.onSfx?.('powerup');
            this.pickRound();
          }
        } else {
          // Gentle: no penalty, round stays so they can try again.
          this.shake = Math.min(10, this.shake + 6);
          this.onSfx?.('hurt');
        }
        break;
      }
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawQuiz(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      // The question is drawn on the canvas (not via the "Find" HUD label).
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
