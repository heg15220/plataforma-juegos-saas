import { describe, expect, it } from "vitest";
import CosmicVanguardRuntime from "./runtime";

function createCanvasStub() {
  return {
    getContext: () =>
      new Proxy(
        {},
        {
          get: () => () => {},
        }
      ),
  };
}

function createRuntime() {
  return new CosmicVanguardRuntime({
    canvas: createCanvasStub(),
    locale: "es",
    onSnapshot: () => {},
  });
}

function projectForwardSpeed(player) {
  return player.vx * Math.cos(player.angle) + player.vy * Math.sin(player.angle);
}

describe("CosmicVanguardRuntime player handling", () => {
  it("raises the base cruise speed a bit for standard thrust", () => {
    const runtime = createRuntime();
    runtime.input.thrust = true;

    for (let frame = 0; frame < 240; frame += 1) {
      runtime.updatePlayer(1 / 60);
    }

    expect(runtime.state.player.speed).toBeGreaterThan(74);
  });

  it("uses brake-assisted steering to make turnarounds easier", () => {
    const steerOnlyRuntime = createRuntime();
    const brakeTurnRuntime = createRuntime();

    Object.assign(steerOnlyRuntime.state.player, {
      angle: 0,
      vx: 320,
      vy: 0,
      speed: 320,
    });
    Object.assign(brakeTurnRuntime.state.player, {
      angle: 0,
      vx: 320,
      vy: 0,
      speed: 320,
    });

    steerOnlyRuntime.input.right = true;
    brakeTurnRuntime.input.right = true;
    brakeTurnRuntime.input.brake = true;

    for (let frame = 0; frame < 60; frame += 1) {
      steerOnlyRuntime.updatePlayer(1 / 60);
      brakeTurnRuntime.updatePlayer(1 / 60);
    }

    expect(brakeTurnRuntime.state.player.angle).toBeGreaterThan(
      steerOnlyRuntime.state.player.angle + 0.35
    );
    expect(projectForwardSpeed(brakeTurnRuntime.state.player)).toBeLessThan(
      projectForwardSpeed(steerOnlyRuntime.state.player) - 30
    );
  });
});

describe("CosmicVanguardRuntime player sustain", () => {
  it("keeps pickups available when a new wave spawns", () => {
    const runtime = createRuntime();
    runtime.state.pickups = [
      {
        id: "pickup-1",
        kind: "repair",
        x: 120,
        y: 140,
        vx: 0,
        vy: 0,
        radius: 11,
        lifeMs: 4000,
      },
    ];
    runtime.state.wave = 2;
    runtime.state.sector = 1;

    runtime.spawnWave();

    expect(runtime.state.pickups).toHaveLength(1);
    expect(runtime.state.enemies.length).toBeGreaterThan(0);
  });

  it("grants a recovery window when a wave is cleared", () => {
    const runtime = createRuntime();
    runtime.state.mode = "playing";
    runtime.state.playState = "combat";
    runtime.state.enemies = [];
    runtime.state.transitionMs = 0;
    runtime.state.wave = 4;
    runtime.state.sector = 2;
    Object.assign(runtime.state.player, {
      hull: 42,
      shield: 8,
      energy: 24,
      recentDamageMs: 1400,
    });

    runtime.checkWaveState(16);

    expect(runtime.state.transitionMs).toBe(2200);
    expect(runtime.state.player.hull).toBeGreaterThan(42);
    expect(runtime.state.player.shield).toBeGreaterThan(8);
    expect(runtime.state.player.energy).toBeGreaterThan(24);
    expect(runtime.state.player.recentDamageMs).toBeLessThanOrEqual(650);
  });

  it("biases enemy drops toward repairs when the player is in trouble", () => {
    const runtime = createRuntime();
    runtime.rng = () => 0;
    Object.assign(runtime.state.player, {
      hull: 34,
      shield: 12,
    });

    runtime.maybeSpawnEnemyPickup({ x: 200, y: 220 });

    expect(runtime.state.pickups).toHaveLength(1);
    expect(runtime.state.pickups[0].kind).toBe("repair");
  });
});
