import { useRef } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import {
  useFingerCursor,
  RING_CIRCUMFERENCE,
} from '../hooks/useFingerCursor';
import { useArcadeStore } from '../store/arcadeStore';
import { getGame } from '../games/registry';
import { ArcadeMenu } from './ArcadeMenu';
import { GameScreen } from './GameScreen';

/**
 * Arcade shell: owns the camera, hand tracking, and finger cursor that every
 * game shares, and routes between the game menu and the selected game's screen.
 */
export function Arcade() {
  const boardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const { videoRef, handPositionRef, isLoading, error } = useHandTracking();

  const phase = useArcadeStore((s) => s.phase);
  const gameId = useArcadeStore((s) => s.gameId);
  const game = getGame(gameId);
  const showGame = !!game && phase !== 'menu';

  // The finger drives the menu cards and the ready / game-over buttons.
  useFingerCursor({
    active: phase === 'menu' || phase === 'ready' || phase === 'gameover',
    handPositionRef,
    boardRef,
    cursorRef,
    ringRef,
  });

  return (
    <div className="stage">
      <div className="title-bar">
        <h1>{showGame ? game!.title : 'ARCADE'}</h1>
        <span className="subtitle">
          {showGame ? game!.tagline : 'hand-controlled games'}
        </span>
      </div>

      <div
        ref={boardRef}
        className={`board${phase === 'playing' ? ' playing' : ''}`}
      >
        {/* Live camera fills the board as the background, for menu and games */}
        <video ref={videoRef} className="cam-bg" muted playsInline />
        <div className="cam-scrim" aria-hidden="true" />

        {showGame ? (
          <GameScreen
            module={game!}
            handPositionRef={handPositionRef}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <ArcadeMenu />
        )}

        {/* Shared finger pointer (hover to click) */}
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
}
