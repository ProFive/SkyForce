import { useRef, useState, useEffect, useCallback } from 'react';
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

  // Full-screen toggle (works for both the menu and the game screen).
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

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
      <button
        className="fullscreen-toggle"
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit full screen' : 'Full screen'}
        aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
      >
        {isFullscreen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" />
          </svg>
        )}
      </button>

      <div className={`title-bar${phase === 'playing' ? ' title-bar--hidden' : ''}`}>
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
            videoRef={videoRef}
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
