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
import { findshape } from './findshape';
import { animalsound } from './animalsound';
import { quiz } from './quiz';
import { sortbin } from './sortbin';
import { mathcatch } from './mathcatch';
import { memorymatch } from './memorymatch';
import { memoword } from './memoword';
import { biggersmaller } from './biggersmaller';
import { orderpop } from './orderpop';
import { growplant } from './growplant';
import { numberhunt } from './numberhunt';
import { flags } from './flags';
import { opposites } from './opposites';
import { telltime } from './telltime';
import { thumbquiz } from './thumbquiz';
import { rps } from './rps';
import { keys } from './keys';
import { storytime } from './storytime';
import { pinchpuzzle } from './pinchpuzzle';

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
  findshape,
  animalsound,
  quiz,
  sortbin,
  mathcatch,
  memorymatch,
  memoword,
  biggersmaller,
  orderpop,
  growplant,
  numberhunt,
  flags,
  opposites,
  telltime,
  thumbquiz,
  rps,
  keys,
  storytime,
  pinchpuzzle,
];

export const getGame = (id: string | null): GameModule | undefined =>
  GAMES.find((g) => g.id === id);
