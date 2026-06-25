import type {
  Player,
  Bullet,
  Enemy,
  Particle,
  HandPosition,
} from '../types';

const PLAYER_W = 44;
const PLAYER_H = 48;
const PLAYER_SMOOTHING = 0.35; // lerp factor toward finger target
const FIRE_COOLDOWN = 9; // frames between shots
const BULLET_SPEED = 11;
const ENEMY_BASE_SPEED = 1.6;
const SPAWN_INTERVAL_START = 75; // frames
const SPAWN_INTERVAL_MIN = 28;

function aabb(a: {
  position: { x: number; y: number };
  width: number;
  height: number;
}, b: {
  position: { x: number; y: number };
  width: number;
  height: number;
}): boolean {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  );
}

/**
 * Holds the entire mutable game state and advances it one frame at a time.
 * Rendering and React read from the public fields; nothing here touches the DOM.
 */
export class GameWorld {
  width: number;
  height: number;

  player!: Player;
  bullets: Bullet[] = [];
  enemies: Enemy[] = [];
  particles: Particle[] = [];

  score = 0;
  lives = 3;
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;
  private frame = 0;

  // Callbacks so the loop can push HUD changes to React (throttled by caller).
  onScore?: (score: number) => void;
  onLives?: (lives: number) => void;
  onGameOver?: () => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.player = {
      id: 0,
      position: { x: this.width / 2 - PLAYER_W / 2, y: this.height - 110 },
      velocity: { x: 0, y: 0 },
      width: PLAYER_W,
      height: PLAYER_H,
      cooldown: 0,
    };
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.frame = 0;
  }

  private spawnInterval(): number {
    // Difficulty ramps with score: spawn faster over time.
    const reduction = Math.floor(this.score / 200) * 4;
    return Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_START - reduction);
  }

  private spawnEnemy() {
    const w = 40 + Math.random() * 16;
    const h = 36;
    const x = Math.random() * (this.width - w);
    const speed = ENEMY_BASE_SPEED + Math.random() * 1.2 + this.score / 800;
    const health = Math.random() < 0.18 ? 3 : 1;
    this.enemies.push({
      id: this.nextId++,
      position: { x, y: -h },
      velocity: { x: 0, y: speed },
      width: w,
      height: h,
      health,
      maxHealth: health,
      hitFlash: 0,
    });
  }

  private fire() {
    const bw = 6;
    const bh = 16;
    this.bullets.push({
      id: this.nextId++,
      position: {
        x: this.player.position.x + this.player.width / 2 - bw / 2,
        y: this.player.position.y - bh,
      },
      velocity: { x: 0, y: -BULLET_SPEED },
      width: bw,
      height: bh,
      damage: 1,
    });
    this.player.cooldown = FIRE_COOLDOWN;
  }

  private emitExplosion(x: number, y: number, color: string, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      const life = 18 + Math.random() * 18;
      this.particles.push({
        position: { x, y },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  /** Advance the simulation one frame. `hand` is normalized (0..1). */
  update(hand: HandPosition) {
    if (this.gameOver) return;
    this.frame++;

    // --- Player movement: lerp toward the finger target (smooths jitter) ---
    if (hand.available) {
      const targetX = hand.x * this.width - this.player.width / 2;
      const targetY = hand.y * this.height - this.player.height / 2;
      this.player.position.x +=
        (targetX - this.player.position.x) * PLAYER_SMOOTHING;
      this.player.position.y +=
        (targetY - this.player.position.y) * PLAYER_SMOOTHING;
      this.player.position.x = clamp(
        this.player.position.x,
        0,
        this.width - this.player.width
      );
      this.player.position.y = clamp(
        this.player.position.y,
        this.height * 0.35,
        this.height - this.player.height
      );
    }

    // --- Auto-fire ---
    if (this.player.cooldown > 0) this.player.cooldown--;
    else this.fire();

    // --- Spawning ---
    if (++this.spawnTimer >= this.spawnInterval()) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // --- Move bullets ---
    for (const b of this.bullets) b.position.y += b.velocity.y;
    this.bullets = this.bullets.filter((b) => b.position.y + b.height > 0);

    // --- Move enemies & particles ---
    for (const e of this.enemies) {
      e.position.y += e.velocity.y;
      if (e.hitFlash > 0) e.hitFlash--;
    }
    for (const p of this.particles) {
      p.position.x += p.velocity.x;
      p.position.y += p.velocity.y;
      p.velocity.x *= 0.94;
      p.velocity.y *= 0.94;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // --- Bullet vs enemy collisions ---
    const deadEnemies = new Set<number>();
    const usedBullets = new Set<number>();
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (deadEnemies.has(e.id)) continue;
        if (aabb(b, e)) {
          usedBullets.add(b.id);
          e.health -= b.damage;
          e.hitFlash = 4;
          if (e.health <= 0) {
            deadEnemies.add(e.id);
            this.score += 10 * e.maxHealth;
            this.emitExplosion(
              e.position.x + e.width / 2,
              e.position.y + e.height / 2,
              '#ff8a3d'
            );
          }
          break;
        }
      }
    }
    if (usedBullets.size) {
      this.bullets = this.bullets.filter((b) => !usedBullets.has(b.id));
    }

    // --- Enemy reaches player or bottom ---
    let livesLost = 0;
    for (const e of this.enemies) {
      if (deadEnemies.has(e.id)) continue;
      if (aabb(e, this.player)) {
        deadEnemies.add(e.id);
        livesLost++;
        this.emitExplosion(
          this.player.position.x + this.player.width / 2,
          this.player.position.y + this.player.height / 2,
          '#4dd2ff'
        );
      } else if (e.position.y > this.height) {
        deadEnemies.add(e.id);
        livesLost++; // a missed enemy costs a life
      }
    }
    if (deadEnemies.size) {
      this.enemies = this.enemies.filter((e) => !deadEnemies.has(e.id));
    }

    if (livesLost > 0) {
      this.lives -= livesLost;
      this.onLives?.(Math.max(0, this.lives));
      if (this.lives <= 0) {
        this.gameOver = true;
        this.onGameOver?.();
      }
    }

    this.onScore?.(this.score);
  }
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
