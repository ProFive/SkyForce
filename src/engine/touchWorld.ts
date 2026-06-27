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
import { type Item, pick } from './content';
import { drawTouch } from './touchRenderer';

const GOAL = 6; // correct touches to win (no-fail learning game)
const CHOICES = 3; // items shown each round
const R = 56; // generous hitbox for little fingers
const TOUCH_COOLDOWN = 12; // frames before a fresh touch can register

export type TouchMode = 'emoji' | 'color';

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
  correct = 0;
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
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.pickRound();
  }

  private pickRound() {
    // Choose distinct items; the first is the target.
    const chosen: Item[] = [];
    while (chosen.length < Math.min(CHOICES, this.pack.length)) {
      const it = pick(this.pack);
      if (!chosen.some((c) => c.en === it.en)) chosen.push(it);
    }
    this.target = chosen[0];

    // Place at spaced, non-overlapping spots within a comfortable band.
    const marginX = R + 24;
    const top = this.height * 0.22;
    const bottom = this.height * 0.78;
    const spots: { x: number; y: number }[] = [];
    for (let n = 0; n < chosen.length; n++) {
      let x = 0;
      let y = 0;
      let ok = false;
      for (let tries = 0; tries < 40 && !ok; tries++) {
        x = marginX + Math.random() * (this.width - 2 * marginX);
        y = top + Math.random() * (bottom - top);
        ok = spots.every((s) => dist(s.x, s.y, x, y) > R * 2.4);
      }
      spots.push({ x, y });
    }

    // Shuffle so the target isn't always first on screen.
    const order = chosen.map((_, i) => i).sort(() => Math.random() - 0.5);
    this.choices = order.map((idx, i) => ({
      id: this.nextId++,
      x: spots[i].x,
      y: spots[i].y,
      r: R,
      item: chosen[idx],
    }));

    this.onSpeak?.(`${this.speakVerb} ${this.target.en}`);
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
          if (this.correct >= GOAL) {
            this.gameOver = true;
            this.onSfx?.('level');
            this.onSpeak?.('Well done!');
            this.onGameOver?.();
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
      prompt: this.target.emoji ?? this.target.en,
      badges: [
        { key: 'progress', label: `${this.correct}/${GOAL}`, color: '#ffd25e' },
      ],
    };
  }
}
