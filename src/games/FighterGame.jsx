import React, { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import createSynthCuePlayer from "../utils/createSynthCuePlayer";

const STAGE_WIDTH = 768;
const STAGE_HEIGHT = 432;
const FLOOR_Y = 356;
const ROUND_TIME = 75;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundNumber = (value) => Math.round(value * 100) / 100;

const ATTACKS = {
  light: {
    name: "light",
    label: "Jab",
    startup: 80,
    active: 120,
    recovery: 170,
    damage: 8,
    range: 78,
    knockback: 130,
    stun: 180,
    meterGain: 10,
    guardBreak: 8,
    meterCost: 0,
    lunge: 0,
    startCue: "attackLight",
    hitCue: "hitLight"
  },
  heavy: {
    name: "heavy",
    label: "Heavy Kick",
    startup: 140,
    active: 160,
    recovery: 260,
    damage: 15,
    range: 98,
    knockback: 190,
    stun: 260,
    meterGain: 14,
    guardBreak: 14,
    meterCost: 0,
    lunge: 0,
    startCue: "attackHeavy",
    hitCue: "hitHeavy"
  },
  special: {
    name: "special",
    label: "Dragon Burst",
    startup: 180,
    active: 170,
    recovery: 320,
    damage: 24,
    range: 132,
    knockback: 260,
    stun: 320,
    meterGain: 0,
    guardBreak: 24,
    meterCost: 40,
    lunge: 190,
    startCue: "attackSpecial",
    hitCue: "hitSpecial"
  }
};

const FIGHTER_CUES = {
  jump: {
    cooldown: 120,
    tones: [{ type: "triangle", frequency: 520, toFrequency: 280, duration: 0.14, gain: 0.05 }]
  },
  attackLight: {
    cooldown: 70,
    tones: [{ type: "square", frequency: 360, toFrequency: 260, duration: 0.08, gain: 0.045 }]
  },
  attackHeavy: {
    cooldown: 120,
    tones: [{ type: "sawtooth", frequency: 300, toFrequency: 170, duration: 0.11, gain: 0.05 }]
  },
  attackSpecial: {
    cooldown: 180,
    tones: [
      { type: "sawtooth", frequency: 240, toFrequency: 380, duration: 0.11, gain: 0.05 },
      { type: "triangle", frequency: 460, toFrequency: 260, duration: 0.13, delay: 70, gain: 0.048 }
    ]
  },
  hitLight: {
    cooldown: 70,
    tones: [{ type: "square", frequency: 260, toFrequency: 130, duration: 0.07, gain: 0.05 }]
  },
  hitHeavy: {
    cooldown: 90,
    tones: [{ type: "sawtooth", frequency: 240, toFrequency: 90, duration: 0.12, gain: 0.06 }]
  },
  hitSpecial: {
    cooldown: 130,
    tones: [
      { type: "square", frequency: 210, toFrequency: 90, duration: 0.12, gain: 0.06 },
      { type: "triangle", frequency: 120, toFrequency: 70, duration: 0.16, delay: 60, gain: 0.06 }
    ]
  },
  block: {
    cooldown: 90,
    tones: [{ type: "triangle", frequency: 190, toFrequency: 240, duration: 0.08, gain: 0.035 }]
  },
  guardBreak: {
    cooldown: 180,
    tones: [
      { type: "square", frequency: 340, toFrequency: 120, duration: 0.1, gain: 0.05 },
      { type: "square", frequency: 210, toFrequency: 90, duration: 0.1, delay: 80, gain: 0.05 }
    ]
  },
  ko: {
    cooldown: 450,
    tones: [
      { type: "sawtooth", frequency: 190, toFrequency: 90, duration: 0.18, gain: 0.06 },
      { type: "triangle", frequency: 110, toFrequency: 60, duration: 0.2, delay: 130, gain: 0.06 }
    ]
  },
  draw: {
    cooldown: 450,
    tones: [{ type: "triangle", frequency: 260, toFrequency: 200, duration: 0.12, gain: 0.04 }]
  }
};

const FIGHTER_POSES = {
  idleA: { armSwing: 1, legSwing: 1, lean: 0, crouch: 0, armsUp: false, guard: false, kick: false },
  idleB: { armSwing: -1, legSwing: -1, lean: 0, crouch: 0, armsUp: false, guard: false, kick: false },
  moveA: { armSwing: 8, legSwing: 8, lean: 1, crouch: -1, armsUp: false, guard: false, kick: false },
  moveB: { armSwing: -8, legSwing: -8, lean: 1, crouch: -1, armsUp: false, guard: false, kick: false },
  jump: { armSwing: 0, legSwing: 4, lean: 0, crouch: 0, armsUp: true, guard: false, kick: false },
  guard: { armSwing: 0, legSwing: 0, lean: -2, crouch: 2, armsUp: false, guard: true, kick: false },
  light: { armSwing: 11, legSwing: 2, lean: 2, crouch: 0, armsUp: false, guard: false, kick: false },
  heavy: { armSwing: 4, legSwing: 12, lean: 2, crouch: 0, armsUp: false, guard: false, kick: true },
  special: { armSwing: 12, legSwing: 7, lean: 3, crouch: -1, armsUp: false, guard: false, kick: false },
  stunned: { armSwing: 0, legSwing: 0, lean: -3, crouch: 4, armsUp: false, guard: false, kick: false },
  ko: { armSwing: 0, legSwing: -2, lean: -6, crouch: 8, armsUp: false, guard: false, kick: false }
};

const PLAYER_PALETTE = {
  skin: 0xf9d5b7,
  top: 0x0284c7,
  bottom: 0x0f172a,
  shoes: 0x111827,
  accent: 0x7dd3fc
};

const CPU_PALETTE = {
  skin: 0xf6bf97,
  top: 0xdc2626,
  bottom: 0x450a0a,
  shoes: 0x111827,
  accent: 0xfca5a5
};

const INITIAL_SNAPSHOT = {
  status: "idle",
  timer: ROUND_TIME,
  message: "Pulsa iniciar para arrancar el combate.",
  inputBuffer: [],
  player: {
    hp: 100,
    meter: 0,
    guard: 100,
    combo: 0,
    x: 220,
    y: FLOOR_Y,
    state: "idle",
    pose: "idle",
    facing: "right"
  },
  cpu: {
    hp: 100,
    meter: 0,
    guard: 100,
    combo: 0,
    x: 548,
    y: FLOOR_Y,
    state: "idle",
    pose: "idle",
    facing: "left"
  }
};

const addRoundedRectTexture = (scene, key, width, height, color, radius = 7, strokeColor = null) => {
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

const createFighterHumanTexture = (scene, key, palette, poseName) => {
  if (scene.textures.exists(key)) {
    return;
  }

  const pose = FIGHTER_POSES[poseName] || FIGHTER_POSES.idleA;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  const width = 60;
  const height = 94;

  const lean = pose.lean;
  const crouch = pose.crouch;
  const shoulderY = 29 + crouch;
  const hipY = 50 + crouch;
  const leftShoulderX = 24 + lean;
  const rightShoulderX = 36 + lean;
  const leftHipX = 27 + lean;
  const rightHipX = 33 + lean;

  graphics.fillStyle(0x000000, 0.2);
  graphics.fillEllipse(30, 90, 28, 5);

  graphics.fillStyle(palette.skin, 1);
  graphics.fillCircle(30 + lean, 14 + Math.max(0, crouch * 0.4), 7);

  graphics.fillStyle(palette.top, 1);
  graphics.fillRoundedRect(23 + lean, 23 + crouch, 14, 22, 5);
  graphics.fillStyle(palette.accent, 0.9);
  graphics.fillRect(23 + lean, 40 + crouch, 14, 2);

  graphics.fillStyle(palette.bottom, 1);
  graphics.fillRoundedRect(25 + lean, 45 + crouch, 10, 9, 3);

  let leftElbow = { x: leftShoulderX - 5 - pose.armSwing * 0.3, y: shoulderY + 8 };
  let leftHand = { x: leftShoulderX - 6 - pose.armSwing * 0.5, y: shoulderY + 17 };
  let rightElbow = { x: rightShoulderX + 5 + pose.armSwing * 0.3, y: shoulderY + 8 };
  let rightHand = { x: rightShoulderX + 6 + pose.armSwing * 0.5, y: shoulderY + 17 };

  if (pose.armsUp) {
    leftElbow = { x: leftShoulderX - 4, y: shoulderY - 7 };
    leftHand = { x: leftShoulderX - 2, y: shoulderY - 16 };
    rightElbow = { x: rightShoulderX + 4, y: shoulderY - 7 };
    rightHand = { x: rightShoulderX + 2, y: shoulderY - 16 };
  }

  if (pose.guard) {
    leftElbow = { x: leftShoulderX + 1, y: shoulderY + 4 };
    leftHand = { x: leftShoulderX + 7, y: shoulderY + 1 };
    rightElbow = { x: rightShoulderX - 1, y: shoulderY + 4 };
    rightHand = { x: rightShoulderX - 7, y: shoulderY + 1 };
  }

  const leftKnee = { x: leftHipX - pose.legSwing * 0.45, y: 67 + crouch };
  const leftFoot = { x: leftHipX - pose.legSwing * 0.78, y: 84 + crouch };
  let rightKnee = { x: rightHipX + pose.legSwing * 0.45, y: 67 + crouch };
  let rightFoot = { x: rightHipX + pose.legSwing * 0.78, y: 84 + crouch };

  if (pose.kick) {
    rightKnee = { x: rightHipX + 10, y: 62 + crouch };
    rightFoot = { x: rightHipX + 18, y: 59 + crouch };
  }

  drawLimb(graphics, palette.top, 4, { x: leftShoulderX, y: shoulderY }, leftElbow, leftHand);
  drawLimb(graphics, palette.top, 4, { x: rightShoulderX, y: shoulderY }, rightElbow, rightHand);
  drawLimb(graphics, palette.bottom, 4, { x: leftHipX, y: hipY }, leftKnee, leftFoot);
  drawLimb(graphics, palette.bottom, 4, { x: rightHipX, y: hipY }, rightKnee, rightFoot);

  graphics.fillStyle(palette.shoes, 1);
  graphics.fillRoundedRect(leftFoot.x - 4, leftFoot.y - 1, 8, 3, 1);
  graphics.fillRoundedRect(rightFoot.x - 4, rightFoot.y - 1, 8, 3, 1);

  if (poseName === "special") {
    graphics.lineStyle(2, palette.accent, 0.7);
    graphics.strokeCircle(30 + lean, 44 + crouch, 20);
  }

  graphics.generateTexture(key, width, height);
  graphics.destroy();
};

const drawStageBackdrop = (scene) => {
  const bg = scene.add.graphics().setDepth(-10);
  bg.fillGradientStyle(0x0f172a, 0x1e293b, 0x111827, 0x020617, 1);
  bg.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

  const crowd = scene.add.graphics().setDepth(-9);
  crowd.fillStyle(0x334155, 0.45);
  for (let x = -10; x < STAGE_WIDTH + 20; x += 26) {
    crowd.fillCircle(x, 168 + Phaser.Math.Between(-8, 8), Phaser.Math.Between(10, 14));
  }

  for (let i = 0; i < 3; i += 1) {
    scene.add.rectangle(STAGE_WIDTH / 2, 196 + i * 26, STAGE_WIDTH - 84, 4, 0xf59e0b, 0.58).setDepth(-8);
  }

  scene.add.rectangle(STAGE_WIDTH / 2, STAGE_HEIGHT - 96, STAGE_WIDTH, 200, 0x0b1220, 0.82).setDepth(-7);
};

const createFighterScene = ({ onSnapshot, onReady }) => {
  class FighterScene extends Phaser.Scene {
    constructor() {
      super("fighter-scene");
      this.status = "idle";
      this.timer = ROUND_TIME;
      this.message = INITIAL_SNAPSHOT.message;
      this.roundStartedAt = 0;
      this.lastSnapshotAt = 0;
      this.externalAxis = 0;
      this.externalGuard = false;
      this.externalJump = false;
      this.externalActions = [];
      this.playerInputBuffer = [];
      this.nextAiDecisionAt = 0;
      this.playCue = () => false;
    }

    preload() {
      addRoundedRectTexture(this, "fighter-floor", STAGE_WIDTH + 32, 36, 0x3f4f5d, 0, 0x617383);

      createFighterHumanTexture(this, "fighter-player-idle-a", PLAYER_PALETTE, "idleA");
      createFighterHumanTexture(this, "fighter-player-idle-b", PLAYER_PALETTE, "idleB");
      createFighterHumanTexture(this, "fighter-player-move-a", PLAYER_PALETTE, "moveA");
      createFighterHumanTexture(this, "fighter-player-move-b", PLAYER_PALETTE, "moveB");
      createFighterHumanTexture(this, "fighter-player-jump", PLAYER_PALETTE, "jump");
      createFighterHumanTexture(this, "fighter-player-guard", PLAYER_PALETTE, "guard");
      createFighterHumanTexture(this, "fighter-player-light", PLAYER_PALETTE, "light");
      createFighterHumanTexture(this, "fighter-player-heavy", PLAYER_PALETTE, "heavy");
      createFighterHumanTexture(this, "fighter-player-special", PLAYER_PALETTE, "special");
      createFighterHumanTexture(this, "fighter-player-stunned", PLAYER_PALETTE, "stunned");
      createFighterHumanTexture(this, "fighter-player-ko", PLAYER_PALETTE, "ko");

      createFighterHumanTexture(this, "fighter-cpu-idle-a", CPU_PALETTE, "idleA");
      createFighterHumanTexture(this, "fighter-cpu-idle-b", CPU_PALETTE, "idleB");
      createFighterHumanTexture(this, "fighter-cpu-move-a", CPU_PALETTE, "moveA");
      createFighterHumanTexture(this, "fighter-cpu-move-b", CPU_PALETTE, "moveB");
      createFighterHumanTexture(this, "fighter-cpu-jump", CPU_PALETTE, "jump");
      createFighterHumanTexture(this, "fighter-cpu-guard", CPU_PALETTE, "guard");
      createFighterHumanTexture(this, "fighter-cpu-light", CPU_PALETTE, "light");
      createFighterHumanTexture(this, "fighter-cpu-heavy", CPU_PALETTE, "heavy");
      createFighterHumanTexture(this, "fighter-cpu-special", CPU_PALETTE, "special");
      createFighterHumanTexture(this, "fighter-cpu-stunned", CPU_PALETTE, "stunned");
      createFighterHumanTexture(this, "fighter-cpu-ko", CPU_PALETTE, "ko");
    }

    create() {
      this.cameras.main.setBackgroundColor("#191d2e");
      drawStageBackdrop(this);

      this.floor = this.physics.add.staticImage(STAGE_WIDTH / 2, FLOOR_Y + 20, "fighter-floor");
      this.floor.refreshBody();

      const playerSprite = this.physics.add.sprite(220, FLOOR_Y, "fighter-player-idle-a");
      playerSprite.setDisplaySize(58, 92);
      playerSprite.body.setSize(26, 78);
      playerSprite.body.setOffset(16, 12);
      playerSprite.setCollideWorldBounds(true);

      const cpuSprite = this.physics.add.sprite(548, FLOOR_Y, "fighter-cpu-idle-a");
      cpuSprite.setDisplaySize(58, 92);
      cpuSprite.body.setSize(26, 78);
      cpuSprite.body.setOffset(16, 12);
      cpuSprite.setCollideWorldBounds(true);

      this.physics.add.collider(playerSprite, this.floor);
      this.physics.add.collider(cpuSprite, this.floor);
      this.physics.add.collider(playerSprite, cpuSprite);

      this.fighters = {
        player: {
          id: "player",
          sprite: playerSprite,
          hp: 100,
          meter: 0,
          guard: 100,
          combo: 0,
          state: "idle",
          pose: "idle",
          facing: 1,
          stunUntil: 0,
          cooldownUntil: 0,
          attack: null,
          lastHitAt: 0
        },
        cpu: {
          id: "cpu",
          sprite: cpuSprite,
          hp: 100,
          meter: 0,
          guard: 100,
          combo: 0,
          state: "idle",
          pose: "idle",
          facing: -1,
          stunUntil: 0,
          cooldownUntil: 0,
          attack: null,
          lastHitAt: 0
        }
      };

      this.keys = this.input.keyboard.addKeys({
        left: "A",
        right: "D",
        jump: "W",
        down: "S",
        light: "J",
        heavy: "K",
        guard: "L",
        special: "U",
        heavyAlt: "ENTER",
        specialAlt: "B"
      });
      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.ensureAnimations();

      const cuePlayer = createSynthCuePlayer(this, FIGHTER_CUES);
      this.playCue = (cueName) => cuePlayer.play(cueName);

      this.startRound();
      this.registerApi();
      this.publishSnapshot(true);
    }

    ensureAnimations() {
      for (const id of ["player", "cpu"]) {
        if (!this.anims.exists(`fighter-${id}-idle`)) {
          this.anims.create({
            key: `fighter-${id}-idle`,
            frames: [{ key: `fighter-${id}-idle-a` }, { key: `fighter-${id}-idle-b` }],
            frameRate: 4,
            repeat: -1
          });
        }

        if (!this.anims.exists(`fighter-${id}-move`)) {
          this.anims.create({
            key: `fighter-${id}-move`,
            frames: [{ key: `fighter-${id}-move-a` }, { key: `fighter-${id}-move-b` }],
            frameRate: 10,
            repeat: -1
          });
        }
      }
    }

    startRound() {
      this.status = "playing";
      this.timer = ROUND_TIME;
      this.message = "Round 1. Mantiene la distancia y confirma golpes.";
      this.roundStartedAt = this.time.now;
      this.playerInputBuffer = [];
      this.nextAiDecisionAt = this.time.now + 350;

      for (const fighter of Object.values(this.fighters)) {
        fighter.hp = 100;
        fighter.meter = 0;
        fighter.guard = 100;
        fighter.combo = 0;
        fighter.state = "idle";
        fighter.pose = "idle";
        fighter.stunUntil = 0;
        fighter.cooldownUntil = 0;
        fighter.attack = null;
        fighter.lastHitAt = 0;
        fighter.sprite.clearTint();
        fighter.sprite.setVelocity(0, 0);
      }

      this.fighters.player.sprite.setPosition(220, FLOOR_Y);
      this.fighters.cpu.sprite.setPosition(548, FLOOR_Y);
    }

    registerApi() {
      onReady({
        setAxis: (axis) => {
          this.externalAxis = clamp(Number(axis) || 0, -1, 1);
        },
        guard: (isActive) => {
          this.externalGuard = Boolean(isActive);
        },
        jump: () => {
          this.externalJump = true;
        },
        action: (action) => {
          this.externalActions.push(action);
        },
        restart: () => {
          this.startRound();
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

    isStunned(fighter) {
      return this.time.now < fighter.stunUntil;
    }

    updateFacing() {
      const player = this.fighters.player;
      const cpu = this.fighters.cpu;
      const playerIsLeft = player.sprite.x <= cpu.sprite.x;
      player.facing = playerIsLeft ? 1 : -1;
      cpu.facing = playerIsLeft ? -1 : 1;
    }

    recordInput(action) {
      this.playerInputBuffer.push({ action, time: this.time.now });
      if (this.playerInputBuffer.length > 16) {
        this.playerInputBuffer = this.playerInputBuffer.slice(-16);
      }
    }

    hasBufferedPattern(pattern, windowMs = 680) {
      const cutoff = this.time.now - windowMs;
      const events = this.playerInputBuffer.filter((entry) => entry.time >= cutoff);
      if (events.length < pattern.length) {
        return false;
      }
      let cursor = events.length - 1;
      for (let index = pattern.length - 1; index >= 0; index -= 1) {
        const expected = pattern[index];
        while (cursor >= 0 && events[cursor].action !== expected) {
          cursor -= 1;
        }
        if (cursor < 0) {
          return false;
        }
        cursor -= 1;
      }
      return true;
    }

    popExternalAction(target) {
      const actionIndex = this.externalActions.indexOf(target);
      if (actionIndex === -1) {
        return false;
      }
      this.externalActions.splice(actionIndex, 1);
      return true;
    }

    spawnHitFlash(x, y, color = 0xffffff) {
      const flash = this.add.circle(x, y, 11, color, 0.84).setDepth(8);
      this.tweens.add({
        targets: flash,
        scale: 2,
        alpha: 0,
        duration: 130,
        ease: "quad.out",
        onComplete: () => flash.destroy()
      });
    }

    handlePlayerInput() {
      const fighter = this.fighters.player;
      if (this.status !== "playing") {
        return;
      }
      if (this.isStunned(fighter)) {
        fighter.state = "stunned";
        fighter.sprite.setVelocityX(0);
        return;
      }
      if (fighter.attack) {
        return;
      }

      const guardPressed = this.keys.guard.isDown || this.externalGuard || this.cursorKeys.down.isDown;
      if (guardPressed) {
        fighter.state = "guard";
        fighter.sprite.setVelocityX(0);
      } else {
        const left = this.keys.left.isDown || this.cursorKeys.left.isDown || this.externalAxis < -0.2;
        const right = this.keys.right.isDown || this.cursorKeys.right.isDown || this.externalAxis > 0.2;

        if (left && !right) {
          fighter.sprite.setVelocityX(-190);
          fighter.state = "move";
        } else if (right && !left) {
          fighter.sprite.setVelocityX(190);
          fighter.state = "move";
        } else {
          fighter.sprite.setVelocityX(0);
          fighter.state = "idle";
        }
      }

      const wantsJump =
        Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
        Phaser.Input.Keyboard.JustDown(this.cursorKeys.up) ||
        this.externalJump;
      if (wantsJump && (fighter.sprite.body.blocked.down || fighter.sprite.body.touching.down)) {
        fighter.sprite.setVelocityY(-455);
        fighter.state = "jump";
        this.playCue("jump");
      }
      this.externalJump = false;

      const pressedLight =
        Phaser.Input.Keyboard.JustDown(this.keys.light) ||
        Phaser.Input.Keyboard.JustDown(this.cursorKeys.space) ||
        this.popExternalAction("light");
      const pressedHeavy =
        Phaser.Input.Keyboard.JustDown(this.keys.heavy) ||
        Phaser.Input.Keyboard.JustDown(this.keys.heavyAlt) ||
        this.popExternalAction("heavy");
      const pressedSpecial =
        Phaser.Input.Keyboard.JustDown(this.keys.special) ||
        Phaser.Input.Keyboard.JustDown(this.keys.specialAlt) ||
        this.popExternalAction("special");

      if (pressedLight) {
        this.recordInput("light");
        this.tryStartAttack("player", "light");
      } else if (pressedHeavy) {
        this.recordInput("heavy");
        this.tryStartAttack("player", "heavy");
      } else if (pressedSpecial) {
        this.recordInput("special");
        this.tryStartAttack("player", "special");
      }
    }

    handleCpuAI() {
      const cpu = this.fighters.cpu;
      const player = this.fighters.player;
      if (this.status !== "playing") {
        return;
      }
      if (this.isStunned(cpu)) {
        cpu.state = "stunned";
        cpu.sprite.setVelocityX(0);
        return;
      }
      if (cpu.attack) {
        return;
      }
      if (this.time.now < this.nextAiDecisionAt) {
        return;
      }
      this.nextAiDecisionAt = this.time.now + Phaser.Math.Between(140, 260);

      const distanceX = player.sprite.x - cpu.sprite.x;
      const absDistance = Math.abs(distanceX);
      const moveDirection = distanceX > 0 ? 1 : -1;
      const playerAttacking = Boolean(player.attack);

      if (playerAttacking && absDistance < 92 && cpu.guard > 8 && Math.random() < 0.5) {
        cpu.state = "guard";
        cpu.sprite.setVelocityX(0);
        return;
      }

      if (absDistance > 130) {
        cpu.state = "move";
        cpu.sprite.setVelocityX(moveDirection * 168);
      } else if (absDistance < 64) {
        cpu.state = "move";
        cpu.sprite.setVelocityX(-moveDirection * 138);
      } else {
        cpu.state = "idle";
        cpu.sprite.setVelocityX(0);
      }

      if ((cpu.sprite.body.blocked.down || cpu.sprite.body.touching.down) && absDistance > 95 && Math.random() < 0.08) {
        cpu.sprite.setVelocityY(-420);
        this.playCue("jump");
      }

      if (absDistance <= 132 && Math.random() < 0.62) {
        if (cpu.meter >= 42 && Math.random() < 0.23) {
          this.tryStartAttack("cpu", "special");
        } else if (Math.random() < 0.44) {
          this.tryStartAttack("cpu", "heavy");
        } else {
          this.tryStartAttack("cpu", "light");
        }
      }
    }

    tryStartAttack(attackerId, attackName) {
      const attacker = this.fighters[attackerId];
      const attack = ATTACKS[attackName];
      if (!attacker || !attack || this.status !== "playing") {
        return false;
      }
      if (this.isStunned(attacker) || attacker.attack || this.time.now < attacker.cooldownUntil) {
        return false;
      }
      if (attack.meterCost > 0 && attacker.meter < attack.meterCost) {
        if (attackerId === "player") {
          this.message = "Meter insuficiente para Dragon Burst.";
        }
        return false;
      }

      const comboBoost =
        attackerId === "player" &&
        attackName === "special" &&
        this.hasBufferedPattern(["light", "light", "special"])
          ? 6
          : 0;

      if (attack.meterCost > 0) {
        attacker.meter = clamp(attacker.meter - attack.meterCost, 0, 100);
      }

      attacker.attack = {
        name: attack.name,
        startedAt: this.time.now,
        phase: "startup",
        connected: false,
        comboBoost
      };
      attacker.cooldownUntil = this.time.now + attack.startup + attack.active + attack.recovery;
      attacker.state = attack.name;
      attacker.sprite.setVelocityX(0);
      this.playCue(attack.startCue);
      return true;
    }

    applyHit(attacker, defender, attack) {
      if (defender.hp <= 0 || attacker.hp <= 0 || this.status !== "playing") {
        return;
      }
      const now = this.time.now;
      const dx = defender.sprite.x - attacker.sprite.x;
      const dy = Math.abs(defender.sprite.y - attacker.sprite.y);
      if (dy > 58 || Math.abs(dx) > attack.range) {
        return;
      }
      if (dx !== 0 && Math.sign(dx) !== attacker.facing) {
        return;
      }

      const defenderGuarding = defender.state === "guard" && defender.guard > 0;
      const defenderLabel = defender.id === "player" ? "Jugador" : "CPU";

      if (defenderGuarding) {
        const guardDamage = Math.max(1, Math.floor((attack.damage + attack.comboBoost) * 0.3));
        defender.hp = clamp(defender.hp - guardDamage, 0, 100);
        defender.guard = clamp(defender.guard - attack.guardBreak, 0, 100);
        defender.sprite.setVelocityX(attacker.facing * Math.floor(attack.knockback * 0.36));
        attacker.meter = clamp(attacker.meter + attack.meterGain * 0.42, 0, 100);
        this.message = `${defenderLabel} bloquea parcialmente (${guardDamage}).`;
        this.playCue("block");
        this.spawnHitFlash(defender.sprite.x, defender.sprite.y - 38, 0x93c5fd);

        if (defender.guard <= 0) {
          defender.stunUntil = now + 560;
          defender.state = "guard-break";
          this.message = `Guardia rota de ${defenderLabel}. Ventana de castigo abierta.`;
          this.playCue("guardBreak");
          this.cameras.main.shake(110, 0.002);
        }
      } else {
        const comboLink = now - attacker.lastHitAt <= 900;
        attacker.combo = comboLink ? attacker.combo + 1 : 1;
        attacker.lastHitAt = now;
        const comboBonus = (attacker.combo - 1) * 2;
        const finalDamage = attack.damage + attack.comboBoost + comboBonus;
        defender.hp = clamp(defender.hp - finalDamage, 0, 100);
        defender.stunUntil = now + attack.stun;
        defender.state = "stunned";
        defender.sprite.setVelocity(attacker.facing * attack.knockback, -120);
        attacker.meter = clamp(attacker.meter + attack.meterGain, 0, 100);
        this.message = `Impacto de ${attack.label}: ${finalDamage} de dano.`;
        this.playCue(ATTACKS[attack.name].hitCue);
        this.spawnHitFlash(defender.sprite.x, defender.sprite.y - 40, 0xfff1f2);
        this.cameras.main.shake(80, attack.name === "special" ? 0.003 : 0.0015);
      }

      attacker.attack.connected = true;
      if (defender.hp <= 0) {
        this.finishFight(attacker.id === "player" ? "won" : "lost");
      }
    }

    updateAttackState(attackerId, defenderId) {
      const attacker = this.fighters[attackerId];
      const defender = this.fighters[defenderId];
      if (!attacker.attack) {
        return;
      }

      const attackDef = ATTACKS[attacker.attack.name];
      const elapsed = this.time.now - attacker.attack.startedAt;
      const activeWindowStart = attackDef.startup;
      const activeWindowEnd = attackDef.startup + attackDef.active;

      if (elapsed >= activeWindowStart && elapsed < activeWindowEnd) {
        attacker.attack.phase = "active";
        if (attackDef.lunge > 0) {
          attacker.sprite.setVelocityX(attacker.facing * attackDef.lunge);
        }
        if (!attacker.attack.connected) {
          this.applyHit(attacker, defender, {
            ...attackDef,
            comboBoost: attacker.attack.comboBoost || 0
          });
        }
      } else if (elapsed < activeWindowStart) {
        attacker.attack.phase = "startup";
      } else {
        attacker.attack.phase = "recovery";
      }

      const attackTotal = attackDef.startup + attackDef.active + attackDef.recovery;
      if (elapsed >= attackTotal) {
        attacker.attack = null;
        if (this.status === "playing" && !this.isStunned(attacker)) {
          attacker.state = "idle";
        }
      }
    }

    updateFighterVisual(fighter) {
      const sprite = fighter.sprite;
      const prefix = `fighter-${fighter.id}`;
      const onGround = sprite.body.blocked.down || sprite.body.touching.down;

      let pose = "idle";
      if (fighter.hp <= 0) {
        pose = "ko";
      } else if (this.isStunned(fighter)) {
        pose = "stunned";
      } else if (fighter.attack) {
        pose = fighter.attack.name;
      } else if (fighter.state === "guard") {
        pose = "guard";
      } else if (!onGround) {
        pose = "jump";
      } else if (Math.abs(sprite.body.velocity.x) > 20) {
        pose = "move";
      }

      if (fighter.pose !== pose) {
        fighter.pose = pose;
        if (pose === "idle") {
          sprite.play(`${prefix}-idle`, true);
        } else if (pose === "move") {
          sprite.play(`${prefix}-move`, true);
        } else {
          sprite.anims.stop();
          sprite.setTexture(`${prefix}-${pose}`);
        }
      }

      sprite.setFlipX(fighter.facing === -1);
      if (this.isStunned(fighter)) {
        sprite.setTint(0xfca5a5);
      } else {
        sprite.clearTint();
      }
    }

    finishFight(nextStatus) {
      if (this.status !== "playing") {
        return;
      }
      this.status = nextStatus;
      if (nextStatus === "won") {
        this.message = "KO confirmado. Victoria del jugador.";
        this.playCue("ko");
      } else if (nextStatus === "lost") {
        this.message = "El rival cierra el round. Derrota.";
        this.playCue("ko");
      } else {
        this.message = "Tiempo agotado. Resultado en tablas.";
        this.playCue("draw");
      }
      this.fighters.player.sprite.setVelocity(0, 0);
      this.fighters.cpu.sprite.setVelocity(0, 0);
      this.fighters.player.attack = null;
      this.fighters.cpu.attack = null;
      this.publishSnapshot(true);
    }

    resolveRoundTimer() {
      this.timer = Math.max(0, ROUND_TIME - (this.time.now - this.roundStartedAt) / 1000);
      if (this.timer > 0) {
        return;
      }
      const playerHp = this.fighters.player.hp;
      const cpuHp = this.fighters.cpu.hp;
      if (playerHp > cpuHp) {
        this.finishFight("won");
      } else if (cpuHp > playerHp) {
        this.finishFight("lost");
      } else {
        this.finishFight("draw");
      }
    }

    publishSnapshot(force = false) {
      if (!force && this.time.now - this.lastSnapshotAt < 80) {
        return;
      }
      this.lastSnapshotAt = this.time.now;
      const player = this.fighters.player;
      const cpu = this.fighters.cpu;
      const serialize = (fighter) => ({
        hp: roundNumber(fighter.hp),
        meter: roundNumber(fighter.meter),
        guard: roundNumber(fighter.guard),
        combo: fighter.combo,
        x: roundNumber(fighter.sprite.x),
        y: roundNumber(fighter.sprite.y),
        vx: roundNumber(fighter.sprite.body.velocity.x),
        vy: roundNumber(fighter.sprite.body.velocity.y),
        state: fighter.state,
        pose: fighter.pose,
        facing: fighter.facing === 1 ? "right" : "left",
        attacking: fighter.attack?.name ?? null
      });

      onSnapshot({
        status: this.status,
        timer: roundNumber(this.timer),
        message: this.message,
        inputBuffer: this.playerInputBuffer.slice(-6).map((entry) => entry.action),
        player: serialize(player),
        cpu: serialize(cpu)
      });
    }

    update(_, delta) {
      this.updateFacing();

      const player = this.fighters.player;
      const cpu = this.fighters.cpu;

      if (this.status === "playing") {
        this.resolveRoundTimer();
        this.handlePlayerInput();
        this.handleCpuAI();
        this.updateAttackState("player", "cpu");
        this.updateAttackState("cpu", "player");

        if (!this.isStunned(player) && !player.attack && player.state !== "guard") {
          player.guard = clamp(player.guard + delta * 0.016, 0, 100);
        }
        if (!this.isStunned(cpu) && !cpu.attack && cpu.state !== "guard") {
          cpu.guard = clamp(cpu.guard + delta * 0.016, 0, 100);
        }

        if (this.time.now - player.lastHitAt > 960) {
          player.combo = 0;
        }
        if (this.time.now - cpu.lastHitAt > 960) {
          cpu.combo = 0;
        }
      }

      this.updateFighterVisual(player);
      this.updateFighterVisual(cpu);
      this.publishSnapshot();
    }
  }

  return new FighterScene();
};

function FighterGame() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const sceneApiRef = useRef(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!mountRef.current || gameRef.current) {
      return undefined;
    }

    let isMounted = true;
    const scene = createFighterScene({
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
          gravity: { y: 980 },
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

  const setGuard = (isActive) => {
    sceneApiRef.current?.guard(isActive);
  };

  const jump = () => {
    sceneApiRef.current?.jump();
  };

  const action = (name) => {
    sceneApiRef.current?.action(name);
  };

  const restart = () => {
    sceneApiRef.current?.restart();
  };

  const buildTextPayload = useCallback((stateSnapshot) => {
    return {
      mode: "fighter",
      coordinates: "origin_top_left_x_right_y_down",
      status: stateSnapshot.status,
      timer: stateSnapshot.timer,
      player: stateSnapshot.player,
      cpu: stateSnapshot.cpu,
      inputBuffer: stateSnapshot.inputBuffer,
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
        : snapshot.status === "draw"
          ? "Empate"
          : snapshot.status === "playing"
            ? "Round activo"
            : "Preparado";

  const timerProgress = (snapshot.timer / ROUND_TIME) * 100;
  const playerHpProgress = snapshot.player.hp;
  const cpuHpProgress = snapshot.cpu.hp;

  return (
    <div className="mini-game fighter-game">
      <div className="mini-head">
        <div>
          <h4>Modo Fighting Realista (Phaser)</h4>
          <p>Rigs humanos con poses de guardia/ataque y audio por impacto, bloqueo y KO.</p>
        </div>
        <button type="button" onClick={restart}>
          Reiniciar round
        </button>
      </div>

      <div className="status-row">
        <span className={`status-pill ${snapshot.status}`}>{statusLabel}</span>
        <span>Tiempo: {Math.max(0, Math.ceil(snapshot.timer))}s</span>
        <span>Combo jugador: x{snapshot.player.combo}</span>
        <span>Combo CPU: x{snapshot.cpu.combo}</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Vida jugador</p>
          <div className="meter-track">
            <span className="meter-fill player" style={{ width: `${playerHpProgress}%` }} />
          </div>
          <strong>{Math.round(snapshot.player.hp)}</strong>
        </div>
        <div className="meter-line compact">
          <p>Vida CPU</p>
          <div className="meter-track">
            <span className="meter-fill enemy" style={{ width: `${cpuHpProgress}%` }} />
          </div>
          <strong>{Math.round(snapshot.cpu.hp)}</strong>
        </div>
        <div className="meter-line compact">
          <p>Tiempo round</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: `${timerProgress}%` }} />
          </div>
          <strong>{Math.max(0, Math.ceil(snapshot.timer))}s</strong>
        </div>
      </div>

      <div className="status-row">
        <span>Meter jugador: {Math.round(snapshot.player.meter)}%</span>
        <span>Guardia jugador: {Math.round(snapshot.player.guard)}%</span>
        <span>Pose jugador: {snapshot.player.pose}</span>
        <span>Pose CPU: {snapshot.cpu.pose}</span>
      </div>

      <div className="phaser-canvas-shell fighter-stage">
        <div ref={mountRef} className="phaser-canvas-host" aria-label="Canvas fighting" />
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
        <button
          type="button"
          onMouseDown={() => setGuard(true)}
          onMouseUp={() => setGuard(false)}
          onMouseLeave={() => setGuard(false)}
          onTouchStart={() => setGuard(true)}
          onTouchEnd={() => setGuard(false)}
        >
          Guardia
        </button>
      </div>

      <div className="phaser-controls">
        <button type="button" onClick={() => action("light")}>
          Jab
        </button>
        <button type="button" onClick={() => action("heavy")}>
          Heavy
        </button>
        <button type="button" onClick={() => action("special")}>
          Special
        </button>
      </div>

      <p className="clue-banner">Input buffer: {snapshot.inputBuffer.join(" > ") || "-"}</p>
      <p className="game-message">{snapshot.message}</p>
    </div>
  );
}

export default FighterGame;
