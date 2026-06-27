import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  clamp,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { drawLetters } from './letterRenderer';

const BASKET_W = 104;
const BASKET_H = 44;
const SMOOTH = 0.4;
const GOAL = 8; // correct catches to win (no-fail learning game)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Simple phonics sounds so kids hear the letter's sound, not just its name.
const PHONICS: Record<string, string> = {
  A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fff', G: 'guh',
  H: 'huh', I: 'ih', J: 'juh', K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn',
  O: 'oh', P: 'puh', Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh', U: 'uh',
  V: 'vvv', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz',
};

export interface LetterItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  char: string;
}

export class LetterWorld implements GameInstance {
  width: number;
  height: number;

  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H };
  letters: LetterItem[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  target = 'A';
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.basket = {
      x: this.width / 2,
      y: this.height - 90,
      w: BASKET_W,
      h: BASKET_H,
    };
    this.letters = [];
    this.particles = [];
    this.popups = [];
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 20;
    this.target = 'A';
    this.pickTarget(); // also speaks the first letter (once onSpeak is wired)
  }

  private pickTarget() {
    let next = this.target;
    while (next === this.target) {
      next = ALPHABET[(Math.random() * ALPHABET.length) | 0];
    }
    this.target = next;
    // Say the name and the phonics sound: "Find the letter B. B says buh."
    const sound = PHONICS[next];
    this.onSpeak?.(
      sound ? `Find the letter ${next}. ${next} says ${sound}` : `Find the letter ${next}`
    );
  }

  private spawn() {
    const r = 26;
    // Bias toward the target so it appears often enough for young players.
    const char =
      Math.random() < 0.42
        ? this.target
        : ALPHABET[(Math.random() * ALPHABET.length) | 0];
    this.letters.push({
      id: this.nextId++,
      x: r + 6 + Math.random() * (this.width - 2 * (r + 6)),
      y: -r,
      vy: 1.9 + Math.random() * 0.8,
      r,
      char,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    if (hand.available) {
      const tx = hand.x * this.width;
      this.basket.x += (tx - this.basket.x) * SMOOTH;
      const ty = hand.y * this.height;
      this.basket.y += (ty - this.basket.y) * SMOOTH * 0.6;
    }
    this.basket.x = clamp(this.basket.x, this.basket.w / 2, this.width - this.basket.w / 2);
    this.basket.y = clamp(this.basket.y, this.height * 0.45, this.height - 60);

    if (++this.spawnTimer >= 46) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const it of this.letters) it.y += it.vy;

    const caught = new Set<number>();
    const rimY = this.basket.y - this.basket.h / 2;
    for (const it of this.letters) {
      const inX = Math.abs(it.x - this.basket.x) < this.basket.w / 2 + it.r * 0.4;
      const inY = it.y + it.r >= rimY && it.y <= this.basket.y + this.basket.h / 2;
      if (!inX || !inY) continue;
      caught.add(it.id);
      if (it.char === this.target) {
        this.score += 10;
        this.correct += 1;
        burst(this.particles, it.x, it.y, '#ffe45e', 16);
        popup(this.popups, it.x, it.y, '✓', '#7dff9b');
        if (this.correct >= GOAL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Well done!');
          this.onGameOver?.();
        } else {
          this.onSfx?.('powerup');
          this.pickTarget();
        }
        break; // one catch per frame keeps targets in sync
      } else {
        // Gentle: no penalty, just a nudge and a fresh prompt of the goal.
        this.shake = Math.min(10, this.shake + 6);
        this.onSfx?.('hurt');
      }
    }

    this.letters = this.letters.filter(
      (it) => !caught.has(it.id) && it.y - it.r < this.height
    );
    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawLetters(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      prompt: this.target,
      badges: [
        { key: 'progress', label: `${this.correct}/${GOAL}`, color: '#ffd25e' },
      ],
    };
  }
}
