import Phaser from "phaser";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const playTone = (context, baseTime, tone) => {
  const duration = clamp(Number(tone.duration) || 0.12, 0.02, 1.4);
  const delay = Math.max(0, (Number(tone.delay) || 0) / 1000);
  const attack = clamp(Number(tone.attack) || 0.012, 0.001, duration * 0.7);
  const release = clamp(Number(tone.release) || 0.06, 0.005, 1.2);
  const startAt = baseTime + delay;
  const stopAt = startAt + duration + release + 0.03;

  const frequency = clamp(Number(tone.frequency) || 440, 40, 10000);
  const toFrequency = clamp(Number(tone.toFrequency) || frequency, 40, 10000);
  const gainAmount = clamp(Number(tone.gain) || 0.05, 0.0001, 0.6);
  const type = tone.type || "triangle";

  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, startAt + duration);

  const filter = context.createBiquadFilter();
  filter.type = tone.filterType || "lowpass";
  filter.frequency.value = clamp(Number(tone.filterFrequency) || 2800, 120, 10000);

  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.linearRampToValueAtTime(gainAmount, startAt + attack);
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
};

function createSynthCuePlayer(scene, cueMap = {}) {
  const lastPlayedAt = new Map();
  const keyboard = scene.input?.keyboard;

  const unlockContext = () => {
    const context = scene.sound?.context;
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      void context.resume();
    }
  };

  scene.input?.on?.("pointerdown", unlockContext);
  keyboard?.on?.("keydown", unlockContext);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input?.off?.("pointerdown", unlockContext);
    keyboard?.off?.("keydown", unlockContext);
  });

  const play = (name) => {
    const cue = cueMap[name];
    if (!cue) {
      return false;
    }

    const now = scene.time?.now ?? 0;
    const cooldown = Math.max(0, Number(cue.cooldown) || 0);
    const previous = lastPlayedAt.get(name) ?? Number.NEGATIVE_INFINITY;
    if (now - previous < cooldown) {
      return false;
    }
    lastPlayedAt.set(name, now);

    unlockContext();
    const context = scene.sound?.context;
    if (!context || context.state !== "running") {
      return false;
    }

    const tones = Array.isArray(cue.tones) ? cue.tones : [cue];
    const baseTime = context.currentTime;
    for (const tone of tones) {
      playTone(context, baseTime, tone);
    }
    return true;
  };

  return {
    play,
    unlock: unlockContext
  };
}

export default createSynthCuePlayer;
