import type { GameWorld } from './gameWorld';
import type { PowerUpType } from '../types';

// Persistent starfield — generated once, scrolls with the frame counter.
interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

let stars: Star[] = [];
let starsW = 0;
let starsH = 0;

function ensureStars(width: number, height: number) {
  if (stars.length && starsW === width && starsH === height) return;
  starsW = width;
  starsH = height;
  stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.4 + Math.random() * 1.6,
    size: Math.random() < 0.85 ? 1 : 2,
  }));
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#05060f');
  grad.addColorStop(0.6, '#0a0f24');
  grad.addColorStop(1, '#10183a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ensureStars(w, h);
  ctx.fillStyle = '#9fb4ff';
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > h) {
      s.y = 0;
      s.x = Math.random() * w;
    }
    ctx.globalAlpha = s.size === 2 ? 0.9 : 0.55;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: GameWorld) {
  const p = world.player;
  const cx = p.position.x + p.width / 2;
  const top = p.position.y;
  const bottom = p.position.y + p.height;

  // Thruster glow.
  ctx.save();
  const flame = 6 + Math.random() * 8;
  const fg = ctx.createLinearGradient(0, bottom, 0, bottom + flame);
  fg.addColorStop(0, 'rgba(120,220,255,0.9)');
  fg.addColorStop(1, 'rgba(120,220,255,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(cx - 6, bottom - 4);
  ctx.lineTo(cx + 6, bottom - 4);
  ctx.lineTo(cx, bottom + flame);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ship body.
  ctx.save();
  ctx.shadowColor = '#3affd0';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#3affd0';
  ctx.beginPath();
  ctx.moveTo(cx, top); // nose
  ctx.lineTo(p.position.x, bottom); // left wing
  ctx.lineTo(cx - p.width * 0.18, bottom - 8);
  ctx.lineTo(cx + p.width * 0.18, bottom - 8);
  ctx.lineTo(p.position.x + p.width, bottom); // right wing
  ctx.closePath();
  ctx.fill();

  // Cockpit.
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0a3b33';
  ctx.beginPath();
  ctx.ellipse(cx, top + p.height * 0.45, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shield ring.
  if (p.shieldTimer > 0) {
    const blink = p.shieldTimer < 90 && Math.floor(p.shieldTimer / 6) % 2 === 0;
    ctx.save();
    ctx.globalAlpha = blink ? 0.25 : 0.6;
    ctx.strokeStyle = '#5cd2ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, top + p.height / 2, p.width * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBullets(ctx: CanvasRenderingContext2D, world: GameWorld) {
  ctx.save();
  ctx.shadowColor = '#fff3a0';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffe45e';
  for (const b of world.bullets) {
    ctx.fillRect(b.position.x, b.position.y, b.width, b.height);
  }
  ctx.restore();
}

function drawEnemyBullets(ctx: CanvasRenderingContext2D, world: GameWorld) {
  ctx.save();
  ctx.shadowColor = '#ff4fa0';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ff77c0';
  for (const b of world.enemyBullets) {
    ctx.beginPath();
    ctx.arc(
      b.position.x + b.width / 2,
      b.position.y + b.height / 2,
      b.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();
}

function drawEnemies(ctx: CanvasRenderingContext2D, world: GameWorld) {
  for (const e of world.enemies) {
    if (e.isBoss) {
      drawBoss(ctx, world, e);
      continue;
    }
    const cx = e.position.x + e.width / 2;
    const top = e.position.y;
    const bottom = e.position.y + e.height;
    const flashing = e.hitFlash > 0;

    ctx.save();
    ctx.shadowColor = flashing ? '#ffffff' : '#ff5d5d';
    ctx.shadowBlur = 12;
    ctx.fillStyle = flashing
      ? '#ffffff'
      : e.maxHealth > 1
        ? '#ff3d6e'
        : '#ff5d5d';
    ctx.beginPath();
    ctx.moveTo(cx, bottom);
    ctx.lineTo(e.position.x, top);
    ctx.lineTo(cx - e.width * 0.18, top + 8);
    ctx.lineTo(cx + e.width * 0.18, top + 8);
    ctx.lineTo(e.position.x + e.width, top);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (e.maxHealth > 1) {
      ctx.fillStyle = '#0a0f24';
      ctx.fillRect(e.position.x, top - 6, e.width, 3);
      ctx.fillStyle = '#7dff9b';
      ctx.fillRect(
        e.position.x,
        top - 6,
        (e.width * Math.max(0, e.health)) / e.maxHealth,
        3
      );
    }
  }
}

function drawBoss(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  e: GameWorld['enemies'][number]
) {
  const cx = e.position.x + e.width / 2;
  const top = e.position.y;
  const bottom = e.position.y + e.height;
  const flashing = e.hitFlash > 0;

  ctx.save();
  ctx.shadowColor = flashing ? '#ffffff' : '#ff2d6e';
  ctx.shadowBlur = 24;
  ctx.fillStyle = flashing ? '#ffffff' : '#c81e5b';
  ctx.beginPath();
  ctx.moveTo(cx, bottom);
  ctx.lineTo(e.position.x, top + e.height * 0.4);
  ctx.lineTo(e.position.x + e.width * 0.2, top);
  ctx.lineTo(e.position.x + e.width * 0.8, top);
  ctx.lineTo(e.position.x + e.width, top + e.height * 0.4);
  ctx.closePath();
  ctx.fill();

  // Core eye.
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#ffd25e';
  ctx.fillStyle = '#ffd25e';
  ctx.beginPath();
  ctx.arc(cx, top + e.height * 0.45, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Full-width boss health bar at the very top of the play area.
  const pad = 14;
  const barW = world.width - pad * 2;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(pad, 8, barW, 8);
  ctx.fillStyle = '#ff3d6e';
  ctx.fillRect(pad, 8, (barW * Math.max(0, e.health)) / e.maxHealth, 8);
}

const POWERUP_STYLE: Record<PowerUpType, { color: string; glyph: string }> = {
  spread: { color: '#7dff9b', glyph: 'W' },
  rapid: { color: '#ffd25e', glyph: 'R' },
  shield: { color: '#5cd2ff', glyph: 'S' },
  life: { color: '#ff5d7a', glyph: '+' },
};

function drawPowerUps(ctx: CanvasRenderingContext2D, world: GameWorld) {
  for (const pu of world.powerUps) {
    const { color, glyph } = POWERUP_STYLE[pu.type];
    const cx = pu.position.x + pu.width / 2;
    const cy = pu.position.y + pu.height / 2;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(8,12,28,0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pu.position.x, pu.position.y, pu.width, pu.height, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, cx, cy + 1);
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, world: GameWorld) {
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx: CanvasRenderingContext2D, world: GameWorld) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px system-ui, sans-serif';
  for (const pop of world.popups) {
    ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, pop.position.x, pop.position.y);
  }
  ctx.restore();
}

function drawBanner(ctx: CanvasRenderingContext2D, world: GameWorld) {
  if (world.bannerTimer <= 0) return;
  const alpha = Math.min(1, world.bannerTimer / 40);
  const boss = world.level % 5 === 0;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.fillStyle = boss ? '#ff3d6e' : '#3affd0';
  ctx.shadowColor = boss ? '#ff3d6e' : '#3affd0';
  ctx.shadowBlur = 18;
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(
    boss ? 'BOSS' : `LEVEL ${world.level}`,
    world.width / 2,
    world.height * 0.42
  );
  ctx.restore();
}

/** Render one full frame of the world to the canvas. */
export function render(ctx: CanvasRenderingContext2D, world: GameWorld) {
  // Background fills the full canvas unshaken so no edge gaps appear.
  drawBackground(ctx, world.width, world.height);

  ctx.save();
  // Screen shake applies only to the gameplay layer.
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  drawParticles(ctx, world);
  drawPowerUps(ctx, world);
  drawBullets(ctx, world);
  drawEnemyBullets(ctx, world);
  drawEnemies(ctx, world);
  drawPlayer(ctx, world);
  drawPopups(ctx, world);
  ctx.restore();

  // Banner sits above the shake so it stays legible.
  drawBanner(ctx, world);
}
