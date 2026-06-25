import { create } from 'zustand';

export type GamePhase = 'idle' | 'playing' | 'gameover';

/**
 * HUD-only state. The per-frame simulation (player, bullets, enemies) lives in
 * the game loop's refs and renders straight to canvas — keeping it out of React
 * avoids 60fps re-renders. Only values the UI needs to show live here.
 */
interface GameStore {
  phase: GamePhase;
  score: number;
  lives: number;
  fps: number;
  handTracked: boolean;
  cameraReady: boolean;

  start: () => void;
  setGameOver: () => void;
  reset: () => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setFps: (fps: number) => void;
  setHandTracked: (tracked: boolean) => void;
  setCameraReady: (ready: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'idle',
  score: 0,
  lives: 3,
  fps: 60,
  handTracked: false,
  cameraReady: false,

  start: () => set({ phase: 'playing', score: 0, lives: 3 }),
  setGameOver: () => set({ phase: 'gameover' }),
  reset: () => set({ phase: 'idle', score: 0, lives: 3 }),
  setScore: (score) => set({ score }),
  setLives: (lives) => set({ lives }),
  setFps: (fps) => set({ fps }),
  setHandTracked: (handTracked) => set({ handTracked }),
  setCameraReady: (cameraReady) => set({ cameraReady }),
}));
