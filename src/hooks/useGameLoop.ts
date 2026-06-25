import { useEffect, useRef, type RefObject } from 'react';
import { GameWorld } from '../engine/gameWorld';
import { render } from '../engine/renderer';
import { useGameStore } from '../store/gameStore';
import type { HandPosition } from '../types';

interface Options {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  handPositionRef: RefObject<HandPosition>;
  width: number;
  height: number;
}

/**
 * Owns the requestAnimationFrame simulation. The loop reads the finger position
 * from a ref and pushes only throttled HUD values into Zustand, so React never
 * re-renders per frame. Starting/stopping is driven by the store `phase`.
 */
export const useGameLoop = ({
  canvasRef,
  handPositionRef,
  width,
  height,
}: Options) => {
  const worldRef = useRef<GameWorld | null>(null);

  useEffect(() => {
    const world = new GameWorld(width, height);
    world.onGameOver = () => useGameStore.getState().setGameOver();
    worldRef.current = world;

    let rafId = 0;
    let running = false;
    let frame = 0;
    let fpsLast = performance.now();
    let fpsFrames = 0;

    const tick = () => {
      const ctx = canvasRef.current?.getContext('2d');
      const hand = handPositionRef.current;

      world.update(hand);
      if (ctx) render(ctx, world);

      // Throttle HUD writes to avoid frequent React re-renders.
      frame++;
      fpsFrames++;
      const store = useGameStore.getState();
      if (frame % 6 === 0) {
        if (store.score !== world.score) store.setScore(world.score);
        if (store.lives !== Math.max(0, world.lives)) {
          store.setLives(Math.max(0, world.lives));
        }
        if (store.handTracked !== hand.available) {
          store.setHandTracked(hand.available);
        }
      }
      const now = performance.now();
      if (now - fpsLast >= 1000) {
        store.setFps(Math.round((fpsFrames * 1000) / (now - fpsLast)));
        fpsLast = now;
        fpsFrames = 0;
      }

      if (running) rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      world.reset();
      running = true;
      frame = 0;
      fpsLast = performance.now();
      fpsFrames = 0;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // React to phase changes from the store.
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.phase === prev.phase) return;
      if (state.phase === 'playing') start();
      else stop();
    });

    // If we mounted already in the playing phase, kick it off.
    if (useGameStore.getState().phase === 'playing') start();

    return () => {
      stop();
      unsub();
      worldRef.current = null;
    };
  }, [canvasRef, handPositionRef, width, height]);

  return worldRef;
};
