import type { BrickWorld } from './brickWorld';
import { drawParticles } from './fx';

export function drawBrick(ctx: CanvasRenderingContext2D, world: BrickWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Bricks.
  for (const br of world.bricks) {
    if (!br.alive) continue;
    ctx.save();
    ctx.shadowColor = br.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = br.color;
    ctx.beginPath();
    ctx.roundRect(br.x, br.y, br.w, br.h, 4);
    ctx.fill();
    ctx.restore();
  }

  drawParticles(ctx, world.particles);

  // Paddle.
  const p = world.paddle;
  ctx.save();
  ctx.shadowColor = '#3affd0';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#3affd0';
  ctx.beginPath();
  ctx.roundRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, 8);
  ctx.fill();
  ctx.restore();

  // Ball.
  const b = world.ball;
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
