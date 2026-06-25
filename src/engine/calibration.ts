/**
 * Maps the comfortable sub-region of the camera frame that the player actually
 * moves their finger within onto the full play field. Without this, people only
 * reach the centre of the screen because they don't wave across the whole frame.
 *
 * Values are normalized (0..1) in the already-mirrored camera space.
 */
interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const KEY = 'skyforce.calibration';
// A centred default so the game is playable before any calibration.
const DEFAULT: Box = { minX: 0.2, maxX: 0.8, minY: 0.2, maxY: 0.8 };
const MIN_RANGE = 0.12; // reject too-small traced areas
const INSET = 0.04; // shrink the traced box slightly so edges stay reachable

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function load(): Box {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const b = JSON.parse(raw);
      if (
        typeof b.minX === 'number' &&
        typeof b.maxX === 'number' &&
        typeof b.minY === 'number' &&
        typeof b.maxY === 'number'
      ) {
        return b;
      }
    }
  } catch {
    /* fall through to default */
  }
  return { ...DEFAULT };
}

let box: Box = load();
let recording = false;
let rec: Box | null = null;

/** Remap a raw normalized point through the current calibration box. */
export function apply(x: number, y: number): { x: number; y: number } {
  const nx = (x - box.minX) / (box.maxX - box.minX);
  const ny = (y - box.minY) / (box.maxY - box.minY);
  return { x: clamp01(nx), y: clamp01(ny) };
}

export function isRecording(): boolean {
  return recording;
}

export function beginRecording() {
  recording = true;
  rec = null;
}

/** Feed a raw sample while recording so we can grow the bounding box. */
export function observe(x: number, y: number) {
  if (!recording) return;
  if (!rec) {
    rec = { minX: x, maxX: x, minY: y, maxY: y };
    return;
  }
  rec.minX = Math.min(rec.minX, x);
  rec.maxX = Math.max(rec.maxX, x);
  rec.minY = Math.min(rec.minY, y);
  rec.maxY = Math.max(rec.maxY, y);
}

/** Commit the traced box if it's large enough; otherwise keep the old one. */
export function finishRecording() {
  recording = false;
  if (rec && rec.maxX - rec.minX > MIN_RANGE && rec.maxY - rec.minY > MIN_RANGE) {
    box = {
      minX: rec.minX + INSET,
      maxX: rec.maxX - INSET,
      minY: rec.minY + INSET,
      maxY: rec.maxY - INSET,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(box));
    } catch {
      /* ignore storage failures */
    }
  }
  rec = null;
}

export function resetCalibration() {
  box = { ...DEFAULT };
  try {
    localStorage.setItem(KEY, JSON.stringify(box));
  } catch {
    /* ignore */
  }
}
