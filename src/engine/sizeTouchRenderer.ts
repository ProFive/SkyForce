import type { SizeTouchWorld } from './sizeTouchWorld';
import { drawParticles, drawPopups } from './fx';

export function drawSizeTouch(ctx: CanvasRenderingContext2D, world: SizeTouchWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const c of world.choices) {
    const baseR = c.r / c.scale;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    ctx.fillStyle = 'rgba(12,20,44,0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, baseR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ffd25e';
    ctx.shadowBlur = 14;
    ctx.font = `${baseR * 1.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.item.emoji ?? c.item.en, 0, 0);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups, 'bold 26px system-ui, sans-serif');

  if (world.finger.active) {
    const { x, y } = world.finger;
    ctx.save();
    ctx.strokeStyle = '#3affd0';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#3affd0';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
