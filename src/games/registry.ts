import type { GameModule } from '../types';
import { skyforce } from './skyforce';
import { fruitslash } from './fruitslash';
import { catchit } from './catchit';
import { brickbreaker } from './brickbreaker';
import { dodgerunner } from './dodgerunner';
import { bugsquash } from './bugsquash';
import { catchletter } from './catchletter';

/** Every game in the arcade. Add a module here to surface it on the menu. */
export const GAMES: GameModule[] = [
  skyforce,
  fruitslash,
  catchit,
  brickbreaker,
  dodgerunner,
  bugsquash,
  catchletter,
];

export const getGame = (id: string | null): GameModule | undefined =>
  GAMES.find((g) => g.id === id);
