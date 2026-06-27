import type { VocabWorld } from './vocabWorld';
import { drawParticles, drawPopups } from './fx';

export function drawVocab(ctx: CanvasRenderingContext2D, world: VocabWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Falling items (big emoji so 3–5 year olds can recognise them easily).
  for (const it of world.items) {
    ctx.save();
    ctx.shadowColor = '#ffd25e';
    ctx.shadowBlur = 12;
    ctx.font = `${it.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.item.emoji ?? it.item.en, it.x, it.y);
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
