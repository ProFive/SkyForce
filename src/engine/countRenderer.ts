import type { CountWorld } from './countWorld';
import { drawParticles, drawPopups } from './fx';

export function drawCount(ctx: CanvasRenderingContext2D, world: CountWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Falling stars.
  for (const s of world.stars) {
    ctx.save();
    ctx.shadowColor = '#ffe45e';
    ctx.shadowBlur = 14;
    ctx.font = `${s.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', s.x, s.y);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);

  // Basket.
  const b = world.basket;
  ctx.save();
  ctx.shadowColor = '#3affd0';
  ctx.shadowBlur = 14;
  ctx.font = `${b.w}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧺', b.x, b.y);
  ctx.restore();

  drawPopups(ctx, world.popups, 'bold 32px system-ui, sans-serif');
  ctx.restore();
}
