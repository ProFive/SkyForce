/** Normalized hand landmark (0..1 in the camera frame). */
export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export type HandGesture =
  | 'none'
  | 'thumbUp'
  | 'thumbDown'
  | 'rock'
  | 'paper'
  | 'scissors';

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

/** Finger extended when the tip is farther from the wrist than the pip joint. */
function fingerExtended(lm: Landmark[], tip: number, pip: number, wrist = 0): boolean {
  return dist(lm[tip], lm[wrist]) > dist(lm[pip], lm[wrist]) * 1.12;
}

/** Count extended fingers (index..pinky), excluding thumb. */
export function countExtendedFingers(lm: Landmark[]): number {
  const checks: [number, number][] = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ];
  let n = 0;
  for (const [tip, pip] of checks) {
    if (fingerExtended(lm, tip, pip)) n++;
  }
  return n;
}

function thumbExtended(lm: Landmark[]): boolean {
  // Thumb tip should be well away from the index MCP when extended.
  return dist(lm[4], lm[0]) > dist(lm[2], lm[0]) * 1.35;
}

function thumbPointingUp(lm: Landmark[]): boolean {
  return thumbExtended(lm) && lm[4].y < lm[3].y && lm[4].y < lm[8].y;
}

function thumbPointingDown(lm: Landmark[]): boolean {
  return thumbExtended(lm) && lm[4].y > lm[3].y && lm[4].y > lm[8].y;
}

/**
 * Classify a coarse hand gesture from 21 MediaPipe landmarks.
 * Tuned for a selfie camera — good enough for kids' games, not biometric precision.
 */
export function classifyGesture(lm: Landmark[]): HandGesture {
  if (lm.length < 21) return 'none';

  const extended = countExtendedFingers(lm);
  const thumb = thumbExtended(lm);

  if (thumbPointingUp(lm) && extended <= 1) return 'thumbUp';
  if (thumbPointingDown(lm) && extended <= 1) return 'thumbDown';

  // Rock: thumb curled, other fingers curled.
  if (!thumb && extended === 0) return 'rock';

  // Paper: all fingers extended.
  if (thumb && extended >= 3) return 'paper';

  // Scissors: index + middle extended, ring + pinky curled.
  const index = fingerExtended(lm, 8, 6);
  const middle = fingerExtended(lm, 12, 10);
  const ring = fingerExtended(lm, 16, 14);
  const pinky = fingerExtended(lm, 20, 18);
  if (index && middle && !ring && !pinky) return 'scissors';

  return 'none';
}

/** True when thumb and index tips are close (pinch grab). */
export function isPinching(lm: Landmark[]): boolean {
  if (lm.length < 21) return false;
  return dist(lm[4], lm[8]) < 0.065;
}
