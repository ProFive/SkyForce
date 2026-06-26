import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import { type Particle, clamp, burst, stepParticles } from './fx';
import { drawBrick } from './brickRenderer';

const PADDLE_W = 110;
const PADDLE_H = 16;
const BALL_R = 8;
const BASE_SPEED = 6;
const SMOOTH = 0.5;
const LIVES = 3;

const COLS = 7;
const ROWS = 5;
const BRICK_GAP = 6;
const TOP_OFFSET = 70;
const ROW_COLORS = ['#ff5d7a', '#ffa53d', '#ffe45e', '#7dff9b', '#5cd2ff'];

export interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  color: string;
  alive: boolean;
}

export class BrickWorld implements GameInstance {
  width: number;
  height: number;

  paddle = { x: 0, y: 0, w: PADDLE_W, h: PADDLE_H };
  ball = { x: 0, y: 0, vx: 0, vy: 0, r: BALL_R };
  bricks: Brick[] = [];
  particles: Particle[] = [];
  score = 0;
  lives = LIVES;
  level = 1;
  shake = 0;
  gameOver = false;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = LIVES;
    this.level = 1;
    this.shake = 0;
    this.gameOver = false;
    this.particles = [];
    this.paddle = {
      x: this.width / 2,
      y: this.height - 70,
      w: PADDLE_W,
      h: PADDLE_H,
    };
    this.buildBricks();
    this.resetBall();
  }

  private buildBricks() {
    this.bricks = [];
    const totalGap = BRICK_GAP * (COLS + 1);
    const bw = (this.width - totalGap) / COLS;
    const bh = 22;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.bricks.push({
          x: BRICK_GAP + c * (bw + BRICK_GAP),
          y: TOP_OFFSET + r * (bh + BRICK_GAP),
          w: bw,
          h: bh,
          hp: 1,
          color: ROW_COLORS[r % ROW_COLORS.length],
          alive: true,
        });
      }
    }
  }

  private resetBall() {
    const speed = BASE_SPEED + (this.level - 1) * 0.6;
    this.ball = {
      x: this.paddle.x,
      y: this.paddle.y - 24,
      vx: (Math.random() < 0.5 ? -1 : 1) * speed * 0.5,
      vy: -speed,
      r: BALL_R,
    };
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    if (hand.available) {
      const tx = hand.x * this.width;
      this.paddle.x += (tx - this.paddle.x) * SMOOTH;
    }
    this.paddle.x = clamp(this.paddle.x, this.paddle.w / 2, this.width - this.paddle.w / 2);

    const b = this.ball;
    b.x += b.vx;
    b.y += b.vy;

    // Walls.
    if (b.x - b.r < 0) {
      b.x = b.r;
      b.vx = Math.abs(b.vx);
    } else if (b.x + b.r > this.width) {
      b.x = this.width - b.r;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y - b.r < 0) {
      b.y = b.r;
      b.vy = Math.abs(b.vy);
    }

    // Paddle.
    const p = this.paddle;
    if (
      b.vy > 0 &&
      b.y + b.r >= p.y - p.h / 2 &&
      b.y - b.r <= p.y + p.h / 2 &&
      Math.abs(b.x - p.x) <= p.w / 2 + b.r
    ) {
      const speed = Math.hypot(b.vx, b.vy);
      const offset = clamp((b.x - p.x) / (p.w / 2), -1, 1);
      const angle = offset * (Math.PI / 3); // up to 60° off vertical
      b.vx = speed * Math.sin(angle);
      b.vy = -Math.abs(speed * Math.cos(angle));
      b.y = p.y - p.h / 2 - b.r;
      this.onSfx?.('hit');
    }

    // Bricks (resolve one hit per frame).
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (
        b.x + b.r > brick.x &&
        b.x - b.r < brick.x + brick.w &&
        b.y + b.r > brick.y &&
        b.y - b.r < brick.y + brick.h
      ) {
        const cx = brick.x + brick.w / 2;
        const cy = brick.y + brick.h / 2;
        const dx = (b.x - cx) / brick.w;
        const dy = (b.y - cy) / brick.h;
        if (Math.abs(dx) > Math.abs(dy)) b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
        else b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
        brick.hp -= 1;
        if (brick.hp <= 0) {
          brick.alive = false;
          this.score += 10;
          burst(this.particles, cx, cy, brick.color, 12);
        }
        this.onSfx?.('hit');
        break;
      }
    }

    this.particles = stepParticles(this.particles);

    // Ball lost.
    if (b.y - b.r > this.height) {
      this.lives -= 1;
      this.shake = Math.min(18, this.shake + 12);
      this.onSfx?.('hurt');
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.onGameOver?.();
      } else {
        this.resetBall();
      }
    }

    // Level cleared.
    if (this.bricks.every((br) => !br.alive)) {
      this.level += 1;
      this.score += 50;
      this.onSfx?.('level');
      this.buildBricks();
      this.resetBall();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawBrick(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      lives: Math.max(0, this.lives),
      maxLives: LIVES,
      level: this.level,
    };
  }
}
