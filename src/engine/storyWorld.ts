import type { GameInstance, HandPosition, HudState, SfxName } from '../types';
import {
  type Particle,
  type Popup,
  clamp,
  dist,
  burst,
  popup,
  stepParticles,
  stepPopups,
} from './fx';
import { type StoryChoice, STORY_SCENES } from './storyContent';
import { MAX_LEVEL, levelGoal } from './levels';
import { drawStory } from './storyRenderer';

const TOUCH_COOLDOWN = 14;
const CHOICE_R = 58;

export interface StoryHotspot {
  id: number;
  x: number;
  y: number;
  r: number;
  choice: StoryChoice;
}

/**
 * Touch characters to hear an English story branch. Wrong picks are gentle;
 * correct choices advance the tale across 10 levels.
 */
export class StoryWorld implements GameInstance {
  width: number;
  height: number;

  hotspots: StoryHotspot[] = [];
  particles: Particle[] = [];
  popups: Popup[] = [];
  finger = { x: 0, y: 0, active: false };
  narration = '';
  level = 1;
  correct = 0;
  score = 0;
  shake = 0;
  gameOver = false;
  cooldown = 0;
  sceneEmoji = '🐰';

  private nextId = 1;

  onGameOver?: () => void;
  onSfx?: (name: SfxName) => void;
  onSpeak?: (text: string) => void;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.hotspots = [];
    this.particles = [];
    this.popups = [];
    this.finger = { x: this.width / 2, y: this.height / 2, active: false };
    this.level = 1;
    this.correct = 0;
    this.score = 0;
    this.shake = 0;
    this.gameOver = false;
    this.cooldown = 0;
    this.sceneEmoji = '🐰';
    this.enterScene();
  }

  private sceneIndex() {
    return clamp(this.level - 1, 0, STORY_SCENES.length - 1);
  }

  private enterScene(announce = '') {
    const scene = STORY_SCENES[this.sceneIndex()];
    this.narration = scene.narration;
    this.onSpeak?.(`${announce}${scene.narration}`);

    const count = scene.choices.length;
    const marginX = CHOICE_R + 28;
    const y = this.height * 0.58;
    const span = this.width - 2 * marginX;
    const step = count > 1 ? span / (count - 1) : 0;

    this.hotspots = scene.choices.map((choice, i) => ({
      id: this.nextId++,
      x: count === 1 ? this.width / 2 : marginX + i * step,
      y,
      r: CHOICE_R,
      choice,
    }));
  }

  private onTouch(choice: StoryChoice, x: number, y: number) {
    this.onSpeak?.(choice.speak);

    if (choice.correct) {
      this.score += 10;
      this.correct += 1;
      burst(this.particles, x, y, '#7dff9b', 16);
      popup(this.popups, x, y - 20, '✓', '#7dff9b');
      this.onSfx?.('powerup');

      if (this.correct >= levelGoal(this.level)) {
        if (this.level >= MAX_LEVEL) {
          this.gameOver = true;
          this.onSfx?.('level');
          this.onSpeak?.('The end! What a wonderful story!');
          this.onGameOver?.();
        } else {
          this.level += 1;
          this.correct = 0;
          this.onSfx?.('level');
          this.enterScene(`Chapter ${this.level}. `);
        }
      }
    } else {
      this.shake = Math.min(10, this.shake + 6);
      this.onSfx?.('hurt');
      this.onSpeak?.('Try the other choice!');
    }
  }

  update(hand: HandPosition) {
    if (this.gameOver) return;
    if (this.shake > 0) this.shake *= 0.85;
    if (this.cooldown > 0) this.cooldown--;

    this.finger.active = hand.available;
    if (hand.available) {
      this.finger.x = hand.x * this.width;
      this.finger.y = hand.y * this.height;

      if (this.cooldown === 0) {
        for (const h of this.hotspots) {
          if (dist(this.finger.x, this.finger.y, h.x, h.y) < h.r) {
            this.onTouch(h.choice, h.x, h.y);
            this.cooldown = TOUCH_COOLDOWN;
            break;
          }
        }
      }
    }

    this.particles = stepParticles(this.particles);
    this.popups = stepPopups(this.popups);
  }

  render(ctx: CanvasRenderingContext2D) {
    drawStory(ctx, this);
  }

  hud(): HudState {
    return {
      score: this.score,
      level: this.level,
      prompt: this.sceneEmoji,
      badges: [
        {
          key: 'progress',
          label: `${this.correct}/${levelGoal(this.level)}`,
          color: '#ffd25e',
        },
        { key: 'story', label: 'Story', color: '#da77f2' },
      ],
    };
  }
}
