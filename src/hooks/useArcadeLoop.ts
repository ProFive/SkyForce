import { useEffect, type RefObject } from 'react';
import { audio } from '../engine/audio';
import { speech } from '../engine/speech';
import { useArcadeStore } from '../store/arcadeStore';
import type { GameInstance, GameModule, HandPosition, HudState } from '../types';

interface Options {
  module: GameModule;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  handPositionRef: RefObject<HandPosition>;
  width: number;
  height: number;
}

function hudEqual(a: HudState, b: HudState): boolean {
  if (a.score !== b.score || a.lives !== b.lives || a.level !== b.level)
    return false;
  const ab = a.badges ?? [];
  const bb = b.badges ?? [];
  if (ab.length !== bb.length) return false;
  for (let i = 0; i < ab.length; i++) {
    if (ab[i].key !== bb[i].key || ab[i].label !== bb[i].label) return false;
  }
  return true;
}

/**
 * Generic game loop for the arcade. A single requestAnimationFrame loop reads
 * `phase` from the store each frame (rather than subscribing), so it is robust
 * to React StrictMode's double-mount: a torn-down effect's loop stops via its
 * `alive` flag and never competes with the next one. The simulation advances at
 * a fixed 60Hz timestep regardless of refresh rate.
 */
export const useArcadeLoop = ({
  module,
  canvasRef,
  handPositionRef,
  width,
  height,
}: Options) => {
  useEffect(() => {
    const instance: GameInstance = module.create(width, height);
    instance.onGameOver = () => useArcadeStore.getState().setGameOver();
    instance.onSfx = (name) => audio.play(name);
    instance.onNote = (hz) => audio.playNote(hz);
    instance.onSpeak = (text) => speech.speak(text);

    const STEP_MS = 1000 / 60;
    const MAX_STEPS = 5;

    let alive = true;
    let rafId = 0;
    let playing = false;
    let frame = 0;
    let fpsLast = performance.now();
    let fpsFrames = 0;
    let lastTime = performance.now();
    let acc = 0;
    let lastHud: HudState = { score: -1 };

    const beginRun = () => {
      audio.resume(); // first run follows the Start button's user gesture
      instance.reset();
      frame = 0;
      fpsFrames = 0;
      fpsLast = performance.now();
      lastTime = performance.now();
      acc = 0;
      lastHud = { score: -1 };
      if (import.meta.env.DEV) {
        (window as unknown as { __game: GameInstance }).__game = instance;
      }
    };

    const tick = () => {
      if (!alive) return;
      const store = useArcadeStore.getState();

      if (store.phase === 'playing') {
        if (!playing) {
          playing = true;
          beginRun();
        }

        const now = performance.now();
        let delta = now - lastTime;
        lastTime = now;
        if (delta > 250) delta = 250;
        acc += delta;

        const hand = handPositionRef.current;
        let steps = 0;
        while (acc >= STEP_MS && steps < MAX_STEPS) {
          instance.update(hand);
          acc -= STEP_MS;
          steps++;
        }
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) instance.render(ctx);

        frame++;
        fpsFrames++;
        if (frame % 6 === 0) {
          const hud = instance.hud();
          if (!hudEqual(hud, lastHud)) {
            store.setHud(hud);
            lastHud = hud;
          }
          if (store.handTracked !== hand.available) {
            store.setHandTracked(hand.available);
          }
        }
        if (now - fpsLast >= 1000) {
          store.setFps(Math.round((fpsFrames * 1000) / (now - fpsLast)));
          fpsLast = now;
          fpsFrames = 0;
        }
      } else {
        // Not playing: leave the last frame on the canvas (overlays cover it)
        // and arm the next run.
        playing = false;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
    };
  }, [module, canvasRef, handPositionRef, width, height]);
};
