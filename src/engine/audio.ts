import type { SfxName } from '../types';

/**
 * Tiny Web Audio synthesizer — all sound effects are generated procedurally so
 * the game ships with zero audio assets. The AudioContext is created lazily on
 * first use (must follow a user gesture, e.g. the Start button).
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;

  /** Lazily create / resume the context. Safe to call repeatedly. */
  resume() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.35;
  }

  isMuted() {
    return this.muted;
  }

  play(name: SfxName) {
    if (this.muted || !this.ctx || !this.master) return;
    switch (name) {
      case 'shoot':
        this.blip(720, 0.05, 'square', 0.12);
        break;
      case 'hit':
        this.blip(320, 0.05, 'triangle', 0.15);
        break;
      case 'explosion':
        this.noise(0.28, 0.4);
        break;
      case 'powerup':
        this.arp([523, 659, 784, 1047], 0.07);
        break;
      case 'hurt':
        this.sweep(440, 90, 0.35, 'sawtooth', 0.25);
        break;
      case 'level':
        this.arp([392, 523, 659, 784, 1047], 0.09);
        break;
      case 'boss':
        this.sweep(110, 55, 0.7, 'sawtooth', 0.3);
        break;
    }
  }

  // ---- primitives ----

  private env(): { osc: OscillatorNode; gain: GainNode } {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.master!);
    return { osc, gain };
  }

  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number
  ) {
    const ctx = this.ctx!;
    const { osc, gain } = this.env();
    const t = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  }

  private sweep(
    from: number,
    to: number,
    dur: number,
    type: OscillatorType,
    vol: number
  ) {
    const ctx = this.ctx!;
    const { osc, gain } = this.env();
    const t = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
  }

  private arp(freqs: number[], step: number) {
    freqs.forEach((f, i) => {
      const ctx = this.ctx!;
      const { osc, gain } = this.env();
      const t = ctx.currentTime + i * step;
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 1.4);
      osc.start(t);
      osc.stop(t + step * 1.4);
    });
  }

  private noise(dur: number, vol: number) {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master!);
    src.start();
    src.stop(ctx.currentTime + dur);
  }
}

export const audio = new AudioEngine();
