const SCHEDULES = [
  {
    levelMin: 1,
    phases: [
      { mode: "scatter", duration: 7 },
      { mode: "chase", duration: 20 },
      { mode: "scatter", duration: 7 },
      { mode: "chase", duration: 20 },
      { mode: "scatter", duration: 5 },
      { mode: "chase", duration: 20 },
      { mode: "scatter", duration: 5 },
      { mode: "chase", duration: Number.POSITIVE_INFINITY }
    ]
  },
  {
    levelMin: 3,
    phases: [
      { mode: "scatter", duration: 5 },
      { mode: "chase", duration: 18 },
      { mode: "scatter", duration: 5 },
      { mode: "chase", duration: 18 },
      { mode: "scatter", duration: 4 },
      { mode: "chase", duration: 18 },
      { mode: "scatter", duration: 4 },
      { mode: "chase", duration: Number.POSITIVE_INFINITY }
    ]
  },
  {
    levelMin: 6,
    phases: [
      { mode: "scatter", duration: 4 },
      { mode: "chase", duration: 16 },
      { mode: "scatter", duration: 4 },
      { mode: "chase", duration: 16 },
      { mode: "scatter", duration: 3 },
      { mode: "chase", duration: 16 },
      { mode: "scatter", duration: 3 },
      { mode: "chase", duration: Number.POSITIVE_INFINITY }
    ]
  }
];

export const buildScatterChaseSchedule = (level = 1) => {
  const sorted = [...SCHEDULES].sort((a, b) => b.levelMin - a.levelMin);
  const match = sorted.find((entry) => level >= entry.levelMin) ?? sorted[sorted.length - 1];
  return match.phases.map((phase) => ({ ...phase }));
};

export default class GhostFSM {
  constructor(level = 1) {
    this.level = Math.max(1, Number(level) || 1);
    this.schedule = buildScatterChaseSchedule(this.level);
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.frightenedTimer = 0;
    this.frightenedChain = 0;
  }

  get phaseMode() {
    return this.schedule[this.phaseIndex]?.mode ?? "chase";
  }

  get mode() {
    if (this.frightenedTimer > 0) {
      return "frightened";
    }
    return this.phaseMode;
  }

  update(deltaSeconds) {
    const dt = Math.max(0, Number(deltaSeconds) || 0);
    const previousMode = this.mode;

    if (this.frightenedTimer > 0) {
      this.frightenedTimer = Math.max(0, this.frightenedTimer - dt);
      if (this.frightenedTimer <= 0) {
        this.frightenedChain = 0;
      }
      return {
        mode: this.mode,
        changed: previousMode !== this.mode,
        frightenedRemaining: this.frightenedTimer,
        phaseIndex: this.phaseIndex
      };
    }

    const activePhase = this.schedule[this.phaseIndex];
    if (!activePhase || !Number.isFinite(activePhase.duration)) {
      return {
        mode: this.mode,
        changed: false,
        frightenedRemaining: this.frightenedTimer,
        phaseIndex: this.phaseIndex
      };
    }

    this.phaseElapsed += dt;
    while (
      this.phaseIndex < this.schedule.length - 1
      && Number.isFinite(this.schedule[this.phaseIndex].duration)
      && this.phaseElapsed >= this.schedule[this.phaseIndex].duration
    ) {
      this.phaseElapsed -= this.schedule[this.phaseIndex].duration;
      this.phaseIndex += 1;
    }

    return {
      mode: this.mode,
      changed: previousMode !== this.mode,
      frightenedRemaining: this.frightenedTimer,
      phaseIndex: this.phaseIndex
    };
  }

  enterFrightened(durationSeconds) {
    const duration = Math.max(0, Number(durationSeconds) || 0);
    if (duration <= 0) {
      return false;
    }

    const previousMode = this.mode;
    this.frightenedTimer = duration;
    this.frightenedChain = 0;
    return previousMode !== this.mode;
  }

  registerGhostEaten() {
    const points = 200 * 2 ** this.frightenedChain;
    this.frightenedChain = Math.min(3, this.frightenedChain + 1);
    return points;
  }

  resetAfterLife() {
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.frightenedTimer = 0;
    this.frightenedChain = 0;
  }

  resetForLevel(level) {
    this.level = Math.max(1, Number(level) || 1);
    this.schedule = buildScatterChaseSchedule(this.level);
    this.resetAfterLife();
  }
}
