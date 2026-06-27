import type { MemoryWorld } from './memoryWorld';
import { drawParticles, drawPopups } from './fx';

function drawCard(
  ctx: CanvasRenderingContext2D,
  face: string,
  x: number,
  y: number,
  w: number,
  h: number,
  faceUp: boolean,
  matched: boolean
) {
  const r = Math.min(w, h) * 0.14;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
  if (matched) {
    ctx.fillStyle = 'rgba(125,255,155,0.25)';
    ctx.strokeStyle = '#7dff9b';
  } else if (faceUp) {
    ctx.fillStyle = 'rgba(12,20,44,0.72)';
    ctx.strokeStyle = '#5cd2ff';
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 10;
  } else {
    ctx.fillStyle = 'rgba(58,255,208,0.18)';
    ctx.strokeStyle = 'rgba(58,255,208,0.55)';
  }
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (faceUp || matched) {
    const isEmoji = face.length <= 4 && !/^[a-z]/i.test(face);
    if (isEmoji) {
      ctx.font = `${Math.min(w, h) * 0.55}px serif`;
    } else {
      const size = Math.min(h * 0.38, (w * 0.85) / Math.max(3, face.length * 0.55));
      ctx.font = `bold ${Math.round(size)}px system-ui, sans-serif`;
    }
    ctx.fillStyle = '#eaf6ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(face, x, y);
  } else {
    ctx.fillStyle = 'rgba(58,255,208,0.5)';
    ctx.font = `bold ${Math.round(h * 0.35)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x, y);
  }
  ctx.restore();
}

export function drawMemory(ctx: CanvasRenderingContext2D, world: MemoryWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const c of world.cards) {
    drawCard(ctx, c.face, c.x, c.y, c.w, c.h, c.flipped, c.matched);
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
    ctx.moveTo(x - 22, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
