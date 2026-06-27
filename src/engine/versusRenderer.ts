import type { VersusWorld } from './versusWorld';
import { drawParticles, drawPopups } from './fx';

export function drawVersus(ctx: CanvasRenderingContext2D, world: VersusWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const { target } = world;
  ctx.save();
  ctx.shadowColor = '#ffd25e';
  ctx.shadowBlur = 16;
  ctx.font = `${Math.round(target.r * 1.6)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(target.emoji, target.x, target.y);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(world.width / 2, world.height * 0.12);
  ctx.lineTo(world.width / 2, world.height * 0.88);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(12,20,44,0.45)';
  ctx.font = `600 ${Math.round(world.width * 0.035)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('BLUE', world.width * 0.25, world.height * 0.1);
  ctx.fillText('RED', world.width * 0.75, world.height * 0.1);

  for (const finger of [world.leftFinger, world.rightFinger]) {
    if (!finger.active) continue;
    const color = finger === world.leftFinger ? '#5cd2ff' : '#ff8787';
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(finger.x, finger.y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(finger.x - 10, finger.y);
    ctx.lineTo(finger.x + 10, finger.y);
    ctx.moveTo(finger.x, finger.y - 10);
    ctx.lineTo(finger.x, finger.y + 10);
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
