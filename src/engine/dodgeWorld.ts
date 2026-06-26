import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import { type Particle, clamp, dist, burst, stepParticles } from './fx';
import { drawDodge } from './dodgeRenderer';

const PLAYER_R = 16;
const SMOOTH = 0.45;
const LIVES = 3;
const INVULN = 70; // frames of mercy after a hit

export interface Rock {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  spin: number;
  spinV: number;
}

export class DodgeWorld implements GameInstance {
  width: number;
  height: number;

  player = { x: 0, y: 0, r: PLAYER_R };
  rocks: Rock[] = [];
  particles: Particle[] = [];
  score = 0;
  lives = LIVES;
  invuln = 0;
  shake = 0;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;
  private frame = 0;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.player = { x: this.width / 2, y: this.height * 0.7, r: PLAYER_R };
    this.rocks = [];
    this.particles = [];
    this.score = 0;
    this.lives = LIVES;
    this.invuln = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.frame = 0;
  }

  private difficulty() {
    return this.frame / 3600; // ramps over the first minute
  }

  private spawnInterval() {
    return Math.max(14, 34 - this.difficulty() * 14);
  }

  private spawn() {
    const r = 16 + Math.random() * 18;
    this.rocks.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: -r,
      vy: 3 + Math.random() * 2 + this.difficulty() * 3,
      r,
      spin: 0,
      spinV: (Math.random() * 2 - 1) * 0.1,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    this.frame++;
    this.score += 1; // distance survived
    if (this.shake > 0) this.shake *= 0.85;
    if (this.invuln > 0) this.invuln--;

    if (hand.available) {
      const tx = hand.x * this.width;
      const ty = hand.y * this.height;
      this.player.x += (tx - this.player.x) * SMOOTH;
      this.player.y += (ty - this.player.y) * SMOOTH;
    }
    this.player.x = clamp(this.player.x, this.player.r, this.width - this.player.r);
    this.player.y = clamp(this.player.y, this.player.r, this.height - this.player.r);

    if (++this.spawnTimer >= this.spawnInterval()) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const rk of this.rocks) {
      rk.y += rk.vy;
      rk.spin += rk.spinV;
    }
    this.rocks = this.rocks.filter((rk) => rk.y - rk.r < this.height);

    if (this.invuln <= 0) {
      for (const rk of this.rocks) {
        if (dist(rk.x, rk.y, this.player.x, this.player.y) < rk.r + this.player.r * 0.7) {
          this.lives -= 1;
          this.invuln = INVULN;
          this.shake = 18;
          burst(this.particles, this.player.x, this.player.y, '#ff5d7a', 20);
          this.onSfx?.('hurt');
          if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver = true;
            this.onGameOver?.();
          }
          break;
        }
      }
    }

    this.particles = stepParticles(this.particles);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawDodge(ctx, this);
  }

  hud(): HudState {
    return { score: this.score, lives: Math.max(0, this.lives), maxLives: LIVES };
  }
}
