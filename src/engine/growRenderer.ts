import type { GrowWorld } from './growWorld';
import { drawParticles, drawPopups } from './fx';

export function drawGrow(ctx: CanvasRenderingContext2D, world: GrowWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const { x, y, r } = world.plant;
  const scale = 0.7 + (world.growth / 100) * 0.6;

  // Pot / soil.
  ctx.save();
  ctx.fillStyle = 'rgba(80,50,30,0.55)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.55, r * 0.55 * scale, r * 0.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Growth bar.
  const barW = r * 1.6;
  const barH = 10;
  const barX = x - barW / 2;
  const barY = y - r * 1.2;
  ctx.fillStyle = 'rgba(12,20,44,0.5)';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = '#5cd2ff';
  ctx.fillRect(barX, barY, barW * (world.growth / 100), barH);

  // Plant emoji scales with growth.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (world.sparkle > 0) {
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 18;
  }
  ctx.font = `${r * 1.4}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(world.stageEmoji(), 0, 0);
  ctx.restore();

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups, 'bold 28px serif');

  if (world.finger.active) {
    const { x: fx, y: fy } = world.finger;
    ctx.save();
    ctx.strokeStyle = '#3affd0';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#3affd0';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(fx, fy, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
