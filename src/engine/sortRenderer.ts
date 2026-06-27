import type { SortWorld, SortBin } from './sortWorld';
import { drawParticles, drawPopups } from './fx';

function drawBin(ctx: CanvasRenderingContext2D, bin: SortBin, active: boolean) {
  ctx.save();
  if (active) {
    ctx.shadowColor = '#3affd0';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = '#3affd0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bin.x, bin.y, bin.w * 0.58, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.globalAlpha = 0.72;
  }
  ctx.font = `${bin.w}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bin.emoji, bin.x, bin.y);
  ctx.restore();
}

export function drawSort(ctx: CanvasRenderingContext2D, world: SortWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  // Midline hint so kids know which half activates which basket.
  ctx.save();
  ctx.strokeStyle = 'rgba(90,210,255,0.22)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(world.width / 2, world.height * 0.12);
  ctx.lineTo(world.width / 2, world.height * 0.88);
  ctx.stroke();
  ctx.restore();

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

  drawBin(ctx, world.leftBin, world.activeSide === 'left');
  drawBin(ctx, world.rightBin, world.activeSide === 'right');

  drawPopups(ctx, world.popups, 'bold 26px system-ui, sans-serif');
  ctx.restore();
}
