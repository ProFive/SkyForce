import { useArcadeStore } from '../store/arcadeStore';

/** Renders whatever HUD state the running game exposes (score/level/lives/badges). */
export function GameHud() {
  const hud = useArcadeStore((s) => s.hud);
  const fps = useArcadeStore((s) => s.fps);
  const handTracked = useArcadeStore((s) => s.handTracked);

  const lives = hud.lives ?? 0;
  const maxLives = hud.maxLives ?? 0;

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-score">{hud.score.toLocaleString()}</div>
        {hud.level !== undefined && <div className="hud-level">LV {hud.level}</div>}
      </div>
      <div className="hud-row">
        {hud.lives !== undefined ? (
          <span className="hud-lives">
            {'❤'.repeat(Math.max(0, lives))}
            <span className="hud-lives-empty">
              {'♡'.repeat(Math.max(0, maxLives - lives))}
            </span>
          </span>
        ) : (
          <span />
        )}
        <span className="hud-fps">{fps} fps</span>
      </div>
      {hud.badges && hud.badges.length > 0 && (
        <div className="hud-powerups">
          {hud.badges.map((b) => (
            <span key={b.key} className="pill" style={{ background: b.color }}>
              {b.label}
            </span>
          ))}
        </div>
      )}
      {!handTracked && (
        <div className="hud-warn">✋ Show your hand to the camera</div>
      )}
    </div>
  );
}
