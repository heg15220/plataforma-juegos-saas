const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function scheduleTone(context, startAt, tone) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = tone.type ?? "triangle";
  oscillator.frequency.setValueAtTime(clamp(tone.from ?? tone.to ?? 440, 40, 10000), startAt);
  oscillator.frequency.exponentialRampToValueAtTime(
    clamp(tone.to ?? tone.from ?? 440, 40, 10000),
    startAt + (tone.duration ?? 0.12)
  );

  filter.type = tone.filterType ?? "lowpass";
  filter.frequency.value = clamp(tone.filter ?? 2400, 120, 12000);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.linearRampToValueAtTime(tone.gain ?? 0.06, startAt + (tone.attack ?? 0.01));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + (tone.duration ?? 0.12) + (tone.release ?? 0.08));

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startAt + (tone.delay ?? 0));
  oscillator.stop(startAt + (tone.delay ?? 0) + (tone.duration ?? 0.12) + (tone.release ?? 0.08) + 0.03);
  oscillator.onended = () => {
    oscillator.disconnect();
    filter.disconnect();
    gainNode.disconnect();
  };
}

const CUES = {
  charge: [
    { from: 280, to: 440, duration: 0.08, gain: 0.032, type: "triangle", filter: 2200 },
  ],
  release: [
    { from: 510, to: 220, duration: 0.12, gain: 0.075, type: "sawtooth", filter: 2400 },
  ],
  "metal-soft": [
    { from: 420, to: 280, duration: 0.08, gain: 0.04, type: "triangle", filter: 1800 },
  ],
  "rubber-soft": [
    { from: 340, to: 210, duration: 0.09, gain: 0.05, type: "sine", filter: 1500 },
  ],
  "rubber-strong": [
    { from: 520, to: 240, duration: 0.12, gain: 0.07, type: "square", filter: 1800 },
  ],
  composite: [
    { from: 360, to: 170, duration: 0.1, gain: 0.048, type: "triangle", filter: 1600 },
  ],
  gel: [
    { from: 180, to: 90, duration: 0.12, gain: 0.05, type: "sine", filter: 900 },
  ],
  fan: [
    { from: 140, to: 170, duration: 0.07, gain: 0.028, type: "triangle", filter: 800 },
  ],
  gravity: [
    { from: 130, to: 90, duration: 0.14, gain: 0.04, type: "sine", filter: 720 },
  ],
  portal: [
    { from: 320, to: 820, duration: 0.08, gain: 0.052, type: "triangle", filter: 2600 },
    { from: 820, to: 240, duration: 0.1, gain: 0.038, type: "sine", filter: 2200, delay: 0.03 },
  ],
  gate: [
    { from: 200, to: 160, duration: 0.1, gain: 0.045, type: "square", filter: 1200 },
  ],
  success: [
    { from: 440, to: 660, duration: 0.12, gain: 0.06, type: "triangle", filter: 2800 },
    { from: 660, to: 990, duration: 0.14, gain: 0.05, type: "sine", filter: 3200, delay: 0.05 },
  ],
  fail: [
    { from: 210, to: 120, duration: 0.18, gain: 0.065, type: "sawtooth", filter: 900 },
  ],
  unlock: [
    { from: 520, to: 880, duration: 0.11, gain: 0.05, type: "triangle", filter: 3000 },
    { from: 660, to: 1180, duration: 0.1, gain: 0.045, type: "triangle", filter: 3400, delay: 0.06 },
  ],
  transition: [
    { from: 260, to: 420, duration: 0.14, gain: 0.04, type: "triangle", filter: 1800 },
    { from: 420, to: 610, duration: 0.12, gain: 0.038, type: "triangle", filter: 2200, delay: 0.05 },
  ],
};

export default class FluxAudioSystem {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.context = null;
    this.lastPlayedAt = new Map();
  }

  ensureContext() {
    if (typeof window === "undefined") {
      return null;
    }
    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    if (!this.context) {
      this.context = new AudioContextCtor();
    }
    return this.context;
  }

  unlock() {
    const context = this.ensureContext();
    if (context?.state === "suspended") {
      void context.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  play(name) {
    if (!this.enabled) {
      return false;
    }

    const cue = CUES[name];
    if (!cue) {
      return false;
    }

    const context = this.ensureContext();
    if (!context) {
      return false;
    }
    if (context.state === "suspended") {
      return false;
    }

    const now = performance.now();
    const last = this.lastPlayedAt.get(name) ?? -Infinity;
    if (now - last < 28) {
      return false;
    }
    this.lastPlayedAt.set(name, now);

    const startAt = context.currentTime;
    cue.forEach((tone) => scheduleTone(context, startAt, tone));
    return true;
  }
}
