import type { MathWorld } from './mathWorld';
import { drawParticles, drawPopups } from './fx';

export function drawMath(ctx: CanvasRenderingContext2D, world: MathWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Equation banner at the top.
  ctx.save();
  const prompt = world.problem.prompt;
  const size = 40;
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  const w = ctx.measureText(prompt).width + 36;
  const cx = world.width / 2;
  const y = world.height * 0.1;
  ctx.fillStyle = 'rgba(12,20,44,0.62)';
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, y - size * 0.75, w, size * 1.5, size * 0.45);
  ctx.fill();
  ctx.fillStyle = '#eaf6ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(prompt, cx, y);
  ctx.restore();

  for (const it of world.items) {
    ctx.save();
    ctx.fillStyle = 'rgba(12,20,44,0.55)';
    ctx.beginPath();
    ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5cd2ff';
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(it.r * 1.1)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(it.value), it.x, it.y);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);

  const b = world.basket;
  ctx.save();
  ctx.shadowColor = '#3affd0';
  ctx.shadowBlur = 14;
  ctx.font = `${b.w}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🧺', b.x, b.y);
  ctx.restore();

  drawPopups(ctx, world.popups, 'bold 26px system-ui, sans-serif');
  ctx.restore();
}
