import type { OrderWorld } from './orderWorld';
import { drawParticles, drawPopups } from './fx';

function popScale(life: number, maxLife: number): number {
  const t = 1 - life / maxLife;
  const inT = 0.12;
  const outT = 0.85;
  if (t < inT) return t / inT;
  if (t > outT) return Math.max(0, (1 - t) / (1 - outT));
  return 1;
}

export function drawOrder(ctx: CanvasRenderingContext2D, world: OrderWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const b of world.bubbles) {
    if (b.popped) continue;
    const sc = popScale(b.life, b.maxLife);
    if (sc <= 0.02) continue;
    const isNext = b.order === world.nextIndex;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(sc, sc);
    ctx.fillStyle = isNext ? 'rgba(92,210,255,0.35)' : 'rgba(125,255,155,0.28)';
    ctx.strokeStyle = isNext ? '#5cd2ff' : 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.shadowColor = isNext ? '#5cd2ff' : '#7dff9b';
    ctx.shadowBlur = isNext ? 16 : 8;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(b.r * 0.9)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, 0, 0);
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
