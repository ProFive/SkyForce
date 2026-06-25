import type { GameWorld } from './gameWorld';

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

function drawEnemies(ctx: CanvasRenderingContext2D, world: GameWorld) {
  for (const e of world.enemies) {
    const cx = e.position.x + e.width / 2;
    const top = e.position.y;
    const bottom = e.position.y + e.height;
    const flashing = e.hitFlash > 0;

    ctx.save();
    ctx.shadowColor = flashing ? '#ffffff' : '#ff5d5d';
    ctx.shadowBlur = 12;
    ctx.fillStyle = flashing ? '#ffffff' : e.maxHealth > 1 ? '#ff3d6e' : '#ff5d5d';
    // Enemy points downward (toward the player).
    ctx.beginPath();
    ctx.moveTo(cx, bottom);
    ctx.lineTo(e.position.x, top);
    ctx.lineTo(cx - e.width * 0.18, top + 8);
    ctx.lineTo(cx + e.width * 0.18, top + 8);
    ctx.lineTo(e.position.x + e.width, top);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Health pips for tanky enemies.
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

/** Render one full frame of the world to the canvas. */
export function render(ctx: CanvasRenderingContext2D, world: GameWorld) {
  drawBackground(ctx, world.width, world.height);
  drawParticles(ctx, world);
  drawBullets(ctx, world);
  drawEnemies(ctx, world);
  drawPlayer(ctx, world);
}
