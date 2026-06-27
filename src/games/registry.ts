import type { GameModule } from '../types';
import { skyforce } from './skyforce';
import { fruitslash } from './fruitslash';
import { catchit } from './catchit';
import { brickbreaker } from './brickbreaker';
import { dodgerunner } from './dodgerunner';
import { bugsquash } from './bugsquash';
import { catchletter } from './catchletter';
import { vocabcatch } from './vocabcatch';
import { touchanimal } from './touchanimal';
import { learncolors } from './learncolors';
import { countgame } from './countgame';
import { spellword } from './spellword';
import { wordmatch } from './wordmatch';

/** Every game in the arcade. Add a module here to surface it on the menu. */
export const GAMES: GameModule[] = [
  skyforce,
  fruitslash,
  catchit,
  brickbreaker,
  dodgerunner,
  bugsquash,
  catchletter,
  vocabcatch,
  touchanimal,
  learncolors,
  countgame,
  spellword,
  wordmatch,
];

export const getGame = (id: string | null): GameModule | undefined =>
  GAMES.find((g) => g.id === id);
