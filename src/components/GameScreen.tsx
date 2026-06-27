import { useEffect, useRef, useState, type RefObject } from 'react';
import { useArcadeLoop } from '../hooks/useArcadeLoop';
import { useAuxTracking } from '../hooks/useAuxTracking';
import { useBackGesture, BACK_RING_C } from '../hooks/useBackGesture';
import { useArcadeStore } from '../store/arcadeStore';
import { audio } from '../engine/audio';
import { speech } from '../engine/speech';
import * as calibration from '../engine/calibration';
import {
  addHighScore,
  loadHighScores,
  type HighScore,
} from '../store/highScores';
import { GameCanvas } from './GameCanvas';
import { GameHud } from './GameHud';
import type { GameModule, HandPosition } from '../types';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;
const CALIBRATION_SECONDS = 5;

interface Props {
  module: GameModule;
  videoRef: RefObject<HTMLVideoElement | null>;
  handPositionRef: RefObject<HandPosition>;
  isLoading: boolean;
  error: string | null;
}

/** A single game's screen: canvas, HUD, and the ready/calibrate/game-over overlays. */
export function GameScreen({
  module,
  videoRef,
  handPositionRef,
  isLoading,
  error,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const backRingRef = useRef<SVGCircleElement>(null);
  const phase = useArcadeStore((s) => s.phase);

  useAuxTracking({
    videoRef,
    handPositionRef,
    mode: module.input,
    active: phase === 'playing' || phase === 'ready',
  });

  useArcadeLoop({
    module,
    canvasRef,
    handPositionRef,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const score = useArcadeStore((s) => s.hud.score);
  const muted = useArcadeStore((s) => s.muted);
  const start = useArcadeStore((s) => s.start);
  const calibrate = useArcadeStore((s) => s.calibrate);
  const selectGame = useArcadeStore((s) => s.selectGame);
  const openMenu = useArcadeStore((s) => s.openMenu);
  const toggleMute = useArcadeStore((s) => s.toggleMute);

  // Hold a finger at the top of the screen during play to return to the menu.
  useBackGesture({
    active: phase === 'playing',
    handPositionRef,
    backRef,
    ringRef: backRingRef,
    onTrigger: openMenu,
  });

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
        setBoard(addHighScore(module.id, score));
      }
    } else {
      submittedRef.current = false;
    }
  }, [phase, score, module.id]);

  // Calibration: record the finger range for a few seconds, then return to ready.
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
        selectGame(module.id); // back to this game's ready screen
      }
    }, 1000);
    return () => {
      clearInterval(id);
      calibration.finishRecording();
    };
  }, [phase, module.id, selectGame]);

  const onToggleMute = () => {
    const next = !muted;
    toggleMute();
    audio.setMuted(next);
    speech.setMuted(next);
  };

  const ctrlsDisabled = isLoading || !!error;
  const bestScores =
    phase === 'gameover' ? board.scores : loadHighScores(module.id);

  return (
    <>
      <GameCanvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

      {phase === 'playing' && <GameHud />}

      {/* Hold a finger up here to go back to the menu (hands-free) */}
      {phase === 'playing' && (
        <div className="back-gesture" ref={backRef} aria-hidden="true">
          <div className="bg-ring-wrap">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle className="bg-track" cx="20" cy="20" r="16" />
              <circle
                className="bg-ring"
                ref={backRingRef}
                cx="20"
                cy="20"
                r="16"
                strokeDasharray={BACK_RING_C}
                strokeDashoffset={BACK_RING_C}
              />
            </svg>
            <span className="bg-icon">↑</span>
          </div>
          <span className="bg-label">Hold for menu</span>
        </div>
      )}

      {phase === 'calibrating' && (
        <div className="overlay">
          <div className="panel">
            <h2>Calibrate</h2>
            <p className="how-to">
              Move your index finger to trace the rectangle you want to play
              in — reach the corners you're comfortable with.
            </p>
            <div className="countdown">{calibCountdown}</div>
            <button className="play-btn ghost" onClick={() => selectGame(module.id)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {(phase === 'ready' || phase === 'gameover') && (
        <div className="overlay">
          <div className="panel">
            {phase === 'gameover' ? (
              <>
                <h2>{module.category === 'learn' ? 'Great job! 🎉' : 'Game Over'}</h2>
                <p className="final-score">Score {score.toLocaleString()}</p>
                <HighScoreList scores={bestScores} rank={board.rank} />
                <div className="btn-row">
                  <button className="play-btn" onClick={start} disabled={ctrlsDisabled}>
                    Play Again
                  </button>
                  <button className="play-btn ghost" onClick={openMenu}>
                    Menu
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Ready?</h2>
                <p className="how-to">{module.howTo}</p>
                {module.legend && (
                  <div className="legend">
                    {module.legend.map((l) => (
                      <span key={l.text} className="legend-item">
                        <span className="pill" style={{ background: l.color }}>
                          {l.symbol}
                        </span>{' '}
                        {l.text}
                      </span>
                    ))}
                  </div>
                )}
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
                <button className="link-btn" onClick={openMenu}>
                  ← All games
                </button>
                <p className="cursor-hint">
                  👆 Or hover a button with your finger to select it
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

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
        </li>
      ))}
    </ol>
  );
}
