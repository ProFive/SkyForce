# Sky Force — Finger-Controlled Shooter

A web "Sky Force"-style airplane shooter you control with your **index finger**
in front of the webcam. Hand tracking runs fully client-side via MediaPipe.

## Play

```bash
npm install
npm run dev
```

## Develop

```bash
npm test        # vitest unit suite (game logic, calibration, high scores)
npm run build   # type-check + production build
```

CI runs the build + tests on every push and PR.

Open the local URL, click **Start**, allow camera access, and move your index
finger to fly. Your ship fires automatically — destroy the enemies and don't let
them slip past.

- Move finger left/right/up/down → ship follows
- Auto-fire bullets upward
- +10 per enemy (+30 for armored ones)
- Each enemy that hits you or escapes costs a life; 0 lives → Game Over

## Tech

- **React 18 + TypeScript** (Vite)
- **MediaPipe Tasks Vision** — hand landmark tracking
- **Zustand** — HUD-only state
- Canvas 2D rendering

## Architecture

The simulation is **decoupled from React**. A single `requestAnimationFrame`
loop owns all entity state and renders straight to canvas; only throttled HUD
values (score, lives, fps) flow into React. This keeps the game at ~60fps
without per-frame re-renders. The loop uses a **fixed timestep** (accumulator),
so gameplay speed is identical on 60/120/144 Hz displays. MediaPipe is
**code-split** into its own chunk so the UI paints before it finishes loading.

| Path | Role |
|------|------|
| `src/engine/gameWorld.ts` | Simulation: movement, auto-fire, spawning, collisions, particles, difficulty |
| `src/engine/renderer.ts` | Canvas drawing: starfield, ship, bullets, enemies, explosions |
| `src/hooks/useHandTracking.ts` | MediaPipe finger tracking → ref (no re-renders) |
| `src/hooks/useGameLoop.ts` | RAF loop, throttled HUD updates |
| `src/store/gameStore.ts` | HUD-only Zustand store (phase/score/lives/fps) |
| `src/components/Game.tsx` | Start / Playing / Game Over screens + HUD |

## Extending

`GameWorld` is the single place to add power-ups, new enemy types, levels, or
boss fights.
