import type { SquashWorld } from './squashWorld';
import { drawParticles, drawPopups } from './fx';

/** Pop-in / pop-out scale based on how much life the target has left. */
function popScale(life: number, maxLife: number): number {
  const t = 1 - life / maxLife; // 0 at spawn -> 1 at expiry
  const inT = 0.16;
  const outT = 0.82;
  if (t < inT) return t / inT;
  if (t > outT) return Math.max(0, (1 - t) / (1 - outT));
  return 1;
}

export function drawSquash(ctx: CanvasRenderingContext2D, world: SquashWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  for (const t of world.targets) {
    const sc = popScale(t.life, t.maxLife);
    if (sc <= 0.02) continue;
    // Shadow / hole.
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(t.x, t.y + t.r * 0.7, t.r * 0.8 * sc, t.r * 0.3 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Target.
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(sc, sc);
    ctx.shadowColor = t.bomb ? '#ff4d4d' : '#7dff9b';
    ctx.shadowBlur = 12;
    ctx.font = `${t.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.bomb ? '💣' : '🐛', 0, 0);
    ctx.restore();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);

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
