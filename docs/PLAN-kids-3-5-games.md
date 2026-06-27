# Plan — Recognition games for kids 3–5 (continue with Cursor)

This is a self-contained implementation plan. Follow it to add four **no-fail,
voice-guided** learning games for ages 3–5 to the existing hand-tracked arcade.
Everything you need is already in the codebase; these are reskins of existing
games plus a shared content layer.

Repo: `sky-force-game/` (Vite + React + TS). Live: https://profive.github.io/SkyForce/

## Games to build (all `category: 'learn'`)

1. **Bắt Đúng Vật** (Vocabulary Catch) — speaks "apple", child slides the basket
   to catch the matching 🍎. Vocabulary + pronunciation. *Template: `letterWorld.ts`.*
2. **Chạm Đúng Con Vật** (Touch the Animal) — shows a few items, "Touch the cat",
   child touches the right one. *Template: `squashWorld.ts`.*
3. **Học Màu Sắc** (Learn Colors) — "Find red", touch the matching colored blob.
   *Same engine as #2, content = colors (no emoji, draw colored circles).*
4. **Đếm Cùng Bé** (Count With Me) — "Catch 3 stars", child catches ⭐ while the
   game counts aloud "one, two, three". *Template: `letterWorld.ts` / catch-style.*

Design rules for this age group (IMPORTANT):
- **No reading required** — always speak the prompt in English via `onSpeak`.
- **No-fail** — wrong answers never cost a life; only a tiny shake + soft sound.
  Do NOT set `lives` in `hud()` (so no hearts show). Show progress via a badge.
- **Win after N correct** (set `gameOver = true`, call `onGameOver()`); the shell
  shows a kid-friendly "Great job! 🎉" end screen because `category === 'learn'`.
- Big targets, slow falls, generous hitboxes.

---

## Architecture you must reuse (do not re-invent)

Each game = **one world class** + **one renderer** + **one module**, registered once.

### Contracts — `src/types/index.ts`
```ts
interface HandPosition { x: number; y: number; confidence: number; available: boolean } // normalized 0..1, already calibrated
type SfxName = 'shoot'|'hit'|'explosion'|'powerup'|'hurt'|'level'|'boss'

interface HudState {
  score: number
  lives?: number; maxLives?: number; level?: number     // OMIT lives for no-fail games
  badges?: { key: string; label: string; color: string }[]
  prompt?: string                                        // big centered objective, e.g. the emoji/word/color
}

interface GameInstance {
  readonly width: number; readonly height: number
  readonly score: number; readonly gameOver: boolean
  onGameOver?: () => void
  onSfx?: (name: SfxName) => void
  onSpeak?: (text: string) => void                       // English TTS — wired by the loop
  reset(): void
  update(hand: HandPosition): void
  render(ctx: CanvasRenderingContext2D): void
  hud(): HudState
}

interface GameModule {
  id: string; title: string; icon: string; tagline: string; accent: string
  howTo: string; legend?: { symbol: string; color: string; text: string }[]
  category?: 'arcade' | 'learn'                           // set 'learn' for all four
  create(width: number, height: number): GameInstance
}
```

### The shell already handles (you get these for free)
- Camera-as-background, MediaPipe hand tracking, calibration.
- Generic HUD (`src/components/GameHud.tsx`) renders `hud()` incl. the big `prompt`.
- Per-game high scores (`src/store/highScores.ts`, keyed by module `id`).
- Finger-cursor menu, sound toggle, **hold-finger-at-top → back to menu** gesture.
- Fixed-timestep loop (`src/hooks/useArcadeLoop.ts`) that wires
  `onGameOver/onSfx/onSpeak`, pushes `hud()` to the store, and is StrictMode-safe.
- Menu grouping: modules with `category:'learn'` appear under **"Học · Learn"**;
  game-over panel shows **"Great job! 🎉"** for learn games.

### Shared helpers
- `src/engine/fx.ts`: `clamp`, `dist`, `burst(out,x,y,color,count,speed?)`,
  `popup(out,x,y,text,color,life?)`, `stepParticles`, `stepPopups`,
  `drawParticles(ctx,ps)`, `drawPopups(ctx,ps,font?)`, types `Particle`, `Popup`.
- `src/engine/speech.ts`: singleton `speech` with `speak(text, lang?)` and
  `setMuted`. You do NOT call it directly in worlds — call `this.onSpeak?.(text)`;
  the loop forwards it to `speech.speak`.
- `src/engine/audio.ts`: `audio.play(name)` (worlds use `this.onSfx?.(name)`).

### Gotchas (read before coding)
- `update(hand)`: `hand.x`/`hand.y` are 0..1. Multiply by `this.width`/`this.height`.
- `render(ctx)` MUST start with `ctx.clearRect(0,0,this.width,this.height)` — the
  canvas is transparent over the live camera. Delegate to a `drawX(ctx, world)` in
  `xRenderer.ts` that imports only `import type { XWorld } from './xWorld'`.
- Emoji: `ctx.font = `${size}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(emoji, x, y)`.
- During play the finger cursor is hidden; if the game needs a pointer (tap games),
  draw a crosshair at the finger like `squashRenderer.ts` does.
- Speak the target when it changes (in a `pickTarget()`), and call `pickTarget()`
  from `reset()`. On the constructor's `reset()`, `onSpeak` is undefined (safe);
  the loop sets `onSpeak` before it calls `reset()` again at play start.
- Canvas logical size is 480×720 (the loop passes these). Keep coordinates in that space.

---

## Step 0 — Shared content packs (build first)

Create `src/engine/content.ts`. Data-driven so one mechanic → many lessons.

```ts
export interface Item { en: string; vi: string; emoji?: string; hex?: string }

export const FRUITS: Item[] = [
  { en: 'apple', vi: 'táo', emoji: '🍎' },
  { en: 'banana', vi: 'chuối', emoji: '🍌' },
  { en: 'orange', vi: 'cam', emoji: '🍊' },
  { en: 'grapes', vi: 'nho', emoji: '🍇' },
  { en: 'strawberry', vi: 'dâu', emoji: '🍓' },
  { en: 'watermelon', vi: 'dưa hấu', emoji: '🍉' },
]

export const ANIMALS: Item[] = [
  { en: 'cat', vi: 'mèo', emoji: '🐱' },
  { en: 'dog', vi: 'chó', emoji: '🐶' },
  { en: 'rabbit', vi: 'thỏ', emoji: '🐰' },
  { en: 'bear', vi: 'gấu', emoji: '🐻' },
  { en: 'frog', vi: 'ếch', emoji: '🐸' },
  { en: 'duck', vi: 'vịt', emoji: '🦆' },
  { en: 'fish', vi: 'cá', emoji: '🐟' },
  { en: 'pig', vi: 'heo', emoji: '🐷' },
]

export const COLORS: Item[] = [
  { en: 'red', vi: 'đỏ', hex: '#ff5d5d' },
  { en: 'blue', vi: 'xanh dương', hex: '#5cd2ff' },
  { en: 'green', vi: 'xanh lá', hex: '#7dff9b' },
  { en: 'yellow', vi: 'vàng', hex: '#ffe45e' },
  { en: 'orange', vi: 'cam', hex: '#ffa53d' },
  { en: 'purple', vi: 'tím', hex: '#b07dff' },
]

export const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0]
```

Add a vitest later (`content.test.ts`) only if you add logic; pure data needs none.

---

## Game 1 — Bắt Đúng Vật (`vocabcatch`) — WORKED EXAMPLE

Copy `src/engine/letterWorld.ts` → `vocabWorld.ts` and adapt: items are emoji from
`FRUITS` (later switchable), target is an `Item`, speak the English word.

`src/engine/vocabWorld.ts` (skeleton — fill in from letterWorld):
```ts
import type { GameInstance, HandPosition, HudState, SfxName } from '../types'
import { type Particle, type Popup, clamp, burst, popup, stepParticles, stepPopups } from './fx'
import { type Item, FRUITS, pick } from './content'
import { drawVocab } from './vocabRenderer'

const GOAL = 8
const BASKET_W = 104, BASKET_H = 44, SMOOTH = 0.4

export interface FallItem { id: number; x: number; y: number; vy: number; r: number; item: Item }

export class VocabWorld implements GameInstance {
  width: number; height: number
  basket = { x: 0, y: 0, w: BASKET_W, h: BASKET_H }
  items: FallItem[] = []
  particles: Particle[] = []; popups: Popup[] = []
  pack: Item[] = FRUITS
  target: Item = FRUITS[0]
  correct = 0; score = 0; shake = 0; gameOver = false
  private nextId = 1; private spawnTimer = 0
  onGameOver?: () => void; onSfx?: (n: SfxName) => void; onSpeak?: (t: string) => void

  constructor(w: number, h: number) { this.width = w; this.height = h; this.reset() }

  reset() {
    this.basket = { x: this.width/2, y: this.height-90, w: BASKET_W, h: BASKET_H }
    this.items = []; this.particles = []; this.popups = []
    this.correct = 0; this.score = 0; this.shake = 0; this.gameOver = false; this.spawnTimer = 20
    this.pickTarget()
  }

  private pickTarget() {
    let next = this.target
    while (next === this.target) next = pick(this.pack)
    this.target = next
    this.onSpeak?.(`Catch the ${next.en}`)
  }

  private spawn() {
    const r = 26
    const item = Math.random() < 0.42 ? this.target : pick(this.pack)
    this.items.push({ id: this.nextId++, x: r+6 + Math.random()*(this.width-2*(r+6)), y: -r, vy: 1.9 + Math.random()*0.7, r, item })
  }

  update(hand: HandPosition) {
    if (this.gameOver) return
    if (this.shake > 0) this.shake *= 0.85
    if (hand.available) {
      this.basket.x += (hand.x*this.width - this.basket.x) * SMOOTH
      this.basket.y += (hand.y*this.height - this.basket.y) * SMOOTH * 0.6
    }
    this.basket.x = clamp(this.basket.x, this.basket.w/2, this.width - this.basket.w/2)
    this.basket.y = clamp(this.basket.y, this.height*0.45, this.height - 60)
    if (++this.spawnTimer >= 46) { this.spawnTimer = 0; this.spawn() }
    for (const it of this.items) it.y += it.vy
    const caught = new Set<number>()
    const rimY = this.basket.y - this.basket.h/2
    for (const it of this.items) {
      const inX = Math.abs(it.x - this.basket.x) < this.basket.w/2 + it.r*0.4
      const inY = it.y + it.r >= rimY && it.y <= this.basket.y + this.basket.h/2
      if (!inX || !inY) continue
      caught.add(it.id)
      if (it.item.en === this.target.en) {
        this.score += 10; this.correct += 1
        burst(this.particles, it.x, it.y, '#ffe45e', 16); popup(this.popups, it.x, it.y, '✓', '#7dff9b')
        if (this.correct >= GOAL) { this.gameOver = true; this.onSfx?.('level'); this.onSpeak?.('Well done!'); this.onGameOver?.() }
        else { this.onSfx?.('powerup'); this.pickTarget() }
        break
      } else { this.shake = Math.min(10, this.shake + 6); this.onSfx?.('hurt') } // gentle, no penalty
    }
    this.items = this.items.filter(it => !caught.has(it.id) && it.y - it.r < this.height)
    this.particles = stepParticles(this.particles); this.popups = stepPopups(this.popups)
  }

  render(ctx: CanvasRenderingContext2D) { drawVocab(ctx, this) }

  hud(): HudState {
    return { score: this.score, prompt: this.target.emoji ?? this.target.en,
      badges: [{ key: 'p', label: `${this.correct}/${GOAL}`, color: '#ffd25e' }] }
  }
}
```

`src/engine/vocabRenderer.ts`: mirror `letterRenderer.ts` but draw `it.item.emoji`
with `ctx.fillText` at `it.r*2` serif, and the 🧺 basket. `clearRect` first.

`src/games/vocabcatch.ts`:
```ts
import { VocabWorld } from '../engine/vocabWorld'
import type { GameModule } from '../types'
export const vocabcatch: GameModule = {
  id: 'vocabcatch', title: 'Catch the Word', icon: '🍎',
  tagline: 'Hear it, catch it — learn words', accent: '#ffd25e', category: 'learn',
  howTo: 'Listen to the word, then slide the basket to catch the matching picture. Catch 8 to win!',
  create: (w, h) => new VocabWorld(w, h),
}
```

Register in `src/games/registry.ts`: import + add to `GAMES`.

`src/engine/vocabWorld.test.ts` (vitest, deterministic — copy letterWorld.test.ts):
- catching the target item scores +10 and picks a new target
- catching a non-target does NOT score and does not end the game
- win (`gameOver`) after 8 correct
Use a helper that drops an item exactly on `world.basket` and calls `update(NO_HAND)`.

---

## Game 2 — Chạm Đúng Con Vật (`touchanimal`) — tap to select

Build a generic **`TouchWorld`** (reuse for #3) parameterized by a content pack and
a render mode (`'emoji' | 'color'`). Copy mechanics from `squashWorld.ts` but:
- Each **round** shows `CHOICES` (3–4) distinct items at spaced, non-overlapping
  positions; one is the `target`. No timeout penalty, no bombs.
- `hud().prompt` = target emoji (or, for colors, a small swatch label) and speak
  `Touch the ${target.en}`.
- Finger touches an item (`dist(finger, item) < r`): if it's the target → +10,
  praise, new round (`pickRound()` re-speaks). If wrong → gentle shake + soft sfx,
  round stays. Win after `GOAL` (e.g. 6) correct.
- Draw a finger **crosshair** (copy from `squashRenderer.ts`) since the cursor is hidden.

`src/engine/touchWorld.ts` outline:
```ts
export type TouchMode = 'emoji' | 'color'
export class TouchWorld implements GameInstance {
  constructor(w, h, private pack: Item[], private mode: TouchMode, private speakVerb = 'Touch the') {...}
  // state: choices: {id,x,y,r,item}[]; target: Item; finger {x,y,active}; correct; score; gameOver
  // pickRound(): choose target + (CHOICES-1) distinct others; place at non-overlapping spots; speak
  // update(hand): set finger; on contact with target -> score/new round; wrong -> gentle
  // hud(): { score, prompt: target.emoji ?? target.en, badges:[{label:`${correct}/${GOAL}`}] }
}
```
`src/engine/touchRenderer.ts`: `emoji` mode draws `item.emoji`; `color` mode draws a
filled circle `item.hex` with a glow; then the crosshair. `clearRect` first.

Modules:
- `src/games/touchanimal.ts` → `new TouchWorld(w,h, ANIMALS, 'emoji', 'Touch the')`,
  id `'touchanimal'`, title "Touch the Animal", icon '🐱', category 'learn'.

Test `touchWorld.test.ts`: target touch scores + new round; wrong touch no score;
win after GOAL. Drive by setting `world.choices` and calling `update(handAt(x,y))`.

---

## Game 3 — Học Màu Sắc (`learncolors`)

Reuse `TouchWorld` with `COLORS` and `mode:'color'`:
`src/games/learncolors.ts` → `new TouchWorld(w,h, COLORS, 'color', 'Find')`, id
`'learncolors'`, title "Learn Colors", icon '🎨', category 'learn'.
Prompt should read nicely: speak `Find ${target.en}` (e.g. "Find red"). The big HUD
`prompt` can be the color word; optionally tint it with `target.hex` (HUD prompt is
text only today — if you want a colored swatch, either keep the word or extend
`HudState.prompt` handling in `GameHud.tsx`). Keep it simple: prompt = `target.en`.

No new test file needed if `TouchWorld` is already covered, but add one round-trip
test with `COLORS` to be safe.

---

## Game 4 — Đếm Cùng Bé (`countgame`)

Catch-style (copy `vocabWorld`/`letterWorld`), but only ⭐ stars fall and the goal is
a **count**:
- `target` = a number 1..5. Prompt = `target` (big). Speak `Catch ${n} stars`.
- A running `caught` counter. Each star caught → `caught++`, speak the number word
  (`['one','two','three','four','five'][caught-1]`), small star burst.
- When `caught === target` → +score, praise, reset `caught=0`, pick new target.
- Win after `ROUNDS` (e.g. 5) completed targets. No-fail (missing stars is free).
- `hud()`: `{ score, prompt: String(target), badges:[{label:`${caught}/${target}`}] }`.

Files: `src/engine/countWorld.ts`, `countRenderer.ts` (draw ⭐ + 🧺 basket),
`src/games/countgame.ts` (id `'countgame'`, title "Count With Me", icon '🔢',
category 'learn'), and `countWorld.test.ts` (catch increments; reaching target
scores + resets; win after ROUNDS).

---

## File checklist (per game)
- [ ] `src/engine/<x>World.ts` — class implements `GameInstance`
- [ ] `src/engine/<x>Renderer.ts` — `draw<X>(ctx, world)`, `clearRect` first, `import type` only
- [ ] `src/games/<id>.ts` — `GameModule` with `category: 'learn'`
- [ ] add to `GAMES` in `src/games/registry.ts`
- [ ] `src/engine/<x>World.test.ts` — vitest, deterministic
- [ ] also: `src/engine/content.ts` once (Step 0)

## Verify & ship (run after each game, or once at the end)
```bash
cd sky-force-game
npm install            # first time only
npx tsc --noEmit       # type-check
npm test               # vitest — every world test must pass
npm run build          # tsc -b && vite build (must succeed)
npm run dev            # manual check at http://localhost:5173/SkyForce/
```
Commit + push to `main` → GitHub Actions runs **CI** (build+test) and **Deploy** to
GitHub Pages → live at https://profive.github.io/SkyForce/.

Manual-test caveat: `requestAnimationFrame` is paused when the tab is hidden, so the
game only animates while the tab is **foreground**. Verify by actually looking at the
window (or screenshots), not by reading state from background scripts. For logic
correctness, rely on the vitest suites.

## Recommended order
1. `content.ts` (Step 0).
2. `vocabcatch` (worked example above) — proves the learn-catch pattern end to end.
3. `TouchWorld` + `touchanimal`, then `learncolors` (reuses TouchWorld).
4. `countgame`.

## Definition of done
- 4 new modules visible under **Học · Learn** on the menu, each playable hands-free.
- Each speaks its prompt in English; wrong answers never end the game; win screen
  says "Great job! 🎉".
- `npx tsc --noEmit` clean, all vitest suites pass, `npm run build` succeeds, CI green.
