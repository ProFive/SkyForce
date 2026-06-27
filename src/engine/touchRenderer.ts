import type { TouchWorld } from './touchWorld';
import { drawParticles, drawPopups } from './fx';

export function drawTouch(ctx: CanvasRenderingContext2D, world: TouchWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const c of world.choices) {
    if (world.mode === 'color') {
      // Colored blob with a soft glow.
      ctx.save();
      ctx.shadowColor = c.item.hex ?? '#ffffff';
      ctx.shadowBlur = 22;
      ctx.fillStyle = c.item.hex ?? '#ffffff';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.stroke();
      ctx.restore();
    } else {
      // Emoji on a soft backing disc so it pops over the camera feed.
      ctx.save();
      ctx.fillStyle = 'rgba(12,20,44,0.45)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#ffd25e';
      ctx.shadowBlur = 14;
      ctx.font = `${c.r * 1.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.item.emoji ?? c.item.en, c.x, c.y);
      ctx.restore();
    }
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups, 'bold 26px system-ui, sans-serif');

  // Finger crosshair (the menu cursor is hidden during play).
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
