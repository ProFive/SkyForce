import { create } from 'zustand';

export type GamePhase = 'idle' | 'calibrating' | 'playing' | 'gameover';

/** Seconds remaining on each timed power-up, for the HUD. */
export interface PowerUpStatus {
  rapid: number;
  spread: number;
  shield: number;
}

/**
 * HUD-only state. The per-frame simulation (player, bullets, enemies) lives in
 * the game loop's refs and renders straight to canvas — keeping it out of React
 * avoids 60fps re-renders. Only values the UI needs to show live here.
 */
interface GameStore {
  phase: GamePhase;
  score: number;
  lives: number;
  level: number;
  fps: number;
  handTracked: boolean;
  cameraReady: boolean;
  muted: boolean;
  powerUps: PowerUpStatus;

  start: () => void;
  calibrate: () => void;
  setGameOver: () => void;
  reset: () => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setLevel: (level: number) => void;
  setFps: (fps: number) => void;
  setHandTracked: (tracked: boolean) => void;
  setCameraReady: (ready: boolean) => void;
  setPowerUps: (status: PowerUpStatus) => void;
  toggleMute: () => void;
}

const NO_POWERUPS: PowerUpStatus = { rapid: 0, spread: 0, shield: 0 };

export const useGameStore = create<GameStore>((set) => ({
  phase: 'idle',
  score: 0,
  lives: 3,
  level: 1,
  fps: 60,
  handTracked: false,
  cameraReady: false,
  muted: false,
  powerUps: NO_POWERUPS,

  start: () =>
    set({ phase: 'playing', score: 0, lives: 3, level: 1, powerUps: NO_POWERUPS }),
  calibrate: () => set({ phase: 'calibrating' }),
  setGameOver: () => set({ phase: 'gameover' }),
  reset: () => set({ phase: 'idle', score: 0, lives: 3, level: 1 }),
  setScore: (score) => set({ score }),
  setLives: (lives) => set({ lives }),
  setLevel: (level) => set({ level }),
  setFps: (fps) => set({ fps }),
  setHandTracked: (handTracked) => set({ handTracked }),
  setCameraReady: (cameraReady) => set({ cameraReady }),
  setPowerUps: (powerUps) => set({ powerUps }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
