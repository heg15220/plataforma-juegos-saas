import {
  CAMERA_SETTINGS,
  DEFAULT_LIVES,
  DEFAULT_MESSAGE,
  FIXED_STEP_MS,
  FIXED_STEP_SECONDS,
  MAX_FRAME_MS,
  PLAYER_SETTINGS,
  SCORE_VALUES,
  SCREENS,
  SNAPSHOT_INTERVAL_MS,
  VIEWPORT_WIDTH
} from "../config";
import ArcadeAudio from "../audio/ArcadeAudio";
import { createEnemyFromSpawn, defeatEnemy, updateEnemy } from "../entities/enemy";
import { createItemFromSpawn, createQuestionReward, updateItem } from "../entities/item";
import {
  applyHorizontalInput,
  applyVerticalForces,
  canShootProjectile,
  createPlayer,
  markProjectileFired,
  queueJump,
  resetPlayer,
  setPlayerAnimation,
  setPlayerGrounded,
  tickPlayerTimers,
  tryStartJump
} from "../entities/player";
import { createProjectile, updateProjectile } from "../entities/projectile";
import InputController from "../input/InputController";
import {
  TILE_TYPES,
  createLevelRuntime,
  getLevelCount,
  getWorldWidth,
  goalToWorldRect,
  spawnToWorldPosition,
  tileKey
} from "../levels/levelLoader";
import { aabbIntersects, clamp, moveEntityWithWorldCollisions } from "../physics/collision";
import Renderer from "../render/Renderer";
import { buildHudSnapshot, createInitialSnapshot } from "../ui/hudModel";

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return numeric;
};

export default class PlatformerEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.onSnapshot = typeof options.onSnapshot === "function" ? options.onSnapshot : () => {};
    this.renderer = new Renderer(canvas);
    this.input = new InputController();
    this.audio = new ArcadeAudio();

    this.state = {
      ...createInitialSnapshot(),
      level: null,
      levelCount: Math.max(1, getLevelCount()),
      goalRect: { x: 0, y: 0, w: 26, h: 66 },
      player: createPlayer({ x: 0, y: 0 }),
      enemies: [],
      items: [],
      projectiles: [],
      camera: { x: 0, y: 0 },
      transitionTimer: 0,
      elapsedMs: 0
    };

    this.input.attach(window);
    this.lastFrameMs = 0;
    this.accumulatorMs = 0;
    this.lastSnapshotAtMs = 0;
    this.running = true;
    this.rafId = null;

    this.loop = this.loop.bind(this);

    this.loadLevel(0, { resetRun: true, keepPower: false, preserveLives: false });
    this.state.screen = SCREENS.START;
    this.state.message = DEFAULT_MESSAGE;
    this.publishSnapshot(true);
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.destroy();
    this.audio.destroy();
  }

  setVirtualAxis(axis) {
    this.input.setVirtualAxis(axis);
  }

  setVirtualJumpHeld(value) {
    this.input.setVirtualJumpHeld(value);
  }

  setVirtualDownHeld(value) {
    this.input.setVirtualDownHeld(value);
  }

  jump() {
    this.input.queueJump();
  }

  action() {
    this.input.queueAction();
  }

  start() {
    this.input.queueStart();
  }

  restart() {
    this.input.queueRestart();
  }

  advanceTime(ms) {
    const totalMs = Math.max(0, toNumber(ms, 0));
    const steps = Math.max(1, Math.round(totalMs / FIXED_STEP_MS));
    for (let i = 0; i < steps; i += 1) {
      this.step(FIXED_STEP_SECONDS);
    }
    this.render();
    this.publishSnapshot(true);
    return Promise.resolve();
  }

  loop(timestampMs) {
    if (!this.running) {
      return;
    }

    if (!this.lastFrameMs) {
      this.lastFrameMs = timestampMs;
    }
    const deltaMs = clamp(timestampMs - this.lastFrameMs, 0, MAX_FRAME_MS);
    this.lastFrameMs = timestampMs;
    this.accumulatorMs += deltaMs;

    while (this.accumulatorMs >= FIXED_STEP_MS) {
      this.step(FIXED_STEP_SECONDS);
      this.accumulatorMs -= FIXED_STEP_MS;
    }

    this.render();
    this.publishSnapshot(false);
    this.rafId = requestAnimationFrame(this.loop);
  }

  beginNewRun() {
    this.loadLevel(0, { resetRun: true, keepPower: false, preserveLives: false });
    this.state.screen = SCREENS.PLAYING;
    this.state.message = "Run started. Reach the flag and survive.";
  }

  loadLevel(index, options = {}) {
    const levelIndex = ((Math.floor(index) % this.state.levelCount) + this.state.levelCount) % this.state.levelCount;
    const level = createLevelRuntime(levelIndex);
    const shouldResetRun = Boolean(options.resetRun);
    const shouldPreserveLives = Boolean(options.preserveLives);

    if (shouldResetRun) {
      this.state.score = 0;
      this.state.lives = DEFAULT_LIVES;
    } else if (!shouldPreserveLives) {
      this.state.lives = Math.max(1, this.state.lives || DEFAULT_LIVES);
    }

    this.state.level = level;
    this.state.levelIndex = levelIndex;
    this.state.levelName = level.name;
    this.state.timeLeft = level.timeLimit;
    this.state.coinsCollected = 0;
    this.state.coinsTotal = Math.max(0, level.coinTarget);
    this.state.goalRect = goalToWorldRect(level);
    this.state.camera = { x: 0, y: 0 };
    this.state.transitionTimer = 0;

    const spawn = spawnToWorldPosition(level, level.playerSpawn, this.state.player.w, this.state.player.h);
    resetPlayer(this.state.player, spawn, {
      keepPower: Boolean(options.keepPower),
      invulnerable: false
    });

    this.state.enemies = level.enemySpawns.map((spawnData, enemyIndex) =>
      createEnemyFromSpawn(level, spawnData, `enemy-${level.id}-${enemyIndex}`)
    );
    this.state.items = level.itemSpawns.map((spawnData, itemIndex) =>
      createItemFromSpawn(level, spawnData, `item-${level.id}-${itemIndex}`)
    );
    this.state.projectiles = [];
  }

  restartCurrentLevel() {
    if (this.state.screen === SCREENS.GAME_OVER || this.state.screen === SCREENS.GAME_COMPLETE) {
      this.beginNewRun();
      return;
    }
    if (this.state.screen === SCREENS.START) {
      this.beginNewRun();
      return;
    }

    const keepPower = this.state.player.powerLevel > 0;
    this.loadLevel(this.state.levelIndex, {
      resetRun: false,
      keepPower,
      preserveLives: true
    });
    this.state.screen = SCREENS.PLAYING;
    this.state.message = `Restarted ${this.state.level.name}.`;
  }

  handleQuestionBlockHit(tx, ty) {
    const level = this.state.level;
    if (!level) {
      return;
    }

    const block = level.questionBlocks.get(tileKey(tx, ty));
    if (!block || block.used) {
      return;
    }
    block.used = true;

    if (block.reward === "mushroom") {
      const reward = createQuestionReward(level, tx, ty, block.reward);
      if (reward) {
        this.state.items.push(reward);
      }
      this.state.score += SCORE_VALUES.questionPower;
      this.state.message = "Power-up released.";
      this.audio.play("powerup");
      return;
    }

    this.state.coinsCollected += 1;
    this.state.score += SCORE_VALUES.questionCoin;
    this.state.message = `Hidden coin found (${this.state.coinsCollected}/${this.state.coinsTotal}).`;
    this.audio.play("coin");
  }

  collectItem(item) {
    if (!item.active) {
      return;
    }

    item.active = false;
    if (item.type === "mushroom") {
      this.state.player.powerLevel = 1;
      this.state.score += SCORE_VALUES.questionPower;
      this.state.message = "Power-up active. Fireballs enabled.";
      this.audio.play("powerup");
      return;
    }

    this.state.coinsCollected += 1;
    this.state.score += SCORE_VALUES.coin;
    this.state.message = `Coin collected (${this.state.coinsCollected}/${this.state.coinsTotal}).`;
    this.audio.play("coin");
  }

  tryShootProjectile() {
    if (!canShootProjectile(this.state.player)) {
      return;
    }
    this.state.projectiles.push(createProjectile(this.state.player));
    markProjectileFired(this.state.player);
    this.state.message = "Fireball launched.";
    this.audio.play("fire");
  }

  loseLife(reason) {
    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }
    if (this.state.player.invulnerableTimer > 0) {
      return;
    }

    this.state.lives -= 1;
    this.audio.play("hurt");
    if (this.state.lives <= 0) {
      this.state.screen = SCREENS.GAME_OVER;
      this.state.message = `${reason} No lives left.`;
      this.audio.play("lose");
      return;
    }

    const spawn = spawnToWorldPosition(
      this.state.level,
      this.state.level.playerSpawn,
      this.state.player.w,
      this.state.player.h
    );
    resetPlayer(this.state.player, spawn, {
      keepPower: this.state.player.powerLevel > 0,
      invulnerable: true
    });
    this.state.projectiles = [];
    this.state.camera.x = clamp(
      spawn.x - VIEWPORT_WIDTH * 0.5,
      0,
      Math.max(0, getWorldWidth(this.state.level) - VIEWPORT_WIDTH)
    );
    this.state.message = `${reason} Lives left: ${this.state.lives}.`;
  }

  completeLevel() {
    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }

    const timeBonus = Math.max(0, Math.floor(this.state.timeLeft)) * SCORE_VALUES.timeBonusMultiplier;
    const fullCoinBonus =
      this.state.coinsTotal > 0 && this.state.coinsCollected >= this.state.coinsTotal
        ? SCORE_VALUES.allCoinsBonus
        : 0;
    const stageBonus = SCORE_VALUES.levelClearBase + timeBonus + fullCoinBonus;
    this.state.score += stageBonus;

    if (this.state.levelIndex >= this.state.levelCount - 1) {
      this.state.screen = SCREENS.GAME_COMPLETE;
      this.state.message = `All levels complete. Bonus +${stageBonus}. Press Enter to play again.`;
      this.audio.play("win");
      return;
    }

    this.state.screen = SCREENS.LEVEL_COMPLETE;
    this.state.transitionTimer = 2.1;
    this.state.message = `Level clear! Bonus +${stageBonus}. Next map loading...`;
    this.audio.play("win");
  }

  updatePlayer(controls, dt) {
    const level = this.state.level;
    if (!level) {
      return;
    }

    if (controls.jumpPressed) {
      queueJump(this.state.player);
    }

    tickPlayerTimers(this.state.player, dt);
    applyHorizontalInput(this.state.player, controls.axis, dt);
    const didJump = tryStartJump(this.state.player);
    if (didJump) {
      this.audio.play("jump");
    }

    applyVerticalForces(this.state.player, controls.jumpHeld, dt);
    const collision = moveEntityWithWorldCollisions(this.state.player, level, dt, { allowOneWay: true });
    setPlayerGrounded(this.state.player, collision.landed);
    if (!collision.landed) {
      this.state.player.onGround = false;
    }

    if (collision.hitCeiling && collision.ceilingTile?.type === TILE_TYPES.QUESTION) {
      this.handleQuestionBlockHit(collision.ceilingTile.tx, collision.ceilingTile.ty);
    }

    setPlayerAnimation(this.state.player);

    if (collision.fellOut) {
      this.loseLife("You fell into the void.");
    }
  }

  updateEnemies(dt) {
    for (const enemy of this.state.enemies) {
      updateEnemy(enemy, dt, this.state.level, moveEntityWithWorldCollisions);
    }
  }

  updateItems(dt) {
    for (const item of this.state.items) {
      updateItem(item, dt, this.state.level, moveEntityWithWorldCollisions);
    }
  }

  updateProjectiles(dt) {
    for (const projectile of this.state.projectiles) {
      updateProjectile(projectile, dt, this.state.level, moveEntityWithWorldCollisions);
    }
  }

  handleCombatAndPickups() {
    const player = this.state.player;
    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }

    for (const item of this.state.items) {
      if (!item.active) {
        continue;
      }
      if (aabbIntersects(player, item)) {
        this.collectItem(item);
      }
    }

    for (const projectile of this.state.projectiles) {
      if (!projectile.active) {
        continue;
      }
      for (const enemy of this.state.enemies) {
        if (!enemy.active) {
          continue;
        }
        if (!aabbIntersects(projectile, enemy)) {
          continue;
        }
        projectile.active = false;
        defeatEnemy(enemy);
        this.state.score += SCORE_VALUES.projectileEnemy;
        this.state.message = "Enemy eliminated with power shot.";
        this.audio.play("stomp");
        break;
      }
    }

    for (const enemy of this.state.enemies) {
      if (!enemy.active) {
        continue;
      }
      if (!aabbIntersects(player, enemy)) {
        continue;
      }

      const playerBottom = player.y + player.h;
      const stomp =
        player.vy > 120 &&
        playerBottom - enemy.y < enemy.h * 0.55 &&
        player.y + player.h * 0.3 < enemy.y;

      if (stomp) {
        defeatEnemy(enemy);
        player.vy = PLAYER_SETTINGS.stompBounceVelocity;
        this.state.score += SCORE_VALUES.stomp;
        this.state.message = "Stomped enemy.";
        this.audio.play("stomp");
        continue;
      }

      this.loseLife("Enemy collision.");
      break;
    }
  }

  cleanupEntities() {
    this.state.items = this.state.items.filter((item) => item.active);
    this.state.enemies = this.state.enemies.filter((enemy) => enemy.active);
    this.state.projectiles = this.state.projectiles.filter((projectile) => projectile.active);
  }

  updateCamera() {
    const worldWidth = getWorldWidth(this.state.level);
    const lead = this.state.player.facing === "right" ? CAMERA_SETTINGS.leadPixels : -CAMERA_SETTINGS.leadPixels;
    const targetX = this.state.player.x + this.state.player.w * 0.5 - VIEWPORT_WIDTH * 0.5 + lead;
    const clampedTarget = clamp(targetX, 0, Math.max(0, worldWidth - VIEWPORT_WIDTH));
    this.state.camera.x += (clampedTarget - this.state.camera.x) * CAMERA_SETTINGS.followLerp;
    this.state.camera.x = clamp(this.state.camera.x, 0, Math.max(0, worldWidth - VIEWPORT_WIDTH));
  }

  step(dt) {
    this.state.elapsedMs += dt * 1000;
    const controls = this.input.consume();

    if (controls.restartPressed) {
      this.restartCurrentLevel();
      return;
    }

    if (this.state.screen === SCREENS.START) {
      if (controls.startPressed || controls.jumpPressed || controls.actionPressed) {
        this.beginNewRun();
      }
      return;
    }

    if (this.state.screen === SCREENS.GAME_OVER || this.state.screen === SCREENS.GAME_COMPLETE) {
      if (controls.startPressed || controls.jumpPressed || controls.actionPressed) {
        this.beginNewRun();
      }
      return;
    }

    if (this.state.screen === SCREENS.LEVEL_COMPLETE) {
      this.state.transitionTimer = Math.max(0, this.state.transitionTimer - dt);
      if (this.state.transitionTimer <= 0) {
        this.loadLevel(this.state.levelIndex + 1, {
          resetRun: false,
          keepPower: this.state.player.powerLevel > 0,
          preserveLives: true
        });
        this.state.screen = SCREENS.PLAYING;
        this.state.message = `Level ${this.state.levelIndex + 1}: ${this.state.level.name}`;
      }
      return;
    }

    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }

    if (controls.actionPressed) {
      this.tryShootProjectile();
    }

    this.state.timeLeft = Math.max(0, this.state.timeLeft - dt);
    if (this.state.timeLeft <= 0) {
      this.loseLife("Time up.");
      return;
    }

    this.updatePlayer(controls, dt);
    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }

    this.updateEnemies(dt);
    this.updateItems(dt);
    this.updateProjectiles(dt);

    this.handleCombatAndPickups();
    if (this.state.screen !== SCREENS.PLAYING) {
      return;
    }

    if (aabbIntersects(this.state.player, this.state.goalRect)) {
      const requiresAllCoins = Boolean(this.state.level.goalRequiresAllCoins);
      if (requiresAllCoins && this.state.coinsCollected < this.state.coinsTotal) {
        this.state.message = `Find all coins first (${this.state.coinsCollected}/${this.state.coinsTotal}).`;
      } else {
        this.completeLevel();
      }
    }

    this.cleanupEntities();
    this.updateCamera();
  }

  render() {
    this.renderer.render({
      ...this.state,
      score: this.state.score,
      lives: this.state.lives,
      levelIndex: this.state.levelIndex,
      levelCount: this.state.levelCount,
      coinsCollected: this.state.coinsCollected,
      coinsTotal: this.state.coinsTotal,
      timeLeft: this.state.timeLeft
    });
  }

  publishSnapshot(force = false) {
    if (!force && this.state.elapsedMs - this.lastSnapshotAtMs < SNAPSHOT_INTERVAL_MS) {
      return;
    }
    this.lastSnapshotAtMs = this.state.elapsedMs;
    this.onSnapshot(buildHudSnapshot(this.state));
  }
}
