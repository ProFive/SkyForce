import type { LetterWorld } from './letterWorld';
import { drawParticles, drawPopups } from './fx';

export function drawLetters(ctx: CanvasRenderingContext2D, world: LetterWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Falling letter tiles (all the same look, so the player has to read them).
  for (const it of world.letters) {
    const size = it.r * 2;
    ctx.save();
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(12,20,44,0.92)';
    ctx.strokeStyle = '#5cd2ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(it.x - it.r, it.y - it.r, size, size, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(it.r * 1.5)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.char, it.x, it.y + 1);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);

  // Basket.
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
