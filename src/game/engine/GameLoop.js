const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default class GameLoop {
  constructor({ update, render, stepMs = 1000 / 60 }) {
    this.update = update;
    this.render = render;
    this.stepMs = stepMs;

    this.running = false;
    this.paused = false;
    this.accumulator = 0;
    this.lastTimestamp = 0;
    this.rafId = null;

    this.metrics = {
      fps: 60,
      frameTime: stepMs,
      fixedStepMs: stepMs
    };

    this.boundTick = this.tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = window.requestAnimationFrame(this.boundTick);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setPaused(value) {
    this.paused = Boolean(value);
    if (!this.paused) {
      this.lastTimestamp = performance.now();
    }
  }

  tick(timestamp) {
    if (!this.running) return;

    let delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    delta = clamp(delta, 0, 100);

    this.metrics.frameTime = delta;
    if (delta > 0) {
      const instantFps = 1000 / delta;
      this.metrics.fps = this.metrics.fps * 0.88 + instantFps * 0.12;
    }

    if (!this.paused) {
      this.accumulator += delta;
      while (this.accumulator >= this.stepMs) {
        this.update(this.stepMs / 1000);
        this.accumulator -= this.stepMs;
      }
    }

    const alpha = this.accumulator / this.stepMs;
    this.render(alpha, this.metrics);

    this.rafId = window.requestAnimationFrame(this.boundTick);
  }

  advanceTime(milliseconds) {
    const safeMs = Math.max(0, Number(milliseconds) || 0);
    const steps = Math.max(1, Math.round(safeMs / this.stepMs));

    if (!this.paused) {
      for (let i = 0; i < steps; i += 1) {
        this.update(this.stepMs / 1000);
      }
    }

    this.metrics.frameTime = this.stepMs;
    this.metrics.fps = 1000 / this.stepMs;
    this.render(0, this.metrics);
  }
}
