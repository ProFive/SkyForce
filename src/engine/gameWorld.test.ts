import { describe, it, expect } from 'vitest';
import { GameWorld } from './gameWorld';
import type { Enemy, PowerUp, HandPosition } from '../types';

const W = 480;
const H = 720;
const NO_HAND: HandPosition = { x: 0, y: 0, confidence: 0, available: false };

function makeEnemy(over: Partial<Enemy> = {}): Enemy {
  return {
    id: 999,
    position: { x: 200, y: 300 },
    velocity: { x: 0, y: 0 },
    width: 40,
    height: 34,
    health: 1,
    maxHealth: 1,
    hitFlash: 0,
    isBoss: false,
    fireTimer: 0,
    telegraph: false,
    ...over,
  };
}

/** A world with a frozen, empty wave so tests control every entity. */
function quietWorld(): GameWorld {
  const w = new GameWorld(W, H);
  w.enemies.length = 0;
  w.bullets.length = 0;
  w.player.cooldown = 10_000; // suppress auto-fire so it doesn't add bullets
  // @ts-expect-error private — drained so no spawns interfere
  w.pendingSpawns = 0;
  return w;
}

describe('GameWorld initial state', () => {
  it('starts at level 1 with 3 lives and not game over', () => {
    const w = new GameWorld(W, H);
    expect(w.level).toBe(1);
    expect(w.lives).toBe(3);
    expect(w.gameOver).toBe(false);
    expect(w.player.position.y).toBeGreaterThan(0);
  });
});

describe('combat', () => {
  it('a bullet destroys an enemy and awards score', () => {
    const w = quietWorld();
    w.enemies.push(makeEnemy({ position: { x: 200, y: 300 } }));
    w.bullets.push({
      id: 1,
      position: { x: 210, y: 300 },
      velocity: { x: 0, y: 0 },
      width: 6,
      height: 16,
      damage: 1,
    });
    const before = w.score;
    w.update(NO_HAND);
    expect(w.enemies).toHaveLength(0);
    expect(w.score).toBe(before + 10);
  });

  it('an enemy escaping the bottom costs a life', () => {
    const w = quietWorld();
    w.enemies.push(
      makeEnemy({ position: { x: 0, y: H - 1 }, velocity: { x: 0, y: 6 } })
    );
    w.update(NO_HAND);
    expect(w.lives).toBe(2);
    expect(w.enemies).toHaveLength(0);
  });

  it('a shield absorbs a collision without losing a life', () => {
    const w = quietWorld();
    w.player.shieldTimer = 100;
    w.enemies.push(makeEnemy({ position: { ...w.player.position } }));
    const before = w.lives;
    w.update(NO_HAND);
    expect(w.lives).toBe(before);
    expect(w.enemies).toHaveLength(0);
  });

  it('reaching 0 lives ends the game', () => {
    const w = quietWorld();
    w.lives = 1;
    w.enemies.push(
      makeEnemy({ position: { x: 0, y: H - 1 }, velocity: { x: 0, y: 6 } })
    );
    w.update(NO_HAND);
    expect(w.lives).toBe(0);
    expect(w.gameOver).toBe(true);
  });
});

describe('power-ups', () => {
  function pushPowerUp(w: GameWorld, type: PowerUp['type']) {
    w.powerUps.push({
      id: 1,
      position: { ...w.player.position },
      velocity: { x: 0, y: 0 },
      width: 26,
      height: 26,
      type,
    });
  }

  it('a life power-up adds a life, capped at 5', () => {
    const w = quietWorld();
    w.lives = 5;
    pushPowerUp(w, 'life');
    w.update(NO_HAND);
    expect(w.lives).toBe(5);

    w.lives = 2;
    pushPowerUp(w, 'life');
    w.update(NO_HAND);
    expect(w.lives).toBe(3);
  });

  it('a spread power-up switches the weapon to spread', () => {
    const w = quietWorld();
    pushPowerUp(w, 'spread');
    w.update(NO_HAND);
    expect(w.player.spreadTimer).toBeGreaterThan(0);
    w.update(NO_HAND);
    expect(w.player.weapon).toBe('spread');
  });
});

describe('waves and bosses', () => {
  it('advances to the next level when the wave is cleared', () => {
    const w = quietWorld();
    const before = w.level;
    w.update(NO_HAND); // empty wave -> level complete
    expect(w.level).toBe(before + 1);
  });

  it('a boss telegraphs before firing and then shoots', () => {
    const w = new GameWorld(W, H);
    w.enemies.length = 0;
    // @ts-expect-error private spawn helper
    w.pendingSpawns = 0;
    // @ts-expect-error private spawn helper
    w.spawnBoss();
    const boss = w.enemies.find((e) => e.isBoss)!;
    boss.position.y = 90;
    boss.fireTimer = 4;
    w.player.shieldTimer = 1e6;
    w.lives = 99;

    let telegraphed = false;
    let fired = false;
    for (let i = 0; i < 60; i++) {
      w.update(NO_HAND);
      if (boss.telegraph) telegraphed = true;
      if (w.enemyBullets.length > 0) fired = true;
    }
    expect(telegraphed).toBe(true);
    expect(fired).toBe(true);
  });
});
