import type { GameModule } from '../types';
import { skyforce } from './skyforce';
import { fruitslash } from './fruitslash';

/** Every game in the arcade. Add a module here to surface it on the menu. */
export const GAMES: GameModule[] = [skyforce, fruitslash];

export const getGame = (id: string | null): GameModule | undefined =>
  GAMES.find((g) => g.id === id);
