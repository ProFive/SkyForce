import type { RpsWorld } from './rpsWorld';
import { RPS_EMOJI } from './rpsWorld';
import { drawParticles, drawPopups } from './fx';

export function drawRps(ctx: CanvasRenderingContext2D, world: RpsWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const cx = world.width / 2;

  ctx.save();
  ctx.font = `${Math.round(world.height * 0.14)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ffd25e';
  ctx.shadowBlur = 16;
  ctx.fillText(RPS_EMOJI[world.computer], cx, world.height * 0.32);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#9aa6d6';
  ctx.fillText('Computer', cx, world.height * 0.22);
  ctx.restore();

  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillStyle = '#eaf6ff';
  ctx.textAlign = 'center';
  ctx.fillText('✊  ✋  ✌️', cx, world.height * 0.55);

  if (world.resultText) {
    ctx.fillStyle = '#ffd25e';
    ctx.fillText(world.resultText, cx, world.height * 0.68);
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);

  if (world.finger.active) {
    const { x, y } = world.finger;
    ctx.strokeStyle = '#3affd0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
