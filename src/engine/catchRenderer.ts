import type { CatchWorld } from './catchWorld';
import { drawParticles, drawPopups } from './fx';

export function drawCatch(ctx: CanvasRenderingContext2D, world: CatchWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Falling items.
  for (const it of world.items) {
    ctx.save();
    ctx.shadowColor = it.good ? '#ffe45e' : '#ff4d4d';
    ctx.shadowBlur = 10;
    ctx.font = `${it.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.emoji, it.x, it.y);
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

  drawPopups(ctx, world.popups);
  ctx.restore();
}
