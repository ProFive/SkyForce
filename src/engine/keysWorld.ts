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
import {
  type PianoNote,
  NOTE_FREQ,
  NOTE_LABEL,
  PIANO_KEYS,
  TWINKLE,
} from './keysContent';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawKeys } from './keysRenderer';

const TOUCH_COOLDOWN = 10;
const KEY_R = 34;

export interface PianoKey {
  note: PianoNote;
  x: number;
  y: number;
  r: number;
}

/**
 * Touch the lit piano key to play Twinkle Twinkle. Each level needs more correct
 * notes from the melody.
 */
export class KeysWorld implements GameInstance {
  width: number;
  height: number;

  keys: PianoKey[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;
  noteIndex = 0;
  pressed: PianoNote | null = null;
  pressFrames = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;
  onNote?: (frequencyHz: number) => void;

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
    this.cooldown = 0;
    this.noteIndex = 0;
    this.pressed = null;
    this.pressFrames = 0;
    this.layoutKeys();
    this.onSpeak?.('Touch the glowing key to play Twinkle Twinkle.');
  }

  expectedNote(): PianoNote {
    return TWINKLE[this.noteIndex % TWINKLE.length];
  }

  private layoutKeys() {
    const y = this.height * 0.72;
    const margin = KEY_R + 16;
    const span = this.width - 2 * margin;
    const step = span / (PIANO_KEYS.length - 1);
    this.keys = PIANO_KEYS.map((note, i) => ({
      note,
      x: margin + i * step,
      y,
      r: KEY_R,
    }));
  }

  private hitKey(x: number, y: number): PianoKey | null {
    for (const k of this.keys) {
      if (dist(x, y, k.x, k.y) < k.r + 8) return k;
    }
    return null;
  }

  private onKeyPress(note: PianoNote) {
    this.onNote?.(NOTE_FREQ[note]);
    this.pressed = note;
    this.pressFrames = 8;

    if (note === this.expectedNote()) {
      this.score += 10;
      this.correct += 1;
      this.noteIndex += 1;
      popup(this.popups, this.width / 2, this.height * 0.38, '♪', '#ffd25e');
      burst(this.particles, this.width / 2, this.height * 0.4, '#ffd25e', 12);
      this.onSfx?.('powerup');

      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Beautiful! You played the whole song!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.onSpeak?.(`Level ${this.level}! Keep playing.`);
        }
      }
    } else {
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.pressFrames > 0) this.pressFrames--;
    else this.pressed = null;
    if (this.cooldown > 0) this.cooldown--;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
      if (this.cooldown === 0) {
        const hit = this.hitKey(this.finger.x, this.finger.y);
        if (hit) {
          this.onKeyPress(hit.note);
          this.cooldown = TOUCH_COOLDOWN;
        }
      }
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawKeys(ctx, this);
  }

  hud(): HudState {
    const next = this.expectedNote();
    return {
      score: this.score,
      level: this.level,
      prompt: NOTE_LABEL[next],
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'song', label: 'Twinkle', color: '#5cd2ff' },
      ],
    };
  }
}
