import type { CSSProperties } from 'react';
import { useArcadeStore } from '../store/arcadeStore';
import { GAMES } from '../games/registry';
import { bestScore } from '../store/highScores';
import type { GameModule, LearnGroup } from '../types';

/** The game-picker grid. Cards are buttons, so the finger cursor can select them. */
export function ArcadeMenu() {
  const selectGame = useArcadeStore((s) => s.selectGame);

  const arcade = GAMES.filter((g) => (g.category ?? 'arcade') === 'arcade');
  const learn = GAMES.filter((g) => g.category === 'learn');
  const inGroup = (group: LearnGroup) =>
    learn.filter((g) => (g.group ?? 'age3to5') === group);

  const Grid = ({ games }: { games: GameModule[] }) => (
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
  );

  const Section = ({ title, games }: { title: string; games: GameModule[] }) =>
    games.length === 0 ? null : (
      <div className="menu-section">
        <h2 className="menu-heading">{title}</h2>
        <Grid games={games} />
      </div>
    );

  const SubSection = ({ title, games }: { title: string; games: GameModule[] }) =>
    games.length === 0 ? null : (
      <div className="menu-subsection">
        <h3 className="menu-subheading">{title}</h3>
        <Grid games={games} />
      </div>
    );

  return (
    <div className="overlay menu-overlay">
      <div className="menu">
        <Section title="Games" games={arcade} />
        {learn.length > 0 && (
          <div className="menu-section">
            <h2 className="menu-heading">Học · Learn</h2>
            <SubSection title="Cho bé 3–5 tuổi" games={inGroup('age3to5')} />
            <SubSection title="Cho bé 6–10 tuổi" games={inGroup('age6to10')} />
            <SubSection title="Nâng cao hơn" games={inGroup('advanced')} />
          </div>
        )}
        <p className="cursor-hint">
          👆 Pick a game — tap, or hover with your finger
        </p>
      </div>
    </div>
  );
}
