import type { ThumbQuizWorld } from './thumbQuizWorld';
import { drawParticles, drawPopups } from './fx';

export function drawThumbQuiz(ctx: CanvasRenderingContext2D, world: ThumbQuizWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  const cx = world.width / 2;
  const cy = world.height * 0.42;

  // Statement card.
  ctx.save();
  const text = world.fact.text;
  const size = Math.min(32, Math.round(world.width * 0.055));
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  const maxW = world.width * 0.82;
  const w = Math.min(ctx.measureText(text).width + 40, maxW);
  ctx.fillStyle = 'rgba(12,20,44,0.65)';
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - size, w, size * 2.2, size * 0.4);
  ctx.fill();
  ctx.fillStyle = '#eaf6ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  ctx.restore();

  // Gesture hints.
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#7dff9b';
  ctx.textAlign = 'center';
  ctx.fillText('👍 True', cx - 80, world.height * 0.68);
  ctx.fillStyle = '#ff8787';
  ctx.fillText('👎 False', cx + 80, world.height * 0.68);

  if (world.feedback) {
    ctx.fillStyle = '#ffd25e';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(world.feedback, cx, world.height * 0.78);
  }

  // Hold progress ring when gesturing.
  if (world.holdFrames > 0 && world.holdGesture !== 'none') {
    const prog = world.holdFrames / 14;
    ctx.strokeStyle = world.holdGesture === 'thumbUp' ? '#7dff9b' : '#ff8787';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, world.height * 0.58, 36, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
    ctx.stroke();
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
