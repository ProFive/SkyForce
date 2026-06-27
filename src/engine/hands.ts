import type { HandPosition } from '../types';

export type HandSide = 'left' | 'right';

/** Collect up to two tracked hands, sorted left-to-right on screen. */
export function trackedHands(hand: HandPosition): { side: HandSide; hand: HandPosition }[] {
  const list: HandPosition[] = [];
  if (hand.available) list.push(hand);
  if (hand.other?.available) list.push(hand.other as HandPosition);
  if (list.length === 0) return [];
  if (list.length === 1) return [{ side: 'left', hand: list[0] }];
  const sorted = [...list].sort((a, b) => a.x - b.x);
  return [
    { side: 'left', hand: sorted[0] },
    { side: 'right', hand: sorted[1] },
  ];
}
