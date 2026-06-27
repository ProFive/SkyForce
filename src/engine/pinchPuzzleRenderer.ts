import type { PinchPuzzleWorld } from './pinchPuzzleWorld';
import { drawParticles, drawPopups } from './fx';

export function drawPinchPuzzle(ctx: CanvasRenderingContext2D, world: PinchPuzzleWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const s of world.slots) {
    ctx.save();
    ctx.fillStyle = s.filled ? 'rgba(125,255,155,0.2)' : 'rgba(12,20,44,0.55)';
    ctx.strokeStyle = s.filled ? '#7dff9b' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 10);
    ctx.fill();
    ctx.stroke();
    if (!s.filled) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = `bold ${Math.round(s.h * 0.35)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', s.x, s.y);
    }
    ctx.restore();
  }

  for (const t of world.tiles) {
    const dragging = world.dragId === t.id;
    ctx.save();
    ctx.fillStyle = dragging ? '#ffe45e' : 'rgba(12,20,44,0.72)';
    ctx.strokeStyle = dragging ? '#ffd25e' : '#5cd2ff';
    ctx.lineWidth = dragging ? 4 : 3;
    if (dragging) {
      ctx.shadowColor = '#ffd25e';
      ctx.shadowBlur = 16;
    }
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(t.r * 1.05)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.char, t.x, t.y);
    ctx.restore();
  }

  if (world.finger.active) {
    const { x, y } = world.finger;
    ctx.save();
    if (world.pinching) {
      ctx.strokeStyle = '#ffd25e';
      ctx.fillStyle = 'rgba(255,210,94,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤏', x, y - 28);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x + 14, y);
      ctx.moveTo(x, y - 14);
      ctx.lineTo(x, y + 14);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
