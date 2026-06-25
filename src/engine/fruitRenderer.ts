import type { FruitWorld } from './fruitWorld';

function drawTrail(ctx: CanvasRenderingContext2D, world: FruitWorld) {
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

function drawFruits(ctx: CanvasRenderingContext2D, world: FruitWorld) {
  for (const f of world.fruits) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.spin);
    ctx.shadowColor = f.bomb ? '#ff4d4d' : f.color;
    ctx.shadowBlur = f.bomb ? 18 : 10;
    ctx.font = `${f.r * 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.emoji, 0, 0);
    ctx.restore();
  }
}

function drawJuice(ctx: CanvasRenderingContext2D, world: FruitWorld) {
  for (const j of world.juice) {
    ctx.globalAlpha = Math.max(0, j.life / j.maxLife);
    ctx.fillStyle = j.color;
    ctx.beginPath();
    ctx.arc(j.x, j.y, j.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx: CanvasRenderingContext2D, world: FruitWorld) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px system-ui, sans-serif';
  for (const p of world.popups) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
}

/** Render one frame of Fruit Slash onto the (transparent) canvas. */
export function drawFruit(ctx: CanvasRenderingContext2D, world: FruitWorld) {
  ctx.clearRect(0, 0, world.width, world.height);

  ctx.save();
  if (world.shake > 0.5) {
    const s = world.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  drawJuice(ctx, world);
  drawFruits(ctx, world);
  drawTrail(ctx, world);
  drawPopups(ctx, world);
  ctx.restore();
}
