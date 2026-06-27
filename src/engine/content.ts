// Shared content packs for the kids' learning games. Data-driven so one
// mechanic (catch / touch) can teach many lessons just by swapping the pack.

export interface Item {
  en: string; // spoken/labelled in English
  vi: string; // Vietnamese gloss (for future bilingual UI)
  emoji?: string; // drawn for emoji-based games
  hex?: string; // drawn as a colored blob for color games
}

export const FRUITS: Item[] = [
  { en: 'apple', vi: 'táo', emoji: '🍎' },
  { en: 'banana', vi: 'chuối', emoji: '🍌' },
  { en: 'orange', vi: 'cam', emoji: '🍊' },
  { en: 'grapes', vi: 'nho', emoji: '🍇' },
  { en: 'strawberry', vi: 'dâu', emoji: '🍓' },
  { en: 'watermelon', vi: 'dưa hấu', emoji: '🍉' },
];

export const ANIMALS: Item[] = [
  { en: 'cat', vi: 'mèo', emoji: '🐱' },
  { en: 'dog', vi: 'chó', emoji: '🐶' },
  { en: 'rabbit', vi: 'thỏ', emoji: '🐰' },
  { en: 'bear', vi: 'gấu', emoji: '🐻' },
  { en: 'frog', vi: 'ếch', emoji: '🐸' },
  { en: 'duck', vi: 'vịt', emoji: '🦆' },
  { en: 'fish', vi: 'cá', emoji: '🐟' },
  { en: 'pig', vi: 'heo', emoji: '🐷' },
];

export const COLORS: Item[] = [
  { en: 'red', vi: 'đỏ', hex: '#ff5d5d' },
  { en: 'blue', vi: 'xanh dương', hex: '#5cd2ff' },
  { en: 'green', vi: 'xanh lá', hex: '#7dff9b' },
  { en: 'yellow', vi: 'vàng', hex: '#ffe45e' },
  { en: 'orange', vi: 'cam', hex: '#ffa53d' },
  { en: 'purple', vi: 'tím', hex: '#b07dff' },
];

export const pick = <T>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
