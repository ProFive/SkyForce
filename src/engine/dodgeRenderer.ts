import type { DodgeWorld } from './dodgeWorld';
import { drawParticles } from './fx';

export function drawDodge(ctx: CanvasRenderingContext2D, world: DodgeWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Rocks.
  for (const rk of world.rocks) {
    ctx.save();
    ctx.translate(rk.x, rk.y);
    ctx.rotate(rk.spin);
    ctx.shadowColor = '#ff7a5d';
    ctx.shadowBlur = 10;
    ctx.font = `${rk.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪨', 0, 0);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);

  // Player ship — blinks while invulnerable.
  const p = world.player;
  const blink = world.invuln > 0 && Math.floor(world.invuln / 5) % 2 === 0;
  if (!blink) {
    ctx.save();
    ctx.shadowColor = '#3affd0';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#3affd0';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.r);
    ctx.lineTo(p.x - p.r, p.y + p.r);
    ctx.lineTo(p.x, p.y + p.r * 0.4);
    ctx.lineTo(p.x + p.r, p.y + p.r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
