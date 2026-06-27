/** One octave of white keys (C4–C5) for the simple piano. */
export type PianoNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'C2';

export const NOTE_FREQ: Record<PianoNote, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392,
  A: 440,
  B: 493.88,
  C2: 523.25,
};

export const NOTE_LABEL: Record<PianoNote, string> = {
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  A: 'A',
  B: 'B',
  C2: 'C',
};

/** Twinkle Twinkle Little Star — one octave, kid-friendly. */
export const TWINKLE: PianoNote[] = [
  'C', 'C', 'G', 'G', 'A', 'A', 'G',
  'F', 'F', 'E', 'E', 'D', 'D', 'C',
  'G', 'G', 'F', 'F', 'E', 'E', 'D',
  'G', 'G', 'F', 'F', 'E', 'E', 'D',
  'C', 'C', 'G', 'G', 'A', 'A', 'G',
  'F', 'F', 'E', 'E', 'D', 'D', 'C',
];

export const PIANO_KEYS: PianoNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'];
