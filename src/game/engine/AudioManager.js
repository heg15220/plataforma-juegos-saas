export default class AudioManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone({ from, to = from, duration = 0.06, type = "square", gain = 0.05 }) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.unlock();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.linearRampToValueAtTime(to, now + duration);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.02, duration * 0.5));
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.02);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  play(eventName) {
    if (eventName === "pellet") {
      this.playTone({ from: 450, to: 520, duration: 0.04, gain: 0.03 });
    } else if (eventName === "power") {
      this.playTone({ from: 220, to: 520, duration: 0.08, type: "triangle", gain: 0.05 });
    } else if (eventName === "ghost") {
      this.playTone({ from: 680, to: 240, duration: 0.12, type: "sawtooth", gain: 0.06 });
    } else if (eventName === "death") {
      this.playTone({ from: 320, to: 100, duration: 0.18, type: "square", gain: 0.06 });
    } else if (eventName === "level") {
      this.playTone({ from: 260, to: 780, duration: 0.2, type: "triangle", gain: 0.06 });
    } else if (eventName === "start") {
      this.playTone({ from: 320, to: 620, duration: 0.1, type: "triangle", gain: 0.05 });
    }
  }
}
