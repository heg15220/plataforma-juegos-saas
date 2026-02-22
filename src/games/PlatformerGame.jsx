import React, { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import createSynthCuePlayer from "../utils/createSynthCuePlayer";

const STAGE_WIDTH = 768;
const STAGE_HEIGHT = 432;
const LEVEL_WIDTH = 1536;
const TOTAL_TIME = 120;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundNumber = (value) => Math.round(value * 100) / 100;

const PLAYER_PALETTE = {
  skin: 0xf9d5b7,
  top: 0x2563eb,
  bottom: 0x1f2937,
  shoes: 0x111827,
  accent: 0x93c5fd
};

const ENEMY_PALETTE = {
  skin: 0xf6c19b,
  top: 0xb91c1c,
  bottom: 0x4c0519,
  shoes: 0x111827,
  accent: 0xfda4af
};

const PLATFORMER_CUES = {
  jump: {
    cooldown: 90,
    tones: [{ type: "triangle", frequency: 560, toFrequency: 320, duration: 0.16, gain: 0.058 }]
  },
  dash: {
    cooldown: 180,
    tones: [
      { type: "square", frequency: 270, toFrequency: 120, duration: 0.1, gain: 0.05 },
      { type: "triangle", frequency: 360, toFrequency: 220, duration: 0.08, delay: 40, gain: 0.04 }
    ]
  },
  coin: {
    cooldown: 40,
    tones: [{ type: "sine", frequency: 760, toFrequency: 980, duration: 0.1, gain: 0.06 }]
  },
  stomp: {
    cooldown: 100,
    tones: [{ type: "sawtooth", frequency: 230, toFrequency: 100, duration: 0.12, gain: 0.05 }]
  },
  hurt: {
    cooldown: 170,
    tones: [{ type: "square", frequency: 240, toFrequency: 95, duration: 0.15, gain: 0.055 }]
  },
  win: {
    cooldown: 500,
    tones: [
      { type: "triangle", frequency: 520, toFrequency: 640, duration: 0.1, gain: 0.05 },
      { type: "triangle", frequency: 710, toFrequency: 860, duration: 0.1, delay: 100, gain: 0.05 },
      { type: "triangle", frequency: 880, toFrequency: 1080, duration: 0.16, delay: 190, gain: 0.056 }
    ]
  },
  lose: {
    cooldown: 500,
    tones: [
      { type: "sawtooth", frequency: 300, toFrequency: 190, duration: 0.14, gain: 0.05 },
      { type: "sawtooth", frequency: 190, toFrequency: 120, duration: 0.16, delay: 130, gain: 0.05 }
    ]
  },
  denied: {
    cooldown: 180,
    tones: [{ type: "square", frequency: 220, toFrequency: 180, duration: 0.09, gain: 0.04 }]
  }
};

const PLATFORMER_POSES = {
  idleA: { armSwing: 1, legSwing: 1, lean: 0, crouch: 0, armsUp: false, armsForward: false },
  idleB: { armSwing: -1, legSwing: -1, lean: 0, crouch: 0, armsUp: false, armsForward: false },
  runA: { armSwing: 9, legSwing: 10, lean: 1, crouch: -1, armsUp: false, armsForward: false },
  runB: { armSwing: -9, legSwing: -10, lean: 1, crouch: -1, armsUp: false, armsForward: false },
  jump: { armSwing: -3, legSwing: 3, lean: 0, crouch: 0, armsUp: true, armsForward: false },
  dash: { armSwing: 12, legSwing: 11, lean: 3, crouch: 1, armsUp: false, armsForward: true },
  hurt: { armSwing: 0, legSwing: 2, lean: -2, crouch: 2, armsUp: false, armsForward: false }
};

const INITIAL_SNAPSHOT = {
  status: "idle",
  score: 0,
  lives: 3,
  coinsCollected: 0,
  coinsTotal: 0,
  combo: 0,
  timer: TOTAL_TIME,
  dashCooldown: 0,
  message: "Pulsa iniciar para lanzar la partida.",
  player: {
    x: 80,
    y: 320,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: "right",
    animation: "idle"
  },
  enemies: [],
  goal: {
    x: LEVEL_WIDTH - 80,
    y: STAGE_HEIGHT - 110
  }
};

const PLATFORM_POSITIONS = [
  { x: 280, y: 324, width: 180 },
  { x: 520, y: 264, width: 170 },
  { x: 755, y: 312, width: 190 },
  { x: 990, y: 248, width: 170 },
  { x: 1220, y: 292, width: 180 }
];

const COIN_POSITIONS = [
  { x: 220, y: 286 },
  { x: 295, y: 286 },
  { x: 480, y: 228 },
  { x: 555, y: 228 },
  { x: 690, y: 275 },
  { x: 820, y: 275 },
  { x: 955, y: 212 },
  { x: 1040, y: 212 },
  { x: 1180, y: 254 },
  { x: 1260, y: 254 },
  { x: 1415, y: 188 }
];

const ENEMY_POSITIONS = [
  { x: 385, y: 286, left: 255, right: 440, speed: 48 },
  { x: 835, y: 274, left: 700, right: 890, speed: 56 },
  { x: 1238, y: 254, left: 1135, right: 1288, speed: 64 }
];

const addRoundedRectTexture = (scene, key, width, height, color, radius = 6, strokeColor = null) => {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphic = scene.make.graphics({ x: 0, y: 0, add: false });
  graphic.fillStyle(color, 1);
  graphic.fillRoundedRect(0, 0, width, height, radius);
  if (strokeColor !== null) {
    graphic.lineStyle(2, strokeColor, 1);
    graphic.strokeRoundedRect(1, 1, width - 2, height - 2, radius);
  }
  graphic.generateTexture(key, width, height);
  graphic.destroy();
};

const drawLimb = (graphics, color, width, start, mid, end) => {
  graphics.lineStyle(width, color, 1);
  graphics.beginPath();
  graphics.moveTo(start.x, start.y);
  graphics.lineTo(mid.x, mid.y);
  graphics.lineTo(end.x, end.y);
  graphics.strokePath();
};

const createHumanTexture = (scene, key, palette, poseName) => {
  if (scene.textures.exists(key)) {
    return;
  }

  const pose = PLATFORMER_POSES[poseName] || PLATFORMER_POSES.idleA;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  const width = 46;
  const height = 64;

  const lean = pose.lean;
  const crouch = pose.crouch;
  const torsoX = 16 + lean;
  const torsoY = 16 + crouch;
  const shoulderY = 21 + crouch;
  const hipY = 34 + crouch;
  const leftShoulderX = 18 + lean;
  const rightShoulderX = 28 + lean;
  const leftHipX = 20 + lean;
  const rightHipX = 26 + lean;

  graphics.fillStyle(0x111827, 0.16);
  graphics.fillEllipse(23, 60, 24, 4);

  graphics.fillStyle(palette.skin, 1);
  graphics.fillCircle(23 + lean, 9 + Math.max(0, crouch), 6);

  graphics.fillStyle(palette.top, 1);
  graphics.fillRoundedRect(torsoX, torsoY, 14, 18, 4);
  graphics.fillStyle(palette.accent, 0.9);
  graphics.fillRect(torsoX, torsoY + 14, 14, 2);

  graphics.fillStyle(palette.bottom, 1);
  graphics.fillRoundedRect(18 + lean, hipY - 2, 10, 8, 3);

  let leftElbow = { x: leftShoulderX - 4 - pose.armSwing * 0.3, y: shoulderY + 7 };
  let leftHand = { x: leftShoulderX - 5 - pose.armSwing * 0.45, y: shoulderY + 15 };
  let rightElbow = { x: rightShoulderX + 4 + pose.armSwing * 0.3, y: shoulderY + 7 };
  let rightHand = { x: rightShoulderX + 5 + pose.armSwing * 0.45, y: shoulderY + 15 };

  if (pose.armsUp) {
    leftElbow = { x: leftShoulderX - 4, y: shoulderY - 6 };
    leftHand = { x: leftShoulderX - 2, y: shoulderY - 12 };
    rightElbow = { x: rightShoulderX + 4, y: shoulderY - 6 };
    rightHand = { x: rightShoulderX + 2, y: shoulderY - 12 };
  } else if (pose.armsForward) {
    leftElbow = { x: leftShoulderX - 7, y: shoulderY + 1 };
    leftHand = { x: leftShoulderX - 11, y: shoulderY + 3 };
    rightElbow = { x: rightShoulderX + 8, y: shoulderY };
    rightHand = { x: rightShoulderX + 12, y: shoulderY + 2 };
  }

  const leftKnee = { x: leftHipX - pose.legSwing * 0.45, y: 44 + crouch };
  const leftFoot = { x: leftHipX - pose.legSwing * 0.8, y: 55 + crouch };
  const rightKnee = { x: rightHipX + pose.legSwing * 0.45, y: 44 + crouch };
  const rightFoot = { x: rightHipX + pose.legSwing * 0.8, y: 55 + crouch };

  drawLimb(graphics, palette.top, 4, { x: leftShoulderX, y: shoulderY }, leftElbow, leftHand);
  drawLimb(graphics, palette.top, 4, { x: rightShoulderX, y: shoulderY }, rightElbow, rightHand);
  drawLimb(graphics, palette.bottom, 4, { x: leftHipX, y: hipY }, leftKnee, leftFoot);
  drawLimb(graphics, palette.bottom, 4, { x: rightHipX, y: hipY }, rightKnee, rightFoot);

  graphics.fillStyle(palette.shoes, 1);
  graphics.fillRoundedRect(leftFoot.x - 4, leftFoot.y - 1, 8, 3, 1);
  graphics.fillRoundedRect(rightFoot.x - 4, rightFoot.y - 1, 8, 3, 1);

  if (poseName === "dash") {
    graphics.lineStyle(2, palette.accent, 0.75);
    graphics.beginPath();
    graphics.moveTo(4, 22);
    graphics.lineTo(11, 22);
    graphics.moveTo(2, 28);
    graphics.lineTo(9, 28);
    graphics.moveTo(5, 34);
    graphics.lineTo(12, 34);
    graphics.strokePath();
  }

  if (poseName === "jump") {
    graphics.lineStyle(2, palette.accent, 0.5);
    graphics.strokeCircle(23 + lean, 31 + crouch, 13);
  }

  graphics.generateTexture(key, width, height);
  graphics.destroy();
};

const createCoinTexture = (scene, key) => {
  if (scene.textures.exists(key)) {
    return;
  }

  const size = 22;
  const graphic = scene.make.graphics({ x: 0, y: 0, add: false });
  graphic.fillStyle(0xffd95c, 1);
  graphic.fillCircle(size / 2, size / 2, 9);
  graphic.lineStyle(2, 0xf59e0b, 1);
  graphic.strokeCircle(size / 2, size / 2, 9);
  graphic.fillStyle(0xfff7c2, 0.9);
  graphic.fillCircle(8, 8, 3);
  graphic.fillStyle(0xfffbe7, 0.5);
  graphic.fillCircle(14, 6, 2);
  graphic.generateTexture(key, size, size);
  graphic.destroy();
};

const createFlagTexture = (scene, key) => {
  if (scene.textures.exists(key)) {
    return;
  }

  const width = 34;
  const height = 84;
  const graphic = scene.make.graphics({ x: 0, y: 0, add: false });

  graphic.fillStyle(0x475569, 1);
  graphic.fillRoundedRect(6, 2, 4, height - 4, 2);
  graphic.fillStyle(0x0d9488, 1);
  graphic.fillRoundedRect(10, 12, 18, 20, 4);
  graphic.fillStyle(0x67e8f9, 0.75);
  graphic.fillRoundedRect(12, 15, 14, 5, 3);
  graphic.fillStyle(0x99f6e4, 0.62);
  graphic.fillRoundedRect(12, 23, 10, 5, 3);

  graphic.generateTexture(key, width, height);
  graphic.destroy();
};

const drawBackdrop = (scene) => {
  const sky = scene.add.graphics().setDepth(-15);
  sky.fillGradientStyle(0x7fd8ff, 0x9be7ff, 0xfde68a, 0xfce7a7, 1);
  sky.fillRect(0, 0, LEVEL_WIDTH, STAGE_HEIGHT);

  scene.add.circle(LEVEL_WIDTH - 210, 92, 42, 0xfff1ad, 0.82).setDepth(-14);

  const farMountains = scene.add.graphics().setDepth(-13);
  farMountains.fillStyle(0x7ca8b8, 0.55);
  for (let x = -120; x < LEVEL_WIDTH + 220; x += 220) {
    farMountains.fillTriangle(x, STAGE_HEIGHT - 50, x + 110, STAGE_HEIGHT - 228, x + 220, STAGE_HEIGHT - 50);
  }

  const nearMountains = scene.add.graphics().setDepth(-12);
  nearMountains.fillStyle(0x58839a, 0.7);
  for (let x = -140; x < LEVEL_WIDTH + 240; x += 170) {
    nearMountains.fillTriangle(x, STAGE_HEIGHT - 42, x + 85, STAGE_HEIGHT - 180, x + 170, STAGE_HEIGHT - 42);
  }

  scene.add.rectangle(LEVEL_WIDTH / 2, STAGE_HEIGHT - 18, LEVEL_WIDTH, 46, 0x275b34).setDepth(-4);
  scene.add.rectangle(LEVEL_WIDTH / 2, STAGE_HEIGHT - 56, LEVEL_WIDTH, 30, 0x3f7f49).setDepth(-4);
};

const createPlatformerScene = ({ onSnapshot, onReady }) => {
  class PlatformerScene extends Phaser.Scene {
    constructor() {
      super("platformer-scene");
      this.axisInput = 0;
      this.bufferedJump = false;
      this.bufferedDash = false;
      this.status = "idle";
      this.message = INITIAL_SNAPSHOT.message;
      this.score = 0;
      this.combo = 0;
      this.coinsCollected = 0;
      this.coinsTotal = COIN_POSITIONS.length;
      this.lives = 3;
      this.timer = TOTAL_TIME;
      this.invulnerableUntil = 0;
      this.dashUntil = 0;
      this.nextDashAt = 0;
      this.lastSnapshotAt = 0;
      this.playerFacing = "right";
      this.playerAnimation = "idle";
      this.startedAt = 0;
      this.playCue = () => false;
    }

    preload() {
      addRoundedRectTexture(this, "platformer-ground", 192, 32, 0x6f4e37, 4, 0x9d7658);
      addRoundedRectTexture(this, "platformer-ledge", 160, 24, 0x7a563d, 4, 0xac8768);
      createCoinTexture(this, "platformer-coin");
      createFlagTexture(this, "platformer-flag");

      createHumanTexture(this, "platformer-player-idle-a", PLAYER_PALETTE, "idleA");
      createHumanTexture(this, "platformer-player-idle-b", PLAYER_PALETTE, "idleB");
      createHumanTexture(this, "platformer-player-run-a", PLAYER_PALETTE, "runA");
      createHumanTexture(this, "platformer-player-run-b", PLAYER_PALETTE, "runB");
      createHumanTexture(this, "platformer-player-jump", PLAYER_PALETTE, "jump");
      createHumanTexture(this, "platformer-player-dash", PLAYER_PALETTE, "dash");
      createHumanTexture(this, "platformer-player-hurt", PLAYER_PALETTE, "hurt");

      createHumanTexture(this, "platformer-enemy-idle-a", ENEMY_PALETTE, "idleA");
      createHumanTexture(this, "platformer-enemy-idle-b", ENEMY_PALETTE, "idleB");
      createHumanTexture(this, "platformer-enemy-run-a", ENEMY_PALETTE, "runA");
      createHumanTexture(this, "platformer-enemy-run-b", ENEMY_PALETTE, "runB");
      createHumanTexture(this, "platformer-enemy-hurt", ENEMY_PALETTE, "hurt");
    }

    create() {
      this.cameras.main.setBackgroundColor("#8fd3ff");
      this.physics.world.setBounds(0, 0, LEVEL_WIDTH, STAGE_HEIGHT + 128);
      this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, STAGE_HEIGHT);

      drawBackdrop(this);

      this.clouds = [
        this.add.ellipse(180, 66, 125, 38, 0xffffff, 0.56).setScrollFactor(0.2),
        this.add.ellipse(620, 104, 135, 44, 0xffffff, 0.52).setScrollFactor(0.3),
        this.add.ellipse(1110, 82, 145, 44, 0xffffff, 0.48).setScrollFactor(0.25)
      ];

      this.platforms = this.physics.add.staticGroup();
      for (let x = 96; x < LEVEL_WIDTH; x += 192) {
        const segment = this.platforms.create(x, STAGE_HEIGHT - 16, "platformer-ground");
        segment.refreshBody();
      }

      for (const platform of PLATFORM_POSITIONS) {
        const ledge = this.platforms.create(platform.x, platform.y, "platformer-ledge");
        ledge.setDisplaySize(platform.width, 24);
        ledge.refreshBody();
      }

      this.player = this.physics.add.sprite(80, STAGE_HEIGHT - 96, "platformer-player-idle-a");
      this.player.setDisplaySize(44, 62);
      this.player.setBounce(0.01);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(20, 46);
      this.player.body.setOffset(12, 14);

      this.enemies = this.physics.add.group();
      for (const enemyConfig of ENEMY_POSITIONS) {
        const enemy = this.enemies.create(enemyConfig.x, enemyConfig.y, "platformer-enemy-run-a");
        enemy.setDisplaySize(42, 60);
        enemy.setCollideWorldBounds(true);
        enemy.body.setSize(18, 42);
        enemy.body.setOffset(12, 14);
        enemy.setData("leftBound", enemyConfig.left);
        enemy.setData("rightBound", enemyConfig.right);
        enemy.setData("patrolSpeed", enemyConfig.speed);
        enemy.setVelocityX(enemyConfig.speed);
      }

      this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
      for (const coinConfig of COIN_POSITIONS) {
        const coin = this.coins.create(coinConfig.x, coinConfig.y, "platformer-coin");
        coin.body.setCircle(9);
        coin.body.setOffset(2, 2);
      }

      this.goal = this.physics.add.staticImage(LEVEL_WIDTH - 80, STAGE_HEIGHT - 108, "platformer-flag");

      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
      this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);
      this.physics.add.overlap(this.player, this.goal, this.touchGoal, null, this);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.altKeys = this.input.keyboard.addKeys({
        left: "A",
        right: "D",
        jump: "W",
        jumpAlt: "SPACE",
        dash: "SHIFT"
      });

      this.ensureAnimations();
      const cuePlayer = createSynthCuePlayer(this, PLATFORMER_CUES);
      this.playCue = (cueName) => cuePlayer.play(cueName);

      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

      this.startRun();
      this.registerApi();
      this.publishSnapshot(true);
    }

    ensureAnimations() {
      if (!this.anims.exists("platformer-player-idle")) {
        this.anims.create({
          key: "platformer-player-idle",
          frames: [{ key: "platformer-player-idle-a" }, { key: "platformer-player-idle-b" }],
          frameRate: 4,
          repeat: -1
        });
      }
      if (!this.anims.exists("platformer-player-run")) {
        this.anims.create({
          key: "platformer-player-run",
          frames: [{ key: "platformer-player-run-a" }, { key: "platformer-player-run-b" }],
          frameRate: 12,
          repeat: -1
        });
      }
      if (!this.anims.exists("platformer-enemy-run")) {
        this.anims.create({
          key: "platformer-enemy-run",
          frames: [{ key: "platformer-enemy-run-a" }, { key: "platformer-enemy-run-b" }],
          frameRate: 9,
          repeat: -1
        });
      }
    }

    startRun() {
      this.status = "playing";
      this.message = "Corre hacia la meta, recoge todas las monedas y sobrevive.";
      this.score = 0;
      this.combo = 0;
      this.coinsCollected = 0;
      this.lives = 3;
      this.timer = TOTAL_TIME;
      this.startedAt = this.time.now;
      this.invulnerableUntil = 0;
      this.dashUntil = 0;
      this.nextDashAt = 0;
      this.playerAnimation = "idle";
      this.player.setAlpha(1);
      this.player.body.allowGravity = true;
      this.player.setPosition(80, STAGE_HEIGHT - 96);
      this.player.setVelocity(0, 0);
      this.playerFacing = "right";
      this.player.play("platformer-player-idle", true);

      for (const coin of this.coins.getChildren()) {
        coin.enableBody(false, coin.x, coin.y, true, true);
        coin.setScale(1);
        coin.rotation = 0;
      }

      for (const enemy of this.enemies.getChildren()) {
        enemy.enableBody(false, enemy.x, enemy.y, true, true);
        enemy.setVelocityX(enemy.getData("patrolSpeed"));
        enemy.play("platformer-enemy-run", true);
      }
    }

    registerApi() {
      onReady({
        setAxis: (axis) => {
          this.axisInput = clamp(Number(axis) || 0, -1, 1);
        },
        jump: () => {
          this.bufferedJump = true;
        },
        dash: () => {
          this.bufferedDash = true;
        },
        restart: () => {
          this.startRun();
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

    getPlayerDirection() {
      const leftPressed = this.cursors.left.isDown || this.altKeys.left.isDown || this.axisInput < -0.2;
      const rightPressed = this.cursors.right.isDown || this.altKeys.right.isDown || this.axisInput > 0.2;
      if (leftPressed && rightPressed) {
        return 0;
      }
      if (leftPressed) {
        return -1;
      }
      if (rightPressed) {
        return 1;
      }
      return 0;
    }

    wantsJump() {
      const keyJump =
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.altKeys.jump) ||
        Phaser.Input.Keyboard.JustDown(this.altKeys.jumpAlt);
      if (keyJump || this.bufferedJump) {
        this.bufferedJump = false;
        return true;
      }
      return false;
    }

    wantsDash() {
      const keyDash = Phaser.Input.Keyboard.JustDown(this.altKeys.dash);
      if (keyDash || this.bufferedDash) {
        this.bufferedDash = false;
        return true;
      }
      return false;
    }

    spawnImpact(x, y, color = 0xffffff) {
      const ring = this.add.circle(x, y, 10, color, 0.82).setDepth(8);
      this.tweens.add({
        targets: ring,
        scale: 1.8,
        alpha: 0,
        duration: 150,
        ease: "quad.out",
        onComplete: () => ring.destroy()
      });
    }

    updatePlayerVisual(onGround) {
      const moving = Math.abs(this.player.body.velocity.x) > 18;
      let nextAnimation = "idle";

      if (this.time.now < this.dashUntil && moving) {
        nextAnimation = "dash";
      } else if (!onGround) {
        nextAnimation = "jump";
      } else if (this.time.now < this.invulnerableUntil) {
        nextAnimation = "hurt";
      } else if (moving) {
        nextAnimation = "run";
      }

      if (this.playerAnimation !== nextAnimation) {
        this.playerAnimation = nextAnimation;
        if (nextAnimation === "idle") {
          this.player.play("platformer-player-idle", true);
        } else if (nextAnimation === "run") {
          this.player.play("platformer-player-run", true);
        } else if (nextAnimation === "jump") {
          this.player.anims.stop();
          this.player.setTexture("platformer-player-jump");
        } else if (nextAnimation === "dash") {
          this.player.anims.stop();
          this.player.setTexture("platformer-player-dash");
        } else {
          this.player.anims.stop();
          this.player.setTexture("platformer-player-hurt");
        }
      }

      this.player.setFlipX(this.playerFacing === "left");
    }

    update(_, delta) {
      for (const cloud of this.clouds) {
        cloud.x += 0.03 * delta;
        if (cloud.x > LEVEL_WIDTH + 90) {
          cloud.x = -90;
        }
      }

      for (const coin of this.coins.getChildren()) {
        if (!coin.active) {
          continue;
        }
        coin.rotation += 0.0028 * delta;
        coin.setScale(1 + Math.sin((this.time.now + coin.x) * 0.015) * 0.05);
      }

      if (this.status !== "playing") {
        this.updatePlayerVisual(this.player.body.blocked.down || this.player.body.touching.down);
        this.publishSnapshot();
        return;
      }

      this.timer = Math.max(0, TOTAL_TIME - (this.time.now - this.startedAt) / 1000);
      if (this.timer <= 0) {
        this.finishRun("lost", "Se acaba el tiempo antes de llegar a la meta.");
      }

      const direction = this.getPlayerDirection();
      const moveSpeed = this.time.now < this.dashUntil ? 330 : 198;
      const wantsDash = this.wantsDash();
      const canMove = this.time.now >= this.invulnerableUntil;

      if (wantsDash && direction !== 0 && canMove && this.time.now >= this.nextDashAt) {
        this.dashUntil = this.time.now + 240;
        this.nextDashAt = this.time.now + 780;
        this.playCue("dash");
        this.cameras.main.shake(90, 0.0016);
      }

      if (direction !== 0 && canMove) {
        this.player.setVelocityX(direction * moveSpeed);
        this.playerFacing = direction > 0 ? "right" : "left";
      } else {
        this.player.setVelocityX(0);
      }

      const onGround = this.player.body.blocked.down || this.player.body.touching.down;
      if (this.wantsJump() && onGround && canMove) {
        this.player.setVelocityY(-430);
        this.playCue("jump");
      }

      if (this.player.y > STAGE_HEIGHT + 64) {
        this.loseLife("Caida al vacio.");
      }

      for (const enemy of this.enemies.getChildren()) {
        if (!enemy.active) {
          continue;
        }
        const leftBound = enemy.getData("leftBound");
        const rightBound = enemy.getData("rightBound");
        const speed = enemy.getData("patrolSpeed");
        if (enemy.x <= leftBound && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(speed);
        } else if (enemy.x >= rightBound && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-speed);
        }
        enemy.setFlipX(enemy.body.velocity.x < 0);
        if (!enemy.anims.isPlaying) {
          enemy.play("platformer-enemy-run", true);
        }
      }

      if (this.time.now < this.invulnerableUntil) {
        const blink = Math.floor((this.invulnerableUntil - this.time.now) / 80) % 2 === 0;
        this.player.setAlpha(blink ? 0.45 : 1);
      } else {
        this.player.setAlpha(1);
      }

      this.updatePlayerVisual(onGround);
      this.publishSnapshot();
    }

    collectCoin(_, coin) {
      if (!coin.active || this.status !== "playing") {
        return;
      }

      this.spawnImpact(coin.x, coin.y, 0xfef08a);
      this.playCue("coin");
      coin.disableBody(true, true);
      this.coinsCollected += 1;
      this.combo = clamp(this.combo + 1, 0, 999);
      this.score += 120 + this.combo * 5;

      if (this.coinsCollected >= this.coinsTotal) {
        this.message = "Monedas completas. Ya puedes cerrar nivel en la bandera.";
      } else {
        this.message = `Moneda recogida (${this.coinsCollected}/${this.coinsTotal}).`;
      }
      this.publishSnapshot(true);
    }

    handleEnemyCollision(player, enemy) {
      if (!enemy.active || this.status !== "playing") {
        return;
      }

      const stomp =
        player.body.velocity.y > 100 &&
        player.y + player.height * 0.35 < enemy.y &&
        this.time.now >= this.invulnerableUntil;

      if (stomp) {
        this.playCue("stomp");
        this.spawnImpact(enemy.x, enemy.y - 8, 0xffffff);
        enemy.disableBody(true, true);
        this.score += 180 + this.combo * 8;
        this.combo = clamp(this.combo + 1, 0, 999);
        this.message = "Pisoton limpio. Rival fuera de combate.";
        player.setVelocityY(-280);
        this.publishSnapshot(true);
        return;
      }

      this.loseLife("Impacto directo con enemigo.");
    }

    touchGoal() {
      if (this.status !== "playing") {
        return;
      }

      if (this.coinsCollected < this.coinsTotal) {
        this.message = `Faltan monedas (${this.coinsCollected}/${this.coinsTotal}) antes de finalizar.`;
        this.playCue("denied");
        this.publishSnapshot(true);
        return;
      }

      const timeBonus = Math.round(this.timer * 25);
      this.score += timeBonus;
      this.finishRun("won", `Nivel completado. Bonus de tiempo: +${timeBonus}.`);
    }

    loseLife(reason) {
      if (this.status !== "playing" || this.time.now < this.invulnerableUntil) {
        return;
      }

      this.lives -= 1;
      this.combo = 0;
      this.message = `${reason} Vidas restantes: ${Math.max(0, this.lives)}.`;
      this.playCue("hurt");
      this.cameras.main.shake(110, 0.002);

      if (this.lives <= 0) {
        this.finishRun("lost", "Sin vidas disponibles. Fin de partida.");
        return;
      }

      this.player.setPosition(80, STAGE_HEIGHT - 96);
      this.player.setVelocity(0, -180);
      this.invulnerableUntil = this.time.now + 1400;
      this.publishSnapshot(true);
    }

    finishRun(nextStatus, message) {
      this.status = nextStatus;
      this.message = message;
      this.player.setVelocity(0, 0);
      this.player.body.allowGravity = false;

      if (nextStatus === "won") {
        this.playCue("win");
        this.cameras.main.flash(220, 180, 255, 240, false);
      } else {
        this.playCue("lose");
      }

      this.time.delayedCall(260, () => {
        this.player.body.allowGravity = true;
      });
      this.publishSnapshot(true);
    }

    publishSnapshot(force = false) {
      if (!force && this.time.now - this.lastSnapshotAt < 80) {
        return;
      }
      this.lastSnapshotAt = this.time.now;

      const activeEnemies = this.enemies
        .getChildren()
        .filter((enemy) => enemy.active)
        .map((enemy) => ({
          x: roundNumber(enemy.x),
          y: roundNumber(enemy.y),
          vx: roundNumber(enemy.body.velocity.x),
          facing: enemy.body.velocity.x >= 0 ? "right" : "left"
        }));

      onSnapshot({
        status: this.status,
        score: this.score,
        lives: this.lives,
        coinsCollected: this.coinsCollected,
        coinsTotal: this.coinsTotal,
        combo: this.combo,
        timer: roundNumber(this.timer),
        dashCooldown: roundNumber(Math.max(0, (this.nextDashAt - this.time.now) / 1000)),
        message: this.message,
        player: {
          x: roundNumber(this.player.x),
          y: roundNumber(this.player.y),
          vx: roundNumber(this.player.body.velocity.x),
          vy: roundNumber(this.player.body.velocity.y),
          onGround: this.player.body.blocked.down || this.player.body.touching.down,
          facing: this.playerFacing,
          animation: this.playerAnimation
        },
        enemies: activeEnemies,
        goal: {
          x: roundNumber(this.goal.x),
          y: roundNumber(this.goal.y)
        }
      });
    }
  }

  return new PlatformerScene();
};

function PlatformerGame() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const sceneApiRef = useRef(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!mountRef.current || gameRef.current) {
      return undefined;
    }

    let isMounted = true;
    const scene = createPlatformerScene({
      onSnapshot: (nextSnapshot) => {
        if (isMounted) {
          setSnapshot(nextSnapshot);
        }
      },
      onReady: (sceneApi) => {
        sceneApiRef.current = sceneApi;
      }
    });

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      parent: mountRef.current,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 960 },
          debug: false
        }
      },
      scene: [scene]
    });

    gameRef.current = game;

    return () => {
      isMounted = false;
      sceneApiRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const setAxis = (axis) => {
    sceneApiRef.current?.setAxis(axis);
  };

  const jump = () => {
    sceneApiRef.current?.jump();
  };

  const dash = () => {
    sceneApiRef.current?.dash();
  };

  const restart = () => {
    sceneApiRef.current?.restart();
  };

  const buildTextPayload = useCallback((stateSnapshot) => {
    return {
      mode: "platformer",
      coordinates: "origin_top_left_x_right_y_down",
      status: stateSnapshot.status,
      timer: stateSnapshot.timer,
      score: stateSnapshot.score,
      lives: stateSnapshot.lives,
      dashCooldown: stateSnapshot.dashCooldown,
      coins: {
        collected: stateSnapshot.coinsCollected,
        total: stateSnapshot.coinsTotal
      },
      combo: stateSnapshot.combo,
      player: stateSnapshot.player,
      enemies: stateSnapshot.enemies,
      goal: stateSnapshot.goal,
      message: stateSnapshot.message
    };
  }, []);

  const advanceTime = useCallback((ms) => {
    if (sceneApiRef.current?.advanceTime) {
      return sceneApiRef.current.advanceTime(ms);
    }
    return undefined;
  }, []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const statusLabel =
    snapshot.status === "won"
      ? "Victoria"
      : snapshot.status === "lost"
        ? "Derrota"
        : snapshot.status === "playing"
          ? "En nivel"
          : "Preparado";

  const coinsProgress = snapshot.coinsTotal > 0
    ? (snapshot.coinsCollected / snapshot.coinsTotal) * 100
    : 0;
  const timeProgress = (snapshot.timer / TOTAL_TIME) * 100;

  return (
    <div className="mini-game platformer-game">
      <div className="mini-head">
        <div>
          <h4>Modo Plataformas Realista (Phaser)</h4>
          <p>Figuras humanas animadas, saltos/dash con audio y combate por pisoton.</p>
        </div>
        <button type="button" onClick={restart}>
          Reiniciar nivel
        </button>
      </div>

      <div className="status-row">
        <span className={`status-pill ${snapshot.status}`}>{statusLabel}</span>
        <span>Puntos: {snapshot.score}</span>
        <span>Vidas: {snapshot.lives}</span>
        <span>Monedas: {snapshot.coinsCollected}/{snapshot.coinsTotal}</span>
        <span>Combo: x{snapshot.combo}</span>
        <span>Dash CD: {snapshot.dashCooldown.toFixed(1)}s</span>
        <span>Tiempo: {Math.max(0, Math.ceil(snapshot.timer))}s</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Monedas</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: `${coinsProgress}%` }} />
          </div>
          <strong>{Math.round(coinsProgress)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Tiempo restante</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: `${timeProgress}%` }} />
          </div>
          <strong>{Math.max(0, Math.ceil(snapshot.timer))}s</strong>
        </div>
      </div>

      <div className="phaser-canvas-shell">
        <div ref={mountRef} className="phaser-canvas-host" aria-label="Canvas platformer" />
      </div>

      <div className="phaser-controls">
        <button
          type="button"
          onMouseDown={() => setAxis(-1)}
          onMouseUp={() => setAxis(0)}
          onMouseLeave={() => setAxis(0)}
          onTouchStart={() => setAxis(-1)}
          onTouchEnd={() => setAxis(0)}
        >
          Izquierda
        </button>
        <button
          type="button"
          onMouseDown={() => setAxis(1)}
          onMouseUp={() => setAxis(0)}
          onMouseLeave={() => setAxis(0)}
          onTouchStart={() => setAxis(1)}
          onTouchEnd={() => setAxis(0)}
        >
          Derecha
        </button>
        <button type="button" onClick={jump}>
          Saltar
        </button>
        <button type="button" onClick={dash}>
          Dash
        </button>
      </div>

      <p className="game-message">{snapshot.message} Animacion: {snapshot.player.animation}.</p>
    </div>
  );
}

export default PlatformerGame;
