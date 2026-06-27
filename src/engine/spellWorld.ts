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
import { type Item, ANIMALS, pick } from './content';
import { drawSpell } from './spellRenderer';

const GRAVITY = 0.3;
const TRAIL_LIFE = 12;
const GOAL = 6; // words to spell to win
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Short, spellable picture-words for ages 6–10.
const WORDS: Item[] = ANIMALS.filter((a) => a.en.length <= 5);

export interface FlyLetter {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  char: string;
  spin: number;
  spinV: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

/**
 * Spell the Word: a picture (e.g. 🐱) names a word; its letters fly up like
 * fruit and the player swipes to slice them in order (C-A-T). Wrong letters
 * are harmless (no-fail). Spell GOAL words to win.
 */
export class SpellWorld implements GameInstance {
  width: number;
  height: number;

  letters: FlyLetter[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  trail: TrailPoint[] = [];
  word: Item = WORDS[0];
  progress = 0; // letters spelled in the current word
  done = 0; // words completed
  score = 0;
  shake = 0;
  gameOver = false;
  prevBlade: { x: number; y: number } | null = null;

  private spawnTimer = 0;
  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.letters = [];
    this.particles = [];
    this.popups = [];
    this.trail = [];
    this.progress = 0;
    this.done = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.prevBlade = null;
    this.spawnTimer = 24;
    this.pickWord();
  }

  /** The next letter the player needs to slice (uppercase), or '' if done. */
  get needed(): string {
    return this.word.en[this.progress]?.toUpperCase() ?? '';
  }

  private pickWord(announce = '') {
    let next = this.word;
    while (next === this.word) next = pick(WORDS);
    this.word = next;
    this.progress = 0;
    this.onSpeak?.(`${announce}Spell ${next.en}`);
  }

  // Letters fly a touch faster / more often as more words are spelled.
  private spawnEvery() {
    return Math.max(26, 48 - this.done * 3);
  }
  private launchVy() {
    return -(13 + this.done * 0.4 + Math.random() * 3);
  }

  private spawn() {
    const wordLetters = this.word.en.toUpperCase().split('');
    // Bias toward letters of the current word (and the needed one especially).
    let char: string;
    const roll = Math.random();
    if (roll < 0.45) char = this.needed || pick(wordLetters);
    else if (roll < 0.75) char = pick(wordLetters);
    else char = ALPHABET[(Math.random() * ALPHABET.length) | 0];

    const r = 24;
    this.letters.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: this.height + r,
      vx: (Math.random() * 2 - 1) * 1.8,
      vy: this.launchVy(),
      r,
      char,
      spin: 0,
      spinV: (Math.random() * 2 - 1) * 0.05,
    });
  }

  private pointSegDist(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number
  ) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
    t = clamp(t, 0, 1);
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  private slice(l: FlyLetter): boolean {
    if (l.char === this.needed) {
      this.score += 10;
      this.progress += 1;
      burst(this.particles, l.x, l.y, '#7dff9b', 16);
      popup(this.popups, l.x, l.y, l.char, '#7dff9b');
      this.onSfx?.('hit');
      if (this.progress >= this.word.en.length) {
        this.done += 1;
        if (this.done >= GOAL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.(`${this.word.en}! You did it! Well done!`);
          this.onGameOver?.();
        } else {
          this.onSfx?.('powerup');
          this.pickWord(`${this.word.en}! `);
        }
        return true; // word finished — stop slicing this frame
      }
      this.onSpeak?.(l.char);
    } else {
      // Gentle: wrong letter never penalizes, just a nudge.
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
    }
    return false;
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    // --- Blade from the finger; slice letters the segment passes through ---
    const sliced = new Set<number>();
    if (hand.available) {
      const cur = { x: hand.x * this.width, y: hand.y * this.height };
      this.trail.push({ x: cur.x, y: cur.y, life: TRAIL_LIFE });
      if (this.prevBlade) {
        for (const l of this.letters) {
          if (sliced.has(l.id)) continue;
          const d = this.pointSegDist(
            l.x,
            l.y,
            this.prevBlade.x,
            this.prevBlade.y,
            cur.x,
            cur.y
          );
          if (d < l.r) {
            sliced.add(l.id);
            const finishedWord = this.slice(l);
            if (this.gameOver || finishedWord) break;
          }
        }
      }
      this.prevBlade = cur;
    } else {
      this.prevBlade = null;
    }
    this.letters = this.letters.filter((l) => !sliced.has(l.id));
    if (this.gameOver) return;

    // --- Physics ---
    for (const l of this.letters) {
      l.vy += GRAVITY;
      l.x += l.vx;
      l.y += l.vy;
      l.spin += l.spinV;
    }
    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
    for (const t of this.trail) t.life--;
    this.trail = this.trail.filter((t) => t.life > 0);

    // --- Cull off-screen (a missed letter is free — no-fail) ---
    this.letters = this.letters.filter((l) => {
      const offBottom = l.vy > 0 && l.y - l.r > this.height;
      const offSide = l.x < -120 || l.x > this.width + 120;
      return !(offBottom || offSide);
    });

    // --- Spawning ---
    if (++this.spawnTimer >= this.spawnEvery()) {
      this.spawnTimer = 0;
      this.spawn();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawSpell(ctx, this);
  }

  hud(): HudState {
    const letters = this.word.en.toUpperCase().split('');
    const spelled = letters
      .map((c, i) => (i < this.progress ? c : '_'))
      .join(' ');
    return {
      score: this.score,
      level: this.done + 1,
      prompt: this.word.emoji ?? this.word.en,
      badges: [
        { key: 'spell', label: spelled, color: '#7dff9b' },
        { key: 'done', label: `${this.done}/${GOAL}`, color: '#ffd25e' },
      ],
    };
  }
}
