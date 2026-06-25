import type { CSSProperties } from 'react';
import { useArcadeStore } from '../store/arcadeStore';
import { GAMES } from '../games/registry';
import { bestScore } from '../store/highScores';

/** The game-picker grid. Cards are buttons, so the finger cursor can select them. */
export function ArcadeMenu() {
  const selectGame = useArcadeStore((s) => s.selectGame);

  return (
    <div className="overlay menu-overlay">
      <div className="menu">
        <div className="menu-grid">
          {GAMES.map((g) => {
            const best = bestScore(g.id);
            return (
              <button
                key={g.id}
                className="game-card"
                style={{ '--accent': g.accent } as CSSProperties}
                onClick={() => selectGame(g.id)}
              >
                <span className="game-icon">{g.icon}</span>
                <span className="game-title">{g.title}</span>
                <span className="game-tagline">{g.tagline}</span>
                {best > 0 && (
                  <span className="game-best">Best {best.toLocaleString()}</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="cursor-hint">
          👆 Pick a game — tap, or hover with your finger
        </p>
      </div>
    </div>
  );
}
