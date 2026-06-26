// Small shared helpers for the simpler arcade games: particles, score popups,
// and geometry. Keeps each game's world/renderer focused on its own mechanics.

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Popup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export const dist = (ax: number, ay: number, bx: number, by: number) =>
  Math.hypot(ax - bx, ay - by);

export function burst(
  out: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 4
) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1 + Math.random() * speed;
    const life = 16 + Math.random() * 16;
    out.push({
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

export function popup(
  out: Popup[],
  x: number,
  y: number,
  text: string,
  color: string,
  life = 46
) {
  out.push({ x, y, text, color, life, maxLife: life });
}

/** Advance particles (with light gravity + drag) and drop dead ones. */
export function stepParticles(ps: Particle[]): Particle[] {
  for (const p of ps) {
    p.vx *= 0.95;
    p.vy = p.vy * 0.95 + 0.2;
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  }
  return ps.filter((p) => p.life > 0);
}

export function stepPopups(ps: Popup[]): Popup[] {
  for (const p of ps) {
    p.y -= 0.6;
    p.life--;
  }
  return ps.filter((p) => p.life > 0);
}

export function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[]) {
  for (const p of ps) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawPopups(
  ctx: CanvasRenderingContext2D,
  ps: Popup[],
  font = 'bold 16px system-ui, sans-serif'
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = font;
  for (const p of ps) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
}
