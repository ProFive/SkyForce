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
import { type Item, ANIMALS, pick } from './content';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawSizeTouch } from './sizeTouchRenderer';

const BASE_R = 52;
const TOUCH_COOLDOWN = 12;

export interface SizeChoice {
  id: number;
  x: number;
  y: number;
  r: number;
  scale: number;
  item: Item;
  correct: boolean;
}

export type SizeCompare = 'bigger' | 'smaller';

/**
 * "Touch the bigger/smaller one" — same emoji at different sizes. No-fail,
 * voice-guided, 10-level progression.
 */
export class SizeTouchWorld implements GameInstance {
  width: number;
  height: number;

  choices: SizeChoice[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  compare: SizeCompare = 'bigger';
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;

  private pack: Item[];
  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number, pack: Item[] = ANIMALS) {
    this.width = width;
    this.height = height;
    this.pack = pack;
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

  private scaleSet() {
    const n = Math.min(2 + Math.floor(this.level / 3), 3);
    if (n === 2) return [0.72, 1.28];
    return [0.65, 1.0, 1.38];
  }

  private pickRound(announce = '') {
    this.compare = Math.random() < 0.5 ? 'bigger' : 'smaller';
    const item = pick(this.pack);
    const scales = this.scaleSet();
    const targetScale =
      this.compare === 'bigger' ? Math.max(...scales) : Math.min(...scales);

    const marginX = BASE_R * 1.5 + 24;
    const top = this.height * 0.22;
    const bottom = this.height * 0.78;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < scales.length; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 60 && !ok; tries++) {
        x = marginX + Math.random() * (this.width - 2 * marginX);
        y = top + Math.random() * (bottom - top);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > BASE_R * 2.8);
      }
      spots.push({ x, y });
    }

    const order = scales.map((_, i) => i).sort(() => Math.random() - 0.5);
    this.choices = order.map((idx, i) => {
      const scale = scales[idx];
      return {
        id: this.nextId++,
        x: spots[i].x,
        y: spots[i].y,
        r: BASE_R * scale,
        scale,
        item,
        correct: scale === targetScale,
      };
    });

    const word = this.compare === 'bigger' ? 'bigger' : 'smaller';
    this.onSpeak?.(`${announce}Touch the ${word} one`);
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
        if (c.correct) {
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
    drawSizeTouch(ctx, this);
  }

  hud(): HudState {
    const word = this.compare === 'bigger' ? 'Bigger' : 'Smaller';
    const emoji = this.choices[0]?.item.emoji ?? '🐾';
    return {
      score: this.score,
      level: this.level,
      prompt: `${word} ${emoji}`,
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
