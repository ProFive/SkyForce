import type {
  Player,
  Bullet,
  Enemy,
  Particle,
  PowerUp,
  PowerUpType,
  ScorePopup,
  HandPosition,
  SfxName,
} from '../types';

const PLAYER_W = 44;
const PLAYER_H = 48;
const PLAYER_SMOOTHING = 0.35; // lerp factor toward finger target
const FIRE_COOLDOWN = 9; // frames between shots
const FIRE_COOLDOWN_RAPID = 4;
const BULLET_SPEED = 11;
const ENEMY_BASE_SPEED = 1.5;
const SPAWN_INTERVAL = 46; // frames between enemies within a wave
const MAX_LIVES = 5;
const BOSS_EVERY = 5; // boss appears on every Nth level

const POWERUP_DURATIONS: Record<PowerUpType, number> = {
  rapid: 8 * 60,
  spread: 10 * 60,
  shield: 6 * 60,
  life: 0,
};

function aabb(
  a: { position: { x: number; y: number }; width: number; height: number },
  b: { position: { x: number; y: number }; width: number; height: number }
): boolean {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  );
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
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
  enemyBullets: Bullet[] = [];
  enemies: Enemy[] = [];
  powerUps: PowerUp[] = [];
  particles: Particle[] = [];
  popups: ScorePopup[] = [];

  score = 0;
  lives = 3;
  level = 1;
  shake = 0; // screen-shake magnitude, decays each frame
  bannerTimer = 0; // frames a "LEVEL n" banner stays visible
  gameOver = false;

  private nextId = 1;
  private spawnTimer = 0;
  private pendingSpawns = 0;
  private frame = 0;

  // Callbacks so the loop can push HUD/audio changes out (throttled by caller).
  onScore?: (score: number) => void;
  onLives?: (lives: number) => void;
  onLevel?: (level: number) => void;
  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;

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
      weapon: 'single',
      rapidTimer: 0,
      spreadTimer: 0,
      shieldTimer: 0,
    };
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.popups = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.shake = 0;
    this.bannerTimer = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.frame = 0;
    this.startLevel();
  }

  // ---------- waves / levels ----------

  private get bossAlive(): boolean {
    return this.enemies.some((e) => e.isBoss);
  }

  private startLevel() {
    this.bannerTimer = 110;
    this.onLevel?.(this.level);
    if (this.level % BOSS_EVERY === 0) {
      this.spawnBoss();
      this.pendingSpawns = 0;
      this.onSfx?.('boss');
    } else {
      this.pendingSpawns = 6 + this.level * 2;
      this.onSfx?.('level');
    }
  }

  private advanceLevel() {
    this.level++;
    this.startLevel();
  }

  // ---------- spawning ----------

  private spawnEnemy() {
    const w = 38 + Math.random() * 18;
    const h = 34;
    const x = Math.random() * (this.width - w);
    const speed = ENEMY_BASE_SPEED + this.level * 0.15 + Math.random() * 1.1;
    const tanky = Math.random() < 0.16 + this.level * 0.01;
    const health = tanky ? 3 : 1;
    this.enemies.push({
      id: this.nextId++,
      position: { x, y: -h },
      velocity: { x: 0, y: speed },
      width: w,
      height: h,
      health,
      maxHealth: health,
      hitFlash: 0,
      isBoss: false,
      fireTimer: 0,
    });
  }

  private spawnBoss() {
    const w = 150;
    const h = 90;
    const health = 60 + this.level * 12;
    this.enemies.push({
      id: this.nextId++,
      position: { x: this.width / 2 - w / 2, y: -h },
      velocity: { x: 1.4, y: 0.28 },
      width: w,
      height: h,
      health,
      maxHealth: health,
      hitFlash: 0,
      isBoss: true,
      fireTimer: 90,
    });
  }

  private bossFire(boss: Enemy) {
    const cx = boss.position.x + boss.width / 2;
    const cy = boss.position.y + boss.height;
    const px = this.player.position.x + this.player.width / 2;
    const py = this.player.position.y + this.player.height / 2;
    // Aim at the player, then fan out a spread that widens with level.
    const aim = Math.atan2(py - cy, px - cx);
    const speed = 4 + this.level * 0.12;
    const shots = 3 + Math.floor(this.level / BOSS_EVERY); // more shots deeper in
    const spread = 0.5; // radians, total fan
    for (let i = 0; i < shots; i++) {
      const t = shots === 1 ? 0 : i / (shots - 1) - 0.5;
      const angle = aim + t * spread;
      this.enemyBullets.push({
        id: this.nextId++,
        position: { x: cx - 5, y: cy },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        width: 10,
        height: 10,
        damage: 1,
      });
    }
    this.onSfx?.('hit');
  }

  private dropPowerUp(x: number, y: number, guaranteed = false) {
    if (!guaranteed && Math.random() > 0.16) return;
    const roll = Math.random();
    const type: PowerUpType =
      roll < 0.34 ? 'spread' : roll < 0.66 ? 'rapid' : roll < 0.86 ? 'shield' : 'life';
    this.powerUps.push({
      id: this.nextId++,
      position: { x: x - 13, y: y - 13 },
      velocity: { x: 0, y: 2 },
      width: 26,
      height: 26,
      type,
    });
  }

  // ---------- firing ----------

  private fire() {
    const p = this.player;
    const bw = 6;
    const bh = 16;
    const baseX = p.position.x + p.width / 2 - bw / 2;
    const topY = p.position.y - bh;

    const make = (vx: number) =>
      this.bullets.push({
        id: this.nextId++,
        position: { x: baseX, y: topY },
        velocity: { x: vx, y: -BULLET_SPEED },
        width: bw,
        height: bh,
        damage: 1,
      });

    if (p.spreadTimer > 0) {
      make(-3.2);
      make(0);
      make(3.2);
    } else {
      make(0);
    }
    p.cooldown = p.rapidTimer > 0 ? FIRE_COOLDOWN_RAPID : FIRE_COOLDOWN;
    this.onSfx?.('shoot');
  }

  // ---------- effects ----------

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

  private popup(x: number, y: number, text: string, color: string) {
    this.popups.push({
      position: { x, y },
      text,
      color,
      life: 50,
      maxLife: 50,
    });
  }

  private collectPowerUp(pu: PowerUp) {
    const p = this.player;
    let label = '';
    switch (pu.type) {
      case 'rapid':
        p.rapidTimer = POWERUP_DURATIONS.rapid;
        label = 'RAPID';
        break;
      case 'spread':
        p.spreadTimer = POWERUP_DURATIONS.spread;
        label = 'SPREAD';
        break;
      case 'shield':
        p.shieldTimer = POWERUP_DURATIONS.shield;
        label = 'SHIELD';
        break;
      case 'life':
        if (this.lives < MAX_LIVES) {
          this.lives++;
          this.onLives?.(this.lives);
        }
        label = '+1 LIFE';
        break;
    }
    this.popup(p.position.x + p.width / 2, p.position.y, label, '#7dff9b');
    this.onSfx?.('powerup');
  }

  // ---------- main step ----------

  /** Advance the simulation one frame. `hand` is normalized (0..1). */
  update(hand: HandPosition) {
    if (this.gameOver) return;
    this.frame++;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.bannerTimer > 0) this.bannerTimer--;

    const p = this.player;
    if (p.rapidTimer > 0) p.rapidTimer--;
    if (p.spreadTimer > 0) p.spreadTimer--;
    if (p.shieldTimer > 0) p.shieldTimer--;
    p.weapon = p.spreadTimer > 0 ? 'spread' : 'single';

    // --- Player movement: lerp toward the finger target (smooths jitter) ---
    if (hand.available) {
      const targetX = hand.x * this.width - p.width / 2;
      const targetY = hand.y * this.height - p.height / 2;
      p.position.x += (targetX - p.position.x) * PLAYER_SMOOTHING;
      p.position.y += (targetY - p.position.y) * PLAYER_SMOOTHING;
      p.position.x = clamp(p.position.x, 0, this.width - p.width);
      p.position.y = clamp(
        p.position.y,
        this.height * 0.35,
        this.height - p.height
      );
    }

    // --- Auto-fire ---
    if (p.cooldown > 0) p.cooldown--;
    else this.fire();

    // --- Wave spawning ---
    if (this.pendingSpawns > 0) {
      if (++this.spawnTimer >= SPAWN_INTERVAL) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        this.pendingSpawns--;
      }
    }

    // --- Move bullets ---
    for (const b of this.bullets) {
      b.position.y += b.velocity.y;
      b.position.x += b.velocity.x;
    }
    this.bullets = this.bullets.filter(
      (b) => b.position.y + b.height > 0 && b.position.x > -20 && b.position.x < this.width + 20
    );

    // --- Move enemies (bosses bounce horizontally) ---
    for (const e of this.enemies) {
      e.position.y += e.velocity.y;
      if (e.isBoss) {
        e.position.x += e.velocity.x;
        if (e.position.x <= 0 || e.position.x + e.width >= this.width) {
          e.velocity.x *= -1;
          e.position.x = clamp(e.position.x, 0, this.width - e.width);
        }
        // Bosses hover in the upper area rather than diving past the player.
        if (e.position.y > this.height * 0.22) e.position.y = this.height * 0.22;
        // Fire once fully on screen.
        if (e.position.y >= 0) {
          if (e.fireTimer > 0) e.fireTimer--;
          else {
            this.bossFire(e);
            e.fireTimer = Math.max(38, 78 - this.level * 2);
          }
        }
      }
      if (e.hitFlash > 0) e.hitFlash--;
    }

    // --- Move enemy bullets ---
    for (const eb of this.enemyBullets) {
      eb.position.x += eb.velocity.x;
      eb.position.y += eb.velocity.y;
    }
    this.enemyBullets = this.enemyBullets.filter(
      (eb) =>
        eb.position.y < this.height + 20 &&
        eb.position.y + eb.height > -20 &&
        eb.position.x > -20 &&
        eb.position.x < this.width + 20
    );

    // --- Move power-ups & particles & popups ---
    for (const pu of this.powerUps) pu.position.y += pu.velocity.y;
    this.powerUps = this.powerUps.filter((pu) => pu.position.y < this.height);
    for (const pt of this.particles) {
      pt.position.x += pt.velocity.x;
      pt.position.y += pt.velocity.y;
      pt.velocity.x *= 0.94;
      pt.velocity.y *= 0.94;
      pt.life--;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
    for (const pop of this.popups) {
      pop.position.y -= 0.7;
      pop.life--;
    }
    this.popups = this.popups.filter((pop) => pop.life > 0);

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
            const reward = e.isBoss ? 500 : 10 * e.maxHealth;
            this.score += reward;
            this.emitExplosion(
              e.position.x + e.width / 2,
              e.position.y + e.height / 2,
              e.isBoss ? '#ffd25e' : '#ff8a3d',
              e.isBoss ? 60 : 14
            );
            this.popup(
              e.position.x + e.width / 2,
              e.position.y,
              `+${reward}`,
              '#ffe45e'
            );
            this.shake = Math.min(18, this.shake + (e.isBoss ? 16 : 4));
            this.onSfx?.('explosion');
            this.dropPowerUp(
              e.position.x + e.width / 2,
              e.position.y + e.height / 2,
              e.isBoss
            );
          } else {
            this.onSfx?.('hit');
          }
          break;
        }
      }
    }
    if (usedBullets.size) {
      this.bullets = this.bullets.filter((b) => !usedBullets.has(b.id));
    }

    // --- Player collects power-ups ---
    this.powerUps = this.powerUps.filter((pu) => {
      if (aabb(pu, p)) {
        this.collectPowerUp(pu);
        return false;
      }
      return true;
    });

    // --- Enemy reaches player or escapes ---
    let livesLost = 0;
    const shielded = p.shieldTimer > 0;

    // Boss bullets hitting the player.
    this.enemyBullets = this.enemyBullets.filter((eb) => {
      if (!aabb(eb, p)) return true;
      this.emitExplosion(
        eb.position.x + eb.width / 2,
        eb.position.y + eb.height / 2,
        shielded ? '#5cd2ff' : '#ff5d7a',
        8
      );
      if (!shielded) livesLost++;
      return false;
    });

    for (const e of this.enemies) {
      if (deadEnemies.has(e.id)) continue;
      if (!e.isBoss && aabb(e, p)) {
        deadEnemies.add(e.id);
        this.emitExplosion(
          e.position.x + e.width / 2,
          e.position.y + e.height / 2,
          shielded ? '#4dd2ff' : '#ff5d7a'
        );
        if (!shielded) livesLost++;
      } else if (!e.isBoss && e.position.y > this.height) {
        deadEnemies.add(e.id);
        livesLost++; // a missed enemy costs a life
      }
    }
    if (deadEnemies.size) {
      this.enemies = this.enemies.filter((e) => !deadEnemies.has(e.id));
    }

    if (livesLost > 0) {
      this.lives -= livesLost;
      this.shake = Math.min(20, this.shake + 12);
      this.onSfx?.('hurt');
      this.onLives?.(Math.max(0, this.lives));
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.onGameOver?.();
      }
    }

    // --- Level complete? ---
    if (
      !this.gameOver &&
      this.pendingSpawns === 0 &&
      this.enemies.length === 0 &&
      !this.bossAlive
    ) {
      this.advanceLevel();
    }

    this.onScore?.(this.score);
  }
}
