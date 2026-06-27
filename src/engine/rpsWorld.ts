import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import type { HandGesture } from './gestures';
import {
  type Particle,
  type Popup,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawRps } from './rpsRenderer';

export type RpsMove = 'rock' | 'paper' | 'scissors';

const MOVES: RpsMove[] = ['rock', 'paper', 'scissors'];
const EMOJI: Record<RpsMove, string> = { rock: '✊', paper: '✋', scissors: '✌️' };

const GESTURE_TO_MOVE: Partial<Record<HandGesture, RpsMove>> = {
  rock: 'rock',
  paper: 'paper',
  scissors: 'scissors',
};

function beats(a: RpsMove, b: RpsMove): boolean {
  return (
    (a === 'rock' && b === 'scissors') ||
    (a === 'paper' && b === 'rock') ||
    (a === 'scissors' && b === 'paper')
  );
}

function pickComputer(): RpsMove {
  return MOVES[(Math.random() * 3) | 0];
}

/**
 * Rock–paper–scissors vs the computer. Show your hand gesture to play.
 * No-fail — losses just nudge; win rounds to clear levels.
 */
export class RpsWorld implements GameInstance {
  width: number;
  height: number;

  computer: RpsMove = 'rock';
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  holdGesture: HandGesture = 'none';
  holdFrames = 0;
  resultText = '';

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.holdGesture = 'none';
    this.holdFrames = 0;
    this.resultText = '';
    this.newRound();
    this.onSpeak?.('Show rock, paper, or scissors to play!');
  }

  private newRound(announce = '') {
    this.computer = pickComputer();
    this.resultText = '';
    this.onSpeak?.(`${announce}I choose ${this.computer}. Your turn!`);
  }

  private resolve(player: RpsMove) {
    const cx = this.width / 2;
    const cy = this.height * 0.45;
    if (player === this.computer) {
      this.resultText = 'Tie!';
      popup(this.popups, cx, cy, '🤝', '#ffd25e');
      this.onSfx?.('hit');
      this.newRound();
    } else if (beats(player, this.computer)) {
      this.resultText = 'You win!';
      this.score += 10;
      this.correct += 1;
      burst(this.particles, cx, cy, '#7dff9b', 18);
      popup(this.popups, cx, cy, '✓', '#7dff9b');
      this.onSfx?.('powerup');
      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('Champion! Well done!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.newRound(`Level ${this.level}! `);
        }
      } else {
        this.newRound();
      }
    } else {
      this.resultText = 'Try again!';
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
      this.newRound();
    }
    this.holdFrames = 0;
    this.holdGesture = 'none';
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;
    }

    const g = hand.gesture ?? 'none';
    const move = GESTURE_TO_MOVE[g];
    if (move) {
      if (g === this.holdGesture) this.holdFrames++;
      else {
        this.holdGesture = g;
        this.holdFrames = 1;
      }
      if (this.holdFrames >= 14) this.resolve(move);
    } else {
      this.holdGesture = 'none';
      this.holdFrames = 0;
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawRps(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: `${EMOJI[this.computer]} vs You`,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
      ],
    };
  }
}

export { EMOJI as RPS_EMOJI };
