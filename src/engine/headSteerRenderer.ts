import type { HeadSteerWorld } from './headSteerWorld';
import { drawParticles } from './fx';

export function drawHeadSteer(ctx: CanvasRenderingContext2D, world: HeadSteerWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const s of world.stars) {
    ctx.font = `${Math.round(s.r * 2)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', s.x, s.y);
  }

  const { player } = world;
  ctx.save();
  ctx.shadowColor = '#5cd2ff';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(92,210,255,0.35)';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(player.r * 1.8)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚀', player.x, player.y);
  ctx.restore();

  drawParticles(ctx, world.particles);
  ctx.restore();
}
