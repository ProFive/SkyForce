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

export interface Player extends Entity {
  cooldown: number; // frames until next shot
}

export interface Bullet extends Entity {
  damage: number;
}

export interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  hitFlash: number; // frames of white-flash after being hit
}

export interface Particle {
  position: Vec2;
  velocity: Vec2;
  life: number; // remaining frames
  maxLife: number;
  color: string;
  size: number;
}

/** Normalized finger position (0..1 within the camera frame). */
export interface HandPosition {
  x: number;
  y: number;
  confidence: number;
  available: boolean;
}
