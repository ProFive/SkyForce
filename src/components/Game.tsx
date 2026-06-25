import { useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { useGameLoop } from '../hooks/useGameLoop';
import {
  useFingerCursor,
  RING_CIRCUMFERENCE,
} from '../hooks/useFingerCursor';
import { useGameStore } from '../store/gameStore';
import { audio } from '../engine/audio';
import * as calibration from '../engine/calibration';
import { addHighScore, loadHighScores, type HighScore } from '../store/highScores';
import { GameCanvas } from './GameCanvas';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;
const CALIBRATION_SECONDS = 5;

const POWERUP_LABEL: Record<'rapid' | 'spread' | 'shield', string> = {
  rapid: 'R',
  spread: 'W',
  shield: 'S',
};

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
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
  const calibrate = useGameStore((s) => s.calibrate);
  const reset = useGameStore((s) => s.reset);
  const toggleMute = useGameStore((s) => s.toggleMute);

  const [board, setBoard] = useState<{ scores: HighScore[]; rank: number }>({
    scores: [],
    rank: -1,
  });
  const [calibCountdown, setCalibCountdown] = useState(0);

  // Record a high score exactly once per game-over transition.
  const submittedRef = useRef(false);
  useEffect(() => {
    if (phase === 'gameover') {
      if (!submittedRef.current) {
        submittedRef.current = true;
        setBoard(addHighScore(score, level));
      }
    } else {
      submittedRef.current = false;
    }
  }, [phase, score, level]);

  // Calibration: record the finger's range for a few seconds, then save.
  useEffect(() => {
    if (phase !== 'calibrating') return;
    calibration.beginRecording();
    let remaining = CALIBRATION_SECONDS;
    setCalibCountdown(remaining);
    const id = setInterval(() => {
      remaining -= 1;
      setCalibCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        calibration.finishRecording();
        reset();
      }
    }, 1000);
    return () => {
      clearInterval(id);
      calibration.finishRecording();
    };
  }, [phase, reset]);

  const onToggleMute = () => {
    const next = !muted;
    toggleMute();
    audio.setMuted(next);
  };

  // Let the finger drive the menu buttons on the start / game-over overlays.
  const cursorActive = phase === 'idle' || phase === 'gameover';
  useFingerCursor({
    active: cursorActive,
    handPositionRef,
    boardRef,
    cursorRef,
    ringRef,
  });

  const activePowerUps = (['spread', 'rapid', 'shield'] as const).filter(
    (k) => powerUps[k] > 0
  );
  const ctrlsDisabled = isLoading || !!error;
  const bestScores = phase === 'gameover' ? board.scores : loadHighScores();

  return (
    <div className="stage">
      <div className="title-bar">
        <h1>SKY&nbsp;FORCE</h1>
        <span className="subtitle">finger-controlled flight</span>
      </div>

      <div
        ref={boardRef}
        className={`board${phase === 'playing' ? ' playing' : ''}`}
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
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

        {/* Camera preview thumbnail (mirrored) */}
        <video ref={videoRef} className="cam-preview" muted playsInline />

        {/* Calibration overlay */}
        {phase === 'calibrating' && (
          <div className="overlay">
            <div className="panel">
              <h2>Calibrate</h2>
              <p className="how-to">
                Move your index finger to trace the rectangle you want to play
                in — reach the corners you're comfortable with.
              </p>
              <div className="countdown">{calibCountdown}</div>
              <button className="play-btn ghost" onClick={reset}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Start / Game Over overlays */}
        {(phase === 'idle' || phase === 'gameover') && (
          <div className="overlay">
            <div className="panel">
              {phase === 'gameover' ? (
                <>
                  <h2>Game Over</h2>
                  <p className="final-score">Score {score.toLocaleString()}</p>
                  <p className="final-level">Reached level {level}</p>
                  <HighScoreList scores={bestScores} rank={board.rank} />
                  <button className="play-btn" onClick={start} disabled={ctrlsDisabled}>
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
                  {bestScores.length > 0 && (
                    <HighScoreList scores={bestScores} rank={-1} />
                  )}
                  {isLoading && <p className="status">Loading camera & model…</p>}
                  {error && <p className="status err">⚠ {error}</p>}
                  <button
                    className="sound-toggle"
                    onClick={onToggleMute}
                    aria-pressed={!muted}
                  >
                    {muted ? '🔇 Sound off' : '🔊 Sound on'}
                  </button>
                  <div className="btn-row">
                    <button className="play-btn" onClick={start} disabled={ctrlsDisabled}>
                      {isLoading ? 'Loading…' : 'Start'}
                    </button>
                    <button
                      className="play-btn ghost"
                      onClick={calibrate}
                      disabled={ctrlsDisabled}
                    >
                      Calibrate
                    </button>
                  </div>
                  <p className="cursor-hint">
                    👆 Or hover a button with your finger to select it
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Finger pointer for hands-free menu control (hover to click) */}
        <div ref={cursorRef} className="finger-cursor" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle className="fc-track" cx="24" cy="24" r="20" />
            <circle
              ref={ringRef}
              className="fc-ring"
              cx="24"
              cy="24"
              r="20"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
            />
          </svg>
          <span className="fc-dot" />
        </div>
      </div>
    </div>
  );
};

function HighScoreList({
  scores,
  rank,
}: {
  scores: HighScore[];
  rank: number;
}) {
  if (scores.length === 0) return null;
  return (
    <ol className="scores">
      {scores.map((s, i) => (
        <li key={s.date} className={i === rank ? 'scores-new' : undefined}>
          <span className="scores-rank">{i + 1}</span>
          <span className="scores-pts">{s.score.toLocaleString()}</span>
          <span className="scores-lv">LV {s.level}</span>
        </li>
      ))}
    </ol>
  );
}
