import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import { type Particle, clamp, dist, burst, stepParticles } from './fx';
import { drawHeadSteer } from './headSteerRenderer';

const PLAYER_R = 18;
const SMOOTH = 0.42;
const LIVES = 5;

export interface Star {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
}

/**
 * Tilt your head left/right to steer and collect stars. Uses FaceLandmarker via
 * HandPosition.headSteer (falls back to finger x if available).
 */
export class HeadSteerWorld implements GameInstance {
  width: number;
  height: number;

  player = { x: 0, y: 0, r: PLAYER_R };
  stars: Star[] = [];
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
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.player = { x: this.width / 2, y: this.height * 0.72, r: PLAYER_R };
    this.stars = [];
    this.particles = [];
    this.score = 0;
    this.lives = LIVES;
    this.invuln = 0;
    this.shake = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.frame = 0;
    this.onSpeak?.('Tilt your head left and right to fly and catch the stars!');
  }

  private steerX(hand: HandPosition): number {
    if (hand.headSteer?.available) return hand.headSteer.x;
    if (hand.available) return hand.x;
    return 0.5;
  }

  private spawn() {
    const r = 14 + Math.random() * 8;
    this.stars.push({
      id: this.nextId++,
      x: r + Math.random() * (this.width - 2 * r),
      y: -r,
      vy: 2.2 + Math.random() * 1.5,
      r,
    });
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    this.frame++;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.invuln > 0) this.invuln--;

    const targetX = this.steerX(hand) * this.width;
    this.player.x += (targetX - this.player.x) * SMOOTH;
    this.player.x = clamp(this.player.x, this.player.r, this.width - this.player.r);

    if (++this.spawnTimer >= 38) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const s of this.stars) s.y += s.vy;

    const caught = new Set<number>();
    for (const s of this.stars) {
      if (dist(s.x, s.y, this.player.x, this.player.y) < s.r + this.player.r) {
        caught.add(s.id);
        this.score += 10;
        burst(this.particles, s.x, s.y, '#ffd25e', 12);
        this.onSfx?.('powerup');
      }
    }
    this.stars = this.stars.filter((s) => !caught.has(s.id) && s.y - s.r < this.height + 20);

    if (this.score >= 200 + this.frame / 30) {
      this.gameOver = true;
      this.onSfx?.('level');
      this.onSpeak?.('Great flying! Well done!');
      this.onGameOver?.();
    }

    this.particles = stepParticles(this.particles);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawHeadSteer(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      lives: this.lives,
      maxLives: LIVES,
      prompt: '⭐',
      badges: [{ key: 'steer', label: '↔ head', color: '#5cd2ff' }],
    };
  }
}
