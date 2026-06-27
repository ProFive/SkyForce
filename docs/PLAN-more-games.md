# Plan — More games (continue with Cursor)

A self-contained backlog + build plan for the next wave of hand-tracked games.
It builds on the existing arcade shell and the patterns in
[`docs/PLAN-kids-3-5-games.md`](./PLAN-kids-3-5-games.md) and
[`.cursor/rules/adding-games.mdc`](../.cursor/rules/adding-games.mdc).

Repo: `sky-force-game/` (Vite + React + TS). Live: https://profive.github.io/SkyForce/

Legend: 🟢 easy reskin · 🟡 needs a small new engine/data · 🔴 needs new MediaPipe
capability. **Strategy: build the shared engines first** — most games below are
thin reskins once the engine exists.

---

## What we already have (reuse, do not re-invent)

- **Contract**: `GameInstance` / `GameModule` / `HudState` in `src/types/index.ts`.
  Register one module in `src/games/registry.ts` → it shows on the menu.
- **Shell freebies**: camera background, MediaPipe hand tracking, calibration,
  generic HUD (`prompt`, `level`, `badges`), finger cursor, high scores,
  hold-finger-at-top → menu, fixed-timestep loop wiring `onSfx`/`onSpeak`/`onGameOver`.
- **Engines/worlds to clone**: `catchWorld.ts` (basket follows finger; good/bad +
  lives), `touchWorld.ts` (touch the correct option; modes `emoji`|`color`|`word`;
  **10-level progression** via `levels.ts`), `squashWorld.ts` (tap targets +
  crosshair), `fruitWorld.ts` (blade-trail slicing), `vocabWorld`/`countWorld`
  (basket-catch learning).
- **Helpers**: `src/engine/fx.ts` (`clamp,dist,burst,popup,step*/draw*`),
  `content.ts` (`FRUITS,ANIMALS,COLORS,pick`), `levels.ts`
  (`MAX_LEVEL,levelGoal`), `speech.ts` (`onSpeak`), `audio.ts` (`onSfx`).
- **Design rules for kids**: no-fail learning games omit `lives`, speak prompts via
  `onSpeak`, win after a goal → "Great job! 🎉". 480×720 logical space; `render`
  starts with `clearRect`.

---

## Phase 0 — Shared infrastructure (the multipliers)

Building these four pieces unlocks ~20 of the games below.

### 0.1 Content packs — extend `src/engine/content.ts`
Add data-only packs (no logic → no tests needed):

```ts
export interface Shape { en: string; vi: string; kind: 'circle'|'square'|'triangle'|'star'|'heart'; hex: string }
export const SHAPES: Shape[] = [/* circle/square/triangle/star/heart */]

// animal sounds reuse ANIMALS; add an optional sound field there:
//   { en:'cat', vi:'mèo', emoji:'🐱', sound:'meow' }
export interface Pair { a: Item; b: Item }           // opposites / synonyms
export const OPPOSITES: Pair[] = [/* hot↔cold, big↔small, up↔down, day↔night… */]

export interface Country { en: string; vi: string; flag: string }   // 🇻🇳 emoji
export const COUNTRIES: Country[] = [/* Vietnam, Japan, USA, France… */]

export interface QuizQ { q: string; options: string[]; answer: number; pack?: string }
export const QUIZZES: QuizQ[] = [/* science / body / nature banks */]
```

### 0.2 `QuizWorld` — generic "pick the right answer" engine 🟡
The single biggest multiplier. Generalizes `touchWorld` to a **question → 3–4
floating answers → touch (or slash) the correct one**. No-fail option for young kids,
scored/levelled for older kids.

```ts
export interface QuizItem { prompt: string; promptKind: 'text'|'emoji'|'clock'|'image'
  options: { label: string; kind: 'text'|'emoji'|'color'|'shape'|'flag'|'clock' }[]
  answer: number; speak?: string }

export class QuizWorld implements GameInstance {
  // takes a () => QuizItem generator + mode { selfail: boolean; goal: number }
  // reuses touchWorld placement/crosshair; renders answers per their `kind`
}
```
Unlocks: **Đố Vui Kiến Thức, Cờ & Quốc Gia, Xem Giờ, Trái/Đồng Nghĩa, Số Lớn/Nhỏ
(touch), Tìm Hình Khối, To/Nhỏ Hơn, Âm Thanh Con Vật, Đúng/Sai**.

### 0.3 `SortWorld` — two-basket catch 🟡
Reskin `catchWorld.ts` with **two baskets** (left/right, both follow X but split
the screen, or finger picks the nearer one). Items fall; route each to the correct
bin by category. Unlocks **Phân Loại Vào Rổ** and bin-based number games.

### 0.4 `MemoryWorld` — concentration grid 🟡
A grid of face-down cards; finger dwell/tap flips one, then a second; match keeps
them open. Unlocks **Ghép Đôi (Memory)** and **Ghép Hình ↔ Từ**.

### 0.5 MediaPipe capability layer (for all 🔴) 🔴
Today `useHandTracking.ts` exposes only landmark 8 (index tip) as a single
`HandPosition`. The 🔴 games need richer signals. Plan a **non-breaking extension**:

- Expose the full landmark set + a derived **gesture** on a new ref, e.g.
  `handsRef: { hands: { landmarks: Vec2[]; pinch: boolean; openFingers: number;
  gesture: 'rock'|'paper'|'scissors'|'thumbUp'|'thumbDown'|'none' }[] }`.
- Add finger-extended detection (compare tip vs pip joints) → `openFingers`,
  thumbs up/down, RPS classification; pinch = distance(thumb tip 4, index tip 8).
- For multi-hand: set `numHands: 2`. For pose/face: separate `PoseLandmarker` /
  `FaceLandmarker` tasks behind their own hooks, lazy-loaded.
- Keep `handPositionRef` (index tip) intact so every existing game keeps working.

---

## Age 3–5 — recognition, no reading required (`category: 'learn'`, no-fail)

| Game (id) | 🎯 | Engine / source | Mechanic | Content |
|---|---|---|---|---|
| **Ghép Đôi / Memory** (`memorymatch`) | 🟢 | `MemoryWorld` (0.4) | flip 2 matching cards | ANIMALS emoji |
| **Tìm Hình Khối** (`findshape`) | 🟢 | `QuizWorld`/`TouchWorld` shape mode | "Find the circle" → touch it | SHAPES (0.1) |
| **To Hơn / Nhỏ Hơn** (`biggersmaller`) | 🟢 | `TouchWorld` + size param | "Touch the bigger one" — same emoji, 2 sizes | any emoji |
| **Phân Loại Vào Rổ** (`sortbin`) | 🟢 | `SortWorld` (0.3) | fruit→fruit basket, animal→pen | FRUITS+ANIMALS |
| **Âm Thanh Con Vật** (`animalsound`) | 🟢 | `QuizWorld` audio prompt | "I say meow, who am I?" → touch 🐱 | ANIMALS + `sound` |
| **Bong Bóng Theo Thứ Tự** (`orderpop`) | 🟢 | `SquashWorld` variant | pop bubbles in 1‑2‑3 / A‑B‑C order | numbers/letters |
| **Tưới Cây / Nhân–Quả** (`growplant`) | 🟢 | `TouchWorld`, no win/lose | touch to water → flower grows | n/a (calm) |

Design: speak every prompt, big slow targets, wrong = gentle shake only. `biggersmaller`
adds a `sizeScale` to drawn items; `growplant` is a relaxation toy (no `gameOver`, or
win when fully grown).

---

## Age 6–10 — literacy / numeracy / knowledge

| Game (id) | 🎯 | Engine / source | Mechanic |
|---|---|---|---|
| **Phép Tính Rơi** (`mathcatch`) | 🟢 | `catchWorld` variant | show "3+4"; catch the falling **7** (distractor numbers fall too) |
| **Ghép Hình ↔ Từ** (`memoword`) | 🟢 | `MemoryWorld` (0.4) | match picture card ↔ English word card |
| **Số Lớn/Nhỏ, Chẵn/Lẻ** (`numberhunt`) | 🟢 | `catchWorld`/`QuizWorld` | "Catch even numbers" / "> 5" |
| **Xem Giờ / Tell the Time** (`telltime`) | 🟡 | `QuizWorld` clock mode | "It's 3 o'clock" → touch the right clock face (canvas-drawn) |
| **Đố Vui Kiến Thức / Quiz** (`quiz`) | 🟡 | `QuizWorld` (0.2) | question + 3–4 answers; science/body/nature banks |
| **Cờ & Quốc Gia** (`flags`) | 🟡 | `QuizWorld` flag mode | "Find the flag of Vietnam" → touch 🇻🇳 |
| **Trái/Đồng Nghĩa** (`opposites`) | 🟡 | `QuizWorld`/`TouchWorld` | "hot ↔ ?" → touch "cold" |
| **Đàn Phím Đơn Giản** (`keys`) | 🟡 | new `KeysWorld` + `audio` synth | touch lit keys to play Twinkle Twinkle |

Math/number games can be scored with the 10-level curve (`levels.ts`). Quiz-family games
share `QuizWorld`; only the **generator + render kinds** differ. `telltime` needs a small
`drawClock(ctx,h,m)` helper; `keys` needs note tones in `audio.ts` (extend the synth).

---

## Advanced — need new MediaPipe capability (Phase 0.5 first)

| Game (id) | 🎯 | Needs | Mechanic |
|---|---|---|---|
| **Oẳn Tù Tì / RPS** (`rps`) | 🔴 | gesture classify | show rock/paper/scissors hand vs the computer |
| **Pinch Kéo–Thả** (`pinchpuzzle`) | 🔴 | pinch (thumb+index) | pinch to grab & drop puzzle/word tiles → unlocks a whole puzzle genre |
| **Đúng/Sai 👍👎** (`thumbquiz`) | 🔴 | thumb up/down | answer `QuizWorld` true/false by thumbs |
| **Hai Tay / Two-hand** (`twohand`) | 🔴 | `numHands: 2` | clap to the beat / keep balance / tug-of-war |
| **Đa Người Chơi** (`versus`) | 🔴 | two-hand | 2 kids, 1 hand each — who catches the target first |
| **Vận Động Theo Tư Thế / Pose** (`posedance`) | 🔴 | `PoseLandmarker` | copy/dance the shown pose (physical activity) |
| **Điều Khiển Bằng Đầu** (`headsteer`) | 🔴 | `FaceLandmarker` | tilt head to steer — accessibility for kids who can't use hands well |
| **Kể Chuyện Tương Tác** (`storytime`) | 🟡 | touch + speech + content | touch characters to hear an English story, branch the path |

Note `thumbquiz`/`rps` reuse `QuizWorld`/a simple matcher once the gesture layer (0.5)
exists. `storytime` is 🟡 (no new MediaPipe) but needs an authored branching content file.

---

## Recommended build order

1. **Phase 0.1 content** + **0.2 `QuizWorld`** → immediately ship `findshape`,
   `animalsound`, `quiz`, `flags`, `opposites`, `numberhunt` (touch), `telltime`.
2. **0.3 `SortWorld`** → `sortbin`. **catch variants** → `mathcatch`, `numberhunt` (catch).
3. **0.4 `MemoryWorld`** → `memorymatch`, `memoword`.
4. Toys/extras: `biggersmaller`, `orderpop`, `growplant`, `keys`, `storytime`.
5. **0.5 MediaPipe layer**, then 🔴 in order: `thumbquiz` → `rps` → `pinchpuzzle`
   → `twohand`/`versus` → `posedance`/`headsteer`.

Each game ships independently behind the same `GameModule` contract, so they can be
merged one PR at a time.

---

## Per-game checklist (every game)

- [ ] `src/engine/<x>World.ts` — `class XWorld implements GameInstance` (480×720 space)
- [ ] `src/engine/<x>Renderer.ts` — `draw<X>(ctx, world)`, `clearRect` first, `import type` only
- [ ] `src/games/<id>.ts` — `GameModule` (`category:'learn'` for kid games)
- [ ] add to `GAMES` in `src/games/registry.ts`
- [ ] `src/engine/<x>World.test.ts` — deterministic vitest (drive `update(hand)`, assert public fields)
- [ ] shared data once in `src/engine/content.ts`

## Verify & ship
```bash
cd sky-force-game
npx tsc --noEmit       # type-check
npm test               # vitest — every world test must pass
npm run build          # tsc -b && vite build
npm run dev            # manual check at http://localhost:5173/SkyForce/
```
Open a PR per game (or per engine + its first game); merge to `main` → GitHub Actions
builds + deploys to Pages.

## Definition of done
- New modules appear under **Games** / **Học · Learn**, each playable hands-free.
- Kid games are no-fail and speak prompts; older games may score/level.
- `tsc` clean, vitest green, `npm run build` succeeds, CI green.
- 🔴 games only after the Phase 0.5 capability layer lands (and keep
  `handPositionRef` working so existing games are unaffected).
