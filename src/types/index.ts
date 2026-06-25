export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  id: number;
  position: Vec2;
  velocity: Vec2;
  width: number;
  height: number;
}

export type WeaponMode = 'single' | 'spread';

export interface Player extends Entity {
  cooldown: number; // frames until next shot
  weapon: WeaponMode;
  rapidTimer: number; // frames of rapid-fire remaining
  spreadTimer: number; // frames of spread-shot remaining
  shieldTimer: number; // frames of shield remaining
}

export interface Bullet extends Entity {
  damage: number;
}

export interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  hitFlash: number; // frames of white-flash after being hit
  isBoss: boolean;
  fireTimer: number; // frames until next shot (bosses only)
  telegraph: boolean; // true in the wind-up window before a boss shot
}

export type PowerUpType = 'spread' | 'rapid' | 'shield' | 'life';

export interface PowerUp extends Entity {
  type: PowerUpType;
}

export interface Particle {
  position: Vec2;
  velocity: Vec2;
  life: number; // remaining frames
  maxLife: number;
  color: string;
  size: number;
}

export interface ScorePopup {
  position: Vec2;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

/** A short sound-effect event emitted by the simulation for the audio layer. */
export type SfxName =
  | 'shoot'
  | 'hit'
  | 'explosion'
  | 'powerup'
  | 'hurt'
  | 'level'
  | 'boss';

/** Normalized finger position (0..1 within the camera frame). */
export interface HandPosition {
  x: number;
  y: number;
  confidence: number;
  available: boolean;
}

// ---------------------------------------------------------------------------
// Arcade contracts — shared across every game so one shell can host them all.
// ---------------------------------------------------------------------------

/** Generic HUD data a game exposes each frame for the shared HUD to render. */
export interface HudState {
  score: number;
  lives?: number;
  maxLives?: number;
  level?: number;
  badges?: { key: string; label: string; color: string }[];
}

/**
 * A running game. The arcade loop drives `update`/`render` at a fixed timestep
 * and polls `hud()`; nothing here touches the DOM or React.
 */
export interface GameInstance {
  readonly width: number;
  readonly height: number;
  readonly score: number;
  readonly gameOver: boolean;
  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  reset(): void;
  update(hand: HandPosition): void;
  render(ctx: CanvasRenderingContext2D): void;
  hud(): HudState;
}

/** Static metadata + factory describing a game in the arcade menu. */
export interface GameModule {
  id: string;
  title: string;
  icon: string; // emoji shown on the menu card
  tagline: string; // short menu subtitle
  accent: string; // theme color (hex)
  howTo: string; // ready-screen instructions
  legend?: { symbol: string; color: string; text: string }[];
  create(width: number, height: number): GameInstance;
}
