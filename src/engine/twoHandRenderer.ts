import type { TwoHandWorld } from './twoHandWorld';
import { drawParticles, drawPopups } from './fx';

export function drawTwoHand(ctx: CanvasRenderingContext2D, world: TwoHandWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const cx = world.width / 2;
  const cy = world.height * 0.45;
  const r = world.width * 0.14;
  const glow = world.beatPulse > 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = glow ? 'rgba(255,210,94,0.35)' : 'rgba(12,20,44,0.45)';
  ctx.fill();
  ctx.lineWidth = glow ? 5 : 2;
  ctx.strokeStyle = glow ? '#ffd25e' : 'rgba(255,255,255,0.35)';
  if (glow) {
    ctx.shadowColor = '#ffd25e';
    ctx.shadowBlur = 24;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#eaf6ff';
  ctx.font = `bold ${Math.round(r * 0.55)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glow ? 'CLAP!' : '♪', cx, cy);
  ctx.restore();

  if (world.feedback) {
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `600 ${Math.round(world.width * 0.04)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(world.feedback, cx, world.height * 0.62);
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
