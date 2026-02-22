import React, { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const STAGE_WIDTH = 768;
const STAGE_HEIGHT = 432;
const ROAD_WIDTH = 360;
const PLAYER_Y = 350;
const LANE_X = [STAGE_WIDTH / 2 - 112, STAGE_WIDTH / 2, STAGE_WIDTH / 2 + 112];
const TICK_MS = 120;
const TOTAL_LAPS = 3;
const LAP_DISTANCE = 260;
const TARGET_DISTANCE = LAP_DISTANCE * TOTAL_LAPS;
const MIN_SPEED = 150;
const MAX_SPEED = 370;
const RIVAL_COUNT = 5;

const ITEM_TYPES = [
  { id: "pulse", label: "Pulso EMP" },
  { id: "repair", label: "Kit de reparacion" }
];

const WEATHER_PROFILES = [
  { id: "dry", label: "Seco", accelFactor: 1, obstacleFactor: 1, rivalFactor: 1, boostFactor: 1, skidChance: 0.04 },
  { id: "rain", label: "Lluvia", accelFactor: 0.88, obstacleFactor: 1.14, rivalFactor: 1.08, boostFactor: 0.84, skidChance: 0.2 },
  { id: "dusk", label: "Crepusculo", accelFactor: 0.95, obstacleFactor: 1.04, rivalFactor: 1.05, boostFactor: 1.18, skidChance: 0.1 }
];

const INITIAL_SNAPSHOT = {
  status: "idle",
  lane: 1,
  weather: WEATHER_PROFILES[0],
  distance: 0,
  lap: 1,
  totalLaps: TOTAL_LAPS,
  position: 1,
  speed: 190,
  turbo: 10,
  turboBurst: 0,
  integrity: 3,
  shield: 1,
  nearMissStreak: 0,
  focusWindow: 0,
  stabilizeCooldown: 0,
  heldItem: null,
  heldItemLabel: "Ninguno",
  traffic: [],
  boosts: [],
  itemCrates: [],
  rivalsProgress: Array.from({ length: RIVAL_COUNT }, () => 0),
  message: "Pulsa reiniciar para comenzar.",
  log: ["Carrera lista."]
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundNumber = (value) => Math.round(value * 100) / 100;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickWeather = () => WEATHER_PROFILES[randomInt(0, WEATHER_PROFILES.length - 1)];
const pickItemType = () => ITEM_TYPES[randomInt(0, ITEM_TYPES.length - 1)];
const createInitialRivals = () => Array.from({ length: RIVAL_COUNT }, (_, index) => 6 + index * 2 + randomInt(0, 4));

const createRoadTexture = (scene, key) => {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x111827, 1);
  graphics.fillRect(0, 0, 240, 512);
  graphics.fillStyle(0x1f2937, 1);
  graphics.fillRect(20, 0, 200, 512);
  graphics.lineStyle(3, 0xe2e8f0, 0.85);
  graphics.strokeLineShape(new Phaser.Geom.Line(22, 0, 22, 512));
  graphics.strokeLineShape(new Phaser.Geom.Line(218, 0, 218, 512));
  graphics.lineStyle(3, 0xf8fafc, 0.75);
  for (let y = 0; y < 512; y += 52) {
    graphics.strokeLineShape(new Phaser.Geom.Line(80, y, 80, y + 30));
    graphics.strokeLineShape(new Phaser.Geom.Line(160, y + 16, 160, y + 44));
  }
  graphics.generateTexture(key, 240, 512);
  graphics.destroy();
};

const createGrassTexture = (scene, key) => {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillGradientStyle(0x14532d, 0x166534, 0x14532d, 0x134e2f, 1);
  graphics.fillRect(0, 0, 192, 512);
  for (let y = 0; y < 512; y += 34) {
    graphics.fillStyle(0x22c55e, 0.12);
    graphics.fillRect(0, y, 192, 8);
  }
  graphics.generateTexture(key, 192, 512);
  graphics.destroy();
};

const createRaceScene = ({ onSnapshot, onReady }) => {
  class RacingScene extends Phaser.Scene {
    constructor() {
      super("racing-scene");
      this.status = INITIAL_SNAPSHOT.status;
      this.weather = INITIAL_SNAPSHOT.weather;
      this.lane = INITIAL_SNAPSHOT.lane;
      this.distance = INITIAL_SNAPSHOT.distance;
      this.lap = INITIAL_SNAPSHOT.lap;
      this.position = INITIAL_SNAPSHOT.position;
      this.speed = INITIAL_SNAPSHOT.speed;
      this.turbo = INITIAL_SNAPSHOT.turbo;
      this.turboBurst = INITIAL_SNAPSHOT.turboBurst;
      this.integrity = INITIAL_SNAPSHOT.integrity;
      this.shield = INITIAL_SNAPSHOT.shield;
      this.nearMissStreak = INITIAL_SNAPSHOT.nearMissStreak;
      this.focusWindow = INITIAL_SNAPSHOT.focusWindow;
      this.stabilizeCooldown = INITIAL_SNAPSHOT.stabilizeCooldown;
      this.heldItem = INITIAL_SNAPSHOT.heldItem;
      this.traffic = [];
      this.boosts = [];
      this.itemCrates = [];
      this.rivalsProgress = [...INITIAL_SNAPSHOT.rivalsProgress];
      this.spawnCounter = 0;
      this.message = INITIAL_SNAPSHOT.message;
      this.log = [...INITIAL_SNAPSHOT.log];
      this.pendingActions = [];
      this.tickAccumulator = 0;
      this.lastSnapshotAt = 0;
    }

    preload() {
      createRoadTexture(this, "race-road");
      createGrassTexture(this, "race-grass");
    }

    create() {
      this.cameras.main.setBackgroundColor("#081426");
      this.add.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, STAGE_WIDTH, STAGE_HEIGHT, 0x0b172f).setDepth(-12);

      this.leftGrass = this.add.tileSprite((STAGE_WIDTH - ROAD_WIDTH) / 4, STAGE_HEIGHT / 2, (STAGE_WIDTH - ROAD_WIDTH) / 2, STAGE_HEIGHT, "race-grass").setDepth(-10);
      this.rightGrass = this.add.tileSprite(STAGE_WIDTH - (STAGE_WIDTH - ROAD_WIDTH) / 4, STAGE_HEIGHT / 2, (STAGE_WIDTH - ROAD_WIDTH) / 2, STAGE_HEIGHT, "race-grass").setDepth(-10);
      this.road = this.add.tileSprite(STAGE_WIDTH / 2, STAGE_HEIGHT / 2, ROAD_WIDTH, STAGE_HEIGHT, "race-road").setDepth(-9);

      this.clouds = [
        this.add.ellipse(120, 68, 112, 36, 0xffffff, 0.55).setDepth(-8),
        this.add.ellipse(430, 94, 126, 40, 0xffffff, 0.45).setDepth(-8),
        this.add.ellipse(650, 78, 88, 30, 0xffffff, 0.35).setDepth(-8)
      ];

      this.player = this.add.rectangle(LANE_X[this.lane], PLAYER_Y, 34, 58, 0x22c55e).setDepth(9).setStrokeStyle(2, 0x67e8f9, 0.9);
      this.playerWindshield = this.add.rectangle(LANE_X[this.lane], PLAYER_Y - 14, 14, 12, 0xe0f2fe, 0.75).setDepth(10);
      this.playerGlow = this.add.circle(LANE_X[this.lane], PLAYER_Y + 6, 22, 0x22c55e, 0.22).setDepth(8);

      this.keys = this.input.keyboard.addKeys({
        left: "A",
        right: "D",
        accelerate: "W",
        brake: "S",
        turbo: "SPACE",
        stabilize: "F",
        item: "I"
      });
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.startRace();
      this.registerApi();
      this.publishSnapshot(true);
    }

    registerApi() {
      onReady({
        lane: (direction) => this.queueAction(direction < 0 ? "left" : "right"),
        accelerate: () => this.queueAction("accelerate"),
        brake: () => this.queueAction("brake"),
        turbo: () => this.queueAction("turbo"),
        stabilize: () => this.queueAction("stabilize"),
        useItem: () => this.queueAction("item"),
        restart: () => {
          this.startRace();
          this.publishSnapshot(true);
        },
        advanceTime: (ms = 0) => {
          const duration = Math.max(1, Math.floor(ms));
          return new Promise((resolve) => {
            this.time.delayedCall(duration, () => resolve(), [], this);
          });
        }
      });
    }

    startRace() {
      this.clearEntityGroup(this.traffic);
      this.clearEntityGroup(this.boosts);
      this.clearEntityGroup(this.itemCrates);
      this.traffic = [];
      this.boosts = [];
      this.itemCrates = [];
      this.pendingActions = [];
      this.tickAccumulator = 0;
      this.spawnCounter = 0;

      this.status = "playing";
      this.weather = pickWeather();
      this.lane = 1;
      this.distance = 0;
      this.lap = 1;
      this.position = 1;
      this.speed = 195;
      this.turbo = 16;
      this.turboBurst = 0;
      this.integrity = 3;
      this.shield = 1;
      this.nearMissStreak = 0;
      this.focusWindow = 0;
      this.stabilizeCooldown = 0;
      this.heldItem = null;
      this.rivalsProgress = createInitialRivals();
      this.message = `Salida limpia con clima ${this.weather.label.toLowerCase()}.`;
      this.log = ["Comienza la carrera arcade con motor Phaser."];

      this.syncPlayerVisual();
      this.spawnTraffic("obstacle", randomInt(0, LANE_X.length - 1), -18);
    }

    clearEntityGroup(list) {
      for (const entity of list) {
        entity.view.destroy();
      }
    }

    queueAction(action) {
      this.pendingActions.push(action);
    }

    prependLog(entry) {
      this.log = [entry, ...this.log].slice(0, 9);
    }

    syncPlayerVisual() {
      const targetX = LANE_X[this.lane];
      this.player.setX(targetX);
      this.playerWindshield.setX(targetX);
      this.playerGlow.setX(targetX);
      if (this.focusWindow > 0) {
        this.player.setFillStyle(0x14b8a6, 1);
        this.player.setStrokeStyle(2, 0x99f6e4, 1);
      } else {
        this.player.setFillStyle(0x22c55e, 1);
        this.player.setStrokeStyle(2, 0x67e8f9, 0.9);
      }
      this.playerGlow.setVisible(this.shield > 0 || this.focusWindow > 0);
      this.playerGlow.setFillStyle(this.focusWindow > 0 ? 0x2dd4bf : 0x22c55e, this.focusWindow > 0 ? 0.3 : 0.2);
    }

    createEntity(kind, lane, y) {
      const x = LANE_X[lane];
      let view;
      if (kind === "obstacle") {
        view = this.add.rectangle(x, y, 28, 28, 0xf97316).setStrokeStyle(2, 0x7c2d12, 0.9);
      } else if (kind === "rival") {
        view = this.add.rectangle(x, y, 30, 52, 0xfb7185).setStrokeStyle(2, 0xfef2f2, 0.9);
      } else if (kind === "boost") {
        view = this.add.circle(x, y, 14, 0x22d3ee, 0.95).setStrokeStyle(2, 0x0ea5e9, 1);
      } else {
        view = this.add.rectangle(x, y, 28, 28, 0xf59e0b).setStrokeStyle(2, 0x92400e, 0.9);
      }
      view.setDepth(7);
      return { id: `${kind}-${this.spawnCounter++}`, type: kind, lane, y, nearMissed: false, view };
    }

    spawnTraffic(type, lane = randomInt(0, LANE_X.length - 1), y = -34) {
      this.traffic.push(this.createEntity(type, lane, y));
    }

    spawnBoost(lane = randomInt(0, LANE_X.length - 1), y = -34) {
      this.boosts.push(this.createEntity("boost", lane, y));
    }

    spawnCrate(lane = randomInt(0, LANE_X.length - 1), y = -34) {
      this.itemCrates.push(this.createEntity("crate", lane, y));
    }

    collectKeyboardActions() {
      if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left) || Phaser.Input.Keyboard.JustDown(this.keys.left)) {
        this.queueAction("left");
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right) || Phaser.Input.Keyboard.JustDown(this.keys.right)) {
        this.queueAction("right");
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.turbo) || Phaser.Input.Keyboard.JustDown(this.cursorKeys.space)) {
        this.queueAction("turbo");
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.stabilize)) {
        this.queueAction("stabilize");
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.item)) {
        this.queueAction("item");
      }
    }

    processQueuedActions() {
      for (const action of this.pendingActions.splice(0)) {
        if (action === "left") this.changeLane(-1);
        if (action === "right") this.changeLane(1);
        if (action === "accelerate") this.adjustSpeed(20);
        if (action === "brake") this.adjustSpeed(-20);
        if (action === "turbo") this.activateTurbo();
        if (action === "stabilize") this.stabilizeCar();
        if (action === "item") this.useItem();
      }
    }

    changeLane(direction) {
      if (this.status !== "playing") return;
      let nextLane = clamp(this.lane + direction, 0, LANE_X.length - 1);
      if (this.weather.id === "rain" && this.speed >= 300 && this.focusWindow === 0 && Math.random() < this.weather.skidChance) {
        nextLane = clamp(this.lane + direction * 2, 0, LANE_X.length - 1);
        this.message = "Pista mojada: derrape lateral al cambiar de carril.";
        this.prependLog(this.message);
      }
      if (nextLane === this.lane) return;
      this.lane = nextLane;
      const targetX = LANE_X[nextLane];
      this.tweens.add({ targets: [this.player, this.playerWindshield, this.playerGlow], x: targetX, duration: 80, ease: "sine.out" });
    }

    adjustSpeed(delta) {
      if (this.status !== "playing") return;
      this.speed = clamp(this.speed + delta, MIN_SPEED, MAX_SPEED);
    }

    activateTurbo() {
      if (this.status !== "playing" || this.turbo < 25 || this.turboBurst > 0) return;
      this.turbo = Math.max(0, this.turbo - 25);
      this.turboBurst = 5;
      this.message = "Turbo activado: aceleracion maxima durante unos instantes.";
      this.prependLog(this.message);
      this.cameras.main.shake(90, 0.002);
    }

    stabilizeCar() {
      if (this.status !== "playing" || this.stabilizeCooldown > 0) return;
      if (this.turbo < 12) {
        this.prependLog("Necesitas al menos 12% de turbo para estabilizar.");
        return;
      }
      this.turbo = Math.max(0, this.turbo - 12);
      this.focusWindow = 5;
      this.stabilizeCooldown = 7;
      this.message = "Modo estabilidad activado: control extra durante 5 ticks.";
      this.prependLog(this.message);
      this.syncPlayerVisual();
    }

    useItem() {
      if (this.status !== "playing") return;
      if (!this.heldItem) {
        this.prependLog("No llevas ningun item activo.");
        return;
      }
      if (this.heldItem === "repair") {
        this.integrity = Math.min(3, this.integrity + 1);
        this.shield = Math.min(2, this.shield + 1);
        this.heldItem = null;
        this.message = "Kit de reparacion usado: mejoras integridad y escudo.";
        this.prependLog(this.message);
        return;
      }
      const closestRival = this.traffic.filter((entity) => entity.type === "rival").sort((a, b) => Math.abs(a.y - PLAYER_Y) - Math.abs(b.y - PLAYER_Y))[0];
      this.heldItem = null;
      if (!closestRival) {
        this.turbo = Math.min(100, this.turbo + 12);
        this.message = "Pulso EMP sin objetivo: conviertes descarga en turbo.";
        this.prependLog(this.message);
        return;
      }
      closestRival.view.destroy();
      this.traffic = this.traffic.filter((entity) => entity.id !== closestRival.id);
      this.turbo = Math.min(100, this.turbo + 14);
      this.message = "Pulso EMP activado: rival neutralizado y pista despejada.";
      this.prependLog(this.message);
    }

    resolveCollisions(list, threshold = 25) {
      const collisions = [];
      const survivors = [];
      for (const entity of list) {
        const offscreen = entity.y > STAGE_HEIGHT + 48;
        const collides = entity.lane === this.lane && Math.abs(entity.y - PLAYER_Y) <= threshold;
        if (offscreen || collides) {
          entity.view.destroy();
          if (collides) collisions.push(entity);
          continue;
        }
        survivors.push(entity);
      }
      return { collisions, survivors };
    }

    resolveRaceTick() {
      if (this.status !== "playing") return;

      this.processQueuedActions();
      if (this.cursorKeys.up.isDown || this.keys.accelerate.isDown) this.adjustSpeed(12);
      if (this.cursorKeys.down.isDown || this.keys.brake.isDown) this.adjustSpeed(-12);

      this.turboBurst = Math.max(0, this.turboBurst - 1);
      this.focusWindow = Math.max(0, this.focusWindow - 1);
      this.stabilizeCooldown = Math.max(0, this.stabilizeCooldown - 1);

      const travel = Math.max(10, Math.round(this.speed / 20));
      this.moveEntities(this.traffic, travel);
      this.moveEntities(this.boosts, travel);
      this.moveEntities(this.itemCrates, travel);

      const nearMissEntity = this.traffic.find((entity) => !entity.nearMissed && entity.lane === this.lane && entity.y < PLAYER_Y && PLAYER_Y - entity.y <= 44);
      if (nearMissEntity) {
        nearMissEntity.nearMissed = true;
        this.nearMissStreak = clamp(this.nearMissStreak + 1, 0, 8);
        const turboGain = 5 + this.nearMissStreak * 2;
        this.turbo = Math.min(100, this.turbo + turboGain);
        this.message = `Near miss x${this.nearMissStreak}: +${turboGain}% turbo.`;
        this.prependLog(this.message);
      } else {
        this.nearMissStreak = Math.max(0, this.nearMissStreak - 1);
      }

      const trafficStep = this.resolveCollisions(this.traffic, 24);
      const boostStep = this.resolveCollisions(this.boosts, 24);
      const crateStep = this.resolveCollisions(this.itemCrates, 24);
      this.traffic = trafficStep.survivors;
      this.boosts = boostStep.survivors;
      this.itemCrates = crateStep.survivors;

      const hitObstacle = trafficStep.collisions.some((entity) => entity.type === "obstacle");
      const hitRival = trafficStep.collisions.some((entity) => entity.type === "rival");
      const hitBoost = boostStep.collisions.length > 0;
      const hitCrate = crateStep.collisions.length > 0;

      if (hitObstacle || hitRival) {
        if (this.shield > 0) {
          this.shield -= 1;
          this.speed = Math.max(MIN_SPEED, this.speed - 14);
          this.message = "Escudo absorbio el impacto. Mantienes integridad.";
          this.prependLog(this.message);
        } else {
          const rawDamage = hitObstacle ? 1 : 1;
          const appliedDamage = this.focusWindow > 0 ? Math.max(0, rawDamage - 1) : rawDamage;
          if (appliedDamage === 0) {
            this.message = "Estabilidad activa: absorbes el golpe critico.";
            this.prependLog(this.message);
          } else {
            this.integrity -= appliedDamage;
            this.message = hitObstacle
              ? `Impacto frontal. Integridad restante: ${Math.max(0, this.integrity)}.`
              : `Toque con rival. Integridad restante: ${Math.max(0, this.integrity)}.`;
            this.prependLog(this.message);
          }
          this.speed = Math.max(MIN_SPEED, this.speed - (hitObstacle ? 34 : 26));
        }
        this.nearMissStreak = 0;
      }

      if (hitBoost) {
        this.turbo = Math.min(100, this.turbo + 24);
        this.speed = Math.min(MAX_SPEED, this.speed + 18);
        this.message = "Recoges turbo y aumentas velocidad.";
        this.prependLog(this.message);
      }

      if (hitCrate) {
        if (this.heldItem) {
          this.turbo = Math.min(100, this.turbo + 8);
          this.message = "Caja recogida con inventario lleno: conviertes premio en turbo.";
          this.prependLog(this.message);
        } else {
          const item = pickItemType();
          this.heldItem = item.id;
          this.message = `Recoges caja de item: ${item.label}.`;
          this.prependLog(this.message);
        }
      }

      const obstacleChance = Math.min(0.62, (0.14 + this.distance / 1500) * this.weather.obstacleFactor);
      const rivalChance = Math.min(0.27, (0.06 + this.distance / 2200) * this.weather.rivalFactor);
      if (this.traffic.length < 14 && Math.random() < obstacleChance) this.spawnTraffic("obstacle");
      if (this.traffic.length < 14 && Math.random() < rivalChance) this.spawnTraffic("rival");
      if (this.boosts.length < 6 && Math.random() < 0.2 * this.weather.boostFactor) this.spawnBoost();
      if (this.itemCrates.length < 4 && Math.random() < 0.14) this.spawnCrate();

      const drag = this.weather.id === "rain" ? 3 : 2;
      const baseAcceleration = Math.round((3 + Math.floor(this.distance / 380)) * this.weather.accelFactor);
      const turboKick = this.turboBurst > 0 ? 42 : 0;
      const collisionPenalty = hitObstacle || hitRival ? 14 : 0;
      this.speed = clamp(this.speed + baseAcceleration + turboKick - drag - collisionPenalty, MIN_SPEED, MAX_SPEED);
      if (this.turboBurst > 0) this.turbo = Math.max(0, this.turbo - (this.weather.id === "rain" ? 5 : 4));

      const travelDelta = Math.round(this.speed / 22) + (this.turboBurst > 0 ? 4 : 0);
      this.distance = Math.min(TARGET_DISTANCE, this.distance + travelDelta);
      this.rivalsProgress = this.rivalsProgress.map((value) => Math.min(TARGET_DISTANCE, value + randomInt(7, 12) + Math.floor(this.distance / 450)));
      this.position = 1 + this.rivalsProgress.filter((value) => value > this.distance).length;
      this.lap = Math.min(TOTAL_LAPS, Math.floor(this.distance / LAP_DISTANCE) + 1);

      if (this.integrity <= 0) {
        this.status = "lost";
        this.message = "Coche destruido. Carrera finalizada.";
        this.prependLog(this.message);
      } else if (this.distance >= TARGET_DISTANCE) {
        this.status = "won";
        this.message = `Bandera a cuadros. Llegas en posicion ${this.position}.`;
        this.prependLog(this.message);
      } else if (!hitObstacle && !hitRival && !hitBoost && !hitCrate) {
        this.message = `Progreso de carrera: ${Math.round((this.distance / TARGET_DISTANCE) * 100)}%.`;
      }

      this.syncPlayerVisual();
    }

    moveEntities(list, travel) {
      for (const entity of list) {
        entity.y += travel;
        entity.view.y = entity.y;
      }
    }

    animateBackdrop(delta) {
      const pace = (this.speed / MAX_SPEED) * (this.status === "playing" ? 1 : 0.28);
      this.road.tilePositionY += 5.2 * pace;
      this.leftGrass.tilePositionY += 1.8 * pace;
      this.rightGrass.tilePositionY += 1.8 * pace;
      this.clouds.forEach((cloud, index) => {
        cloud.x += (0.03 + index * 0.012) * delta;
        if (cloud.x > STAGE_WIDTH + 90) cloud.x = -90;
      });
    }

    publishSnapshot(force = false) {
      if (!force && this.time.now - this.lastSnapshotAt < 80) return;
      this.lastSnapshotAt = this.time.now;

      const heldItemLabel = ITEM_TYPES.find((item) => item.id === this.heldItem)?.label ?? "Ninguno";
      onSnapshot({
        status: this.status,
        lane: this.lane,
        weather: this.weather,
        distance: this.distance,
        lap: this.lap,
        totalLaps: TOTAL_LAPS,
        position: this.position,
        speed: this.speed,
        turbo: this.turbo,
        turboBurst: this.turboBurst,
        integrity: this.integrity,
        shield: this.shield,
        nearMissStreak: this.nearMissStreak,
        focusWindow: this.focusWindow,
        stabilizeCooldown: this.stabilizeCooldown,
        heldItem: this.heldItem,
        heldItemLabel,
        traffic: this.traffic.map((entity) => ({ type: entity.type, lane: entity.lane, y: roundNumber(entity.y) })),
        boosts: this.boosts.map((entity) => ({ lane: entity.lane, y: roundNumber(entity.y) })),
        itemCrates: this.itemCrates.map((entity) => ({ lane: entity.lane, y: roundNumber(entity.y) })),
        rivalsProgress: this.rivalsProgress.map((value) => roundNumber(value)),
        message: this.message,
        log: [...this.log]
      });
    }

    update(_, delta) {
      this.collectKeyboardActions();
      this.animateBackdrop(delta);
      if (this.status === "playing") {
        this.tickAccumulator += delta;
        while (this.tickAccumulator >= TICK_MS) {
          this.tickAccumulator -= TICK_MS;
          this.resolveRaceTick();
        }
      }
      this.publishSnapshot();
    }
  }

  return new RacingScene();
};

function RacingGame() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const sceneApiRef = useRef(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!mountRef.current || gameRef.current) return undefined;

    let isMounted = true;
    const scene = createRaceScene({
      onSnapshot: (nextSnapshot) => {
        if (isMounted) setSnapshot(nextSnapshot);
      },
      onReady: (sceneApi) => {
        sceneApiRef.current = sceneApi;
      }
    });

    gameRef.current = new Phaser.Game({
      type: Phaser.CANVAS,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      parent: mountRef.current,
      scene: [scene]
    });

    return () => {
      isMounted = false;
      sceneApiRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const lane = (direction) => sceneApiRef.current?.lane(direction);
  const accelerate = () => sceneApiRef.current?.accelerate();
  const brake = () => sceneApiRef.current?.brake();
  const turbo = () => sceneApiRef.current?.turbo();
  const stabilize = () => sceneApiRef.current?.stabilize();
  const useItem = () => sceneApiRef.current?.useItem();
  const restart = () => sceneApiRef.current?.restart();

  const buildTextPayload = useCallback((stateSnapshot) => ({
    mode: "racing",
    coordinates: "origin_top_left_x_right_y_down",
    status: stateSnapshot.status,
    weather: stateSnapshot.weather,
    hud: {
      position: stateSnapshot.position,
      lap: stateSnapshot.lap,
      totalLaps: stateSnapshot.totalLaps,
      speed: stateSnapshot.speed,
      turbo: stateSnapshot.turbo
    },
    player: {
      lane: stateSnapshot.lane,
      y: PLAYER_Y,
      integrity: stateSnapshot.integrity,
      shield: stateSnapshot.shield,
      nearMissStreak: stateSnapshot.nearMissStreak,
      distance: stateSnapshot.distance,
      heldItem: stateSnapshot.heldItemLabel
    },
    focusWindow: stateSnapshot.focusWindow,
    stabilizeCooldown: stateSnapshot.stabilizeCooldown,
    traffic: stateSnapshot.traffic,
    boosts: stateSnapshot.boosts,
    itemCrates: stateSnapshot.itemCrates,
    rivalsProgress: stateSnapshot.rivalsProgress,
    message: stateSnapshot.message,
    log: stateSnapshot.log
  }), []);

  const advanceTime = useCallback((ms) => {
    if (sceneApiRef.current?.advanceTime) return sceneApiRef.current.advanceTime(ms);
    return undefined;
  }, []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const statusLabel =
    snapshot.status === "won"
      ? "Victoria"
      : snapshot.status === "lost"
        ? "Derrota"
        : snapshot.status === "playing"
          ? "En carrera"
          : "Preparado";

  const progressPercent = (snapshot.distance / TARGET_DISTANCE) * 100;
  const lapProgress = snapshot.status === "won" ? 100 : ((snapshot.distance % LAP_DISTANCE) / LAP_DISTANCE) * 100;
  const nearMissProgress = Math.min(100, snapshot.nearMissStreak * 12.5);
  const isPlaying = snapshot.status === "playing";

  return (
    <div className="mini-game racing-game">
      <div className="mini-head">
        <div>
          <h4>Modo Carreras Realista (Phaser)</h4>
          <p>Arcade por carriles con clima dinamico, near-miss, turbo tactico e items.</p>
        </div>
        <button type="button" onClick={restart}>
          Reiniciar carrera
        </button>
      </div>

      <div className="racing-hud">
        <span className={`status-pill ${snapshot.status}`}>{statusLabel}</span>
        <span className="hud-pill">Clima: {snapshot.weather.label}</span>
        <span className="hud-pill">Posicion #{snapshot.position}</span>
        <span className="hud-pill">Vuelta {snapshot.lap}/{TOTAL_LAPS}</span>
        <span className="hud-pill">{Math.round(snapshot.speed)} km/h</span>
        <span className="hud-pill">Turbo {Math.round(snapshot.turbo)}%</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Meta</p>
          <div className="meter-track">
            <span className="meter-fill race" style={{ width: `${progressPercent}%` }} />
          </div>
          <strong>{Math.round(progressPercent)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Progreso de vuelta</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: `${lapProgress}%` }} />
          </div>
          <strong>{Math.round(lapProgress)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Cadena near-miss</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: `${nearMissProgress}%` }} />
          </div>
          <strong>x{snapshot.nearMissStreak}</strong>
        </div>
      </div>

      <div className="status-row">
        <span>Distancia: {Math.round(snapshot.distance)}/{TARGET_DISTANCE}</span>
        <span>Integridad: {snapshot.integrity}/3</span>
        <span>Escudo: {snapshot.shield}</span>
        <span>Estabilidad: {snapshot.focusWindow > 0 ? "Activa" : "Normal"}</span>
        <span>Turbo: {snapshot.turboBurst > 0 ? "Activo" : "Listo"}</span>
        <span>Item: {snapshot.heldItemLabel}</span>
      </div>

      <div className="phaser-canvas-shell racing-stage">
        <div ref={mountRef} className="phaser-canvas-host" aria-label="Canvas de carreras" />
      </div>

      <div className="phaser-controls">
        <button type="button" onClick={() => lane(-1)} disabled={!isPlaying}>Izquierda</button>
        <button type="button" onClick={() => lane(1)} disabled={!isPlaying}>Derecha</button>
        <button type="button" onClick={accelerate} disabled={!isPlaying}>Acelerar</button>
        <button type="button" onClick={brake} disabled={!isPlaying}>Frenar</button>
      </div>

      <div className="phaser-controls">
        <button type="button" onClick={turbo} disabled={!isPlaying || snapshot.turbo < 25 || snapshot.turboBurst > 0}>
          Activar turbo
        </button>
        <button type="button" onClick={stabilize} disabled={!isPlaying || snapshot.stabilizeCooldown > 0 || snapshot.turbo < 12}>
          Estabilizar {snapshot.stabilizeCooldown > 0 ? `(${snapshot.stabilizeCooldown})` : ""}
        </button>
        <button type="button" onClick={useItem} disabled={!isPlaying || !snapshot.heldItem}>Usar item</button>
      </div>

      <p className="game-message">{snapshot.message}</p>
      <ul className="game-log">
        {snapshot.log.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default RacingGame;
