import type { KeysWorld } from './keysWorld';
import { NOTE_LABEL } from './keysContent';
import { drawParticles, drawPopups } from './fx';

export function drawKeys(ctx: CanvasRenderingContext2D, world: KeysWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const lit = world.expectedNote();

  for (const k of world.keys) {
    const isLit = k.note === lit;
    const isPressed = world.pressed === k.note;

    ctx.save();
    if (isLit) {
      ctx.shadowColor = '#ffd25e';
      ctx.shadowBlur = 22;
    }
    ctx.fillStyle = isPressed
      ? '#ffe45e'
      : isLit
        ? 'rgba(255,210,94,0.35)'
        : 'rgba(12,20,44,0.55)';
    ctx.beginPath();
    ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = isLit ? 4 : 2;
    ctx.strokeStyle = isLit ? '#ffd25e' : 'rgba(255,255,255,0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(k.r * 0.72)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(NOTE_LABEL[k.note], k.x, k.y);
    ctx.restore();
  }

  if (world.finger.active) {
    const { x, y } = world.finger;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x, y + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
