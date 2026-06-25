import { useEffect, type RefObject } from 'react';
import type { HandPosition } from '../types';

interface Options {
  /** Only drive the cursor while an overlay with buttons is showing. */
  active: boolean;
  handPositionRef: RefObject<HandPosition>;
  boardRef: RefObject<HTMLDivElement | null>;
  cursorRef: RefObject<HTMLDivElement | null>;
  ringRef: RefObject<SVGCircleElement | null>;
  dwellMs?: number;
}

const RING_R = 20;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

/**
 * Turns the tracked finger into a pointer that can "click" buttons by hovering
 * (dwelling) over them. Reads the finger position from a ref and drives the
 * cursor + progress ring imperatively, so it never triggers React re-renders.
 */
export function useFingerCursor({
  active,
  handPositionRef,
  boardRef,
  cursorRef,
  ringRef,
  dwellMs = 1100,
}: Options) {
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!active) {
      if (cursor) cursor.style.opacity = '0';
      return;
    }

    let raf = 0;
    let hovered: HTMLButtonElement | null = null;
    let dwell = 0;
    let last = performance.now();

    const setRing = (p: number) => {
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(
          RING_CIRCUMFERENCE * (1 - p)
        );
      }
    };

    const reset = (cur: HTMLDivElement | null) => {
      hovered = null;
      dwell = 0;
      setRing(0);
      cur?.classList.remove('over');
    };

    const loop = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;

      const hp = handPositionRef.current;
      const board = boardRef.current;
      const cur = cursorRef.current;

      if (cur && board && hp.available) {
        const r = board.getBoundingClientRect();
        const x = r.left + hp.x * r.width;
        const y = r.top + hp.y * r.height;
        cur.style.opacity = '1';
        cur.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

        // The cursor has pointer-events:none, so this finds the button beneath.
        const el = document.elementFromPoint(x, y);
        const btn = el
          ? (el.closest('button') as HTMLButtonElement | null)
          : null;

        if (btn && !btn.disabled) {
          if (btn === hovered) dwell += dt;
          else {
            hovered = btn;
            dwell = 0;
          }
          cur.classList.add('over');
          setRing(Math.min(1, dwell / dwellMs));
          if (dwell >= dwellMs) {
            reset(cur);
            btn.click();
          }
        } else {
          reset(cur);
        }
      } else if (cur) {
        cur.style.opacity = '0';
        reset(cur);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, handPositionRef, boardRef, cursorRef, ringRef, dwellMs]);
}
