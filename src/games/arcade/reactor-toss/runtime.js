import { createBall, createRunStats, createTransientFlags } from "./core/entities/factories";
import { WORLD1_LEVELS } from "./core/level/world1";
import { BALL_SKINS, WORLD_THEMES } from "./core/level/themes";
import {
  FAIL_RESET_MS,
  FIXED_DT_MS,
  INPUT_PROFILES,
  MAX_DRAG_DISTANCE,
  MIN_DRAG_DISTANCE,
  PORTAL_COOLDOWN_MS,
  RUN_RESULT,
  SHAKE_DECAY,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  clamp,
  computeLaunchSpeed,
} from "./core/physics/constants";
import {
  applyFieldForces,
  applyTargetForces,
  buildPreviewDots,
  computeBallSquash,
  createPortalPairs,
  getBallSpeed,
  integrateBall,
  isBallOutOfBounds,
  resolveObstaclePose,
  resolveTargetPose,
  stepObstacles,
  withinStage,
} from "./core/physics/simulation";
import FluxAudioSystem from "./core/systems/audio";
import { spawnBurst, spawnTrail, updateParticles } from "./core/systems/particles";
import { drawFluxScene } from "./render/drawScene";
import {
  applyLevelResult,
  incrementRetryCount,
  loadFluxSave,
  persistFluxSave,
  selectSkin,
  updateSettings,
} from "./services/save";

const DEG_TO_RAD = Math.PI / 180;
const AIM_MIN_DEG = -175;
const AIM_MAX_DEG = -5;

function localizeLabel(value, locale) {
  if (!value) {
    return "";
  }
  return value[locale] ?? value.en ?? "";
}

function impactCueFromObstacle(obstacle, impactSpeed) {
  if (!obstacle) {
    return impactSpeed > 320 ? "rubber-strong" : "rubber-soft";
  }
  if (obstacle.type === "bumper") {
    return impactSpeed > 320 ? "rubber-strong" : "rubber-soft";
  }
  if (obstacle.type === "stickyPad") {
    return "gel";
  }
  if (obstacle.type === "movingBar") {
    return "composite";
  }
  if (obstacle.type === "gate") {
    return "gate";
  }
  return "metal-soft";
}

function createTrailPoint(ball) {
  return {
    x: ball.x,
    y: ball.y,
    radius: clamp(ball.radius * 0.14, 2, 6),
  };
}

function createLevelLookup(levels) {
  return new Map(levels.map((level) => [level.id, level]));
}

export default class FluxBasinRuntime {
  constructor({ canvas, locale = "en", ui, onSnapshot, onFullscreenRequest }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.locale = locale === "es" ? "es" : "en";
    this.ui = ui;
    this.onSnapshot = onSnapshot;
    this.onFullscreenRequest = onFullscreenRequest;

    this.levels = WORLD1_LEVELS;
    this.levelLookup = createLevelLookup(this.levels);
    this.theme = WORLD_THEMES["neon-foundry"];
    this.audio = new FluxAudioSystem({ enabled: true });

    this.saveData = loadFluxSave(this.levels);
    this.audio.setEnabled(this.saveData.settings.soundEnabled);

    this.mode = "menu";
    this.playState = "idle";
    this.clockMs = 0;
    this.accumulatorMs = 0;
    this.lastFrameTime = 0;
    this.rafId = 0;
    this.running = false;

    this.keyState = Object.create(null);
    this.virtualState = {
      aimLeft: false,
      aimRight: false,
      powerDown: false,
      powerUp: false,
    };

    this.transient = createTransientFlags();
    this.level = null;
    this.posedObstacles = [];
    this.posedTarget = null;
    this.portalPairs = new Map();
    this.ball = createBall({ x: 0, y: 0 });
    this.runStats = createRunStats("flux-01");
    this.particles = [];
    this.aim = {
      angleDeg: -34,
      power: 0.56,
      launchSpeed: computeLaunchSpeed(0.56),
      dots: [],
      isDragging: false,
    };
    this.score = 0;
    this.starsEarned = 0;
    this.result = RUN_RESULT.none;
    this.resultLabel = "";
    this.shotStartElapsedMs = 0;
    this.bestScore = 0;
    this.medalLabel = "";
    this.shakeOffset = { x: 0, y: 0 };
    this.lastNearMissAtMs = -Infinity;
    this.pausedState = "aiming";

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.loop = this.loop.bind(this);

    this.prepareLevel(this.saveData.currentLevelId ?? this.levels[0].id, false);
    this.mode = "menu";
    this.playState = "idle";
  }

  start() {
    this.canvas.width = STAGE_WIDTH;
    this.canvas.height = STAGE_HEIGHT;
    this.canvas.style.touchAction = "none";
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointercancel", this.handlePointerUp);
    this.canvas.addEventListener("pointerleave", this.handlePointerUp);
    this.running = true;
    this.lastFrameTime = performance.now();
    this.render();
    this.emit();
    this.rafId = window.requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    window.cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerUp);
    this.canvas.removeEventListener("pointercancel", this.handlePointerUp);
    this.canvas.removeEventListener("pointerleave", this.handlePointerUp);
  }

  loop(now) {
    if (!this.running) {
      return;
    }
    const deltaMs = Math.min(80, now - this.lastFrameTime);
    this.lastFrameTime = now;
    this.advanceInternal(deltaMs);
    this.rafId = window.requestAnimationFrame(this.loop);
  }

  advanceInternal(ms) {
    this.accumulatorMs += ms;
    while (this.accumulatorMs >= FIXED_DT_MS) {
      this.update(FIXED_DT_MS);
      this.accumulatorMs -= FIXED_DT_MS;
    }
    this.render();
    this.emit();
  }

  advanceTime(ms = 0) {
    const safeMs = clamp(Number(ms) || 0, 0, 4000);
    this.accumulatorMs += safeMs;
    while (this.accumulatorMs >= FIXED_DT_MS) {
      this.update(FIXED_DT_MS);
      this.accumulatorMs -= FIXED_DT_MS;
    }
    this.render();
    this.emit();
  }

  getSettings() {
    return this.saveData.settings;
  }

  getSelectedSkin() {
    return BALL_SKINS.find((skin) => skin.id === this.saveData.selectedSkinId) ?? BALL_SKINS[0];
  }

  getLevelProgress(levelId) {
    return this.saveData.levels[levelId] ?? {
      unlocked: false,
      completed: false,
      stars: 0,
      attempts: 0,
      bestScore: 0,
      bestTimeMs: null,
      bestBounces: null,
      firstShotWin: false,
    };
  }

  setSaveData(nextSave) {
    this.saveData = nextSave;
    this.audio.setEnabled(nextSave.settings.soundEnabled);
    persistFluxSave(this.saveData);
  }

  setFullscreenState(fullscreen) {
    this.fullscreen = Boolean(fullscreen);
    this.emit();
  }

  setVirtualControl(name, active) {
    if (name in this.virtualState) {
      this.virtualState[name] = Boolean(active);
    }
  }

  prepareLevel(levelId, resetElapsed = true) {
    this.level = this.levelLookup.get(levelId) ?? this.levels[0];
    this.ball = createBall(this.level.ballSpawn);
    this.runStats = createRunStats(this.level.id);
    if (!resetElapsed) {
      this.runStats.elapsedMs = 0;
    }
    this.aim = {
      angleDeg: clamp(this.level.ballSpawn.aimDeg ?? -34, AIM_MIN_DEG, AIM_MAX_DEG),
      power: clamp(this.level.ballSpawn.power ?? 0.56, 0.18, 1),
      launchSpeed: computeLaunchSpeed(this.level.ballSpawn.power ?? 0.56),
      dots: [],
      isDragging: false,
    };
    this.transient = createTransientFlags();
    this.particles = [];
    this.result = RUN_RESULT.none;
    this.resultLabel = "";
    this.score = 0;
    this.starsEarned = 0;
    this.medalLabel = "";
    this.lastNearMissAtMs = -Infinity;
    this.playState = "aiming";
    this.poseLevel();
    this.updatePreview();
    this.bestScore = this.getLevelProgress(this.level.id).bestScore ?? 0;
  }

  poseLevel() {
    this.posedObstacles = this.level.obstacles.map((obstacle) => resolveObstaclePose(obstacle, this.clockMs));
    this.posedTarget = resolveTargetPose(this.level.target, this.clockMs);
    this.portalPairs = createPortalPairs(this.posedObstacles);
  }

  updatePreview() {
    if (!this.level) {
      return;
    }
    if (!this.saveData.settings.showTrajectoryHelp) {
      this.aim.dots = [];
      return;
    }
    this.aim.launchSpeed = computeLaunchSpeed(this.aim.power);
    this.aim.dots = buildPreviewDots(this.level, this.aim, this.clockMs, INPUT_PROFILES[this.saveData.settings.inputProfile].previewDots);
  }

  openMenu() {
    this.mode = "menu";
    this.playState = "idle";
    this.transient.message = this.ui.messages.menu;
    this.emit();
  }

  openLevelSelect() {
    this.mode = "levelSelect";
    this.playState = "idle";
    this.emit();
  }

  startLevel(levelId = this.level?.id ?? this.saveData.currentLevelId ?? this.levels[0].id) {
    const progress = this.getLevelProgress(levelId);
    const allowedLevelId = progress.unlocked ? levelId : this.levels[0].id;
    this.prepareLevel(allowedLevelId, true);
    this.mode = "playing";
    this.playState = "aiming";
    this.transient.message = this.ui.messages.ready;
    this.emit();
  }

  restartLevel({ countRetry = true } = {}) {
    if (!this.level) {
      return;
    }
    if (countRetry) {
      this.setSaveData(incrementRetryCount(this.saveData));
    }
    this.prepareLevel(this.level.id, true);
    this.mode = "playing";
    this.playState = "aiming";
    this.transient.message = this.ui.messages.retry;
  }

  nextLevel() {
    const next = this.levels[this.level.index + 1];
    if (next) {
      this.startLevel(next.id);
    } else {
      this.mode = "menu";
      this.playState = "idle";
      this.transient.message = this.ui.messages.worldClear;
      this.audio.play("transition");
    }
  }

  togglePause() {
    if (this.mode !== "playing") {
      return;
    }
    if (this.playState === "paused") {
      this.playState = this.pausedState;
      this.transient.message = this.ui.messages.resume;
      if (this.playState === "aiming") {
        this.updatePreview();
      }
    } else if (this.playState === "aiming" || this.playState === "flying" || this.playState === "recovering") {
      this.pausedState = this.playState;
      this.playState = "paused";
      this.transient.message = this.ui.messages.paused;
    }
    this.emit();
  }

  toggleSound() {
    this.setSaveData(updateSettings(this.saveData, { soundEnabled: !this.saveData.settings.soundEnabled }));
    this.transient.message = this.saveData.settings.soundEnabled ? this.ui.messages.soundOn : this.ui.messages.soundOff;
  }

  toggleVibration() {
    this.setSaveData(updateSettings(this.saveData, { vibrationEnabled: !this.saveData.settings.vibrationEnabled }));
  }

  setInputProfile(profile) {
    if (!(profile in INPUT_PROFILES)) {
      return;
    }
    this.setSaveData(updateSettings(this.saveData, { inputProfile: profile }));
    this.updatePreview();
  }

  setShowTrajectoryHelp(value) {
    this.setSaveData(updateSettings(this.saveData, { showTrajectoryHelp: Boolean(value) }));
    this.updatePreview();
  }

  setAutoRetry(value) {
    this.setSaveData(updateSettings(this.saveData, { autoRetry: Boolean(value) }));
  }

  chooseSkin(skinId) {
    const before = this.saveData.selectedSkinId;
    this.setSaveData(selectSkin(this.saveData, skinId));
    if (before !== this.saveData.selectedSkinId) {
      this.transient.message = `${this.ui.labels.skin}: ${localizeLabel(this.getSelectedSkin().name, this.locale)}`;
    }
  }

  cycleSkin() {
    const unlocked = this.saveData.unlockedSkinIds;
    const index = unlocked.indexOf(this.saveData.selectedSkinId);
    const nextId = unlocked[(index + 1) % unlocked.length] ?? unlocked[0];
    this.chooseSkin(nextId);
  }

  vibrate(pattern) {
    if (this.saveData.settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  handleKeyDown(event) {
    this.keyState[event.code] = true;
    this.audio.unlock();

    if (event.code === "KeyF") {
      this.onFullscreenRequest?.();
      return;
    }
    if (event.code === "KeyM") {
      this.toggleSound();
      return;
    }
    if (event.code === "KeyV") {
      this.toggleVibration();
      return;
    }
    if (event.code === "KeyP" || event.code === "Escape") {
      this.togglePause();
      return;
    }
    if (event.code === "KeyR") {
      if (this.mode === "playing") {
        this.restartLevel();
      }
      return;
    }
    if (event.code === "KeyL") {
      this.openLevelSelect();
      return;
    }
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      if (this.mode === "menu") {
        this.startLevel();
        return;
      }
      if (this.mode === "levelSelect") {
        this.startLevel(this.level?.id ?? this.saveData.currentLevelId ?? this.levels[0].id);
        return;
      }
      if (this.mode === "playing" && this.playState === "aiming") {
        this.fireBall();
        return;
      }
      if (this.mode === "levelComplete") {
        this.nextLevel();
      }
    }
  }

  handleKeyUp(event) {
    this.keyState[event.code] = false;
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  handlePointerDown(event) {
    if (this.mode !== "playing" || this.playState !== "aiming") {
      return;
    }
    const point = this.getCanvasPoint(event);
    const dx = point.x - this.level.ballSpawn.x;
    const dy = point.y - this.level.ballSpawn.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq > sqr(this.level.ballSpawn.dragRadius ?? 88)) {
      return;
    }

    this.audio.unlock();
    this.canvas.setPointerCapture?.(event.pointerId);
    this.transient.pointerId = event.pointerId;
    this.transient.dragging = true;
    this.aim.isDragging = true;
    this.transient.dragStartX = point.x;
    this.transient.dragStartY = point.y;
    this.transient.dragCurrentX = point.x;
    this.transient.dragCurrentY = point.y;
    this.audio.play("charge");
    this.updateAimFromPointer(point);
  }

  handlePointerMove(event) {
    if (!this.transient.dragging || event.pointerId !== this.transient.pointerId) {
      return;
    }
    const point = this.getCanvasPoint(event);
    this.transient.dragCurrentX = point.x;
    this.transient.dragCurrentY = point.y;
    this.updateAimFromPointer(point);
  }

  handlePointerUp(event) {
    if (!this.transient.dragging || event.pointerId !== this.transient.pointerId) {
      return;
    }
    const point = this.getCanvasPoint(event);
    const launchDistance = distance(this.level.ballSpawn.x, this.level.ballSpawn.y, point.x, point.y);
    this.transient.dragging = false;
    this.aim.isDragging = false;
    this.transient.pointerId = null;
    this.canvas.releasePointerCapture?.(event.pointerId);
    if (launchDistance >= MIN_DRAG_DISTANCE) {
      this.updateAimFromPointer(point);
      this.fireBall();
    }
    this.updatePreview();
  }

  updateAimFromPointer(point) {
    const vectorX = this.level.ballSpawn.x - point.x;
    const vectorY = this.level.ballSpawn.y - point.y;
    const distanceDrag = Math.min(MAX_DRAG_DISTANCE, Math.hypot(vectorX, vectorY));
    const dragMultiplier = INPUT_PROFILES[this.saveData.settings.inputProfile].dragMultiplier;
    const power = clamp((distanceDrag / MAX_DRAG_DISTANCE) * dragMultiplier, 0.18, 1);
    const angleDeg = clamp(Math.atan2(vectorY, vectorX) / DEG_TO_RAD, AIM_MIN_DEG, AIM_MAX_DEG);
    this.aim.angleDeg = angleDeg;
    this.aim.power = power;
    this.updatePreview();
  }

  adjustAimByKeyboard(dtMs) {
    if (this.mode !== "playing" || this.playState !== "aiming") {
      return;
    }

    const inputProfile = INPUT_PROFILES[this.saveData.settings.inputProfile];
    let changed = false;
    const angleStep = inputProfile.keyboardAngleStep * (dtMs / 16.6667);
    const powerStep = inputProfile.keyboardPowerStep * (dtMs / 16.6667);

    if (this.keyState.ArrowLeft || this.keyState.KeyA || this.virtualState.aimLeft) {
      this.aim.angleDeg = clamp(this.aim.angleDeg - angleStep, AIM_MIN_DEG, AIM_MAX_DEG);
      changed = true;
    }
    if (this.keyState.ArrowRight || this.keyState.KeyD || this.virtualState.aimRight) {
      this.aim.angleDeg = clamp(this.aim.angleDeg + angleStep, AIM_MIN_DEG, AIM_MAX_DEG);
      changed = true;
    }
    if (this.keyState.ArrowUp || this.keyState.KeyW || this.virtualState.powerUp) {
      this.aim.power = clamp(this.aim.power + powerStep, 0.18, 1);
      changed = true;
    }
    if (this.keyState.ArrowDown || this.keyState.KeyS || this.virtualState.powerDown) {
      this.aim.power = clamp(this.aim.power - powerStep, 0.18, 1);
      changed = true;
    }

    if (changed) {
      this.updatePreview();
    }
  }

  fireBall() {
    if (this.mode !== "playing" || this.playState !== "aiming") {
      return;
    }
    this.ball.active = true;
    this.ball.vx = Math.cos(this.aim.angleDeg * DEG_TO_RAD) * computeLaunchSpeed(this.aim.power);
    this.ball.vy = Math.sin(this.aim.angleDeg * DEG_TO_RAD) * computeLaunchSpeed(this.aim.power);
    this.ball.angularVelocity = this.ball.vx * 0.012;
    this.ball.portalLockMs = PORTAL_COOLDOWN_MS;
    this.ball.targetDwellMs = 0;
    this.ball.stillMs = 0;
    this.ball.trail = [];
    this.playState = "flying";
    this.transient.callout = "";
    this.runStats.launches += 1;
    this.runStats.rebounds = 0;
    this.shotStartElapsedMs = this.runStats.elapsedMs;
    this.particles.push(...spawnBurst(this.ball.x, this.ball.y, { count: 10, color: "#bafaff", speed: 220, size: 4 }));
    this.audio.play("release");
    this.vibrate(10);
    this.transient.message = this.ui.messages.inFlight;
  }

  failLevel(reason) {
    if (this.playState === "recovering" || this.mode !== "playing") {
      return;
    }
    this.result = reason;
    this.resultLabel = this.ui.resultLabels[reason] ?? this.ui.resultLabels.out;
    this.playState = "recovering";
    this.transient.resultTimerMs = this.saveData.settings.autoRetry ? FAIL_RESET_MS : 0;
    this.ball.active = false;
    this.particles.push(...spawnBurst(this.ball.x, this.ball.y, { count: 14, color: "#ff8da2", speed: 260, size: 5 }));
    this.audio.play("fail");
    this.vibrate([18, 18, 26]);
    this.transient.message = this.resultLabel;
  }

  completeLevel() {
    if (this.mode !== "playing") {
      return;
    }

    const par = this.level.starRules;
    const timeMs = Math.max(1, Math.round(this.runStats.elapsedMs));
    const bounces = this.runStats.rebounds;
    const attempts = this.runStats.attempts;
    let stars = 1;
    if (attempts === 1 && timeMs <= par.parTimeMs * 1.08 && bounces <= par.parBounces) {
      stars = 3;
    } else if (attempts <= par.parAttempts + 1 && timeMs <= par.parTimeMs * 1.35) {
      stars = 2;
    }

    const firstAttempt = attempts === 1;
    const cleanBonus = bounces <= Math.max(1, par.parBounces - 1) ? 120 : 0;
    const firstAttemptBonus = firstAttempt ? 180 : 0;
    const timeBonus = Math.max(0, Math.round((par.parTimeMs * 1.4 - timeMs) / 42));
    const bounceBonus = Math.max(0, (par.parBounces + 1 - bounces) * 55);
    const score = 650 + stars * 200 + cleanBonus + firstAttemptBonus + timeBonus + bounceBonus;

    if (firstAttempt && bounces <= 1) {
      this.medalLabel = this.ui.medals.silk;
    } else if (timeMs <= par.parTimeMs * 0.85) {
      this.medalLabel = this.ui.medals.flash;
    } else {
      this.medalLabel = this.ui.medals.stable;
    }

    const previousUnlockedCount = this.saveData.unlockedSkinIds.length;
    this.setSaveData(
      applyLevelResult(this.saveData, this.levels, this.level.id, {
        stars,
        score,
        timeMs,
        bounces,
        shots: this.runStats.launches,
        attemptsSpent: this.runStats.attempts,
        firstAttempt,
      })
    );

    this.result = RUN_RESULT.success;
    this.resultLabel = this.ui.resultLabels.success;
    this.starsEarned = stars;
    this.score = score;
    this.bestScore = this.getLevelProgress(this.level.id).bestScore ?? score;
    this.mode = "levelComplete";
    this.playState = "idle";
    this.ball.active = false;
    this.particles.push(...spawnBurst(this.posedTarget.x, this.posedTarget.y + 28, { count: 18, color: "#7effc7", speed: 240, size: 5 }));
    this.audio.play("success");
    this.vibrate([16, 24, 42]);
    this.transient.message = `${this.resultLabel} · ${this.medalLabel}`;

    if (this.saveData.unlockedSkinIds.length > previousUnlockedCount) {
      this.audio.play("unlock");
      this.transient.callout = this.ui.messages.skinUnlocked;
    }
  }

  updateFlight(dtMs) {
    this.poseLevel();
    const dt = dtMs / 1000;
    this.posedObstacles.forEach((obstacle) => applyFieldForces(this.ball, obstacle, dt));
    integrateBall(this.ball, this.level.physicsProfile, dt);
    const events = stepObstacles(this.ball, this.level, this.posedObstacles, this.portalPairs, this.level.physicsProfile);

    events.forEach((event) => {
      if (event.type === "bounce") {
        this.runStats.rebounds += 1;
        this.audio.play(impactCueFromObstacle(event.obstacle, event.impactSpeed));
        this.shake(event.impactSpeed > 320 ? 6 : 3);
        this.particles.push(
          ...spawnBurst(this.ball.x, this.ball.y, {
            count: event.impactSpeed > 320 ? 9 : 5,
            color: event.obstacle?.type === "bumper" ? "#84fff0" : "#d8f6ff",
            speed: clamp(event.impactSpeed * 0.5, 80, 260),
            size: event.impactSpeed > 320 ? 4 : 3,
          })
        );
        if (event.impactSpeed > 360) {
          this.transient.callout = this.ui.messages.perfectBounce;
          this.vibrate(12);
        }
      }
      if (event.type === "portal") {
        this.audio.play("portal");
        this.particles.push(...spawnBurst(event.entry.x, event.entry.y, { count: 8, color: "#9df5ff", speed: 120, size: 4 }));
        this.particles.push(...spawnBurst(event.exit.x, event.exit.y, { count: 10, color: "#d6a8ff", speed: 160, size: 4 }));
      }
      if (event.type === "hazard") {
        this.failLevel(RUN_RESULT.hazard);
      }
    });

    if (this.mode !== "playing") {
      return;
    }

    const targetState = applyTargetForces(this.ball, this.posedTarget, dt);
    if (targetState.nearMiss && this.clockMs - this.lastNearMissAtMs > 500) {
      this.lastNearMissAtMs = this.clockMs;
      this.transient.callout = this.ui.messages.nearMiss;
    }
    if (targetState.captured) {
      this.completeLevel();
      return;
    }

    if (isBallOutOfBounds(this.ball, this.level.bounds)) {
      this.failLevel(RUN_RESULT.out);
      return;
    }

    const speed = getBallSpeed(this.ball);
    if (speed < 18) {
      this.ball.stillMs += dtMs;
      if (this.ball.stillMs >= 1100) {
        this.failLevel(RUN_RESULT.stuck);
        return;
      }
    } else {
      this.ball.stillMs = 0;
    }

    computeBallSquash(this.ball);
    if (withinStage(this.ball)) {
      this.ball.trail.push(createTrailPoint(this.ball));
      if (this.ball.trail.length > 16) {
        this.ball.trail.shift();
      }
      this.particles.push(spawnTrail(this.ball, this.getSelectedSkin().colors[0]));
    }
  }

  shake(intensity) {
    this.transient.cameraShake = Math.max(this.transient.cameraShake, intensity);
  }

  resetAfterFailure() {
    this.setSaveData(incrementRetryCount(this.saveData));
    this.runStats.attempts += 1;
    this.runStats.firstAttempt = false;
    this.ball = createBall(this.level.ballSpawn);
    this.aim.angleDeg = this.level.ballSpawn.aimDeg;
    this.aim.power = this.level.ballSpawn.power;
    this.transient.resultTimerMs = 0;
    this.playState = "aiming";
    this.result = RUN_RESULT.none;
    this.resultLabel = "";
    this.transient.message = this.ui.messages.retry;
    this.transient.callout = "";
    this.updatePreview();
  }

  update(dtMs) {
    this.clockMs += dtMs;
    this.particles = updateParticles(this.particles, dtMs);
    this.transient.cameraShake = Math.max(0, this.transient.cameraShake - SHAKE_DECAY * (dtMs / 16.6667));
    this.shakeOffset = {
      x: (Math.random() - 0.5) * this.transient.cameraShake * 1.2,
      y: (Math.random() - 0.5) * this.transient.cameraShake * 1.2,
    };

    if (this.mode === "playing") {
      if (this.playState !== "paused") {
        this.runStats.elapsedMs += dtMs;
      }

      if (this.playState === "aiming") {
        this.poseLevel();
        this.adjustAimByKeyboard(dtMs);
      } else if (this.playState === "flying") {
        this.updateFlight(dtMs);
      } else if (this.playState === "recovering") {
        if (this.saveData.settings.autoRetry) {
          this.transient.resultTimerMs -= dtMs;
          if (this.transient.resultTimerMs <= 0) {
            this.resetAfterFailure();
          }
        }
      }

      if (this.mode === "playing" && this.runStats.elapsedMs >= this.level.physicsProfile.timeLimitMs) {
        this.failLevel(RUN_RESULT.timeout);
      }
    } else {
      this.poseLevel();
    }
  }

  render() {
    this.poseLevel();
    drawFluxScene(this.ctx, this);
  }

  buildLevelsSummary() {
    return this.levels.map((level) => {
      const progress = this.getLevelProgress(level.id);
      return {
        id: level.id,
        index: level.index,
        name: localizeLabel(level.name, this.locale),
        stars: progress.stars,
        unlocked: progress.unlocked,
        completed: progress.completed,
        bestTimeMs: progress.bestTimeMs,
        bestScore: progress.bestScore,
      };
    });
  }

  emit() {
    this.onSnapshot?.({
      mode: this.mode,
      playState: this.playState,
      locale: this.locale,
      worldId: this.level.world,
      worldName: localizeLabel(this.theme.name, this.locale),
      worldSubtitle: localizeLabel(this.theme.subtitle, this.locale),
      levelId: this.level.id,
      levelIndex: this.level.index,
      levelTotal: this.levels.length,
      levelName: localizeLabel(this.level.name, this.locale),
      taxonomy: this.level.taxonomy,
      difficultyBand: this.level.difficultyBand,
      backgroundId: this.level.backgroundId,
      levelHints: this.level.tutorialHints[this.locale] ?? [],
      score: this.score,
      bestScore: this.bestScore,
      starsEarned: this.starsEarned,
      totalStars: this.saveData.totals.stars,
      attempts: this.runStats.attempts,
      launches: this.runStats.launches,
      rebounds: this.runStats.rebounds,
      elapsedMs: this.runStats.elapsedMs,
      timeLimitMs: this.level.physicsProfile.timeLimitMs,
      selectedSkinId: this.saveData.selectedSkinId,
      selectedSkinName: localizeLabel(this.getSelectedSkin().name, this.locale),
      unlockedSkinIds: this.saveData.unlockedSkinIds,
      settings: this.saveData.settings,
      levels: this.buildLevelsSummary(),
      ball: {
        active: this.ball.active,
        x: Number(this.ball.x.toFixed(2)),
        y: Number(this.ball.y.toFixed(2)),
        vx: Number(this.ball.vx.toFixed(2)),
        vy: Number(this.ball.vy.toFixed(2)),
        radius: this.ball.radius,
        targetDwellMs: Math.round(this.ball.targetDwellMs),
      },
      target: this.posedTarget,
      obstacles: this.posedObstacles,
      aim: {
        angleDeg: Number(this.aim.angleDeg.toFixed(2)),
        power: Number(this.aim.power.toFixed(3)),
        launchSpeed: Number(computeLaunchSpeed(this.aim.power).toFixed(2)),
        isDragging: this.aim.isDragging,
        dots: this.aim.dots,
      },
      result: this.result,
      resultLabel: this.resultLabel,
      medalLabel: this.medalLabel,
      message: this.transient.message,
      callout: this.transient.callout,
      coordinates: "origin_top_left_x_right_y_down_pixels",
      fullscreen: Boolean(this.fullscreen),
    });
  }
}

function sqr(value) {
  return value * value;
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
