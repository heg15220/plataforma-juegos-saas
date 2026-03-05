import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import "./rhythm-platformer/styles/RhythmPlatformerGame.css";

import {
  BASE_SEED,
  BEAT_SECONDS,
  BPM,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLOR_SETS,
  DEFAULT_SETTINGS,
  DIFFICULTY_PRESETS,
  GAME_NAME,
  MAX_CHARGE,
  MAX_INTEGRITY,
  MOBILE_TOUCH_IDS,
  SNAPSHOT_HZ,
  START_X,
} from "./rhythm-platformer/game/constants";
import { generateTrack } from "./rhythm-platformer/game/trackGen";
import {
  createGhostState,
  createPlayerState,
  performBurst,
  resetFrameEvents,
  resetGhostReplay,
  stepPhysics,
  updateGhostReplay,
} from "./rhythm-platformer/game/physics";
import {
  createBeatState,
  getBeatRating,
  msToNextBeat,
  updateBeatState,
} from "./rhythm-platformer/game/systems/beatSystem";
import {
  addRuntimeScore,
  applyTimingJudgement,
  computeAccuracy,
  computeRank,
  createScoreState,
  registerDamage,
  registerPerfectShift,
  rewardBurst,
  rewardPickup,
  tickScoreState,
} from "./rhythm-platformer/game/systems/scoreSystem";
import {
  createFxSystem,
  pulseBeatFx,
  spawnBurstFx,
  spawnDamageFx,
  spawnPerfectJumpFx,
  spawnPickupFx,
  tickFxSystem,
} from "./rhythm-platformer/game/systems/fxSystem";
import {
  createAudioSystem,
  disposeAudio,
  getTransportState,
  playSfx,
  resumeAudioContext,
  setAudioEnabled,
  startMusic,
  stopMusic,
  updateMusicScheduler,
} from "./rhythm-platformer/game/systems/audioSystem";
import { createCameraState, updateCamera } from "./rhythm-platformer/game/systems/cameraSystem";
import { createRenderer, drawFrame } from "./rhythm-platformer/game/render/renderer";

const ALT_NAMES = [
  "Pulse Prism Runner",
  "Neon Flux Sprint",
  "Lumen Rift Glide",
  "Kinetic Spectrum Run",
];

const FRAME_STEP = 1 / 60;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createPhaseState(difficulty) {
  return {
    active: "A",
    timer: 0,
    cooldown: 0,
    cooldownMax: difficulty.shiftCooldown,
    justShiftedTimer: 0,
  };
}

function createRuntime(settings, seed, mode = "menu", replaySource = null) {
  const difficulty = DIFFICULTY_PRESETS[settings.difficultyId] ?? DIFFICULTY_PRESETS.core;
  const track = generateTrack({ seed, difficultyId: difficulty.id });

  const runtime = {
    mode,
    settings: { ...settings },
    seed,
    difficulty,
    difficultyId: difficulty.id,
    elapsed: 0,
    worldSpeed: difficulty.worldSpeed,
    beatSeconds: BEAT_SECONDS,
    beat: createBeatState(),
    score: createScoreState(),
    fx: createFxSystem(),
    camera: createCameraState(),
    player: createPlayerState(),
    ghost: createGhostState(),
    phase: createPhaseState(difficulty),
    obstacles: track.obstacles,
    pickups: track.pickups,
    obstacleCursor: 0,
    pickupCursor: 0,
    integrity: MAX_INTEGRITY,
    charge: 1.24,
    worldLength: track.worldLength,
    finishX: track.finishX,
    message: mode === "menu" ? "Press Play. Jump and Shift to the pulse." : "Run started",
    messageTtl: mode === "menu" ? 3 : 1.1,
    jumpVelocityScale: 1,
    pendingJumpRating: { rating: "good", offset: 0 },
    input: { jumpPressed: false, burstPressed: false, shiftPressed: false },
    frameEvents: {
      jumped: false,
      landed: false,
      damage: false,
      collidedObstacle: null,
      collectedPickups: 0,
      lastCollectedValue: 0,
    },
    replayRecording: { events: [] },
    results: null,
    outcome: "none",
    fps: {
      frameMs: 16.7,
      fps: 60,
      reportTimer: 0,
      frameCount: 0,
      frameAccumulator: 0,
    },
    fullscreen: false,
  };

  if (mode === "playing" && replaySource && replaySource.seed === seed && replaySource.difficultyId === difficulty.id) {
    resetGhostReplay(runtime.ghost, replaySource);
  } else {
    resetGhostReplay(runtime.ghost, null);
  }

  return runtime;
}

function collectObstacles(runtime) {
  const list = [];
  for (const obstacle of runtime.obstacles) {
    if (obstacle.disabled) continue;
    if (obstacle.x + obstacle.w < runtime.player.x - 48) continue;
    list.push({
      id: obstacle.id,
      type: obstacle.type,
      phase: obstacle.phase,
      x: Number(obstacle.x.toFixed(1)),
      y: Number(obstacle.y.toFixed(1)),
      w: Number(obstacle.w.toFixed(1)),
      h: Number(obstacle.h.toFixed(1)),
      distanceFromPlayer: Number((obstacle.x - runtime.player.x).toFixed(1)),
    });
    if (list.length >= 8) break;
  }
  return list;
}

function collectPickups(runtime) {
  const list = [];
  for (const pickup of runtime.pickups) {
    if (pickup.collected) continue;
    if (pickup.x < runtime.player.x - 42) continue;
    list.push({
      id: pickup.id,
      x: Number(pickup.x.toFixed(1)),
      y: Number(pickup.y.toFixed(1)),
      value: pickup.value,
      distanceFromPlayer: Number((pickup.x - runtime.player.x).toFixed(1)),
    });
    if (list.length >= 8) break;
  }
  return list;
}

function buildResult(runtime, won) {
  const accuracy = computeAccuracy(runtime.score);
  return {
    won,
    rank: computeRank(runtime.score, runtime.difficulty),
    score: Math.round(runtime.score.score),
    perfects: runtime.score.perfects,
    goods: runtime.score.goods,
    misses: runtime.score.misses,
    maxCombo: runtime.score.maxCombo,
    longestPerfectStreak: runtime.score.longestPerfectStreak,
    damageTaken: runtime.score.damageTaken,
    accuracyPercent: Number((accuracy * 100).toFixed(2)),
    elapsedSeconds: Number(runtime.elapsed.toFixed(2)),
  };
}

function buildSnapshot(runtime, audio) {
  const accuracy = computeAccuracy(runtime.score);
  const progress = clamp((runtime.player.x - START_X) / Math.max(1, runtime.worldLength - START_X), 0, 1);
  const transport = getTransportState(audio);

  return {
    mode: runtime.mode,
    seed: runtime.seed,
    difficultyId: runtime.difficultyId,
    difficultyLabel: runtime.difficulty.label,
    score: Math.round(runtime.score.score),
    combo: runtime.score.combo,
    maxCombo: runtime.score.maxCombo,
    perfects: runtime.score.perfects,
    goods: runtime.score.goods,
    misses: runtime.score.misses,
    integrity: runtime.integrity,
    charge: runtime.charge,
    progress: Number((progress * 100).toFixed(2)),
    accuracy: Number((accuracy * 100).toFixed(2)),
    beatPulse: runtime.beat.pulse,
    beatIndex: runtime.beat.index,
    nextBeatMs: msToNextBeat(runtime.beat),
    beatSection: runtime.beat.section,
    phase: runtime.phase.active,
    phaseCooldown: runtime.phase.cooldown,
    phaseTimer: runtime.phase.timer,
    elapsed: runtime.elapsed,
    worldLength: runtime.worldLength,
    finishX: runtime.finishX,
    playerX: runtime.player.x,
    playerY: runtime.player.y,
    playerVy: runtime.player.vy,
    message: runtime.message,
    rank: runtime.results?.rank ?? "-",
    resultSummary: runtime.results,
    replayGhostActive: runtime.ghost.active,
    fps: runtime.fps.fps,
    frameMs: runtime.fps.frameMs,
    audioEnabled: runtime.settings.audioEnabled,
    reduceMotion: runtime.settings.reduceMotion,
    colorblindSafe: runtime.settings.colorblindSafe,
    debugEnabled: runtime.settings.debugEnabled,
    transport,
    lastJudgement: runtime.score.lastJudgement,
    lastJudgementTimer: runtime.score.lastJudgementTimer,
    visibleObstacles: collectObstacles(runtime),
    visiblePickups: collectPickups(runtime),
  };
}

function RhythmPlatformerGame() {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const ctxRef = useRef(null);
  const rendererRef = useRef(createRenderer());
  const runtimeRef = useRef(createRuntime(DEFAULT_SETTINGS, BASE_SEED, "menu"));
  const inputRef = useRef({ jump: false, burst: false, shift: false });
  const replayRef = useRef(null);
  const audioRef = useRef(createAudioSystem());
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const snapshotTimerRef = useRef(0);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [snapshot, setSnapshot] = useState(() => buildSnapshot(runtimeRef.current, audioRef.current));

  const palette = useMemo(
    () => (settings.colorblindSafe ? COLOR_SETS.colorblind : COLOR_SETS.normal),
    [settings.colorblindSafe]
  );

  const publishSnapshot = useCallback(() => {
    setSnapshot(buildSnapshot(runtimeRef.current, audioRef.current));
  }, []);

  const drawNow = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const runtime = runtimeRef.current;
    runtime.settings.reduceMotion = settings.reduceMotion;
    runtime.settings.colorblindSafe = settings.colorblindSafe;
    drawFrame(ctx, runtime, palette, rendererRef.current);
  }, [palette, settings.colorblindSafe, settings.reduceMotion]);

  const setRuntimeSettings = useCallback((nextSettings) => {
    runtimeRef.current.settings = { ...runtimeRef.current.settings, ...nextSettings };
    setAudioEnabled(audioRef.current, runtimeRef.current.settings.audioEnabled);
  }, []);

  const applySettingsPatch = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setRuntimeSettings(next);
      return next;
    });
  }, [setRuntimeSettings]);

  const queueInput = useCallback((id) => {
    if (id === MOBILE_TOUCH_IDS.jump) inputRef.current.jump = true;
    if (id === MOBILE_TOUCH_IDS.burst) inputRef.current.burst = true;
    if (id === MOBILE_TOUCH_IDS.shift) inputRef.current.shift = true;
  }, []);

  const finishRun = useCallback((won, silent = false) => {
    const runtime = runtimeRef.current;
    if (runtime.mode !== "playing") return;

    runtime.mode = "results";
    runtime.results = buildResult(runtime, won);
    runtime.outcome = won ? "win" : "fail";
    runtime.message = won ? "Run complete." : "Signal lost.";
    runtime.messageTtl = 2.4;

    replayRef.current = {
      seed: runtime.seed,
      difficultyId: runtime.difficultyId,
      events: runtime.replayRecording.events.slice(),
      duration: runtime.elapsed,
      score: runtime.score.score,
    };

    stopMusic(audioRef.current);
    if (!silent) playSfx(audioRef.current, won ? "win" : "fail");
  }, []);

  const startRun = useCallback((forcedSeed = null) => {
    const seed = forcedSeed ?? (
      settings.deterministic
        ? (Number(settings.seed) || BASE_SEED)
        : ((Date.now() * 2654435761) >>> 0)
    );

    const runtime = createRuntime(settings, seed, "playing", replayRef.current);
    runtimeRef.current = runtime;
    runtime.message = "Flow online.";
    runtime.messageTtl = 1;

    resumeAudioContext(audioRef.current);
    startMusic(audioRef.current, runtime.beat.section);
    playSfx(audioRef.current, "jump");

    drawNow();
    publishSnapshot();
  }, [drawNow, publishSnapshot, settings]);

  const restartRun = useCallback(() => startRun(), [startRun]);

  const openMenu = useCallback(() => {
    runtimeRef.current = createRuntime(settings, Number(settings.seed) || BASE_SEED, "menu");
    drawNow();
    publishSnapshot();
  }, [drawNow, publishSnapshot, settings]);

  const togglePause = useCallback(() => {
    const runtime = runtimeRef.current;
    if (runtime.mode === "playing") {
      runtime.mode = "paused";
      runtime.message = "Paused";
      runtime.messageTtl = 0.8;
      stopMusic(audioRef.current);
    } else if (runtime.mode === "paused") {
      runtime.mode = "playing";
      runtime.message = "Back on pulse";
      runtime.messageTtl = 0.8;
      resumeAudioContext(audioRef.current);
      startMusic(audioRef.current, runtime.beat.section);
    }
    drawNow();
    publishSnapshot();
  }, [drawNow, publishSnapshot]);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      shell.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const step = useCallback((dt, silent = false) => {
    const runtime = runtimeRef.current;

    runtime.fps.frameMs = runtime.fps.frameMs * 0.82 + dt * 1000 * 0.18;
    runtime.fps.reportTimer += dt;
    runtime.fps.frameCount += 1;
    runtime.fps.frameAccumulator += dt;
    if (runtime.fps.reportTimer >= 0.3) {
      runtime.fps.fps = Math.round(runtime.fps.frameCount / runtime.fps.frameAccumulator);
      runtime.fps.reportTimer = 0;
      runtime.fps.frameCount = 0;
      runtime.fps.frameAccumulator = 0;
    }

    if (runtime.mode !== "playing") {
      tickFxSystem(runtime.fx, dt, runtime.settings.reduceMotion);
      updateCamera(runtime.camera, runtime, runtime.fx, dt);
      return;
    }

    runtime.elapsed += dt;

    if (runtime.messageTtl > 0) {
      runtime.messageTtl = Math.max(0, runtime.messageTtl - dt);
      if (runtime.messageTtl === 0) runtime.message = "";
    }

    runtime.phase.justShiftedTimer = Math.max(0, runtime.phase.justShiftedTimer - dt);
    if (runtime.phase.timer > 0) {
      runtime.phase.timer = Math.max(0, runtime.phase.timer - dt);
      if (runtime.phase.timer === 0) runtime.phase.active = "A";
    }
    runtime.phase.cooldown = Math.max(0, runtime.phase.cooldown - dt);

    const beatHit = updateBeatState(runtime.beat, dt);
    if (beatHit) pulseBeatFx(runtime.fx, 1);

    tickScoreState(runtime.score, dt);
    runtime.charge = clamp(runtime.charge + runtime.difficulty.chargeRegen * dt, 0, MAX_CHARGE);

    runtime.input.jumpPressed = inputRef.current.jump;
    runtime.input.burstPressed = inputRef.current.burst;
    runtime.input.shiftPressed = inputRef.current.shift;
    inputRef.current.jump = false;
    inputRef.current.burst = false;
    inputRef.current.shift = false;

    if (runtime.input.jumpPressed) {
      const rating = getBeatRating(runtime.beat, runtime.difficulty);
      runtime.pendingJumpRating = rating;
      runtime.jumpVelocityScale = rating.rating === "perfect" ? 1.1 : rating.rating === "good" ? 1.03 : 0.96;
      runtime.replayRecording.events.push({ time: Number(runtime.elapsed.toFixed(4)), type: "jump" });
    } else {
      runtime.jumpVelocityScale = 1;
    }

    if (runtime.input.shiftPressed) {
      const shiftRating = getBeatRating(runtime.beat, runtime.difficulty);
      if (runtime.phase.cooldown <= 0) {
        runtime.phase.active = runtime.phase.active === "A" ? "B" : "A";
        runtime.phase.timer = runtime.difficulty.shiftDuration;
        runtime.phase.cooldown = runtime.difficulty.shiftCooldown;
        runtime.phase.justShiftedTimer = 0.34;
        runtime.messageTtl = 0.65;

        if (shiftRating.rating === "perfect") {
          registerPerfectShift(runtime.score);
          runtime.charge = clamp(runtime.charge + 0.24, 0, MAX_CHARGE);
          spawnPerfectJumpFx(
            runtime.fx,
            runtime.player.x,
            runtime.player.y,
            settings.colorblindSafe ? "#f8ff7a" : "#90ffc7"
          );
          runtime.message = "Perfect Shift";
        } else if (shiftRating.rating === "miss") {
          applyTimingJudgement(runtime.score, "miss", 18);
          runtime.message = "Shift off-beat";
        } else {
          runtime.score.score += 42;
          runtime.message = "Shift online";
        }
        if (!silent) playSfx(audioRef.current, "shift");
      } else {
        runtime.message = "Shift cooling down";
        runtime.messageTtl = 0.42;
      }
    }

    if (runtime.input.burstPressed) {
      if (runtime.charge >= runtime.difficulty.burstCost) {
        const burstRating = getBeatRating(runtime.beat, runtime.difficulty);
        const onBeat = burstRating.rating !== "miss";
        const target = performBurst(runtime, runtime.difficulty, runtime.frameEvents);
        if (target) {
          if (onBeat && burstRating.rating === "perfect") {
            for (const obstacle of runtime.obstacles) {
              if (obstacle.disabled || obstacle.type === "finish-beacon") continue;
              if (Math.abs(obstacle.x - target.x) <= 86) obstacle.disabled = true;
            }
          }
          rewardBurst(runtime.score, burstRating.rating, onBeat);
          spawnBurstFx(runtime.fx, target.x + target.w * 0.5, target.y + target.h * 0.5, onBeat);
          runtime.message = onBeat ? "Beat Burst" : "Burst fired";
          runtime.messageTtl = 0.64;
          if (!silent) playSfx(audioRef.current, "burst");
        } else {
          runtime.message = "No burst target";
          runtime.messageTtl = 0.5;
        }
      } else {
        runtime.message = "Low charge";
        runtime.messageTtl = 0.45;
      }
    }

    resetFrameEvents(runtime.frameEvents);
    stepPhysics(runtime, dt, runtime.difficulty, runtime.frameEvents);

    if (runtime.frameEvents.jumped) {
      const rating = runtime.pendingJumpRating?.rating ?? "good";
      applyTimingJudgement(runtime.score, rating, 108);
      if (rating === "perfect") {
        spawnPerfectJumpFx(
          runtime.fx,
          runtime.player.x,
          runtime.player.y,
          settings.colorblindSafe ? "#f8ff7a" : "#8fffc1"
        );
        runtime.message = "Perfect jump";
        runtime.messageTtl = 0.48;
        if (!silent) playSfx(audioRef.current, "perfect");
      } else if (rating === "good") {
        if (!silent) playSfx(audioRef.current, "jump");
      } else {
        runtime.message = "Miss timing";
        runtime.messageTtl = 0.35;
      }
    }

    if (runtime.frameEvents.collectedPickups > 0) {
      rewardPickup(runtime.score, runtime.frameEvents.lastCollectedValue);
      spawnPickupFx(runtime.fx, runtime.player.x + 6, runtime.player.y - 12);
      runtime.message = "Pulse orb +";
      runtime.messageTtl = 0.45;
      if (!silent) playSfx(audioRef.current, "pickup");
    }

    if (runtime.frameEvents.damage) {
      registerDamage(runtime.score);
      runtime.charge = clamp(runtime.charge - 0.45, 0, MAX_CHARGE);
      spawnDamageFx(runtime.fx, runtime.player.x, runtime.player.y);
      runtime.message = "Integrity hit";
      runtime.messageTtl = 0.8;
      if (!silent) playSfx(audioRef.current, "damage");
    }

    for (const pickup of runtime.pickups) {
      if (!pickup.collected) pickup.spin += dt;
    }

    addRuntimeScore(runtime.score, dt, runtime.worldSpeed);
    updateGhostReplay(runtime.ghost, dt, runtime.elapsed, runtime.worldSpeed);

    if (runtime.integrity <= 0) {
      finishRun(false, silent);
    } else if (runtime.player.x >= runtime.finishX) {
      runtime.score.score += 620 + runtime.integrity * 120 + runtime.score.longestPerfectStreak * 20;
      finishRun(true, silent);
    }

    tickFxSystem(runtime.fx, dt, runtime.settings.reduceMotion);
    updateCamera(runtime.camera, runtime, runtime.fx, dt);
    updateMusicScheduler(audioRef.current, runtime.beat.section);
  }, [finishRun, settings.colorblindSafe]);

  const advanceTime = useCallback((ms) => {
    let remaining = Math.max(0, Number(ms) || 0) / 1000;
    while (remaining > 0) {
      const dt = Math.min(FRAME_STEP, remaining);
      step(dt, true);
      remaining -= dt;
    }
    drawNow();
    publishSnapshot();
    return { mode: runtimeRef.current.mode, elapsed: runtimeRef.current.elapsed };
  }, [drawNow, publishSnapshot, step]);

  const buildTextPayload = useCallback((state) => ({
    mode: "pulse_prism_runner_v2",
    coordinateSystem: "origin top-left; +x right, +y down; world and screen axis match",
    title: GAME_NAME,
    status: state.mode,
    difficulty: state.difficultyLabel,
    seed: state.seed,
    bpm: BPM,
    beat: {
      index: state.beatIndex,
      nextBeatMs: state.nextBeatMs,
      pulse: state.beatPulse,
      section: state.beatSection,
      windowsMs: {
        perfect: Math.round((DIFFICULTY_PRESETS[state.difficultyId]?.perfectWindow ?? 0.084) * 1000),
        good: Math.round((DIFFICULTY_PRESETS[state.difficultyId]?.goodWindow ?? 0.168) * 1000),
      },
    },
    player: {
      worldX: Number(state.playerX.toFixed(2)),
      screenX: 280,
      y: Number(state.playerY.toFixed(2)),
      vy: Number(state.playerVy.toFixed(2)),
      phase: state.phase,
    },
    resources: {
      integrity: state.integrity,
      charge: Number(state.charge.toFixed(2)),
    },
    score: {
      value: state.score,
      combo: state.combo,
      maxCombo: state.maxCombo,
      perfects: state.perfects,
      goods: state.goods,
      misses: state.misses,
      accuracyPercent: state.accuracy,
      rank: state.rank,
      lastJudgement: state.lastJudgement,
    },
    progress: {
      percent: state.progress,
      elapsedSeconds: Number(state.elapsed.toFixed(2)),
      worldLength: Number(state.worldLength.toFixed(2)),
      finishX: Number(state.finishX.toFixed(2)),
    },
    shift: {
      active: state.phase,
      cooldownSeconds: Number(state.phaseCooldown.toFixed(2)),
      timerSeconds: Number(state.phaseTimer.toFixed(2)),
    },
    replayGhostActive: state.replayGhostActive,
    visibleObstacles: state.visibleObstacles,
    visiblePickups: state.visiblePickups,
    message: state.message,
    settings: {
      audioEnabled: state.audioEnabled,
      reduceMotion: state.reduceMotion,
      colorblindSafe: state.colorblindSafe,
      debugEnabled: state.debugEnabled,
    },
    performance: {
      fps: state.fps,
      frameMs: Number(state.frameMs.toFixed(2)),
    },
    controls: {
      jump: "Space or ArrowUp",
      burst: "E",
      shift: "Q",
      playConfirm: "Enter",
      pause: "P",
      restart: "R",
      fullscreen: "F",
      audio: "O or M",
    },
    resultSummary: state.resultSummary,
  }), []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
    setAudioEnabled(audioRef.current, settings.audioEnabled);
    drawNow();
    publishSnapshot();
  }, [drawNow, publishSnapshot, settings.audioEnabled]);

  useEffect(() => {
    const onFs = () => {
      runtimeRef.current.fullscreen = Boolean(document.fullscreenElement);
      publishSnapshot();
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [publishSnapshot]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const code = event.code;
      const mode = runtimeRef.current.mode;

      if (code === "Space" || code === "ArrowUp") {
        event.preventDefault();
        if (mode === "menu") startRun();
        else if (!event.repeat && mode === "playing") queueInput(MOBILE_TOUCH_IDS.jump);
        return;
      }
      if (code === "KeyE") {
        event.preventDefault();
        if (!event.repeat && mode === "playing") queueInput(MOBILE_TOUCH_IDS.burst);
        return;
      }
      if (code === "KeyQ") {
        event.preventDefault();
        if (!event.repeat && mode === "playing") queueInput(MOBILE_TOUCH_IDS.shift);
        return;
      }
      if (code === "Enter") {
        event.preventDefault();
        if (mode === "menu" || mode === "results") startRun();
        else if (mode === "paused") togglePause();
        return;
      }
      if (code === "KeyP") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (code === "KeyR") {
        event.preventDefault();
        restartRun();
        return;
      }
      if (code === "KeyF") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (code === "KeyO" || code === "KeyM") {
        event.preventDefault();
        applySettingsPatch({ audioEnabled: !runtimeRef.current.settings.audioEnabled });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applySettingsPatch, queueInput, restartRun, startRun, toggleFullscreen, togglePause]);

  useEffect(() => {
    const frame = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      dt = Math.min(0.05, Math.max(0, dt));

      step(dt, false);
      drawNow();

      snapshotTimerRef.current += dt;
      if (snapshotTimerRef.current >= 1 / SNAPSHOT_HZ) {
        snapshotTimerRef.current = 0;
        publishSnapshot();
      }

      rafRef.current = window.requestAnimationFrame(frame);
    };

    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
      snapshotTimerRef.current = 0;
    };
  }, [drawNow, publishSnapshot, step]);

  useEffect(() => () => {
    stopMusic(audioRef.current);
    disposeAudio(audioRef.current);
  }, []);

  const canPause = snapshot.mode === "playing" || snapshot.mode === "paused";
  const pauseOverlay = snapshot.mode === "paused";
  const resultOverlay = snapshot.mode === "results" && snapshot.resultSummary;
  const beatPulseClass = snapshot.beatPulse > 0.55 ? "is-pulse" : "";
  const comboPopClass = snapshot.lastJudgement === "perfect" && snapshot.lastJudgementTimer > 0 ? "is-pop" : "";

  return (
    <div className="mini-game pulse-prism-runner" data-colorblind={settings.colorblindSafe ? "true" : "false"}>
      <div className="ppr-shell" ref={shellRef}>
        <header className="ppr-header">
          <div className="ppr-title-wrap">
            <h4>{GAME_NAME}</h4>
            <p>Runner rítmico original: Canvas 2D + WebAudio procedural + feedback sincronizado.</p>
            <div className="ppr-title-badge">Original Rhythm Runner</div>
          </div>
          <div className="ppr-top-actions">
            <button type="button" className="ppr-btn is-primary" onClick={() => startRun()}>
              {snapshot.mode === "playing" ? "Restart" : "Play"}
            </button>
            <button type="button" className="ppr-btn" onClick={togglePause} disabled={!canPause}>
              {snapshot.mode === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="ppr-btn" onClick={toggleFullscreen}>Fullscreen</button>
          </div>
        </header>

        <div className="ppr-main">
          <aside className="ppr-panel">
            <h5>Main Menu</h5>
            <p>Casual/Core/Expert, seed determinista y toggles de accesibilidad.</p>

            <div className="ppr-form">
              <label>
                Difficulty
                <select
                  className="ppr-select"
                  value={settings.difficultyId}
                  onChange={(event) => applySettingsPatch({ difficultyId: event.target.value })}
                >
                  {Object.values(DIFFICULTY_PRESETS).map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>{difficulty.label}</option>
                  ))}
                </select>
              </label>

              <label>
                Seed
                <input
                  className="ppr-input"
                  type="number"
                  value={settings.seed}
                  onChange={(event) => applySettingsPatch({ seed: Number(event.target.value) || BASE_SEED })}
                />
              </label>

              <div className="ppr-switch-row">
                <button
                  type="button"
                  className="ppr-toggle"
                  aria-pressed={settings.audioEnabled}
                  onClick={() => applySettingsPatch({ audioEnabled: !settings.audioEnabled })}
                >
                  Audio {settings.audioEnabled ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  className="ppr-toggle"
                  aria-pressed={settings.deterministic}
                  onClick={() => applySettingsPatch({ deterministic: !settings.deterministic })}
                >
                  Deterministic {settings.deterministic ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  className="ppr-toggle"
                  aria-pressed={settings.reduceMotion}
                  onClick={() => applySettingsPatch({ reduceMotion: !settings.reduceMotion })}
                >
                  Reduce Motion {settings.reduceMotion ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  className="ppr-toggle"
                  aria-pressed={settings.colorblindSafe}
                  onClick={() => applySettingsPatch({ colorblindSafe: !settings.colorblindSafe })}
                >
                  Colorblind {settings.colorblindSafe ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  className="ppr-toggle"
                  aria-pressed={settings.debugEnabled}
                  onClick={() => applySettingsPatch({ debugEnabled: !settings.debugEnabled })}
                >
                  Debug {settings.debugEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            <div className="ppr-name-list">
              {ALT_NAMES.map((name) => (
                <span key={name} className="ppr-chip">{name}</span>
              ))}
            </div>

            <p className="ppr-status-line">{snapshot.message || "Press Play."}</p>
          </aside>

          <section className="ppr-stage-wrap">
            <div className="ppr-hud">
              <article className="ppr-hud-card">
                <div className="ppr-hud-label">Integrity</div>
                <div className="ppr-health-grid">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`ppr-health-cell ${snapshot.integrity > i ? "is-live" : ""}`} />
                  ))}
                </div>
                <div className="ppr-hud-label" style={{ marginTop: "0.34rem" }}>Charge</div>
                <div className="ppr-charge-track">
                  <div className="ppr-charge-fill" style={{ width: `${Math.round((snapshot.charge / MAX_CHARGE) * 100)}%` }} />
                </div>
              </article>

              <article className="ppr-hud-card">
                <div className="ppr-hud-label">Combo</div>
                <div className={`ppr-hud-value ppr-combo ${comboPopClass}`}><span>x{snapshot.combo}</span></div>
                <div className="ppr-hud-label" style={{ marginTop: "0.26rem" }}>Score</div>
                <div className="ppr-hud-value">{snapshot.score}</div>
              </article>

              <article className="ppr-hud-card">
                <div className="ppr-hud-label">Beat</div>
                <div className="ppr-beat-meter">
                  <span className={`ppr-beat-ring ${beatPulseClass}`} />
                  <div className="ppr-hud-value">{snapshot.nextBeatMs} ms</div>
                </div>
                <div className="ppr-hud-label" style={{ marginTop: "0.26rem" }}>Acc / Rank</div>
                <div className="ppr-hud-value">{snapshot.accuracy}% · {snapshot.rank}</div>
              </article>
            </div>

            <div className="ppr-canvas-shell">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label="Pulse Prism Runner canvas" />

              {pauseOverlay && (
                <div className="ppr-overlay">
                  <div className="ppr-overlay-panel">
                    <h5>Paused</h5>
                    <p>Resume, restart o vuelve a settings.</p>
                    <div className="ppr-overlay-actions">
                      <button type="button" className="ppr-btn is-primary" onClick={togglePause}>Resume</button>
                      <button type="button" className="ppr-btn" onClick={restartRun}>Restart</button>
                      <button type="button" className="ppr-btn" onClick={openMenu}>Settings</button>
                    </div>
                  </div>
                </div>
              )}

              {resultOverlay && (
                <div className="ppr-overlay">
                  <div className="ppr-overlay-panel">
                    <h5>{snapshot.resultSummary.won ? "Run Complete" : "Run Failed"}</h5>
                    <p>Breakdown final de la carrera.</p>
                    <div className="ppr-results-grid">
                      <div className="ppr-results-item"><span>Score</span><strong>{snapshot.resultSummary.score}</strong></div>
                      <div className="ppr-results-item"><span>Accuracy</span><strong>{snapshot.resultSummary.accuracyPercent}%</strong></div>
                      <div className="ppr-results-item"><span>Perfects</span><strong>{snapshot.resultSummary.perfects}</strong></div>
                      <div className="ppr-results-item"><span>Streak</span><strong>{snapshot.resultSummary.longestPerfectStreak}</strong></div>
                      <div className="ppr-results-item"><span>Damage</span><strong>{snapshot.resultSummary.damageTaken}</strong></div>
                      <div className="ppr-results-item"><span>Time</span><strong>{snapshot.resultSummary.elapsedSeconds}s</strong></div>
                    </div>
                    <div className="ppr-rank-badge">Rank {snapshot.resultSummary.rank}</div>
                    <div className="ppr-overlay-actions">
                      <button type="button" className="ppr-btn is-primary" onClick={restartRun}>Restart</button>
                      <button type="button" className="ppr-btn" onClick={openMenu}>Main Menu</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ppr-mobile-controls">
              <button type="button" className="ppr-btn" onPointerDown={() => queueInput(MOBILE_TOUCH_IDS.jump)}>Jump</button>
              <button type="button" className="ppr-btn" onPointerDown={() => queueInput(MOBILE_TOUCH_IDS.burst)}>Burst</button>
              <button type="button" className="ppr-btn" onPointerDown={() => queueInput(MOBILE_TOUCH_IDS.shift)}>Shift</button>
            </div>

            <p className="ppr-footer-help">
              Space/Up jump · E burst · Q shift · Enter play · P pause · R restart · F fullscreen
            </p>

            {settings.debugEnabled && (
              <div className="ppr-debug">
                FPS {snapshot.fps} · Frame {snapshot.frameMs.toFixed(2)} ms · Ghost {snapshot.replayGhostActive ? "ON" : "OFF"} · Section {snapshot.beatSection}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default RhythmPlatformerGame;
