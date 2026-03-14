const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const CUES = {
  start: [
    { frequency: 320, toFrequency: 480, duration: 0.08, gain: 0.035, type: "triangle" },
    { frequency: 480, toFrequency: 720, duration: 0.11, delay: 40, gain: 0.03, type: "triangle" },
  ],
  move: [{ frequency: 360, toFrequency: 320, duration: 0.05, gain: 0.02, type: "square" }],
  rotate: [{ frequency: 540, toFrequency: 690, duration: 0.06, gain: 0.024, type: "triangle" }],
  lock: [{ frequency: 220, toFrequency: 180, duration: 0.08, gain: 0.03, type: "sawtooth" }],
  clear: [
    { frequency: 340, toFrequency: 520, duration: 0.12, gain: 0.03, type: "triangle" },
    { frequency: 520, toFrequency: 780, duration: 0.14, delay: 35, gain: 0.026, type: "triangle" },
  ],
  pulse: [
    { frequency: 190, toFrequency: 620, duration: 0.18, gain: 0.032, type: "sawtooth" },
    { frequency: 620, toFrequency: 260, duration: 0.14, delay: 50, gain: 0.02, type: "triangle" },
  ],
  level: [
    { frequency: 420, toFrequency: 630, duration: 0.09, gain: 0.03, type: "triangle" },
    { frequency: 630, toFrequency: 860, duration: 0.1, delay: 50, gain: 0.028, type: "triangle" },
  ],
  over: [
    { frequency: 280, toFrequency: 180, duration: 0.22, gain: 0.03, type: "sawtooth" },
    { frequency: 180, toFrequency: 120, duration: 0.26, delay: 70, gain: 0.02, type: "triangle" },
  ],
};

function playTone(context, baseTime, tone) {
  const duration = clamp(Number(tone.duration) || 0.1, 0.02, 0.8);
  const delay = Math.max(0, (Number(tone.delay) || 0) / 1000);
  const startAt = baseTime + delay;
  const stopAt = startAt + duration + 0.05;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gainNode = context.createGain();

  oscillator.type = tone.type || "triangle";
  oscillator.frequency.setValueAtTime(clamp(Number(tone.frequency) || 440, 80, 1400), startAt);
  oscillator.frequency.exponentialRampToValueAtTime(
    clamp(Number(tone.toFrequency) || Number(tone.frequency) || 440, 80, 1800),
    startAt + duration
  );

  filter.type = "lowpass";
  filter.frequency.value = 2600;

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.linearRampToValueAtTime(clamp(Number(tone.gain) || 0.025, 0.001, 0.12), startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(stopAt);
  oscillator.onended = () => {
    oscillator.disconnect();
    filter.disconnect();
    gainNode.disconnect();
  };
}

export default class PrismStackAudio {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  ensureContext() {
    if (this.context || typeof window === "undefined") {
      return this.context;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return null;
    }
    this.context = new AudioContext();
    return this.context;
  }

  unlock() {
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      void context.resume();
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.unlock();
    }
  }

  play(name) {
    if (!this.enabled) {
      return;
    }
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      void context.resume();
      return;
    }

    const tones = CUES[name];
    if (!tones?.length) {
      return;
    }

    const baseTime = context.currentTime;
    tones.forEach((tone) => playTone(context, baseTime, tone));
  }

  destroy() {
    if (this.context?.state === "running") {
      void this.context.suspend();
    }
  }
}
