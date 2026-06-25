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
