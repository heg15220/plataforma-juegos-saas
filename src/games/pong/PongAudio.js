const DEFAULT_VOLUME = 0.035;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default class PongAudio {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.masterGain = null;
    this.lastPlayAt = 0;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  getEnabled() {
    return this.enabled;
  }

  ensureContext() {
    if (!this.enabled) {
      return null;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    if (!this.context) {
      this.context = new AudioContextCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = DEFAULT_VOLUME;
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => undefined);
    }

    return this.context;
  }

  dispose() {
    if (this.context && this.context.state !== "closed") {
      this.context.close().catch(() => undefined);
    }
    this.context = null;
    this.masterGain = null;
  }

  playTone({
    frequency,
    duration,
    type = "sine",
    gain = 1,
    sweepTo = null,
    detune = 0
  }) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) {
      return;
    }

    const now = ctx.currentTime;
    if (now - this.lastPlayAt < 0.008) {
      return;
    }
    this.lastPlayAt = now;

    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();

    osc.type = type;
    osc.frequency.value = clamp(frequency, 30, 4000);
    osc.detune.value = detune;

    const attack = 0.01;
    const release = Math.max(0.02, duration);

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(clamp(gain, 0.05, 1.4), now + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + release);

    if (sweepTo && Number.isFinite(sweepTo)) {
      osc.frequency.exponentialRampToValueAtTime(clamp(sweepTo, 30, 4500), now + release);
    }

    osc.connect(envelope);
    envelope.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + release + 0.02);
  }

  playServeCue() {
    this.playTone({ frequency: 390, duration: 0.16, type: "triangle", gain: 0.7, sweepTo: 620 });
    this.playTone({ frequency: 220, duration: 0.2, type: "sine", gain: 0.48, sweepTo: 320, detune: 3 });
  }

  playPaddleHitCue(english = 0) {
    const intensity = clamp(Math.abs(english), 0, 1.4);
    const base = 430 + intensity * 180;
    this.playTone({
      frequency: base,
      duration: 0.08,
      type: "square",
      gain: 0.52 + intensity * 0.2,
      sweepTo: base * 0.88
    });
    this.playTone({
      frequency: base * 1.75,
      duration: 0.06,
      type: "triangle",
      gain: 0.24,
      sweepTo: base * 1.25
    });
  }

  playWallCue() {
    this.playTone({ frequency: 265, duration: 0.06, type: "triangle", gain: 0.3, sweepTo: 220 });
  }

  playGoalCue(scoredByPlayer) {
    if (scoredByPlayer) {
      this.playTone({ frequency: 520, duration: 0.22, type: "triangle", gain: 0.75, sweepTo: 860 });
      this.playTone({ frequency: 780, duration: 0.16, type: "sine", gain: 0.38, sweepTo: 1100, detune: 7 });
      return;
    }

    this.playTone({ frequency: 260, duration: 0.25, type: "sawtooth", gain: 0.55, sweepTo: 120 });
  }

  playRoundEndCue(playerWon) {
    if (playerWon) {
      this.playTone({ frequency: 420, duration: 0.24, type: "triangle", gain: 0.65, sweepTo: 760 });
      this.playTone({ frequency: 610, duration: 0.28, type: "triangle", gain: 0.58, sweepTo: 920 });
      this.playTone({ frequency: 820, duration: 0.32, type: "triangle", gain: 0.52, sweepTo: 1260 });
      return;
    }

    this.playTone({ frequency: 300, duration: 0.18, type: "sawtooth", gain: 0.52, sweepTo: 160 });
    this.playTone({ frequency: 180, duration: 0.2, type: "sawtooth", gain: 0.45, sweepTo: 90 });
  }

  playPauseCue(paused) {
    if (paused) {
      this.playTone({ frequency: 280, duration: 0.08, type: "square", gain: 0.36, sweepTo: 220 });
      return;
    }

    this.playTone({ frequency: 320, duration: 0.08, type: "square", gain: 0.36, sweepTo: 460 });
  }
}
