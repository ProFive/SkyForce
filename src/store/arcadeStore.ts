import { create } from 'zustand';
import type { HudState } from '../types';

export type Phase = 'menu' | 'ready' | 'calibrating' | 'playing' | 'gameover';

const EMPTY_HUD: HudState = { score: 0 };

/**
 * Shell-wide UI state shared by every game. Per-frame simulation lives in the
 * game instance (driven by the arcade loop); only throttled HUD values land
 * here, so React never re-renders at 60fps.
 */
interface ArcadeStore {
  phase: Phase;
  gameId: string | null;
  hud: HudState;
  fps: number;
  handTracked: boolean;
  cameraReady: boolean;
  muted: boolean;

  openMenu: () => void;
  selectGame: (id: string) => void;
  start: () => void;
  calibrate: () => void;
  setGameOver: () => void;
  setHud: (hud: HudState) => void;
  setFps: (fps: number) => void;
  setHandTracked: (tracked: boolean) => void;
  setCameraReady: (ready: boolean) => void;
  toggleMute: () => void;
}

export const useArcadeStore = create<ArcadeStore>((set) => ({
  phase: 'menu',
  gameId: null,
  hud: EMPTY_HUD,
  fps: 60,
  handTracked: false,
  cameraReady: false,
  muted: false,

  openMenu: () => set({ phase: 'menu', hud: EMPTY_HUD }),
  selectGame: (id) => set({ gameId: id, phase: 'ready', hud: EMPTY_HUD }),
  start: () => set({ phase: 'playing', hud: EMPTY_HUD }),
  calibrate: () => set({ phase: 'calibrating' }),
  setGameOver: () => set({ phase: 'gameover' }),
  setHud: (hud) => set({ hud }),
  setFps: (fps) => set({ fps }),
  setHandTracked: (handTracked) => set({ handTracked }),
  setCameraReady: (cameraReady) => set({ cameraReady }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
