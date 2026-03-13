export function createHeadSoccerAudio() {
  let context = null;

  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      context = new AudioContextClass();
    }
    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }
    return context;
  };

  const pulse = (frequency, duration, type = "square", gainValue = 0.04, sweepTo = null) => {
    const ctx = ensure();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (sweepTo) oscillator.frequency.exponentialRampToValueAtTime(sweepTo, now + duration);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  return {
    unlock() {
      ensure();
    },
    play(cue) {
      if (cue === "kick") pulse(220, 0.09, "triangle", 0.05, 120);
      if (cue === "jump") pulse(320, 0.08, "square", 0.04, 480);
      if (cue === "power") pulse(190, 0.18, "sawtooth", 0.05, 680);
      if (cue === "goal") {
        pulse(420, 0.12, "square", 0.06, 620);
        pulse(520, 0.18, "triangle", 0.05, 880);
      }
      if (cue === "start") pulse(280, 0.12, "square", 0.04, 360);
    },
  };
}
