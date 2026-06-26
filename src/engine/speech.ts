/**
 * English text-to-speech via the browser's Web Speech API — zero assets.
 * Used by the learning games to read letters / words / numbers aloud so
 * pre-readers can play and kids hear native pronunciation. Respects the same
 * mute toggle as the sound effects.
 */
class Speech {
  private muted = false;
  private voice: SpeechSynthesisVoice | null = null;

  private get synth(): SpeechSynthesis | null {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  }

  private pickVoice() {
    const s = this.synth;
    if (!s) return;
    const voices = s.getVoices();
    if (!voices.length) return;
    this.voice =
      voices.find((v) => /en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0];
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) this.synth?.cancel();
  }

  speak(text: string, lang = 'en-US') {
    const s = this.synth;
    if (!s || this.muted || !text) return;
    if (!this.voice) this.pickVoice();
    s.cancel(); // interrupt any previous phrase
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    if (this.voice) u.voice = this.voice;
    u.rate = 0.9; // a touch slow and friendly for children
    u.pitch = 1.1;
    s.speak(u);
  }
}

export const speech = new Speech();
