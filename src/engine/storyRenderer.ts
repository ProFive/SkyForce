import type { StoryWorld } from './storyWorld';
import { drawParticles, drawPopups } from './fx';

export function drawStory(ctx: CanvasRenderingContext2D, world: StoryWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  ctx.font = `${Math.round(world.width * 0.18)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(world.sceneEmoji, world.width / 2, world.height * 0.28);

  ctx.fillStyle = 'rgba(12,20,44,0.55)';
  const bannerY = world.height * 0.14;
  const bannerH = 52;
  ctx.beginPath();
  ctx.roundRect(24, bannerY, world.width - 48, bannerH, 12);
  ctx.fill();

  ctx.fillStyle = '#eaf6ff';
  ctx.font = `600 ${Math.round(world.width * 0.034)}px system-ui, sans-serif`;
  const words = world.narration.split(' ');
  let line = '';
  let y = bannerY + 18;
  const maxW = world.width - 72;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, world.width / 2, y);
      line = w;
      y += 20;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, world.width / 2, y);

  for (const h of world.hotspots) {
    ctx.save();
    ctx.fillStyle = 'rgba(12,20,44,0.62)';
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5cd2ff';
    ctx.shadowColor = '#5cd2ff';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.font = `${Math.round(h.r * 1.1)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(h.choice.emoji, h.x, h.y);
    ctx.restore();
  }

  if (world.finger.active) {
    const { x, y: fy } = world.finger;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, fy);
    ctx.lineTo(x + 14, fy);
    ctx.moveTo(x, fy - 14);
    ctx.lineTo(x, fy + 14);
    ctx.stroke();
  }

  drawParticles(ctx, world.particles);
  drawPopups(ctx, world.popups);
  ctx.restore();
}
