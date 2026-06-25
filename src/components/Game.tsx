import { useRef } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../store/gameStore';
import { audio } from '../engine/audio';
import { GameCanvas } from './GameCanvas';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;

const POWERUP_LABEL: Record<'rapid' | 'spread' | 'shield', string> = {
  rapid: 'R',
  spread: 'W',
  shield: 'S',
};

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, handPositionRef, isLoading, error } = useHandTracking();

  useGameLoop({
    canvasRef,
    handPositionRef,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const phase = useGameStore((s) => s.phase);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const fps = useGameStore((s) => s.fps);
  const handTracked = useGameStore((s) => s.handTracked);
  const muted = useGameStore((s) => s.muted);
  const powerUps = useGameStore((s) => s.powerUps);
  const start = useGameStore((s) => s.start);
  const toggleMute = useGameStore((s) => s.toggleMute);

  const onToggleMute = () => {
    const next = !muted;
    toggleMute();
    audio.setMuted(next);
  };

  const activePowerUps = (['spread', 'rapid', 'shield'] as const).filter(
    (k) => powerUps[k] > 0
  );

  return (
    <div className="stage">
      <div className="title-bar">
        <h1>SKY&nbsp;FORCE</h1>
        <span className="subtitle">finger-controlled flight</span>
      </div>

      <div className="board" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <GameCanvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

        {/* Live HUD */}
        {phase === 'playing' && (
          <div className="hud">
            <div className="hud-top">
              <div className="hud-score">{score.toLocaleString()}</div>
              <div className="hud-level">LV {level}</div>
            </div>
            <div className="hud-row">
              <span className="hud-lives">
                {'❤'.repeat(Math.max(0, lives))}
                <span className="hud-lives-empty">
                  {'♡'.repeat(Math.max(0, 5 - lives))}
                </span>
              </span>
              <span className="hud-fps">{fps} fps</span>
            </div>
            {activePowerUps.length > 0 && (
              <div className="hud-powerups">
                {activePowerUps.map((k) => (
                  <span key={k} className={`pill pill-${k}`}>
                    {POWERUP_LABEL[k]} {powerUps[k]}s
                  </span>
                ))}
              </div>
            )}
            {!handTracked && (
              <div className="hud-warn">✋ Show your hand to the camera</div>
            )}
          </div>
        )}

        {/* Mute toggle */}
        <button
          className="mute-btn"
          onClick={onToggleMute}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Camera preview thumbnail (mirrored) */}
        <video ref={videoRef} className="cam-preview" muted playsInline />

        {/* Overlays */}
        {phase !== 'playing' && (
          <div className="overlay">
            <div className="panel">
              {phase === 'gameover' ? (
                <>
                  <h2>Game Over</h2>
                  <p className="final-score">Score {score.toLocaleString()}</p>
                  <p className="final-level">Reached level {level}</p>
                  <button className="play-btn" onClick={start} disabled={isLoading || !!error}>
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h2>Ready?</h2>
                  <p className="how-to">
                    Move your index finger to fly. Your ship fires automatically.
                    Grab power-ups, clear each wave, and survive the boss every
                    5 levels.
                  </p>
                  <div className="legend">
                    <span className="pill pill-spread">W</span> spread
                    <span className="pill pill-rapid">R</span> rapid
                    <span className="pill pill-shield">S</span> shield
                    <span className="pill pill-life">+</span> life
                  </div>
                  {isLoading && <p className="status">Loading camera & model…</p>}
                  {error && <p className="status err">⚠ {error}</p>}
                  <button className="play-btn" onClick={start} disabled={isLoading || !!error}>
                    {isLoading ? 'Loading…' : 'Start'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
