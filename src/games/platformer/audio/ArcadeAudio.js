const CUES = {
  jump: {
    cooldownMs: 90,
    tones: [{ type: "square", from: 540, to: 360, duration: 0.11, gain: 0.03 }]
  },
  coin: {
    cooldownMs: 45,
    tones: [{ type: "triangle", from: 760, to: 980, duration: 0.09, gain: 0.035 }]
  },
  stomp: {
    cooldownMs: 90,
    tones: [{ type: "sawtooth", from: 250, to: 120, duration: 0.11, gain: 0.03 }]
  },
  hurt: {
    cooldownMs: 150,
    tones: [{ type: "square", from: 280, to: 120, duration: 0.14, gain: 0.03 }]
  },
  fire: {
    cooldownMs: 75,
    tones: [{ type: "square", from: 420, to: 280, duration: 0.1, gain: 0.024 }]
  },
  powerup: {
    cooldownMs: 180,
    tones: [
      { type: "triangle", from: 420, to: 560, duration: 0.1, gain: 0.028 },
      { type: "triangle", from: 560, to: 700, duration: 0.11, gain: 0.028, delay: 0.08 }
    ]
  },
  win: {
    cooldownMs: 420,
    tones: [
      { type: "triangle", from: 540, to: 720, duration: 0.1, gain: 0.03 },
      { type: "triangle", from: 760, to: 920, duration: 0.12, gain: 0.03, delay: 0.1 },
      { type: "triangle", from: 980, to: 1140, duration: 0.14, gain: 0.03, delay: 0.22 }
    ]
  },
  lose: {
    cooldownMs: 420,
    tones: [
      { type: "sawtooth", from: 300, to: 180, duration: 0.16, gain: 0.03 },
      { type: "sawtooth", from: 170, to: 95, duration: 0.18, gain: 0.03, delay: 0.14 }
    ]
  }
};

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.AudioContext || window.webkitAudioContext || null;
};

export default class ArcadeAudio {
  constructor() {
    this.audioContext = null;
    this.lastPlayedAt = new Map();
  }

  ensureContext() {
    if (this.audioContext) {
      return this.audioContext;
    }
    const AudioContextCtor = getAudioContext();
    if (!AudioContextCtor) {
      return null;
    }
    this.audioContext = new AudioContextCtor();
    return this.audioContext;
  }

  play(cueName) {
    const cue = CUES[cueName];
    if (!cue) {
      return false;
    }

    const now = Date.now();
    const last = this.lastPlayedAt.get(cueName) || 0;
    if (now - last < cue.cooldownMs) {
      return false;
    }
    this.lastPlayedAt.set(cueName, now);

    const context = this.ensureContext();
    if (!context) {
      return false;
    }
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const baseTime = context.currentTime;
    for (const tone of cue.tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = baseTime + (tone.delay || 0);
      const endAt = startAt + tone.duration;

      oscillator.type = tone.type;
      oscillator.frequency.setValueAtTime(tone.from, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, tone.to), endAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(tone.gain, startAt + Math.min(0.02, tone.duration * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startAt);
      oscillator.stop(endAt + 0.01);
    }

    return true;
  }

  destroy() {
    if (!this.audioContext) {
      return;
    }
    this.audioContext.close().catch(() => {});
    this.audioContext = null;
  }
}

