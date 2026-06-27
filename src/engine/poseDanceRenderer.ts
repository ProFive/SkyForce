import type { PoseDanceWorld } from './poseDanceWorld';
import { drawParticles, drawPopups } from './fx';

export function drawPoseDance(ctx: CanvasRenderingContext2D, world: PoseDanceWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const cx = world.width / 2;
  ctx.font = `${Math.round(world.width * 0.28)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(world.challenge.emoji, cx, world.height * 0.32);

  ctx.fillStyle = 'rgba(12,20,44,0.55)';
  const bannerY = world.height * 0.52;
  ctx.beginPath();
  ctx.roundRect(32, bannerY, world.width - 64, 56, 12);
  ctx.fill();

  ctx.fillStyle = '#eaf6ff';
  ctx.font = `600 ${Math.round(world.width * 0.042)}px system-ui, sans-serif`;
  ctx.fillText(world.challenge.speak, cx, bannerY + 28);

  if (world.feedback) {
    ctx.fillStyle = world.feedback.startsWith('✓') ? '#7dff9b' : '#ffd25e';
    ctx.font = `600 ${Math.round(world.width * 0.038)}px system-ui, sans-serif`;
    ctx.fillText(world.feedback, cx, world.height * 0.68);
  }

  const progress = Math.min(1, world.holdFrames / 18);
  const barW = world.width * 0.5;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(cx - barW / 2, world.height * 0.74, barW, 10);
  ctx.fillStyle = '#7dff9b';
  ctx.fillRect(cx - barW / 2, world.height * 0.74, barW * progress, 10);

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
