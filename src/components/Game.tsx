import { useRef } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../store/gameStore';
import { GameCanvas } from './GameCanvas';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;

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
  const fps = useGameStore((s) => s.fps);
  const handTracked = useGameStore((s) => s.handTracked);
  const start = useGameStore((s) => s.start);

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
            <div className="hud-score">{score.toLocaleString()}</div>
            <div className="hud-row">
              <span className="hud-lives">
                {'❤'.repeat(Math.max(0, lives))}
                <span className="hud-lives-empty">
                  {'♡'.repeat(Math.max(0, 3 - lives))}
                </span>
              </span>
              <span className="hud-fps">{fps} fps</span>
            </div>
            {!handTracked && (
              <div className="hud-warn">✋ Show your hand to the camera</div>
            )}
          </div>
        )}

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
                  <button className="play-btn" onClick={start} disabled={isLoading || !!error}>
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h2>Ready?</h2>
                  <p className="how-to">
                    Move your index finger in front of the camera to fly.
                    Your ship fires automatically — destroy the enemies and
                    don't let them slip past.
                  </p>
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
