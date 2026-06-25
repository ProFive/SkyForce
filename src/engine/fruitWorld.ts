import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import { drawFruit } from './fruitRenderer';

const GRAVITY = 0.34;
const LIVES = 10;
const COMBO_WINDOW = 22; // frames to chain slices into a combo
const TRAIL_LIFE = 12; // frames a blade-trail point lingers

export interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  emoji: string;
  color: string;
  bomb: boolean;
  spin: number;
  spinV: number;
}

export interface Juice {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface SlicePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

const FRUITS: { emoji: string; color: string }[] = [
  { emoji: '🍉', color: '#ff5d7a' },
  { emoji: '🍎', color: '#ff6b4a' },
  { emoji: '🍊', color: '#ffa53d' },
  { emoji: '🍋', color: '#ffe45e' },
  { emoji: '🍇', color: '#b07dff' },
  { emoji: '🥝', color: '#7dff9b' },
  { emoji: '🍓', color: '#ff4d6d' },
  { emoji: '🍑', color: '#ff9f7d' },
];

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v;
}

/** Distance from point (px,py) to the segment (ax,ay)->(bx,by). */
function pointSegDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = clamp(t, 0, 1);
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/**
 * Fruit Slash: fruit is tossed up from the bottom; swipe the finger to slice
 * it. Avoid bombs and don't let fruit fall. Same GameInstance contract as
 * every other arcade game.
 */
export class FruitWorld implements GameInstance {
  width: number;
  height: number;

  fruits: Fruit[] = [];
  juice: Juice[] = [];
  popups: SlicePopup[] = [];
  trail: TrailPoint[] = [];
  score = 0;
  lives = LIVES;
  combo = 0;
  shake = 0;
  gameOver = false;

  private prevBlade: { x: number; y: number } | null = null;
  private comboTimer = 0;
  private spawnTimer = 0;
  private frame = 0;
  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.fruits = [];
    this.juice = [];
    this.popups = [];
    this.trail = [];
    this.score = 0;
    this.lives = LIVES;
    this.combo = 0;
    this.shake = 0;
    this.gameOver = false;
    this.prevBlade = null;
    this.comboTimer = 0;
    this.spawnTimer = 30;
    this.frame = 0;
  }

  private spawnInterval(): number {
    return Math.max(22, 56 - Math.floor(this.score / 60) * 2);
  }

  private launch() {
    const r = 26 + Math.random() * 9;
    const bomb = Math.random() < Math.min(0.22, 0.1 + this.score / 4000);
    const pick = FRUITS[(Math.random() * FRUITS.length) | 0];
    this.fruits.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: this.height + r,
      vx: (Math.random() * 2 - 1) * 2.2,
      vy: -(15 + Math.random() * 4.5),
      r,
      emoji: bomb ? '💣' : pick.emoji,
      color: bomb ? '#ff4d4d' : pick.color,
      bomb,
      spin: 0,
      spinV: (Math.random() * 2 - 1) * 0.08,
    });
  }

  private burst(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 4;
      const life = 16 + Math.random() * 16;
      this.juice.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  private popup(x: number, y: number, text: string, color: string) {
    this.popups.push({ x, y, text, color, life: 46, maxLife: 46 });
  }

  private sliceFruit(f: Fruit) {
    if (f.bomb) {
      this.burst(f.x, f.y, '#ff5d4d', 40);
      this.shake = 22;
      this.popup(f.x, f.y, 'BOOM', '#ff5d4d');
      this.onSfx?.('explosion');
      this.lives = 0;
      this.gameOver = true;
      this.onGameOver?.();
      return;
    }
    this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
    this.comboTimer = COMBO_WINDOW;
    const bonus = this.combo >= 3 ? (this.combo - 2) * 5 : 0;
    const points = 10 + bonus;
    this.score += points;
    this.burst(f.x, f.y, f.color, 16);
    this.popup(
      f.x,
      f.y,
      this.combo >= 3 ? `+${points} x${this.combo}` : `+${points}`,
      this.combo >= 3 ? '#ffd25e' : '#ffffff'
    );
    this.onSfx?.(this.combo >= 3 ? 'powerup' : 'hit');
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    this.frame++;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.comboTimer > 0) this.comboTimer--;
    else this.combo = 0;

    // --- Blade from the finger; slice fruit the segment passes through ---
    if (hand.available) {
      const cur = { x: hand.x * this.width, y: hand.y * this.height };
      this.trail.push({ x: cur.x, y: cur.y, life: TRAIL_LIFE });
      if (this.prevBlade) {
        for (const f of this.fruits) {
          const d = pointSegDist(
            f.x,
            f.y,
            this.prevBlade.x,
            this.prevBlade.y,
            cur.x,
            cur.y
          );
          if (d < f.r) {
            f.spin = NaN; // mark sliced (removed below)
            this.sliceFruit(f);
            if (this.gameOver) break;
          }
        }
      }
      this.prevBlade = cur;
    } else {
      this.prevBlade = null;
    }
    this.fruits = this.fruits.filter((f) => !Number.isNaN(f.spin));
    if (this.gameOver) return;

    // --- Physics ---
    for (const f of this.fruits) {
      f.vy += GRAVITY;
      f.x += f.vx;
      f.y += f.vy;
      f.spin += f.spinV;
    }
    for (const j of this.juice) {
      j.vx *= 0.95;
      j.vy = j.vy * 0.95 + 0.25; // juice falls a little
      j.x += j.vx;
      j.y += j.vy;
      j.life--;
    }
    this.juice = this.juice.filter((j) => j.life > 0);
    for (const p of this.popups) {
      p.y -= 0.6;
      p.life--;
    }
    this.popups = this.popups.filter((p) => p.life > 0);
    for (const t of this.trail) t.life--;
    this.trail = this.trail.filter((t) => t.life > 0);

    // --- Cull off-screen; a fruit that falls past the bottom is a miss ---
    let missed = 0;
    this.fruits = this.fruits.filter((f) => {
      const offBottom = f.vy > 0 && f.y - f.r > this.height;
      const offSide = f.x < -120 || f.x > this.width + 120;
      if (offBottom || offSide) {
        if (offBottom && !f.bomb) missed++;
        return false;
      }
      return true;
    });
    if (missed > 0) {
      this.lives -= missed;
      this.shake = Math.min(16, this.shake + 8);
      this.onSfx?.('hurt');
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.onGameOver?.();
        return;
      }
    }

    // --- Spawning ---
    if (++this.spawnTimer >= this.spawnInterval()) {
      this.spawnTimer = 0;
      const batch = 1 + (Math.random() < this.score / 1200 ? 1 : 0);
      for (let i = 0; i < batch; i++) this.launch();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawFruit(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      lives: Math.max(0, this.lives),
      maxLives: LIVES,
      badges:
        this.combo >= 2
          ? [{ key: 'combo', label: `Combo x${this.combo}`, color: '#ffd25e' }]
          : [],
    };
  }
}
