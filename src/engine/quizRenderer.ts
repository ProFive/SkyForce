import type { QuizWorld, QuizChoice } from './quizWorld';
import type { ShapeKind } from './content';
import { drawParticles, drawPopups } from './fx';

/** Draw a simple analog clock face (kid-friendly: o'clock or half-past). */
export function drawClockFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hour: number,
  minute: number
) {
  ctx.save();
  ctx.fillStyle = 'rgba(12,20,44,0.62)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd25e';
  ctx.shadowColor = '#ffd25e';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Hour ticks.
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const x1 = x + Math.cos(a) * (r * 0.78);
    const y1 = y + Math.sin(a) * (r * 0.78);
    const x2 = x + Math.cos(a) * (r * 0.9);
    const y2 = y + Math.sin(a) * (r * 0.9);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const minAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  const hrAngle = ((hour % 12) / 12) * Math.PI * 2 + (minute / 60) * (Math.PI / 6) - Math.PI / 2;

  ctx.strokeStyle = '#eaf6ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(hrAngle) * r * 0.45, y + Math.sin(hrAngle) * r * 0.45);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(minAngle) * r * 0.62, y + Math.sin(minAngle) * r * 0.62);
  ctx.stroke();

  ctx.fillStyle = '#ffd25e';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Draw a filled shape centered at (x,y) sized to roughly fit radius r. */
function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: ShapeKind
) {
  ctx.beginPath();
  switch (kind) {
    case 'circle':
      ctx.arc(x, y, r, 0, Math.PI * 2);
      break;
    case 'square': {
      const s = r * 1.7;
      ctx.rect(x - s / 2, y - s / 2, s, s);
      break;
    }
    case 'triangle':
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.95, y + r * 0.75);
      ctx.lineTo(x - r * 0.95, y + r * 0.75);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.8, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.8, y);
      ctx.closePath();
      break;
    case 'star': {
      const spikes = 5;
      const outer = r;
      const inner = r * 0.45;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const a = (Math.PI / spikes) * i - Math.PI / 2;
        const px = x + Math.cos(a) * rad;
        const py = y + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case 'heart': {
      const w = r * 1.3;
      const h = r * 1.2;
      ctx.moveTo(x, y + h * 0.6);
      ctx.bezierCurveTo(x + w, y - h * 0.3, x + w * 0.5, y - h, x, y - h * 0.3);
      ctx.bezierCurveTo(x - w * 0.5, y - h, x - w, y - h * 0.3, x, y + h * 0.6);
      ctx.closePath();
      break;
    }
  }
}

function drawOption(ctx: CanvasRenderingContext2D, c: QuizChoice) {
  const { x, y, r, option } = c;

  if (option.kind === 'shape' && option.shape) {
    ctx.save();
    ctx.shadowColor = option.hex ?? '#ffffff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = option.hex ?? '#ffffff';
    drawShape(ctx, x, y, r * 0.92, option.shape);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (option.kind === 'color') {
    ctx.save();
    ctx.shadowColor = option.hex ?? '#ffffff';
    ctx.shadowBlur = 22;
    ctx.fillStyle = option.hex ?? '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (option.kind === 'clock' && option.hour !== undefined) {
    drawClockFace(ctx, x, y, r, option.hour, option.minute ?? 0);
    return;
  }

  if (option.kind === 'emoji') {
    ctx.save();
    ctx.fillStyle = 'rgba(12,20,44,0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ffd25e';
    ctx.shadowBlur = 14;
    ctx.font = `${r * 1.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(option.emoji ?? '?', x, y);
    ctx.restore();
    return;
  }

  // text option on a soft backing disc
  ctx.save();
  ctx.fillStyle = 'rgba(12,20,44,0.62)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#5cd2ff';
  ctx.shadowColor = '#5cd2ff';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#eaf6ff';
  const label = option.text ?? '?';
  const size = Math.min(r * 0.6, (r * 1.7) / Math.max(3, label.length));
  ctx.font = `bold ${Math.round(size)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.restore();
}

/** Word-wrap `text` to fit `maxWidth`, returning the lines. */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawPrompt(ctx: CanvasRenderingContext2D, world: QuizWorld) {
  const cx = world.width / 2;
  let y = world.height * 0.1;

  if (world.promptEmoji) {
    ctx.save();
    ctx.shadowColor = '#ffd25e';
    ctx.shadowBlur = 18;
    ctx.font = `${Math.round(world.height * 0.1)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(world.promptEmoji, cx, y);
    ctx.restore();
    y += world.height * 0.09;
  }

  if (world.promptText) {
    ctx.save();
    const size = Math.round(Math.min(36, world.width * 0.06));
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapLines(ctx, world.promptText, world.width * 0.86);
    for (const ln of lines) {
      // soft backing for readability over the camera feed
      const w = ctx.measureText(ln).width + 28;
      ctx.fillStyle = 'rgba(12,20,44,0.55)';
      ctx.beginPath();
      const rectY = y - size * 0.7;
      const radius = size * 0.5;
      const left = cx - w / 2;
      ctx.roundRect(left, rectY, w, size * 1.4, radius);
      ctx.fill();
      ctx.fillStyle = '#eaf6ff';
      ctx.fillText(ln, cx, y);
      y += size * 1.5;
    }
    ctx.restore();
  }
}

export function drawQuiz(ctx: CanvasRenderingContext2D, world: QuizWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }

  drawPrompt(ctx, world);

  for (const c of world.choices) drawOption(ctx, c);

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
