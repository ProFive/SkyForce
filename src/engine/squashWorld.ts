import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import { type Particle, type Popup, dist, burst, popup, stepParticles, stepPopups } from './fx';
import { drawSquash } from './squashRenderer';

const LIVES = 5;

export interface Target {
  id: number;
  x: number;
  y: number;
  r: number;
  bomb: boolean;
  life: number;
  maxLife: number;
}

export class SquashWorld implements GameInstance {
  width: number;
  height: number;

  targets: Target[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  score = 0;
  lives = LIVES;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.targets = [];
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.score = 0;
    this.lives = LIVES;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 20;
  }

  private spawnInterval() {
    return Math.max(26, 64 - Math.floor(this.score / 40) * 3);
  }

  private lifetime() {
    return Math.max(48, 96 - Math.floor(this.score / 40) * 4);
  }

  private spawn() {
    const r = 30;
    const m = r + 16;
    const life = this.lifetime();
    this.targets.push({
      id: this.nextId++,
      x: m + Math.random() * (this.width - 2 * m),
      y: m + 20 + Math.random() * (this.height - 2 * m - 40),
      r,
      bomb: Math.random() < 0.18,
      life,
      maxLife: life,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    if (++this.spawnTimer >= this.spawnInterval()) {
      this.spawnTimer = 0;
      this.spawn();
    }

    let lostLife = 0;
    const hit = new Set<number>();

    // Finger contact squashes targets.
    if (hand.available) {
      for (const t of this.targets) {
        if (dist(this.finger.x, this.finger.y, t.x, t.y) < t.r) {
          hit.add(t.id);
          if (t.bomb) {
            lostLife++;
            burst(this.particles, t.x, t.y, '#ff5d4d', 26);
            popup(this.popups, t.x, t.y, 'BOOM', '#ff5d4d');
            this.shake = Math.min(20, this.shake + 14);
            this.onSfx?.('explosion');
          } else {
            this.score += 10;
            burst(this.particles, t.x, t.y, '#7dff9b', 14);
            popup(this.popups, t.x, t.y, '+10', '#7dff9b');
            this.onSfx?.('hit');
          }
        }
      }
    }

    // Age targets; a bug that times out unsquashed is a miss.
    for (const t of this.targets) t.life--;
    this.targets = this.targets.filter((t) => {
      if (hit.has(t.id)) return false;
      if (t.life <= 0) {
        if (!t.bomb) lostLife++;
        return false;
      }
      return true;
    });

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);

    if (lostLife > 0) {
      this.lives -= lostLife;
      this.onSfx?.('hurt');
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.onGameOver?.();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawSquash(ctx, this);
  }

  hud(): HudState {
    return { score: this.score, lives: Math.max(0, this.lives), maxLives: LIVES };
  }
}
