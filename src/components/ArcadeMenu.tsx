import type { CSSProperties } from 'react';
import { useArcadeStore } from '../store/arcadeStore';
import { GAMES } from '../games/registry';
import { bestScore } from '../store/highScores';
import type { GameModule } from '../types';

/** The game-picker grid. Cards are buttons, so the finger cursor can select them. */
export function ArcadeMenu() {
  const selectGame = useArcadeStore((s) => s.selectGame);

  const arcade = GAMES.filter((g) => (g.category ?? 'arcade') === 'arcade');
  const learn = GAMES.filter((g) => g.category === 'learn');

  const Section = ({ title, games }: { title: string; games: GameModule[] }) =>
    games.length === 0 ? null : (
      <div className="menu-section">
        <h2 className="menu-heading">{title}</h2>
        <div className="menu-grid">
          {games.map((g) => {
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
      </div>
    );

  return (
    <div className="overlay menu-overlay">
      <div className="menu">
        <Section title="Games" games={arcade} />
        <Section title="Học · Learn" games={learn} />
        <p className="cursor-hint">
          👆 Pick a game — tap, or hover with your finger
        </p>
      </div>
    </div>
  );
}
