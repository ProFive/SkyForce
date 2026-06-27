import { describe, it, expect } from 'vitest';
import { checkPose } from './poseMatch';
import type { Vec2 } from '../types';

/** Flat neutral pose at center. */
function flatPose(): Vec2[] {
  const lm: Vec2[] = [];
  for (let i = 0; i < 33; i++) lm.push({ x: 0.5, y: 0.5 });
  return lm;
}

function setArmsUp(lm: Vec2[]) {
  lm[11] = { x: 0.4, y: 0.4 };
  lm[12] = { x: 0.6, y: 0.4 };
  lm[15] = { x: 0.35, y: 0.2 };
  lm[16] = { x: 0.65, y: 0.2 };
  lm[23] = { x: 0.42, y: 0.7 };
  lm[24] = { x: 0.58, y: 0.7 };
}

describe('checkPose', () => {
  it('detects arms up', () => {
    const lm = flatPose();
    setArmsUp(lm);
    expect(checkPose('armsUp', lm)).toBe(true);
  });

  it('rejects arms up when wrists are low', () => {
    const lm = flatPose();
    lm[11] = { x: 0.4, y: 0.4 };
    lm[12] = { x: 0.6, y: 0.4 };
    lm[15] = { x: 0.35, y: 0.5 };
    lm[16] = { x: 0.65, y: 0.5 };
    lm[23] = { x: 0.42, y: 0.7 };
    lm[24] = { x: 0.58, y: 0.7 };
    expect(checkPose('armsUp', lm)).toBe(false);
  });
});
