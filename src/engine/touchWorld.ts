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
import { type Item, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawTouch } from './touchRenderer';

const BASE_R = 56; // generous hitbox for little fingers at level 1
const MIN_R = 36; // never shrink below this
const TOUCH_COOLDOWN = 12; // frames before a fresh touch can register

export type TouchMode = 'emoji' | 'color' | 'word';

export interface Choice {
  id: number;
  x: number;
  y: number;
  r: number;
  item: Item;
}

export class TouchWorld implements GameInstance {
  width: number;
  height: number;

  choices: Choice[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  target: Item;
  level = 1;
  correct = 0; // correct touches within the current level
  score = 0;
  shake = 0;
  gameOver = false;
  mode: TouchMode;
  cooldown = 0; // frames before a fresh touch registers (debounce a held finger)

  private pack: Item[];
  private speakVerb: string;
  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(
    width: number,
    height: number,
    pack: Item[],
    mode: TouchMode = 'emoji',
    speakVerb = 'Touch the'
  ) {
    this.width = width;
    this.height = height;
    this.pack = pack;
    this.mode = mode;
    this.speakVerb = speakVerb;
    this.target = pack[0];
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

  // More choices and smaller targets as the level climbs.
  private choiceCount() {
    return clamp(2 + this.level, 3, this.pack.length);
  }
  private choiceRadius() {
    return clamp(BASE_R - (this.level - 1) * 4, MIN_R, BASE_R);
  }

  private pickRound(announce = '') {
    const count = this.choiceCount();
    const r = this.choiceRadius();

    // Choose distinct items; the first is the target.
    const chosen: Item[] = [];
    while (chosen.length < count) {
      const it = pick(this.pack);
      if (!chosen.some((c) => c.en === it.en)) chosen.push(it);
    }
    this.target = chosen[0];

    // Place at spaced, non-overlapping spots within a comfortable band.
    const marginX = r + 24;
    const top = this.height * 0.2;
    const bottom = this.height * 0.8;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < chosen.length; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 60 && !ok; tries++) {
        x = marginX + Math.random() * (this.width - 2 * marginX);
        y = top + Math.random() * (bottom - top);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > r * 2.2);
      }
      spots.push({ x, y });
    }

    // Shuffle so the target isn't always first on screen.
    const order = chosen.map((_, i) => i).sort(() => Math.random() - 0.5);
    this.choices = order.map((idx, i) => ({
      id: this.nextId++,
      x: spots[i].x,
      y: spots[i].y,
      r,
      item: chosen[idx],
    }));

    this.onSpeak?.(`${announce}${this.speakVerb} ${this.target.en}`);
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
        if (c.item.en === this.target.en) {
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
    drawTouch(ctx, this);
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
