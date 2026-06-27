import type { SpellWorld } from './spellWorld';
import { drawParticles, drawPopups } from './fx';

function drawTrail(ctx: CanvasRenderingContext2D, world: SpellWorld) {
  const pts = world.trail;
  if (pts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#5cffe0';
  ctx.shadowBlur = 12;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const t = i / pts.length;
    ctx.strokeStyle = `rgba(180, 255, 240, ${0.15 + 0.6 * t})`;
    ctx.lineWidth = 2 + 9 * t;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** The picture + the word being spelled, shown across the top. */
function drawTarget(ctx: CanvasRenderingContext2D, world: SpellWorld) {
  const cx = world.width / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Picture.
  ctx.shadowColor = '#7dff9b';
  ctx.shadowBlur = 16;
  ctx.font = '64px serif';
  ctx.fillText(world.word.emoji ?? '', cx, 70);
  ctx.shadowBlur = 0;

  // Word with blanks for letters not yet spelled.
  const letters = world.word.en.toUpperCase().split('');
  ctx.font = 'bold 34px system-ui, sans-serif';
  const gap = 34;
  const startX = cx - ((letters.length - 1) * gap) / 2;
  letters.forEach((c, i) => {
    const done = i < world.progress;
    ctx.fillStyle = done ? '#7dff9b' : 'rgba(234,246,255,0.4)';
    ctx.fillText(done ? c : '_', startX + i * gap, 130);
  });
  ctx.restore();
}

export function drawSpell(ctx: CanvasRenderingContext2D, world: SpellWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  drawParticles(ctx, world.particles);

  // Flying letter tiles.
  for (const l of world.letters) {
    const size = l.r * 2;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.spin);
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(12,20,44,0.92)';
    ctx.strokeStyle = '#5cd2ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-l.r, -l.r, size, size, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#eaf6ff';
    ctx.font = `bold ${Math.round(l.r * 1.4)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(l.char, 0, 1);
    ctx.restore();
  }

  drawTrail(ctx, world);
  drawPopups(ctx, world.popups, 'bold 26px system-ui, sans-serif');
  ctx.restore();

  // Target overlay is drawn last so it stays readable above the action.
  drawTarget(ctx, world);
}
