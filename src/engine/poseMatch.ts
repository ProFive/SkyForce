import type { Vec2 } from '../types';

/** Kid-friendly body poses checked against MediaPipe pose landmarks. */
export type PoseChallengeId =
  | 'armsUp'
  | 'tPose'
  | 'handsOnHips'
  | 'leftWave'
  | 'rightWave';

export interface PoseChallenge {
  id: PoseChallengeId;
  emoji: string;
  speak: string;
  label: string;
}

/** MediaPipe pose landmark indices used for matching. */
const LS = 11;
const RS = 12;
const LW = 15;
const RW = 16;
const LH = 23;
const RH = 24;

export const POSE_CHALLENGES: PoseChallenge[] = [
  { id: 'armsUp', emoji: '🙌', speak: 'Raise both arms up!', label: 'Arms up' },
  { id: 'tPose', emoji: '🤸', speak: 'Stretch your arms out wide!', label: 'T-pose' },
  { id: 'handsOnHips', emoji: '🦸', speak: 'Hands on your hips!', label: 'Hero pose' },
  { id: 'leftWave', emoji: '👋', speak: 'Wave your left hand!', label: 'Left wave' },
  { id: 'rightWave', emoji: '✋', speak: 'Wave your right hand!', label: 'Right wave' },
];

function lmAt(lm: Vec2[], i: number): Vec2 | null {
  return lm[i] ?? null;
}

/** True when the body matches the requested pose (camera coords, y grows downward). */
export function checkPose(id: PoseChallengeId, lm: Vec2[]): boolean {
  if (lm.length < 25) return false;
  const ls = lmAt(lm, LS);
  const rs = lmAt(lm, RS);
  const lw = lmAt(lm, LW);
  const rw = lmAt(lm, RW);
  const lh = lmAt(lm, LH);
  const rh = lmAt(lm, RH);
  if (!ls || !rs || !lw || !rw || !lh || !rh) return false;

  switch (id) {
    case 'armsUp':
      return lw.y < ls.y - 0.04 && rw.y < rs.y - 0.04;
    case 'tPose':
      return (
        Math.abs(lw.y - ls.y) < 0.08 &&
        Math.abs(rw.y - rs.y) < 0.08 &&
        Math.abs(lw.x - ls.x) > 0.12 &&
        Math.abs(rw.x - rs.x) > 0.12
      );
    case 'handsOnHips':
      return (
        Math.abs(lw.y - lh.y) < 0.1 &&
        Math.abs(rw.y - rh.y) < 0.1 &&
        Math.abs(lw.x - lh.x) < 0.12 &&
        Math.abs(rw.x - rh.x) < 0.12
      );
    case 'leftWave':
      return lw.y < ls.y - 0.06 && rw.y > rs.y - 0.02;
    case 'rightWave':
      return rw.y < rs.y - 0.06 && lw.y > ls.y - 0.02;
    default:
      return false;
  }
}

export function pickChallenge(exclude?: PoseChallengeId): PoseChallenge {
  const pool = exclude
    ? POSE_CHALLENGES.filter((c) => c.id !== exclude)
    : POSE_CHALLENGES;
  return pool[(Math.random() * pool.length) | 0];
}
