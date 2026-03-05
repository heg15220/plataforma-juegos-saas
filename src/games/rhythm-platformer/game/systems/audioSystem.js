import { BEAT_SECONDS, BPM } from "../constants";

const STEP_PER_BEAT = 4;
const STEP_SECONDS = BEAT_SECONDS / STEP_PER_BEAT;
const LOOK_AHEAD_SECONDS = 0.2;

const SECTION_PATTERNS = {
  intro: {
    kick: [0, 8],
    snare: [12],
    hat: [2, 6, 10, 14],
    bass: [0, 5, 8, 11],
    bassNotes: [44, 44, 46, 44],
  },
  build: {
    kick: [0, 7, 8, 12],
    snare: [4, 12],
    hat: [2, 3, 6, 7, 10, 11, 14, 15],
    bass: [0, 3, 6, 8, 10, 12, 14],
    bassNotes: [44, 47, 49, 44, 47, 51, 49],
  },
  drop: {
    kick: [0, 4, 8, 11, 12],
    snare: [4, 12],
    hat: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15],
    bass: [0, 2, 3, 5, 7, 8, 10, 12, 13, 15],
    bassNotes: [44, 47, 49, 47, 44, 51, 49, 47, 44, 42],
  },
  outro: {
    kick: [0, 8],
    snare: [4, 12],
    hat: [0, 4, 8, 12],
    bass: [0, 6, 10],
    bassNotes: [42, 44, 47],
  },
};

function midiToFreq(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function buildNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  return buffer;
}

function scheduleKick(audio, time, velocity = 1) {
  const { ctx, musicGain, bassGain } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(132, time);
  osc.frequency.exponentialRampToValueAtTime(44, time + 0.1);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.36 * velocity, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

  osc.connect(gain);
  gain.connect(musicGain);
  osc.start(time);
  osc.stop(time + 0.2);

  bassGain.gain.cancelScheduledValues(time);
  bassGain.gain.setValueAtTime(Math.max(0.15, bassGain.gain.value * 0.55), time);
  bassGain.gain.linearRampToValueAtTime(0.72, time + 0.15);
}

function scheduleSnare(audio, time, velocity = 1) {
  const { ctx, noiseBuffer, musicGain } = audio;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(1800, time);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.001, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.24 * velocity, time + 0.006);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(musicGain);
  noise.start(time);
  noise.stop(time + 0.16);

  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();
  tone.type = "triangle";
  tone.frequency.setValueAtTime(280, time);
  tone.frequency.exponentialRampToValueAtTime(120, time + 0.08);
  toneGain.gain.setValueAtTime(0.001, time);
  toneGain.gain.exponentialRampToValueAtTime(0.09 * velocity, time + 0.004);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
  tone.connect(toneGain);
  toneGain.connect(musicGain);
  tone.start(time);
  tone.stop(time + 0.12);
}

function scheduleHat(audio, time, velocity = 1) {
  const { ctx, noiseBuffer, musicGain } = audio;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(5200, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.08 * velocity, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(musicGain);
  noise.start(time);
  noise.stop(time + 0.06);
}

function scheduleBass(audio, time, midi, velocity = 1) {
  const { ctx, bassGain } = audio;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(midiToFreq(midi), time);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(720, time);
  filter.Q.value = 1.1;

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(0.16 * velocity, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + STEP_SECONDS * 0.92);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(bassGain);

  osc.start(time);
  osc.stop(time + STEP_SECONDS);
}

function ensureContext(audio) {
  if (audio.ctx) {
    return audio.ctx;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  const ctx = new AudioCtx({ latencyHint: "interactive" });
  const masterGain = ctx.createGain();
  const musicGain = ctx.createGain();
  const bassGain = ctx.createGain();
  const sfxGain = ctx.createGain();

  masterGain.gain.value = 0.74;
  musicGain.gain.value = 0.44;
  bassGain.gain.value = 0.72;
  sfxGain.gain.value = 0.62;

  bassGain.connect(musicGain);
  musicGain.connect(masterGain);
  sfxGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  audio.ctx = ctx;
  audio.masterGain = masterGain;
  audio.musicGain = musicGain;
  audio.bassGain = bassGain;
  audio.sfxGain = sfxGain;
  audio.noiseBuffer = buildNoiseBuffer(ctx);

  return ctx;
}

export function createAudioSystem() {
  return {
    enabled: true,
    ctx: null,
    masterGain: null,
    musicGain: null,
    bassGain: null,
    sfxGain: null,
    noiseBuffer: null,
    playing: false,
    nextStepTime: 0,
    stepIndex: 0,
    scheduledSection: "intro",
    mutedByPolicy: false,
  };
}

export function setAudioEnabled(audio, enabled) {
  audio.enabled = enabled;
  if (!audio.ctx) {
    return;
  }
  const value = enabled ? 0.74 : 0;
  audio.masterGain.gain.setTargetAtTime(value, audio.ctx.currentTime, 0.015);
}

export function resumeAudioContext(audio) {
  if (!audio.enabled) {
    return false;
  }
  const ctx = ensureContext(audio);
  if (!ctx) {
    audio.mutedByPolicy = true;
    return false;
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {
      audio.mutedByPolicy = true;
    });
  }
  return true;
}

export function startMusic(audio, section = "intro") {
  if (!audio.enabled) {
    return;
  }
  const ctx = ensureContext(audio);
  if (!ctx) {
    return;
  }

  resumeAudioContext(audio);
  audio.playing = true;
  audio.nextStepTime = ctx.currentTime + 0.02;
  audio.stepIndex = 0;
  audio.scheduledSection = section;
}

export function stopMusic(audio) {
  audio.playing = false;
}

function scheduleStep(audio, section) {
  const pattern = SECTION_PATTERNS[section] ?? SECTION_PATTERNS.drop;
  const stepInBar = audio.stepIndex % 16;
  const time = audio.nextStepTime;

  if (pattern.kick.includes(stepInBar)) {
    scheduleKick(audio, time, 1);
  }
  if (pattern.snare.includes(stepInBar)) {
    scheduleSnare(audio, time, 0.86);
  }
  if (pattern.hat.includes(stepInBar)) {
    scheduleHat(audio, time, section === "drop" ? 0.9 : 0.72);
  }

  const bassSlot = pattern.bass.indexOf(stepInBar);
  if (bassSlot >= 0) {
    const note = pattern.bassNotes[bassSlot % pattern.bassNotes.length];
    scheduleBass(audio, time, note, section === "drop" ? 1 : 0.8);
  }

  audio.stepIndex += 1;
  audio.nextStepTime += STEP_SECONDS;
}

export function updateMusicScheduler(audio, section) {
  if (!audio.playing || !audio.enabled) {
    return;
  }
  const ctx = ensureContext(audio);
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    return;
  }

  audio.scheduledSection = section;

  while (audio.nextStepTime < ctx.currentTime + LOOK_AHEAD_SECONDS) {
    scheduleStep(audio, section);
  }
}

function scheduleSimpleSfx(audio, config) {
  if (!audio.enabled) {
    return;
  }
  const ctx = ensureContext(audio);
  if (!ctx || !audio.sfxGain) {
    return;
  }

  const time = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.from, time);
  if (config.to && config.to > 0) {
    osc.frequency.exponentialRampToValueAtTime(config.to, time + config.duration * 0.8);
  }

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(config.peak, time + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + config.duration);

  osc.connect(gain);
  gain.connect(audio.sfxGain);
  osc.start(time);
  osc.stop(time + config.duration + 0.02);
}

export function playSfx(audio, id) {
  const map = {
    jump: { type: "triangle", from: 320, to: 500, duration: 0.1, attack: 0.01, peak: 0.12 },
    perfect: { type: "square", from: 560, to: 860, duration: 0.15, attack: 0.005, peak: 0.13 },
    pickup: { type: "sine", from: 700, to: 980, duration: 0.12, attack: 0.005, peak: 0.11 },
    damage: { type: "sawtooth", from: 190, to: 84, duration: 0.2, attack: 0.004, peak: 0.14 },
    burst: { type: "square", from: 240, to: 170, duration: 0.18, attack: 0.006, peak: 0.15 },
    shift: { type: "triangle", from: 460, to: 350, duration: 0.11, attack: 0.005, peak: 0.11 },
    win: { type: "triangle", from: 430, to: 710, duration: 0.26, attack: 0.01, peak: 0.16 },
    fail: { type: "square", from: 140, to: 82, duration: 0.22, attack: 0.008, peak: 0.12 },
  };
  const config = map[id];
  if (!config) {
    return;
  }
  scheduleSimpleSfx(audio, config);
}

export function disposeAudio(audio) {
  audio.playing = false;
  if (audio.ctx && audio.ctx.state !== "closed") {
    audio.ctx.close().catch(() => {});
  }
  audio.ctx = null;
  audio.masterGain = null;
  audio.musicGain = null;
  audio.bassGain = null;
  audio.sfxGain = null;
  audio.noiseBuffer = null;
}

export function getTransportState(audio) {
  if (!audio.ctx) {
    return {
      bpm: BPM,
      stepIndex: audio.stepIndex,
      nextStepInMs: 0,
      section: audio.scheduledSection,
      ready: false,
    };
  }

  return {
    bpm: BPM,
    stepIndex: audio.stepIndex,
    nextStepInMs: Math.max(0, Math.round((audio.nextStepTime - audio.ctx.currentTime) * 1000)),
    section: audio.scheduledSection,
    ready: true,
  };
}
