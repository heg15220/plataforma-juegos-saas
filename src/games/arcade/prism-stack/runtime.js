import {
  FRAME_MS,
  LOCK_DELAY_MS,
  PULSE_BAND_STEP,
  SOFT_DROP_MULTIPLIER,
  STAGE_HEIGHT,
  STAGE_WIDTH,
} from "./core/constants";
import {
  applyPulse,
  buildBoardStrings,
  buildColumnHeights,
  buildVisibleBoard,
  clearBands,
  collides,
  computeDangerRatio,
  createActivePiece,
  createEmptyBoard,
  getDropInterval,
  getHardDropDistance,
  getPieceCells,
  lockPiece,
  movePiece,
  resolveDangerState,
  resolveLevel,
  rewardPulseCharge,
  rotatePiece,
  scoreBandClear,
  shuffleBag,
} from "./core/logic";
import PrismStackAudio from "./services/audio";
import { loadPrismStackProfile, savePrismStackProfile } from "./services/storage";
import drawScene from "./render/drawScene";

function clampNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export default class PrismStackRuntime {
  constructor({ canvas, locale, ui, onSnapshot, onFullscreenRequest, deviceProfile }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.locale = locale;
    this.ui = ui;
    this.onSnapshot = onSnapshot;
    this.onFullscreenRequest = onFullscreenRequest;
    this.deviceProfile = deviceProfile;
    this.audio = new PrismStackAudio();
    this.random = Math.random;

    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.rafId = 0;

    this.state = this.createMenuState();

    this.holdControls = {
      left: { active: false, delayMs: 0, repeatMs: 0 },
      right: { active: false, delayMs: 0, repeatMs: 0 },
      down: { active: false, delayMs: 0, repeatMs: 0 },
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.loop = this.loop.bind(this);
    this.handleCanvasPointerDown = this.handleCanvasPointerDown.bind(this);
  }

  createQueueState() {
    const bag = shuffleBag(this.random);
    const queue = [];
    while (queue.length < 4) {
      if (!bag.length) {
        bag.push(...shuffleBag(this.random));
      }
      queue.push(bag.shift());
    }
    return {
      bag,
      queue,
    };
  }

  createMenuState() {
    const profile = loadPrismStackProfile();
    const { bag, queue } = this.createQueueState();
    return {
      mode: "menu",
      playState: "idle",
      board: createEmptyBoard(),
      activePiece: null,
      bag,
      queue,
      score: 0,
      bestScore: profile.bestScore,
      bands: 0,
      bestBands: profile.bestBands,
      level: 1,
      combo: 0,
      elapsedMs: 0,
      dropAccumulatorMs: 0,
      lockMs: 0,
      pulseCharges: 1,
      pulseProgress: 0,
      pulseColumn: -1,
      pulseFxMs: 0,
      pulseFreezeMs: 0,
      clearFlashMs: 0,
      callout: this.ui.sections.menuTagline,
      message: this.ui.messages.ready,
      soundEnabled: true,
      fullscreen: false,
      deviceProfile: this.deviceProfile,
      dangerRatio: 0,
      dangerState: "calm",
      lastClearCount: 0,
    };
  }

  createRunState() {
    const profile = loadPrismStackProfile();
    const { bag, queue } = this.createQueueState();
    const state = {
      mode: "playing",
      playState: "running",
      board: createEmptyBoard(),
      activePiece: null,
      bag,
      queue,
      score: 0,
      bestScore: profile.bestScore,
      bands: 0,
      bestBands: profile.bestBands,
      level: 1,
      combo: 0,
      elapsedMs: 0,
      dropAccumulatorMs: 0,
      lockMs: 0,
      pulseCharges: 1,
      pulseProgress: 0,
      pulseColumn: -1,
      pulseFxMs: 0,
      pulseFreezeMs: 0,
      clearFlashMs: 0,
      callout: this.ui.messages.pulseReady,
      message: this.ui.messages.start,
      soundEnabled: this.state?.soundEnabled ?? true,
      fullscreen: this.state?.fullscreen ?? false,
      deviceProfile: this.deviceProfile,
      dangerRatio: 0,
      dangerState: "calm",
      lastClearCount: 0,
    };

    state.activePiece = this.takeNextPiece(state);
    return state;
  }

  start() {
    this.canvas.width = STAGE_WIDTH;
    this.canvas.height = STAGE_HEIGHT;
    this.canvas.addEventListener("pointerdown", this.handleCanvasPointerDown);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.render();
    this.emitSnapshot();
    this.rafId = window.requestAnimationFrame(this.loop);
  }

  destroy() {
    window.cancelAnimationFrame(this.rafId);
    this.canvas.removeEventListener("pointerdown", this.handleCanvasPointerDown);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.audio.destroy();
  }

  handleCanvasPointerDown() {
    this.audio.unlock();
  }

  setFullscreenState(isFullscreen) {
    this.state.fullscreen = Boolean(isFullscreen);
    this.emitSnapshot();
  }

  setDeviceProfile(deviceProfile) {
    this.deviceProfile = deviceProfile;
    this.state.deviceProfile = deviceProfile;
    this.emitSnapshot();
  }

  takeNextPiece(state) {
    while (state.queue.length < 4) {
      if (!state.bag.length) {
        state.bag = shuffleBag(this.random);
      }
      state.queue.push(state.bag.shift());
    }

    const pieceId = state.queue.shift();
    while (state.queue.length < 4) {
      if (!state.bag.length) {
        state.bag = shuffleBag(this.random);
      }
      state.queue.push(state.bag.shift());
    }

    return createActivePiece(pieceId);
  }

  updateDanger() {
    this.state.dangerRatio = computeDangerRatio(this.state.board);
    this.state.dangerState = resolveDangerState(this.state.dangerRatio);
  }

  persistBests() {
    if (
      this.state.score > this.state.bestScore ||
      this.state.bands > this.state.bestBands
    ) {
      this.state.bestScore = Math.max(this.state.bestScore, this.state.score);
      this.state.bestBands = Math.max(this.state.bestBands, this.state.bands);
      savePrismStackProfile({
        bestScore: this.state.bestScore,
        bestBands: this.state.bestBands,
      });
    }
  }

  resetHoldControl(name) {
    const control = this.holdControls[name];
    if (!control) {
      return;
    }
    control.active = false;
    control.delayMs = 0;
    control.repeatMs = 0;
  }

  setVirtualControl(name, active) {
    if (!this.holdControls[name]) {
      return;
    }
    if (active) {
      this.activateHoldControl(name);
      return;
    }
    this.resetHoldControl(name);
  }

  activateHoldControl(name) {
    const control = this.holdControls[name];
    if (!control || control.active) {
      return;
    }
    control.active = true;
    control.delayMs = 0;
    control.repeatMs = 0;

    if (name === "left") {
      this.shiftHorizontal(-1);
    } else if (name === "right") {
      this.shiftHorizontal(1);
    }
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    const relevantKeys = new Set([
      "arrowleft",
      "arrowright",
      "arrowdown",
      "arrowup",
      "a",
      "d",
      "s",
      "w",
      "x",
      "z",
      "c",
      " ",
      "enter",
      "p",
      "escape",
      "r",
      "m",
      "f",
    ]);

    if (!relevantKeys.has(key)) {
      return;
    }

    event.preventDefault();
    this.audio.unlock();

    if (key === "arrowleft" || key === "a") {
      this.activateHoldControl("left");
      return;
    }
    if (key === "arrowright" || key === "d") {
      this.activateHoldControl("right");
      return;
    }
    if (key === "arrowdown" || key === "s") {
      this.activateHoldControl("down");
      return;
    }
    if (event.repeat) {
      return;
    }

    if (key === "enter") {
      if (this.state.mode === "menu") {
        this.startRun();
      } else if (this.state.mode === "paused") {
        this.togglePause();
      } else if (this.state.mode === "gameover") {
        this.startRun();
      }
      return;
    }

    if (key === " " && this.state.mode === "playing" && this.state.playState === "running") {
      this.hardDrop();
      return;
    }

    if (key === "arrowup" || key === "w" || key === "x") {
      this.rotateClockwise();
      return;
    }
    if (key === "z") {
      this.rotateCounterClockwise();
      return;
    }
    if (key === "c") {
      this.triggerPulse();
      return;
    }
    if (key === "p" || key === "escape") {
      this.togglePause();
      return;
    }
    if (key === "r") {
      this.startRun();
      return;
    }
    if (key === "m") {
      this.toggleAudio();
      return;
    }
    if (key === "f") {
      this.onFullscreenRequest?.();
    }
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key === "arrowleft" || key === "a") {
      this.resetHoldControl("left");
      return;
    }
    if (key === "arrowright" || key === "d") {
      this.resetHoldControl("right");
      return;
    }
    if (key === "arrowdown" || key === "s") {
      this.resetHoldControl("down");
    }
  }

  startRun() {
    this.state = this.createRunState();
    this.audio.setEnabled(this.state.soundEnabled);
    this.audio.play("start");
    this.emitSnapshot();
    this.render();
  }

  returnToMenu() {
    this.state = this.createMenuState();
    this.emitSnapshot();
    this.render();
  }

  togglePause() {
    if (this.state.mode === "menu" || this.state.mode === "gameover") {
      return;
    }
    if (this.state.playState === "running") {
      this.state.playState = "paused";
      this.state.mode = "paused";
      this.state.message = this.ui.messages.pause;
    } else {
      this.state.playState = "running";
      this.state.mode = "playing";
      this.state.message = this.ui.messages.resume;
    }
    this.emitSnapshot();
    this.render();
  }

  toggleAudio() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.audio.setEnabled(this.state.soundEnabled);
    this.state.message = this.state.soundEnabled ? this.ui.messages.audioOn : this.ui.messages.audioOff;
    this.emitSnapshot();
  }

  rotateClockwise() {
    if (this.state.mode !== "playing" || this.state.playState !== "running" || !this.state.activePiece) {
      return;
    }
    const nextPiece = rotatePiece(this.state.board, this.state.activePiece, 1);
    if (nextPiece !== this.state.activePiece) {
      this.state.activePiece = nextPiece;
      this.state.lockMs = 0;
      this.audio.play("rotate");
      this.emitSnapshot();
      this.render();
    }
  }

  rotateCounterClockwise() {
    if (this.state.mode !== "playing" || this.state.playState !== "running" || !this.state.activePiece) {
      return;
    }
    const nextPiece = rotatePiece(this.state.board, this.state.activePiece, -1);
    if (nextPiece !== this.state.activePiece) {
      this.state.activePiece = nextPiece;
      this.state.lockMs = 0;
      this.audio.play("rotate");
      this.emitSnapshot();
      this.render();
    }
  }

  shiftHorizontal(direction) {
    if (this.state.mode !== "playing" || this.state.playState !== "running" || !this.state.activePiece) {
      return false;
    }
    const candidate = movePiece(this.state.activePiece, direction, 0);
    if (collides(this.state.board, candidate)) {
      return false;
    }
    this.state.activePiece = candidate;
    this.state.lockMs = 0;
    this.audio.play("move");
    this.emitSnapshot();
    this.render();
    return true;
  }

  hardDrop() {
    if (this.state.mode !== "playing" || this.state.playState !== "running" || !this.state.activePiece) {
      return;
    }
    const distance = getHardDropDistance(this.state.board, this.state.activePiece);
    if (distance > 0) {
      this.state.activePiece = movePiece(this.state.activePiece, 0, distance);
      this.state.score += distance * 4;
    }
    this.state.message = this.ui.messages.slam;
    this.lockCurrentPiece(true);
  }

  triggerPulse() {
    if (this.state.mode !== "playing" || this.state.playState !== "running") {
      return;
    }
    if (this.state.pulseCharges <= 0) {
      this.state.message = this.ui.messages.noPulse;
      this.emitSnapshot();
      return;
    }

    const result = applyPulse(this.state.board);
    if (!result.removedCell) {
      this.state.message = this.ui.messages.noPulse;
      this.emitSnapshot();
      return;
    }

    this.state.board = result.board;
    this.state.pulseCharges -= 1;
    this.state.pulseColumn = result.column;
    this.state.pulseFxMs = 340;
    this.state.pulseFreezeMs = 620;
    this.state.message = this.ui.messages.pulseUsed;
    this.state.callout = `${this.ui.labels.pulse} - ${result.column + 1}`;
    this.state.score += 28;
    this.audio.play("pulse");
    this.updateDanger();
    this.persistBests();
    this.emitSnapshot();
    this.render();
  }

  endGame() {
    this.state.mode = "gameover";
    this.state.playState = "gameover";
    this.state.message = this.ui.messages.gameOver;
    this.state.callout = this.ui.overlays.gameOverTitle;
    this.audio.play("over");
    this.persistBests();
  }

  lockCurrentPiece(fromHardDrop = false) {
    if (!this.state.activePiece) {
      return;
    }

    this.state.board = lockPiece(this.state.board, this.state.activePiece);
    const clearResult = clearBands(this.state.board);
    this.state.board = clearResult.board;
    const previousLevel = this.state.level;

    if (clearResult.clearedRows.length > 0) {
      this.state.combo += 1;
      this.state.bands += clearResult.clearedRows.length;
      this.state.level = resolveLevel(this.state.bands);
      const awarded = scoreBandClear({
        rowsCleared: clearResult.clearedRows.length,
        level: this.state.level,
        combo: this.state.combo,
        coreCellsCleared: clearResult.coreCellsCleared,
      });
      this.state.score += awarded;
      const pulseReward = rewardPulseCharge(
        this.state.pulseCharges,
        this.state.pulseProgress,
        clearResult.clearedRows.length
      );
      this.state.pulseCharges = pulseReward.pulseCharges;
      this.state.pulseProgress = pulseReward.pulseProgress;
      this.state.callout = this.ui.clearNames[Math.min(clearResult.clearedRows.length, 5)];
      this.state.message = pulseReward.gainedCharge ? this.ui.messages.charge : this.ui.messages.cleared;
      this.state.clearFlashMs = 220;
      this.state.lastClearCount = clearResult.clearedRows.length;
      this.audio.play("clear");

      if (this.state.level > previousLevel) {
        this.state.message = this.ui.messages.levelUp;
        this.audio.play("level");
      }
    } else {
      this.state.combo = 0;
      this.state.lastClearCount = 0;
      this.state.callout = fromHardDrop ? this.ui.messages.slam : this.ui.sections.menuTagline;
      this.audio.play("lock");
    }

    this.state.dropAccumulatorMs = 0;
    this.state.lockMs = 0;
    this.state.pulseColumn = -1;
    this.state.activePiece = this.takeNextPiece(this.state);
    this.updateDanger();
    this.persistBests();

    if (collides(this.state.board, this.state.activePiece)) {
      this.endGame();
    }

    this.emitSnapshot();
    this.render();
  }

  processHoldActions(frameMs) {
    const directions = [
      ["left", -1],
      ["right", 1],
    ];

    directions.forEach(([name, delta]) => {
      const control = this.holdControls[name];
      if (!control.active) {
        return;
      }
      control.delayMs += frameMs;
      if (control.delayMs < 150) {
        return;
      }
      control.repeatMs += frameMs;
      while (control.repeatMs >= 52) {
        this.shiftHorizontal(delta);
        control.repeatMs -= 52;
      }
    });
  }

  step(frameMs) {
    if (this.state.mode !== "playing" || this.state.playState !== "running") {
      this.state.pulseFxMs = Math.max(0, this.state.pulseFxMs - frameMs);
      this.state.clearFlashMs = Math.max(0, this.state.clearFlashMs - frameMs);
      return;
    }

    this.processHoldActions(frameMs);

    this.state.elapsedMs += frameMs;
    this.state.pulseFxMs = Math.max(0, this.state.pulseFxMs - frameMs);
    this.state.clearFlashMs = Math.max(0, this.state.clearFlashMs - frameMs);
    this.state.pulseFreezeMs = Math.max(0, this.state.pulseFreezeMs - frameMs);

    const dropInterval = getDropInterval(this.state.level);
    const dropMultiplier = this.holdControls.down.active ? SOFT_DROP_MULTIPLIER : 1;

    if (this.state.pulseFreezeMs <= 0) {
      this.state.dropAccumulatorMs += frameMs * dropMultiplier;
      while (this.state.dropAccumulatorMs >= dropInterval) {
        this.state.dropAccumulatorMs -= dropInterval;
        const candidate = movePiece(this.state.activePiece, 0, 1);
        if (collides(this.state.board, candidate)) {
          this.state.dropAccumulatorMs = 0;
          break;
        }
        this.state.activePiece = candidate;
      }
    }

    const grounded = collides(this.state.board, movePiece(this.state.activePiece, 0, 1));
    if (grounded) {
      this.state.lockMs += frameMs;
      if (this.state.lockMs >= LOCK_DELAY_MS) {
        this.lockCurrentPiece(false);
      }
    } else {
      this.state.lockMs = 0;
    }

    this.updateDanger();
  }

  buildSnapshot() {
    const visibleBoard = buildVisibleBoard(this.state.board);
    const boardRows = buildBoardStrings(this.state.board);
    const columnHeights = buildColumnHeights(this.state.board);
    const phaseIndex = Math.min(
      this.ui.phaseNames.length - 1,
      Math.floor((this.state.level - 1) / 2)
    );
    const phaseLabel = this.ui.phaseNames[phaseIndex];
    const activeCells = this.state.activePiece
      ? getPieceCells(this.state.activePiece)
          .filter((cell) => cell.y >= 0)
          .map((cell) => ({
            x: cell.x,
            y: cell.y,
            core: cell.core,
            pieceId: cell.pieceId,
          }))
      : [];

    return {
      mode: this.state.mode,
      playState: this.state.playState,
      locale: this.locale,
      board: visibleBoard,
      boardRows,
      columnHeights,
      activePiece: this.state.activePiece
        ? {
            ...this.state.activePiece,
            cells: activeCells,
          }
        : null,
      queue: this.state.queue.slice(0, 3),
      score: this.state.score,
      bestScore: this.state.bestScore,
      bands: this.state.bands,
      bestBands: this.state.bestBands,
      level: this.state.level,
      phaseLabel,
      combo: this.state.combo,
      elapsedMs: this.state.elapsedMs,
      pulseCharges: this.state.pulseCharges,
      pulseProgress: this.state.pulseProgress,
      pulseGoal: PULSE_BAND_STEP,
      dangerRatio: this.state.dangerRatio,
      dangerState: this.state.dangerState,
      dangerLabel: this.ui.danger[this.state.dangerState],
      message: this.state.message,
      callout: this.state.callout,
      lastClearCount: this.state.lastClearCount,
      soundEnabled: this.state.soundEnabled,
      fullscreen: this.state.fullscreen,
      deviceProfile: this.state.deviceProfile,
      dropIntervalMs: clampNumber(getDropInterval(this.state.level), 0),
      pulseColumn: this.state.pulseColumn,
      pulseFxMs: this.state.pulseFxMs,
      clearFlashMs: this.state.clearFlashMs,
      coordinates: "origin_top_left_x_right_y_down_board_cells",
      hudLabels: {
        score: this.ui.labels.score,
        phase: this.ui.labels.level,
        bands: this.ui.labels.bands,
        pressure: this.ui.labels.pressure,
      },
      phaseNames: this.ui.phaseNames,
    };
  }

  emitSnapshot() {
    this.onSnapshot(this.buildSnapshot());
  }

  render() {
    drawScene(this.ctx, {
      ...this.state,
      hudLabels: {
        score: this.ui.labels.score,
        phase: this.ui.labels.level,
        bands: this.ui.labels.bands,
        pressure: this.ui.labels.pressure,
      },
      phaseLabel:
        this.ui.phaseNames[
          Math.min(this.ui.phaseNames.length - 1, Math.floor((this.state.level - 1) / 2))
        ],
      dangerLabel: this.ui.danger[this.state.dangerState],
    });
  }

  advanceTime(ms = 0) {
    const totalMs = Math.max(0, Number(ms) || 0);
    let remaining = totalMs;
    while (remaining > 0) {
      const stepMs = Math.min(FRAME_MS, remaining);
      this.step(stepMs);
      remaining -= stepMs;
    }
    this.render();
    this.emitSnapshot();
  }

  loop(timestamp) {
    if (!this.lastFrameTime) {
      this.lastFrameTime = timestamp;
    }
    const delta = Math.min(50, timestamp - this.lastFrameTime);
    this.lastFrameTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= FRAME_MS) {
      this.step(FRAME_MS);
      this.accumulator -= FRAME_MS;
    }

    this.render();
    this.emitSnapshot();
    this.rafId = window.requestAnimationFrame(this.loop);
  }
}
