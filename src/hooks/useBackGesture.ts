import { useEffect, type RefObject } from 'react';
import type { HandPosition } from '../types';

const RING_R = 16;
export const BACK_RING_C = 2 * Math.PI * RING_R;

interface Options {
  active: boolean; // only while a game is being played
  handPositionRef: RefObject<HandPosition>;
  backRef: RefObject<HTMLDivElement | null>;
  ringRef: RefObject<SVGCircleElement | null>;
  onTrigger: () => void;
  zone?: number; // top fraction of the field that arms the gesture
  holdMs?: number; // how long to hold before it fires
}

/**
 * Hands-free "back to menu": when the tracked finger holds in the top band of
 * the play field for `holdMs`, fire `onTrigger`. Drives a progress ring
 * imperatively so it never re-renders React. Runs only while `active`.
 */
export function useBackGesture({
  active,
  handPositionRef,
  backRef,
  ringRef,
  onTrigger,
  zone = 0.08,
  holdMs = 1200,
}: Options) {
  useEffect(() => {
    const setRing = (p: number) => {
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(BACK_RING_C * (1 - p));
      }
    };
    const reset = () => {
      backRef.current?.classList.remove('arming');
      setRing(0);
    };

    if (!active) {
      reset();
      return;
    }

    let raf = 0;
    let alive = true;
    let dwell = 0;
    let last = performance.now();

    const loop = () => {
      if (!alive) return;
      const now = performance.now();
      const dt = now - last;
      last = now;

      const hp = handPositionRef.current;
      const inZone = hp.available && hp.y < zone;
      const el = backRef.current;

      if (inZone) {
        dwell += dt;
        el?.classList.add('arming');
        setRing(Math.min(1, dwell / holdMs));
        if (dwell >= holdMs) {
          reset();
          onTrigger();
          return; // stop; phase change will deactivate the effect
        }
      } else {
        dwell = 0;
        reset();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [active, handPositionRef, backRef, ringRef, onTrigger, zone, holdMs]);
}
