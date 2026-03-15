export const STAGE_WIDTH = 960;
export const STAGE_HEIGHT = 540;
const FIXED_STEP_MS = 1000 / 60;
const MAX_PARTICLES = 180;
const PLAYER_TURN_SPEED = 3.75;
const PLAYER_THRUST = 285;
const PLAYER_BOOST = 430;
const PLAYER_MAX_SPEED = 400;
const PLAYER_BOOST_MAX_SPEED = 565;
const PLAYER_DRAG = 0.942;
const PLAYER_BRAKE = 0.88;
const PLAYER_BRAKE_TURN_MULTIPLIER = 1.32;
const PLAYER_RETRO_THRUST = 205;
const PLAYER_FIRE_INTERVAL_MS = 120;
const PLAYER_PULSE_INTERVAL_MS = 4200;
const PLAYER_PULSE_COST = 34;
const PLAYER_MAX_HEAT = 100;
const PLAYER_MAX_ENERGY = 100;
const PLAYER_MAX_HULL = 100;
const PLAYER_MAX_SHIELD = 80;
const WAVE_TRANSITION_MS = 2200;
const WAVE_RECOVERY_HULL = 9;
const WAVE_RECOVERY_SHIELD = 20;
const WAVE_RECOVERY_ENERGY = 14;
const PLAYER_BULLET_SPEED = 760;
const ENEMY_BULLET_SPEED = 340;
const PICKUP_LIFETIME_MS = 11000;
const INVULNERABLE_AFTER_HIT_MS = 520;
const RECENT_DAMAGE_COOLDOWN_MS = 1800;
const COMBO_CHAIN_MS = 2600;
const VANGUARD_MODE_THRESHOLD = 62;
const NEAR_MISS_CLEARANCE = 60;
const BULLET_NEAR_MISS_CLEARANCE = 42;

const SECTOR_THEMES = [
  {
    nameEs: "Orbita Cobalto",
    nameEn: "Cobalt Orbit",
    sky: "#050816",
    nebula: ["#0f1d46", "#123a78", "#1d9bf0"],
    accent: "#22d3ee",
  },
  {
    nameEs: "Marea Carmin",
    nameEn: "Crimson Tide",
    sky: "#13050d",
    nebula: ["#3c071a", "#842029", "#fb7185"],
    accent: "#f97316",
  },
  {
    nameEs: "Corona Esmeralda",
    nameEn: "Emerald Crown",
    sky: "#04130e",
    nebula: ["#0b342b", "#0f766e", "#5eead4"],
    accent: "#34d399",
  },
  {
    nameEs: "Vacuo Real",
    nameEn: "Royal Void",
    sky: "#10051d",
    nebula: ["#27104a", "#5b21b6", "#c084fc"],
    accent: "#facc15",
  },
];

const ENEMY_PROFILES = {
  raider: {
    radius: 15,
    hull: 34,
    thrust: 150,
    drag: 0.95,
    turnRate: 2.2,
    preferredRange: 190,
    fireArc: 0.22,
    fireIntervalMs: 1200,
    fireCount: 1,
    spread: 0,
    score: 75,
    color: "#fb7185",
  },
  lancer: {
    radius: 17,
    hull: 48,
    thrust: 134,
    drag: 0.958,
    turnRate: 1.85,
    preferredRange: 250,
    fireArc: 0.18,
    fireIntervalMs: 1500,
    fireCount: 2,
    spread: 0.11,
    score: 110,
    color: "#f97316",
  },
  drone: {
    radius: 13,
    hull: 26,
    thrust: 174,
    drag: 0.947,
    turnRate: 2.9,
    preferredRange: 150,
    fireArc: 0.28,
    fireIntervalMs: 980,
    fireCount: 1,
    spread: 0,
    score: 60,
    color: "#a78bfa",
  },
  boss: {
    radius: 34,
    hull: 260,
    thrust: 120,
    drag: 0.968,
    turnRate: 1.2,
    preferredRange: 280,
    fireArc: 0.48,
    fireIntervalMs: 980,
    fireCount: 5,
    spread: 0.18,
    score: 550,
    color: "#facc15",
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrap(value, max) {
  if (value < 0) {
    return value + max;
  }
  if (value > max) {
    return value - max;
  }
  return value;
}

function normalizeAngle(angle) {
  let next = angle;
  while (next <= -Math.PI) next += Math.PI * 2;
  while (next > Math.PI) next -= Math.PI * 2;
  return next;
}

function angleDiff(current, target) {
  return normalizeAngle(target - current);
}

function rotateToward(current, target, maxDelta) {
  const delta = angleDiff(current, target);
  if (Math.abs(delta) <= maxDelta) {
    return target;
  }
  return current + Math.sign(delta) * maxDelta;
}

function hashSeed(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seedText) {
  let seed = hashSeed(seedText || "cosmic-vanguard");
  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function choose(rng, values) {
  return values[Math.floor(rng() * values.length)] ?? values[0];
}

function createStarfield(rng) {
  const palette = ["#ffffff", "#dbeafe", "#bfdbfe", "#f5d0fe", "#fde68a"];
  return Array.from({ length: 110 }, (_, index) => ({
    id: `star-${index}`,
    x: rng() * STAGE_WIDTH,
    y: rng() * STAGE_HEIGHT,
    radius: randomBetween(rng, 0.6, 2.8),
    alpha: randomBetween(rng, 0.22, 0.9),
    speed: randomBetween(rng, 0.1, 0.8),
    depth: randomBetween(rng, 0.55, 1.9),
    twinkle: randomBetween(rng, 0.6, 1.8),
    color: choose(rng, palette),
  }));
}

function getWrappedDelta(from, to) {
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  if (Math.abs(dx) > STAGE_WIDTH / 2) {
    dx -= Math.sign(dx) * STAGE_WIDTH;
  }
  if (Math.abs(dy) > STAGE_HEIGHT / 2) {
    dy -= Math.sign(dy) * STAGE_HEIGHT;
  }
  return { dx, dy, distance: Math.hypot(dx, dy) };
}

function circlesCollide(a, b) {
  const delta = getWrappedDelta(a, b);
  return delta.distance <= a.radius + b.radius;
}

function createPlayer() {
  return {
    x: STAGE_WIDTH * 0.5,
    y: STAGE_HEIGHT * 0.66,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    radius: 16,
    hull: PLAYER_MAX_HULL,
    shield: PLAYER_MAX_SHIELD,
    energy: PLAYER_MAX_ENERGY,
    heat: 0,
    overheated: false,
    weaponCooldownMs: 0,
    pulseCooldownMs: 0,
    invulnerableMs: 1200,
    recentDamageMs: 0,
    boosting: false,
    driftDistance: 0,
    turnVelocity: 0,
    speed: 0,
  };
}

function createInitialSnapshot(locale) {
  const theme = SECTOR_THEMES[0];
  return {
    mode: "menu",
    playState: "ready",
    locale,
    coordinates: "origin_top_left_x_right_y_down_pixels_wrap_edges",
    score: 0,
    bestScore: 0,
    wave: 1,
    sector: 1,
    sectorName: locale === "es" ? theme.nameEs : theme.nameEn,
    elapsedMs: 0,
    player: createPlayer(),
    enemies: [],
    asteroids: [],
    bullets: [],
    pickups: [],
    particles: [],
    shockwaves: [],
    leaderboard: [],
    backendStatus: "loading",
    backendMessage: locale === "es" ? "Conectando backend..." : "Connecting backend...",
    backendConfig: { dailySeed: "pending", motd: "" },
    pilotName: "ACE-01",
    message:
      locale === "es"
        ? "Lanza una nueva corrida para abrir la Operacion Vanguard."
        : "Launch a fresh run to open Operation Vanguard.",
    events: [],
    metrics: {
      shotsFired: 0,
      shotsHit: 0,
      enemiesDestroyed: 0,
      asteroidsCleared: 0,
      damageTaken: 0,
      maxCombo: 0,
      nearMisses: 0,
    },
    combo: 0,
    comboTimerMs: 0,
    focus: 0,
    vanguardMode: false,
    transitionMs: 0,
    waveThreat: 0,
    cameraShake: 0,
    damageFlashMs: 0,
    fullscreen: false,
    theme,
    stars: createStarfield(createSeededRandom(`${locale}-menu-stars`)),
  };
}

function formatAccuracy(shotsFired, shotsHit) {
  if (!shotsFired) {
    return 0;
  }
  return Math.round((shotsHit / shotsFired) * 1000) / 10;
}

export default class CosmicVanguardRuntime {
  constructor({
    canvas,
    locale = "en",
    onSnapshot,
    onRunFinished,
    onFullscreenRequest,
  }) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.locale = locale;
    this.onSnapshot = onSnapshot;
    this.onRunFinished = onRunFinished;
    this.onFullscreenRequest = onFullscreenRequest;
    this.state = createInitialSnapshot(locale);
    this.input = {
      left: false,
      right: false,
      thrust: false,
      brake: false,
      fire: false,
      boost: false,
      pulse: false,
    };
    this.animationFrame = 0;
    this.lastTime = 0;
    this.accumulator = 0;
    this.uid = 0;
    this.submittedRunId = null;
    this.seedBase = "offline-fallback";
    this.rng = createSeededRandom("cosmic-vanguard-default");
    this.boundLoop = this.loop.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundBlur = this.onBlur.bind(this);
  }

  start() {
    this.canvas.width = STAGE_WIDTH;
    this.canvas.height = STAGE_HEIGHT;
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    window.addEventListener("blur", this.boundBlur);
    this.emitSnapshot();
    this.render();
    this.lastTime = performance.now();
    this.animationFrame = window.requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    window.cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("keyup", this.boundKeyUp);
    window.removeEventListener("blur", this.boundBlur);
  }

  loop(timestamp) {
    const delta = Math.min(50, timestamp - this.lastTime);
    this.lastTime = timestamp;
    this.accumulator += delta;
    while (this.accumulator >= FIXED_STEP_MS) {
      this.step(FIXED_STEP_MS);
      this.accumulator -= FIXED_STEP_MS;
    }
    this.render();
    this.animationFrame = window.requestAnimationFrame(this.boundLoop);
  }

  advanceTime(ms) {
    const safeMs = Math.max(0, Number(ms) || 0);
    let remaining = safeMs;
    while (remaining > 0) {
      const step = Math.min(FIXED_STEP_MS, remaining);
      this.step(step);
      remaining -= step;
    }
    this.render();
    this.emitSnapshot();
  }

  onBlur() {
    Object.keys(this.input).forEach((key) => {
      this.input[key] = false;
    });
  }

  isTypingContext(event) {
    const tagName = event.target?.tagName?.toLowerCase();
    return tagName === "input" || tagName === "textarea" || event.target?.isContentEditable;
  }

  onKeyDown(event) {
    if (this.isTypingContext(event)) {
      return;
    }
    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        this.input.left = true;
        event.preventDefault();
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.input.right = true;
        event.preventDefault();
        break;
      case "ArrowUp":
      case "w":
      case "W":
        this.input.thrust = true;
        event.preventDefault();
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.input.brake = true;
        event.preventDefault();
        break;
      case " ":
        if (this.state.mode === "menu") {
          this.restart();
        } else {
          this.input.fire = true;
        }
        event.preventDefault();
        break;
      case "Shift":
        this.input.boost = true;
        event.preventDefault();
        break;
      case "e":
      case "E":
      case "x":
      case "X":
        this.input.pulse = true;
        event.preventDefault();
        break;
      case "Enter":
        if (this.state.mode === "menu" || this.state.mode === "gameover") {
          this.restart();
        }
        event.preventDefault();
        break;
      case "p":
      case "P":
      case "Escape":
        this.togglePause();
        event.preventDefault();
        break;
      case "r":
      case "R":
        this.restart();
        event.preventDefault();
        break;
      case "f":
      case "F":
        this.onFullscreenRequest?.();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  onKeyUp(event) {
    switch (event.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        this.input.left = false;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        this.input.right = false;
        break;
      case "ArrowUp":
      case "w":
      case "W":
        this.input.thrust = false;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        this.input.brake = false;
        break;
      case " ":
        this.input.fire = false;
        break;
      case "Shift":
        this.input.boost = false;
        break;
      case "e":
      case "E":
      case "x":
      case "X":
        this.input.pulse = false;
        break;
      default:
        break;
    }
  }

  setVirtualControl(control, active) {
    if (control in this.input) {
      this.input[control] = Boolean(active);
    }
  }

  setPilotName(name) {
    this.state.pilotName = String(name || "ACE-01").slice(0, 12) || "ACE-01";
    this.emitSnapshot();
  }

  applyBackendSnapshot(payload = {}) {
    this.state.backendStatus = payload.status ?? this.state.backendStatus;
    this.state.backendMessage = payload.message ?? this.state.backendMessage;
    this.state.backendConfig = payload.config ?? this.state.backendConfig;
    this.seedBase = String(this.state.backendConfig.dailySeed || "offline-fallback");
    this.state.leaderboard = Array.isArray(payload.leaderboard) ? payload.leaderboard.slice(0, 8) : this.state.leaderboard;
    this.state.bestScore = Math.max(
      this.state.bestScore,
      this.state.leaderboard[0]?.score ?? 0,
      this.state.score
    );
    this.pushEvent(this.state.backendMessage);
    this.emitSnapshot();
    this.render();
  }

  setFullscreenState(value) {
    this.state.fullscreen = Boolean(value);
    this.emitSnapshot();
  }

  togglePause() {
    if (this.state.mode === "menu" || this.state.mode === "gameover") {
      return;
    }
    if (this.state.mode === "paused") {
      this.state.mode = "playing";
      this.state.playState = "combat";
      this.state.message = this.locale === "es" ? "Operacion reanudada." : "Operation resumed.";
    } else {
      this.state.mode = "paused";
      this.state.playState = "paused";
      this.state.message = this.locale === "es" ? "Operacion en pausa." : "Operation paused.";
    }
    this.emitSnapshot();
  }

  restart() {
    const previousBest = this.state.bestScore;
    const leaderboard = this.state.leaderboard.slice();
    const backendStatus = this.state.backendStatus;
    const backendMessage = this.state.backendMessage;
    const backendConfig = this.state.backendConfig;
    const pilotName = this.state.pilotName;
    const fullscreen = this.state.fullscreen;
    this.state = createInitialSnapshot(this.locale);
    this.state.bestScore = previousBest;
    this.state.leaderboard = leaderboard;
    this.state.backendStatus = backendStatus;
    this.state.backendMessage = backendMessage;
    this.state.backendConfig = backendConfig;
    this.state.pilotName = pilotName;
    this.state.fullscreen = fullscreen;
    this.seedBase = String(this.state.backendConfig.dailySeed || this.seedBase || "offline-fallback");
    this.rng = createSeededRandom(`${this.seedBase}-${pilotName}`);
    this.state.mode = "playing";
    this.state.playState = "combat";
    this.state.message = this.locale === "es" ? "Sector 1 listo. Limpia la orbita." : "Sector 1 ready. Clear the orbit.";
    this.pushEvent(this.state.message);
    this.spawnWave();
    this.emitSnapshot();
  }

  createId(prefix) {
    this.uid += 1;
    return `${prefix}-${this.uid}`;
  }

  getTheme() {
    const index = Math.max(0, Math.min(SECTOR_THEMES.length - 1, this.state.sector - 1));
    return SECTOR_THEMES[index];
  }

  spawnAtDistance(minDistance) {
    let position = { x: this.rng() * STAGE_WIDTH, y: this.rng() * STAGE_HEIGHT };
    for (let attempt = 0; attempt < 20; attempt += 1) {
      position = { x: this.rng() * STAGE_WIDTH, y: this.rng() * STAGE_HEIGHT };
      if (getWrappedDelta(position, this.state.player).distance >= minDistance) {
        break;
      }
    }
    return position;
  }

  spawnWave() {
    const theme = this.getTheme();
    this.state.theme = theme;
    this.state.sectorName = this.locale === "es" ? theme.nameEs : theme.nameEn;
    this.state.enemies = [];
    this.state.asteroids = [];
    this.state.bullets = [];
    this.state.shockwaves = [];
    const bossWave = this.state.wave % 3 === 0;
    const asteroidCount = bossWave ? 4 : Math.min(7, 3 + this.state.sector);
    for (let index = 0; index < asteroidCount; index += 1) {
      this.spawnAsteroid(18 + this.state.sector * 4 + this.rng() * 16);
    }

    if (bossWave) {
      this.spawnEnemy("boss");
      this.state.waveThreat = 100;
      this.state.message =
        this.locale === "es"
          ? `Jefe del sector ${this.state.sector}: Dreadnought entrando en orbita.`
          : `Sector ${this.state.sector} boss: dreadnought entering orbit.`;
    } else {
      const enemyCount = Math.min(9, 2 + this.state.wave + this.state.sector);
      for (let index = 0; index < enemyCount; index += 1) {
        const kind = choose(this.rng, ["raider", "raider", "drone", this.state.wave > 1 ? "lancer" : "raider"]);
        this.spawnEnemy(kind);
      }
      this.state.waveThreat = clamp(24 + enemyCount * 8 + asteroidCount * 3, 0, 100);
      this.state.message =
        this.locale === "es"
          ? `Oleada ${this.state.wave}: intercepta la flotilla hostil.`
          : `Wave ${this.state.wave}: intercept the hostile flotilla.`;
    }
    this.pushEvent(this.state.message);
    this.emitSnapshot();
  }

  spawnEnemy(kind, options = {}) {
    const profile = ENEMY_PROFILES[kind];
    const position = options.position ?? this.spawnAtDistance(kind === "boss" ? 260 : 180);
    this.state.enemies.push({
      id: this.createId(kind),
      kind,
      x: position.x,
      y: position.y,
      vx: randomBetween(this.rng, -20, 20),
      vy: randomBetween(this.rng, -20, 20),
      angle: randomBetween(this.rng, -Math.PI, Math.PI),
      radius: profile.radius,
      hull: profile.hull + (kind === "boss" ? this.state.sector * 55 : this.state.wave * 4),
      maxHull: profile.hull + (kind === "boss" ? this.state.sector * 55 : this.state.wave * 4),
      shootCooldownMs: randomBetween(this.rng, 240, profile.fireIntervalMs),
      color: profile.color,
      profile,
      wobble: this.rng() * Math.PI * 2,
      orbitDir: this.rng() > 0.5 ? 1 : -1,
      nearMissCooldownMs: 0,
      phaseBurstsTriggered: 0,
    });
  }

  spawnAsteroid(radius) {
    const position = this.spawnAtDistance(140);
    this.state.asteroids.push({
      id: this.createId("asteroid"),
      x: position.x,
      y: position.y,
      vx: randomBetween(this.rng, -46, 46),
      vy: randomBetween(this.rng, -46, 46),
      angle: randomBetween(this.rng, -Math.PI, Math.PI),
      spin: randomBetween(this.rng, -0.8, 0.8),
      radius,
      hull: Math.round(radius * 1.6),
      maxHull: Math.round(radius * 1.6),
      score: Math.round(radius * 4),
      craterSeed: this.rng(),
      nearMissCooldownMs: 0,
    });
  }

  spawnBullet({
    owner,
    x,
    y,
    angle,
    speed,
    damage,
    color,
    radius = 4,
    lifeMs = 1400,
  }) {
    this.state.bullets.push({
      id: this.createId(owner === "player" ? "shot" : "enemy-shot"),
      owner,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      radius,
      damage,
      color,
      lifeMs,
      nearMissed: false,
    });
  }

  spawnPickup(x, y, kind) {
    this.state.pickups.push({
      id: this.createId("pickup"),
      kind,
      x,
      y,
      vx: randomBetween(this.rng, -18, 18),
      vy: randomBetween(this.rng, -18, 18),
      radius: 11,
      lifeMs: PICKUP_LIFETIME_MS,
    });
  }

  maybeSpawnEnemyPickup(enemy) {
    const player = this.state.player;
    const lowHull = player.hull <= 58;
    const lowShield = player.shield <= 24;
    const pressureWave = this.state.wave >= 4 || this.state.sector >= 3;
    const dropChance = Math.min(
      0.66,
      0.28 + (pressureWave ? 0.05 : 0) + (lowHull ? 0.18 : 0) + (lowShield ? 0.09 : 0)
    );
    if (this.rng() > dropChance) {
      return;
    }
    const pickupPool = lowHull
      ? ["repair", "repair", "repair", "energy", "coolant"]
      : lowShield
        ? ["energy", "energy", "repair", "coolant"]
        : pressureWave
          ? ["repair", "energy", "energy", "coolant"]
          : ["repair", "coolant", "energy"];
    this.spawnPickup(enemy.x, enemy.y, choose(this.rng, pickupPool));
  }

  grantWaveRecovery() {
    const player = this.state.player;
    const hullRecovery = WAVE_RECOVERY_HULL + this.state.sector * 2;
    const shieldRecovery = WAVE_RECOVERY_SHIELD + this.state.sector * 3;
    const energyRecovery = WAVE_RECOVERY_ENERGY + this.state.sector * 2;
    const recoveredHull = Math.min(PLAYER_MAX_HULL, player.hull + hullRecovery);
    const recoveredShield = Math.min(PLAYER_MAX_SHIELD, player.shield + shieldRecovery);
    const recoveredEnergy = Math.min(PLAYER_MAX_ENERGY, player.energy + energyRecovery);
    const recovered =
      recoveredHull > player.hull ||
      recoveredShield > player.shield ||
      recoveredEnergy > player.energy;
    player.hull = recoveredHull;
    player.shield = recoveredShield;
    player.energy = recoveredEnergy;
    player.recentDamageMs = Math.min(player.recentDamageMs, 650);
    if (recovered) {
      this.pushEvent(
        this.locale === "es"
          ? "Ventana de soporte: casco, escudos y energia estabilizados."
          : "Support window: hull, shields, and energy stabilized."
      );
    }
  }

  spawnExplosion(x, y, color, count = 14, scale = 1) {
    for (let index = 0; index < count; index += 1) {
      this.state.particles.push({
        id: this.createId("particle"),
        x,
        y,
        vx: randomBetween(this.rng, -180, 180) * scale,
        vy: randomBetween(this.rng, -180, 180) * scale,
        radius: randomBetween(this.rng, 1.8, 4.8) * scale,
        lifeMs: randomBetween(this.rng, 240, 720),
        maxLifeMs: 720,
        color,
      });
    }
    if (this.state.particles.length > MAX_PARTICLES) {
      this.state.particles.splice(0, this.state.particles.length - MAX_PARTICLES);
    }
  }

  spawnShockwave(x, y, options = {}) {
    this.state.shockwaves.push({
      id: this.createId("shockwave"),
      x,
      y,
      radius: options.radius ?? 14,
      initialRadius: options.radius ?? 14,
      maxRadius: options.maxRadius ?? 132,
      lifeMs: options.lifeMs ?? 420,
      maxLifeMs: options.maxLifeMs ?? options.lifeMs ?? 420,
      color: options.color ?? "#22d3ee",
      lineWidth: options.lineWidth ?? 4,
    });
  }

  addScreenShake(amount) {
    this.state.cameraShake = Math.max(this.state.cameraShake, amount);
  }

  emitEngineTrail(ship, color, scale = 1) {
    const exhaustX = ship.x - Math.cos(ship.angle) * (ship.radius + 5);
    const exhaustY = ship.y - Math.sin(ship.angle) * (ship.radius + 5);
    this.state.particles.push({
      id: this.createId("thruster"),
      x: exhaustX + randomBetween(this.rng, -4, 4),
      y: exhaustY + randomBetween(this.rng, -4, 4),
      vx: -Math.cos(ship.angle) * randomBetween(this.rng, 90, 180) * scale + ship.vx * 0.12,
      vy: -Math.sin(ship.angle) * randomBetween(this.rng, 90, 180) * scale + ship.vy * 0.12,
      radius: randomBetween(this.rng, 1.6, 4.4) * scale,
      lifeMs: randomBetween(this.rng, 120, 280),
      maxLifeMs: 280,
      color,
    });
    if (this.state.particles.length > MAX_PARTICLES) {
      this.state.particles.splice(0, this.state.particles.length - MAX_PARTICLES);
    }
  }

  setCombo(amount, durationMs = COMBO_CHAIN_MS) {
    this.state.combo = Math.max(0, amount);
    this.state.comboTimerMs = this.state.combo > 0 ? durationMs : 0;
    this.state.metrics.maxCombo = Math.max(this.state.metrics.maxCombo, this.state.combo);
  }

  boostFocus(amount) {
    const previousMode = this.state.vanguardMode;
    this.state.focus = clamp(this.state.focus + amount, 0, 100);
    this.state.vanguardMode =
      this.state.focus >= VANGUARD_MODE_THRESHOLD ||
      (previousMode && this.state.focus >= VANGUARD_MODE_THRESHOLD - 14);
    if (this.state.vanguardMode && !previousMode) {
      this.pushEvent(
        this.locale === "es"
          ? "Vanguard Drive online: armas y maniobra potenciadas."
          : "Vanguard Drive online: weapons and handling boosted."
      );
    }
  }

  decayFocus(dt) {
    const previousMode = this.state.vanguardMode;
    const decayRate = this.state.vanguardMode ? 10 : 5.5;
    this.state.focus = Math.max(0, this.state.focus - decayRate * dt);
    this.state.vanguardMode =
      this.state.focus >= VANGUARD_MODE_THRESHOLD ||
      (previousMode && this.state.focus >= VANGUARD_MODE_THRESHOLD - 14);
    if (previousMode && !this.state.vanguardMode) {
      this.pushEvent(
        this.locale === "es"
          ? "Vanguard Drive descargado."
          : "Vanguard Drive discharged."
      );
    }
  }

  awardNearMiss(source, focusGain, scoreGain) {
    const player = this.state.player;
    this.boostFocus(focusGain);
    player.energy = Math.min(PLAYER_MAX_ENERGY, player.energy + 8);
    player.shield = Math.min(PLAYER_MAX_SHIELD, player.shield + 3);
    this.state.score += scoreGain;
    this.state.metrics.nearMisses += 1;
    this.setCombo(this.state.combo + 1, COMBO_CHAIN_MS + 320);
    this.state.message =
      this.locale === "es"
        ? "Pasada al limite: energia y combo recuperados."
        : "Close pass: energy and combo recovered.";
    if (this.state.metrics.nearMisses === 1 || this.state.metrics.nearMisses % 4 === 0) {
      this.pushEvent(this.state.message);
    }
    this.spawnShockwave(source.x, source.y, {
      radius: 8,
      maxRadius: 54,
      lifeMs: 220,
      color: "#67e8f9",
      lineWidth: 2,
    });
  }

  triggerBossPhase(enemy) {
    const nextPhase = enemy.phaseBurstsTriggered + 1;
    enemy.phaseBurstsTriggered = nextPhase;
    this.spawnShockwave(enemy.x, enemy.y, {
      radius: enemy.radius,
      maxRadius: 176,
      lifeMs: 360,
      color: "#fde047",
      lineWidth: 5,
    });
    this.addScreenShake(7);
    for (let index = 0; index < 10 + nextPhase * 2; index += 1) {
      const angle = (Math.PI * 2 * index) / (10 + nextPhase * 2) + enemy.wobble * 0.24;
      this.spawnBullet({
        owner: "enemy",
        x: enemy.x,
        y: enemy.y,
        angle,
        speed: 250 + nextPhase * 24,
        damage: 10 + nextPhase * 2,
        color: "#fde047",
        radius: 4,
        lifeMs: 1600,
      });
    }
    const supportKinds = nextPhase === 1 ? ["drone", "drone"] : ["lancer", "drone"];
    supportKinds.forEach((kind, index) => {
      const angle = enemy.angle + index * Math.PI;
      this.spawnEnemy(kind, {
        position: {
          x: wrap(enemy.x + Math.cos(angle) * 92, STAGE_WIDTH),
          y: wrap(enemy.y + Math.sin(angle) * 92, STAGE_HEIGHT),
        },
      });
    });
    this.state.message =
      this.locale === "es"
        ? `Dreadnought en fase ${nextPhase}: oleada de defensa desplegada.`
        : `Dreadnought phase ${nextPhase}: defense wing deployed.`;
    this.pushEvent(this.state.message);
  }

  pushEvent(text) {
    if (!text) {
      return;
    }
    this.state.events = [
      { id: this.createId("event"), text, timestamp: this.state.elapsedMs },
      ...this.state.events,
    ].slice(0, 6);
  }
  step(stepMs) {
    const dt = stepMs / 1000;
    if (this.state.mode === "paused" || this.state.mode === "menu" || this.state.mode === "gameover") {
      this.updateAmbient(dt);
      this.decayFocus(dt);
      this.emitSnapshot();
      return;
    }

    this.state.elapsedMs += stepMs;
    this.updateAmbient(dt);
    this.updateCombatPresentation(stepMs, dt);
    this.updatePlayer(dt);
    this.updateEnemies(dt);
    this.updateAsteroids(dt);
    this.updateBullets(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);
    this.updateShockwaves(stepMs);
    this.updateNearMisses();
    this.handleCollisions();
    this.checkWaveState(stepMs);
    this.state.bestScore = Math.max(this.state.bestScore, this.state.score, this.state.leaderboard[0]?.score ?? 0);
    this.emitSnapshot();
  }

  updateAmbient(dt) {
    this.state.stars.forEach((star) => {
      star.y = wrap(
        star.y + star.speed * star.depth * (this.state.mode === "menu" ? 20 : 10) * dt,
        STAGE_HEIGHT
      );
    });
  }

  updateCombatPresentation(stepMs, dt) {
    this.decayFocus(dt);
    if (this.state.combo > 0) {
      this.state.comboTimerMs = Math.max(0, this.state.comboTimerMs - stepMs);
      if (this.state.comboTimerMs === 0) {
        this.state.combo = 0;
      }
    }
    this.state.cameraShake = Math.max(0, this.state.cameraShake - stepMs * 0.018);
    this.state.damageFlashMs = Math.max(0, this.state.damageFlashMs - stepMs);
  }

  updatePlayer(dt) {
    const player = this.state.player;
    player.weaponCooldownMs = Math.max(0, player.weaponCooldownMs - dt * 1000);
    player.pulseCooldownMs = Math.max(0, player.pulseCooldownMs - dt * 1000);
    player.invulnerableMs = Math.max(0, player.invulnerableMs - dt * 1000);
    player.recentDamageMs = Math.max(0, player.recentDamageMs - dt * 1000);

    const turnIntent = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    const turnMultiplier = this.input.brake ? PLAYER_BRAKE_TURN_MULTIPLIER : 1;
    const turnTarget =
      PLAYER_TURN_SPEED *
      turnIntent *
      (this.state.vanguardMode ? 1.18 : 1) *
      turnMultiplier;
    player.turnVelocity +=
      (turnTarget - player.turnVelocity) * Math.min(1, dt * (this.input.brake ? 13 : 10));
    player.turnVelocity *= this.input.brake ? 0.91 : 0.88;
    player.angle += player.turnVelocity * dt;

    let thrust = 0;
    if (this.input.thrust) {
      thrust = PLAYER_THRUST;
    }
    player.boosting = false;
    if (this.input.boost && player.energy > 1) {
      thrust = PLAYER_BOOST;
      player.energy = Math.max(0, player.energy - 26 * dt);
      player.boosting = true;
    } else {
      player.energy = Math.min(
        PLAYER_MAX_ENERGY,
        player.energy + (14 + this.state.focus * 0.05) * dt
      );
    }

    if (thrust > 0) {
      player.vx += Math.cos(player.angle) * thrust * dt;
      player.vy += Math.sin(player.angle) * thrust * dt;
      this.emitEngineTrail(player, player.boosting ? "#f97316" : "#67e8f9", player.boosting ? 1.15 : 0.82);
    }

    const velocitySpeed = Math.hypot(player.vx, player.vy);
    if (this.input.brake) {
      player.vx *= PLAYER_BRAKE;
      player.vy *= PLAYER_BRAKE;
      if (velocitySpeed > 70) {
        const retroScale = 0.6 + Math.min(0.5, velocitySpeed / PLAYER_BOOST_MAX_SPEED);
        player.vx -= Math.cos(player.angle) * PLAYER_RETRO_THRUST * retroScale * dt;
        player.vy -= Math.sin(player.angle) * PLAYER_RETRO_THRUST * retroScale * dt;
      }
    }

    const forwardSpeed = player.vx * Math.cos(player.angle) + player.vy * Math.sin(player.angle);
    const lateralSpeed = player.vx * -Math.sin(player.angle) + player.vy * Math.cos(player.angle);
    const dampedLateral = lateralSpeed * (1 - 0.11 * (this.input.brake ? 1.8 : 1));
    player.vx =
      Math.cos(player.angle) * forwardSpeed + -Math.sin(player.angle) * dampedLateral;
    player.vy =
      Math.sin(player.angle) * forwardSpeed + Math.cos(player.angle) * dampedLateral;

    player.vx *= 1 - (1 - PLAYER_DRAG) * dt * 60;
    player.vy *= 1 - (1 - PLAYER_DRAG) * dt * 60;
    const maxSpeed = (player.boosting ? PLAYER_BOOST_MAX_SPEED : PLAYER_MAX_SPEED) + this.state.focus * 0.7;
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      player.vx *= scale;
      player.vy *= scale;
    }

    player.x = wrap(player.x + player.vx * dt, STAGE_WIDTH);
    player.y = wrap(player.y + player.vy * dt, STAGE_HEIGHT);
    player.driftDistance += Math.hypot(player.vx, player.vy) * dt;
    player.speed = Math.hypot(player.vx, player.vy);

    player.heat = Math.max(0, player.heat - (player.overheated ? 34 : 20) * dt);
    if (player.overheated && player.heat <= 34) {
      player.overheated = false;
      this.pushEvent(this.locale === "es" ? "Armas estabilizadas." : "Weapons stabilized.");
    }

    if (player.recentDamageMs <= 0) {
      const shieldRegen = 6 + this.state.sector * 0.45 + (this.state.enemies.length <= 2 ? 0.8 : 0);
      player.shield = Math.min(PLAYER_MAX_SHIELD, player.shield + shieldRegen * dt);
    }

    if (this.input.fire) {
      this.tryFirePlayer();
    }
    if (this.input.pulse) {
      this.tryPulse();
      this.input.pulse = false;
    }
  }

  tryFirePlayer() {
    const player = this.state.player;
    if (player.weaponCooldownMs > 0 || player.overheated) {
      return;
    }
    const focusRatio = this.state.focus / 100;
    const originX = player.x + Math.cos(player.angle) * 20;
    const originY = player.y + Math.sin(player.angle) * 20;
    this.spawnBullet({
      owner: "player",
      x: originX,
      y: originY,
      angle: player.angle,
      speed: PLAYER_BULLET_SPEED + focusRatio * 90,
      damage: Math.round((22 + focusRatio * 8) * (this.state.vanguardMode ? 1.18 : 1)),
      color: this.state.vanguardMode ? "#c084fc" : "#67e8f9",
      radius: this.state.vanguardMode ? 5 : 4,
      lifeMs: 1200 + Math.round(focusRatio * 220),
    });
    player.weaponCooldownMs = PLAYER_FIRE_INTERVAL_MS * (this.state.vanguardMode ? 0.82 : 1);
    player.heat = Math.min(PLAYER_MAX_HEAT, player.heat + (this.state.vanguardMode ? 16 : 14));
    player.vx -= Math.cos(player.angle) * (this.state.vanguardMode ? 10 : 7);
    player.vy -= Math.sin(player.angle) * (this.state.vanguardMode ? 10 : 7);
    this.emitEngineTrail(player, this.state.vanguardMode ? "#c084fc" : "#22d3ee", 0.56);
    if (player.heat >= PLAYER_MAX_HEAT) {
      player.overheated = true;
      this.state.message = this.locale === "es" ? "Armas sobrecalentadas." : "Weapons overheated.";
    }
    this.state.metrics.shotsFired += 1;
  }

  tryPulse() {
    const player = this.state.player;
    if (player.pulseCooldownMs > 0 || player.energy < PLAYER_PULSE_COST) {
      return;
    }
    player.energy -= PLAYER_PULSE_COST;
    player.pulseCooldownMs = PLAYER_PULSE_INTERVAL_MS;
    this.spawnShockwave(player.x, player.y, {
      radius: 14,
      maxRadius: this.state.vanguardMode ? 154 : 132,
      lifeMs: 420,
      color: this.state.vanguardMode ? "#c084fc" : "#22d3ee",
      lineWidth: this.state.vanguardMode ? 5 : 4,
    });
    this.pushEvent(this.locale === "es" ? "Pulso EMP desplegado." : "EMP pulse deployed.");
    this.addScreenShake(5);

    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (bullet.owner !== "enemy") {
        return true;
      }
      const hit = getWrappedDelta(player, bullet).distance <= (this.state.vanguardMode ? 154 : 132);
      if (hit) {
        this.spawnExplosion(bullet.x, bullet.y, "#22d3ee", 5, 0.5);
      }
      return !hit;
    });

    this.state.enemies.forEach((enemy) => {
      const delta = getWrappedDelta(player, enemy);
      if (delta.distance <= (this.state.vanguardMode ? 154 : 132)) {
        enemy.hull -= this.state.vanguardMode ? 36 : 28;
        enemy.vx += (delta.dx / Math.max(1, delta.distance)) * 120;
        enemy.vy += (delta.dy / Math.max(1, delta.distance)) * 120;
      }
    });
  }

  updateEnemies(dt) {
    const player = this.state.player;
    this.state.enemies.forEach((enemy) => {
      enemy.nearMissCooldownMs = Math.max(0, enemy.nearMissCooldownMs - dt * 1000);
      const delta = getWrappedDelta(enemy, player);
      let desiredAngle = Math.atan2(delta.dy, delta.dx);
      let moveDirection =
        delta.distance > enemy.profile.preferredRange
          ? 1
          : delta.distance < enemy.profile.preferredRange * 0.6
            ? -0.45
            : 0;
      let strafeForce = 0;
      if (enemy.kind === "drone") {
        desiredAngle += enemy.orbitDir * 0.28;
        strafeForce = enemy.profile.thrust * (0.42 + Math.sin(enemy.wobble) * 0.08) * enemy.orbitDir;
        moveDirection = delta.distance > 150 ? 0.9 : 0.24;
      } else if (enemy.kind === "lancer") {
        strafeForce = enemy.profile.thrust * 0.28 * enemy.orbitDir;
        moveDirection = delta.distance > 240 ? 1.1 : delta.distance < 180 ? -0.25 : 0.2;
      } else if (enemy.kind === "boss") {
        desiredAngle += Math.sin(enemy.wobble * 0.45) * 0.18;
        strafeForce = enemy.profile.thrust * 0.18 * Math.sin(enemy.wobble * 0.9);
        moveDirection = delta.distance > enemy.profile.preferredRange ? 0.9 : 0.12;
        const hullRatio = enemy.hull / enemy.maxHull;
        const thresholds = [0.72, 0.38];
        if (enemy.phaseBurstsTriggered < thresholds.length && hullRatio <= thresholds[enemy.phaseBurstsTriggered]) {
          this.triggerBossPhase(enemy);
        }
      }
      enemy.angle = rotateToward(enemy.angle, desiredAngle, enemy.profile.turnRate * dt);
      enemy.vx += Math.cos(enemy.angle) * enemy.profile.thrust * moveDirection * dt;
      enemy.vy += Math.sin(enemy.angle) * enemy.profile.thrust * moveDirection * dt;
      enemy.vx += Math.cos(enemy.angle + Math.PI / 2) * strafeForce * dt;
      enemy.vy += Math.sin(enemy.angle + Math.PI / 2) * strafeForce * dt;
      enemy.vx *= 1 - (1 - enemy.profile.drag) * dt * 60;
      enemy.vy *= 1 - (1 - enemy.profile.drag) * dt * 60;
      enemy.x = wrap(enemy.x + enemy.vx * dt, STAGE_WIDTH);
      enemy.y = wrap(enemy.y + enemy.vy * dt, STAGE_HEIGHT);
      enemy.wobble += dt * (enemy.kind === "boss" ? 1.2 : 2.4);
      if (Math.hypot(enemy.vx, enemy.vy) > 28) {
        this.emitEngineTrail(enemy, enemy.kind === "boss" ? "#fde047" : enemy.color, enemy.kind === "boss" ? 0.7 : 0.48);
      }
      enemy.shootCooldownMs -= dt * 1000;
      if (
        enemy.shootCooldownMs <= 0 &&
        Math.abs(angleDiff(enemy.angle, desiredAngle)) <= enemy.profile.fireArc
      ) {
        this.fireEnemy(enemy, desiredAngle);
      }
    });
  }

  fireEnemy(enemy, baseAngle) {
    const profile = enemy.profile;
    const count = profile.fireCount;
    for (let shotIndex = 0; shotIndex < count; shotIndex += 1) {
      const spreadOffset = count === 1 ? 0 : (shotIndex - (count - 1) / 2) * profile.spread;
      this.spawnBullet({
        owner: "enemy",
        x: enemy.x + Math.cos(baseAngle) * (enemy.radius + 8),
        y: enemy.y + Math.sin(baseAngle) * (enemy.radius + 8),
        angle: baseAngle + spreadOffset,
        speed: ENEMY_BULLET_SPEED + (enemy.kind === "boss" ? 40 : 0),
        damage: enemy.kind === "boss" ? 15 : 10,
        color: enemy.kind === "boss" ? "#fde047" : "#fb7185",
        radius: enemy.kind === "boss" ? 5 : 4,
        lifeMs: enemy.kind === "boss" ? 1700 : 1500,
      });
    }
    enemy.shootCooldownMs = profile.fireIntervalMs + randomBetween(this.rng, -120, 160);
  }

  updateAsteroids(dt) {
    this.state.asteroids.forEach((asteroid) => {
      asteroid.x = wrap(asteroid.x + asteroid.vx * dt, STAGE_WIDTH);
      asteroid.y = wrap(asteroid.y + asteroid.vy * dt, STAGE_HEIGHT);
      asteroid.angle += asteroid.spin * dt;
      asteroid.nearMissCooldownMs = Math.max(0, (asteroid.nearMissCooldownMs ?? 0) - dt * 1000);
    });
  }

  updateBullets(dt) {
    this.state.bullets.forEach((bullet) => {
      bullet.x = wrap(bullet.x + bullet.vx * dt, STAGE_WIDTH);
      bullet.y = wrap(bullet.y + bullet.vy * dt, STAGE_HEIGHT);
      bullet.lifeMs -= dt * 1000;
    });
    this.state.bullets = this.state.bullets.filter((bullet) => bullet.lifeMs > 0);
  }

  updatePickups(dt) {
    this.state.pickups.forEach((pickup) => {
      pickup.x = wrap(pickup.x + pickup.vx * dt, STAGE_WIDTH);
      pickup.y = wrap(pickup.y + pickup.vy * dt, STAGE_HEIGHT);
      pickup.lifeMs -= dt * 1000;
    });
    this.state.pickups = this.state.pickups.filter((pickup) => pickup.lifeMs > 0);
  }

  updateParticles(dt) {
    this.state.particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.lifeMs -= dt * 1000;
    });
    this.state.particles = this.state.particles.filter((particle) => particle.lifeMs > 0);
  }

  updateShockwaves(stepMs) {
    this.state.shockwaves.forEach((shockwave) => {
      shockwave.lifeMs -= stepMs;
      const progress = 1 - shockwave.lifeMs / shockwave.maxLifeMs;
      shockwave.radius =
        shockwave.initialRadius +
        (shockwave.maxRadius - shockwave.initialRadius) * progress;
    });
    this.state.shockwaves = this.state.shockwaves.filter((shockwave) => shockwave.lifeMs > 0);
  }

  updateNearMisses() {
    const player = this.state.player;
    if (player.speed < 125 && !player.boosting) {
      return;
    }

    this.state.bullets.forEach((bullet) => {
      if (bullet.owner !== "enemy" || bullet.nearMissed) {
        return;
      }
      const distance = getWrappedDelta(player, bullet).distance;
      const collideDistance = player.radius + bullet.radius;
      if (
        distance > collideDistance + 5 &&
        distance <= collideDistance + BULLET_NEAR_MISS_CLEARANCE
      ) {
        bullet.nearMissed = true;
        this.awardNearMiss(bullet, 11, 24);
      }
    });

    this.state.asteroids.forEach((asteroid) => {
      const distance = getWrappedDelta(player, asteroid).distance;
      const collideDistance = player.radius + asteroid.radius;
      if (
        (asteroid.nearMissCooldownMs ?? 0) <= 0 &&
        distance > collideDistance + 6 &&
        distance <= collideDistance + NEAR_MISS_CLEARANCE
      ) {
        asteroid.nearMissCooldownMs = 1300;
        this.awardNearMiss(asteroid, 9, 18);
      }
    });

    this.state.enemies.forEach((enemy) => {
      const distance = getWrappedDelta(player, enemy).distance;
      const collideDistance = player.radius + enemy.radius;
      if (
        enemy.nearMissCooldownMs <= 0 &&
        distance > collideDistance + 8 &&
        distance <= collideDistance + NEAR_MISS_CLEARANCE
      ) {
        enemy.nearMissCooldownMs = 1500;
        this.awardNearMiss(enemy, enemy.kind === "boss" ? 16 : 12, enemy.kind === "boss" ? 44 : 28);
      }
    });
  }

  applyPlayerDamage(amount, sourceX, sourceY) {
    const player = this.state.player;
    if (player.invulnerableMs > 0) {
      return;
    }
    let remaining = amount;
    if (player.shield > 0) {
      const shieldAbsorb = Math.min(player.shield, remaining);
      player.shield -= shieldAbsorb;
      remaining -= shieldAbsorb;
    }
    if (remaining > 0) {
      player.hull = Math.max(0, player.hull - remaining);
    }
    player.invulnerableMs = INVULNERABLE_AFTER_HIT_MS;
    player.recentDamageMs = RECENT_DAMAGE_COOLDOWN_MS;
    this.state.metrics.damageTaken += amount;
    this.state.damageFlashMs = 180;
    this.addScreenShake(amount >= 14 ? 9 : 6);
    this.spawnExplosion(sourceX, sourceY, "#fca5a5", 10, 0.8);
    if (player.hull <= 0) {
      this.endRun();
    } else {
      this.state.message = this.locale === "es" ? "Escudos bajo presion." : "Shields under pressure.";
      this.setCombo(Math.max(0, this.state.combo - 2), Math.max(0, this.state.comboTimerMs - 600));
    }
  }

  collectPickup(pickup) {
    const player = this.state.player;
    if (pickup.kind === "repair") {
      player.hull = Math.min(PLAYER_MAX_HULL, player.hull + 30);
      player.shield = Math.min(PLAYER_MAX_SHIELD, player.shield + 10);
      this.state.message = this.locale === "es" ? "Kit de casco recuperado." : "Hull kit recovered.";
    } else if (pickup.kind === "coolant") {
      player.heat = Math.max(0, player.heat - 36);
      player.overheated = false;
      this.state.message = this.locale === "es" ? "Coolant inyectado." : "Coolant injected.";
    } else {
      player.energy = Math.min(PLAYER_MAX_ENERGY, player.energy + 32);
      player.shield = Math.min(PLAYER_MAX_SHIELD, player.shield + 20);
      this.state.message = this.locale === "es" ? "Celda tactica recargada." : "Tactical cell recharged.";
    }
    this.pushEvent(this.state.message);
  }

  handleCollisions() {
    const player = this.state.player;

    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (bullet.owner === "player") {
        const enemyHit = this.state.enemies.find((enemy) => circlesCollide(bullet, enemy));
        if (enemyHit) {
          enemyHit.hull -= bullet.damage;
          this.state.metrics.shotsHit += 1;
          this.setCombo(this.state.combo + 1);
          this.boostFocus(enemyHit.kind === "boss" ? 4.5 : 3.2);
          this.spawnExplosion(bullet.x, bullet.y, "#67e8f9", 6, 0.6);
          this.addScreenShake(enemyHit.kind === "boss" ? 4 : 2.5);
          return false;
        }
        const asteroidHit = this.state.asteroids.find((asteroid) => circlesCollide(bullet, asteroid));
        if (asteroidHit) {
          asteroidHit.hull -= bullet.damage;
          this.state.metrics.shotsHit += 1;
          this.setCombo(Math.max(this.state.combo, 1), COMBO_CHAIN_MS - 300);
          this.spawnExplosion(bullet.x, bullet.y, "#cbd5e1", 5, 0.5);
          return false;
        }
        return true;
      }

      if (circlesCollide(bullet, player)) {
        this.applyPlayerDamage(bullet.damage, bullet.x, bullet.y);
        return false;
      }
      return true;
    });

    this.state.asteroids.forEach((asteroid) => {
      if (circlesCollide(asteroid, player)) {
        this.applyPlayerDamage(14, asteroid.x, asteroid.y);
        asteroid.hull -= 18;
      }
    });

    this.state.enemies.forEach((enemy) => {
      if (circlesCollide(enemy, player)) {
        this.applyPlayerDamage(enemy.kind === "boss" ? 18 : 12, enemy.x, enemy.y);
        enemy.hull -= 20;
      }
    });

    this.state.pickups = this.state.pickups.filter((pickup) => {
      if (circlesCollide(pickup, player)) {
        this.collectPickup(pickup);
        return false;
      }
      return true;
    });

    const defeatedEnemies = this.state.enemies.filter((enemy) => enemy.hull <= 0);
    defeatedEnemies.forEach((enemy) => {
      this.state.score += enemy.profile.score + this.state.wave * 12 + this.state.combo * 4;
      this.state.metrics.enemiesDestroyed += 1;
      this.boostFocus(enemy.kind === "boss" ? 18 : 8);
      this.spawnExplosion(enemy.x, enemy.y, enemy.color, enemy.kind === "boss" ? 26 : 14, enemy.kind === "boss" ? 1.4 : 1);
      this.spawnShockwave(enemy.x, enemy.y, {
        radius: 10,
        maxRadius: enemy.kind === "boss" ? 160 : 72,
        lifeMs: enemy.kind === "boss" ? 380 : 240,
        color: enemy.kind === "boss" ? "#fde047" : enemy.color,
        lineWidth: enemy.kind === "boss" ? 5 : 3,
      });
      this.addScreenShake(enemy.kind === "boss" ? 10 : 4.5);
      this.maybeSpawnEnemyPickup(enemy);
    });
    this.state.enemies = this.state.enemies.filter((enemy) => enemy.hull > 0);

    const destroyedAsteroids = this.state.asteroids.filter((asteroid) => asteroid.hull <= 0);
    destroyedAsteroids.forEach((asteroid) => {
      this.state.score += asteroid.score;
      this.state.metrics.asteroidsCleared += 1;
      this.spawnExplosion(asteroid.x, asteroid.y, "#cbd5e1", 12, 0.9);
      this.addScreenShake(2.5);
      if (asteroid.radius > 26 && this.rng() > 0.48) {
        this.spawnAsteroid(Math.max(14, asteroid.radius * 0.55));
      }
    });
    this.state.asteroids = this.state.asteroids.filter((asteroid) => asteroid.hull > 0);
  }

  checkWaveState(stepMs) {
    if (this.state.enemies.length === 0) {
      if (this.state.transitionMs <= 0) {
        this.state.transitionMs = WAVE_TRANSITION_MS;
        this.grantWaveRecovery();
        this.state.score += 120 + this.state.wave * 20;
        this.state.message =
          this.locale === "es"
            ? `Oleada ${this.state.wave} completada. Recalibrando salto.`
            : `Wave ${this.state.wave} cleared. Recalibrating jump.`;
        this.pushEvent(this.state.message);
      } else {
        this.state.transitionMs = Math.max(0, this.state.transitionMs - stepMs);
        if (this.state.transitionMs === 0) {
          this.state.wave += 1;
          this.state.sector = Math.floor((this.state.wave - 1) / 3) + 1;
          this.spawnWave();
        }
      }
    } else {
      this.state.transitionMs = 0;
    }
  }

  endRun() {
    if (this.state.mode === "gameover") {
      return;
    }
    this.state.mode = "gameover";
    this.state.playState = "defeat";
    this.state.message =
      this.locale === "es"
        ? `Mision perdida. Score final ${this.state.score}.`
        : `Mission failed. Final score ${this.state.score}.`;
    this.pushEvent(this.state.message);
    const summary = this.createRunSummary();
    if (summary.id !== this.submittedRunId) {
      this.submittedRunId = summary.id;
      this.onRunFinished?.(summary);
    }
  }

  createRunSummary() {
    return {
      id: this.createId("run"),
      pilot: this.state.pilotName,
      score: this.state.score,
      wave: this.state.wave,
      sector: this.state.sector,
      accuracy: formatAccuracy(this.state.metrics.shotsFired, this.state.metrics.shotsHit),
      enemiesDestroyed: this.state.metrics.enemiesDestroyed,
      asteroidsCleared: this.state.metrics.asteroidsCleared,
      createdAt: new Date().toISOString(),
      source: "client",
    };
  }
  emitSnapshot() {
    const player = this.state.player;
    const snapshot = {
      mode: this.state.mode,
      playState: this.state.playState,
      locale: this.state.locale,
      coordinates: this.state.coordinates,
      score: this.state.score,
      bestScore: this.state.bestScore,
      wave: this.state.wave,
      sector: this.state.sector,
      sectorName: this.state.sectorName,
      elapsedMs: this.state.elapsedMs,
      combo: this.state.combo,
      comboTimerMs: Math.round(this.state.comboTimerMs),
      focus: Math.round(this.state.focus),
      vanguardMode: this.state.vanguardMode,
      waveThreat: this.state.waveThreat,
      player: {
        x: Math.round(player.x),
        y: Math.round(player.y),
        vx: Math.round(player.vx),
        vy: Math.round(player.vy),
        speed: Math.round(player.speed),
        angleDeg: Math.round((player.angle * 180) / Math.PI),
        turnVelocityDeg: Math.round((player.turnVelocity * 180) / Math.PI),
        hull: Math.round(player.hull),
        shield: Math.round(player.shield),
        energy: Math.round(player.energy),
        heat: Math.round(player.heat),
        overheated: player.overheated,
        pulseCooldownMs: Math.round(player.pulseCooldownMs),
        weaponCooldownMs: Math.round(player.weaponCooldownMs),
        boosting: player.boosting,
      },
      enemies: this.state.enemies.map((enemy) => ({
        id: enemy.id,
        kind: enemy.kind,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        hull: Math.round(enemy.hull),
        radius: enemy.radius,
      })),
      asteroids: this.state.asteroids.map((asteroid) => ({
        id: asteroid.id,
        x: Math.round(asteroid.x),
        y: Math.round(asteroid.y),
        radius: Math.round(asteroid.radius),
        hull: Math.round(asteroid.hull),
      })),
      bullets: this.state.bullets.map((bullet) => ({
        id: bullet.id,
        owner: bullet.owner,
        x: Math.round(bullet.x),
        y: Math.round(bullet.y),
      })),
      pickups: this.state.pickups.map((pickup) => ({
        id: pickup.id,
        kind: pickup.kind,
        x: Math.round(pickup.x),
        y: Math.round(pickup.y),
      })),
      backendStatus: this.state.backendStatus,
      backendMessage: this.state.backendMessage,
      backendConfig: this.state.backendConfig,
      leaderboard: this.state.leaderboard,
      message: this.state.message,
      events: this.state.events,
      metrics: {
        ...this.state.metrics,
        accuracy: formatAccuracy(this.state.metrics.shotsFired, this.state.metrics.shotsHit),
      },
      fullscreen: this.state.fullscreen,
    };
    this.onSnapshot?.(snapshot);
  }

  render() {
    const context = this.context;
    const theme = this.state.theme;
    const player = this.state.player;
    const speedRatio = clamp(player.speed / PLAYER_BOOST_MAX_SPEED, 0, 1.2);
    const shakeStrength = this.state.cameraShake;
    const shakeX = shakeStrength > 0 ? Math.sin(this.state.elapsedMs * 0.045) * shakeStrength : 0;
    const shakeY = shakeStrength > 0 ? Math.cos(this.state.elapsedMs * 0.06) * shakeStrength * 0.7 : 0;
    context.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    const gradient = context.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
    gradient.addColorStop(0, theme.sky);
    gradient.addColorStop(1, "#020617");
    context.fillStyle = gradient;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    context.save();
    context.globalAlpha = 0.22;
    const nebula = context.createRadialGradient(STAGE_WIDTH * 0.25, STAGE_HEIGHT * 0.2, 40, STAGE_WIDTH * 0.25, STAGE_HEIGHT * 0.2, 260);
    nebula.addColorStop(0, theme.nebula[2]);
    nebula.addColorStop(0.5, theme.nebula[1]);
    nebula.addColorStop(1, "transparent");
    context.fillStyle = nebula;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    const nebula2 = context.createRadialGradient(STAGE_WIDTH * 0.82, STAGE_HEIGHT * 0.3, 20, STAGE_WIDTH * 0.82, STAGE_HEIGHT * 0.3, 200);
    nebula2.addColorStop(0, theme.nebula[1]);
    nebula2.addColorStop(0.5, theme.nebula[0]);
    nebula2.addColorStop(1, "transparent");
    context.fillStyle = nebula2;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    const planet = context.createRadialGradient(
      STAGE_WIDTH * 0.74,
      STAGE_HEIGHT * 0.78,
      18,
      STAGE_WIDTH * 0.74,
      STAGE_HEIGHT * 0.78,
      132
    );
    planet.addColorStop(0, "rgba(148, 163, 184, 0.45)");
    planet.addColorStop(0.34, "rgba(59, 130, 246, 0.22)");
    planet.addColorStop(1, "transparent");
    context.fillStyle = planet;
    context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    context.restore();

    this.state.stars.forEach((star) => {
      context.save();
      const twinkle =
        0.45 + 0.55 * Math.sin(this.state.elapsedMs * 0.0018 * star.twinkle + star.x * 0.02);
      context.globalAlpha = star.alpha * twinkle;
      if (speedRatio > 0.32) {
        const streak = speedRatio * star.depth * (player.boosting ? 16 : 9);
        const streakAngle = Math.atan2(player.vy || -1, player.vx || 0);
        context.strokeStyle = star.color;
        context.lineWidth = Math.max(1, star.radius * 0.85);
        context.beginPath();
        context.moveTo(star.x, star.y);
        context.lineTo(
          star.x - Math.cos(streakAngle) * streak,
          star.y - Math.sin(streakAngle) * streak
        );
        context.stroke();
      } else {
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    });

    context.save();
    context.translate(shakeX, shakeY);

    context.save();
    context.strokeStyle = "rgba(148, 163, 184, 0.1)";
    context.lineWidth = 1;
    for (let x = 0; x <= STAGE_WIDTH; x += 120) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, STAGE_HEIGHT);
      context.stroke();
    }
    for (let y = 0; y <= STAGE_HEIGHT; y += 90) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(STAGE_WIDTH, y);
      context.stroke();
    }
    context.restore();

    this.state.shockwaves.forEach((shockwave) => {
      context.save();
      context.globalAlpha = shockwave.lifeMs / shockwave.maxLifeMs;
      context.strokeStyle = shockwave.color;
      context.lineWidth = shockwave.lineWidth;
      context.beginPath();
      context.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    });

    this.state.asteroids.forEach((asteroid) => {
      context.save();
      context.translate(asteroid.x, asteroid.y);
      context.rotate(asteroid.angle);
      context.fillStyle = "#64748b";
      context.beginPath();
      for (let index = 0; index < 8; index += 1) {
        const angle = (Math.PI * 2 * index) / 8;
        const radius = asteroid.radius * (0.78 + ((index % 2 === 0 ? 0.18 : -0.1) + asteroid.craterSeed * 0.1));
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
      context.strokeStyle = "rgba(226, 232, 240, 0.38)";
      context.stroke();
      context.restore();
    });

    this.state.pickups.forEach((pickup) => {
      context.save();
      context.translate(pickup.x, pickup.y);
      context.fillStyle = pickup.kind === "repair" ? "#34d399" : pickup.kind === "coolant" ? "#60a5fa" : "#facc15";
      context.beginPath();
      context.arc(0, 0, pickup.radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#020617";
      context.fillRect(-2, -7, 4, 14);
      context.fillRect(-7, -2, 14, 4);
      context.restore();
    });

    this.state.enemies.forEach((enemy) => {
      context.save();
      context.translate(enemy.x, enemy.y);
      context.rotate(enemy.angle + Math.PI / 2);
      context.fillStyle = enemy.color;
      context.beginPath();
      if (enemy.kind === "boss") {
        context.moveTo(0, -enemy.radius - 10);
        context.lineTo(enemy.radius + 16, 0);
        context.lineTo(0, enemy.radius + 12);
        context.lineTo(-enemy.radius - 16, 0);
      } else {
        context.moveTo(0, -enemy.radius - 8);
        context.lineTo(enemy.radius, enemy.radius);
        context.lineTo(0, enemy.radius * 0.2);
        context.lineTo(-enemy.radius, enemy.radius);
      }
      context.closePath();
      context.fill();
      context.restore();

      context.fillStyle = "rgba(15, 23, 42, 0.7)";
      context.fillRect(enemy.x - 24, enemy.y - enemy.radius - 18, 48, 5);
      context.fillStyle = enemy.kind === "boss" ? "#fde047" : "#fb7185";
      context.fillRect(enemy.x - 24, enemy.y - enemy.radius - 18, 48 * (enemy.hull / enemy.maxHull), 5);
    });

    this.state.bullets.forEach((bullet) => {
      context.save();
      context.strokeStyle = bullet.color;
      context.lineWidth = bullet.owner === "player" ? 3 : 2;
      context.beginPath();
      context.moveTo(bullet.x - bullet.vx * 0.016, bullet.y - bullet.vy * 0.016);
      context.lineTo(bullet.x, bullet.y);
      context.stroke();
      context.restore();
    });

    this.state.particles.forEach((particle) => {
      context.save();
      context.globalAlpha = particle.lifeMs / particle.maxLifeMs;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });

    context.save();
    context.translate(player.x, player.y);
    context.rotate(player.angle + Math.PI / 2);
    if (player.boosting || this.input.thrust) {
      const exhaustGradient = context.createLinearGradient(0, player.radius - 6, 0, player.radius + 24);
      exhaustGradient.addColorStop(0, player.boosting ? "#fb923c" : "#67e8f9");
      exhaustGradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = exhaustGradient;
      context.beginPath();
      context.moveTo(-8, player.radius - 2);
      context.lineTo(0, player.radius + 18 + Math.sin(this.state.elapsedMs * 0.03) * 4);
      context.lineTo(8, player.radius - 2);
      context.closePath();
      context.fill();
    }
    context.strokeStyle = player.invulnerableMs > 0 ? "#facc15" : this.state.vanguardMode ? "#c084fc" : "#a5f3fc";
    context.lineWidth = this.state.vanguardMode ? 2.8 : 2;
    context.fillStyle = this.state.vanguardMode ? "#1e1b4b" : "#0f172a";
    context.beginPath();
    context.moveTo(0, -player.radius - 12);
    context.lineTo(player.radius, player.radius + 8);
    context.lineTo(0, player.radius * 0.3);
    context.lineTo(-player.radius, player.radius + 8);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = this.state.vanguardMode ? "#c084fc" : theme.accent;
    context.fillRect(-4, -player.radius - 2, 8, 18);
    context.fillStyle = "#e2e8f0";
    context.fillRect(-10, -2, 20, 4);
    context.restore();

    context.save();
    context.globalAlpha = clamp(player.shield / PLAYER_MAX_SHIELD, 0.15, 0.7);
    context.strokeStyle = this.state.vanguardMode ? "#c084fc" : "#38bdf8";
    context.lineWidth = this.state.vanguardMode ? 4 : 3;
    context.beginPath();
    context.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    context.restore();

    if (this.state.damageFlashMs > 0) {
      context.save();
      context.globalAlpha = this.state.damageFlashMs / 260;
      context.fillStyle = "rgba(248, 113, 113, 0.18)";
      context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      context.restore();
    }

    this.drawHud();
    this.drawOverlays();
  }

  drawHud() {
    const context = this.context;
    const player = this.state.player;
    context.save();
    context.fillStyle = "rgba(2, 6, 23, 0.72)";
    context.fillRect(18, 16, 304, 112);
    context.strokeStyle = "rgba(148, 163, 184, 0.22)";
    context.strokeRect(18, 16, 304, 112);
    context.fillStyle = "#e2e8f0";
    context.font = "700 18px Bricolage Grotesque, sans-serif";
    context.fillText(`SCORE ${this.state.score}`, 34, 42);
    context.font = "600 12px Outfit, sans-serif";
    context.fillStyle = "#94a3b8";
    context.fillText(`Wave ${this.state.wave}  Sector ${this.state.sector}`, 34, 62);
    context.fillText(this.state.sectorName, 34, 80);
    context.fillText(this.state.backendStatus.toUpperCase(), 34, 98);
    context.fillText(
      this.state.vanguardMode
        ? this.locale === "es"
          ? "Vanguard Drive online"
          : "Vanguard Drive online"
        : `${this.locale === "es" ? "Velocidad" : "Speed"} ${Math.round(player.speed)}`,
      34,
      116
    );

    this.drawMeter(348, 24, 180, 10, player.hull / PLAYER_MAX_HULL, "#ef4444", "HULL");
    this.drawMeter(348, 48, 180, 10, player.shield / PLAYER_MAX_SHIELD, "#38bdf8", "SHIELD");
    this.drawMeter(348, 72, 180, 10, player.energy / PLAYER_MAX_ENERGY, "#22c55e", "ENERGY");
    this.drawMeter(348, 96, 180, 10, player.heat / PLAYER_MAX_HEAT, "#f97316", "HEAT");
    this.drawMeter(348, 120, 180, 10, this.state.focus / 100, "#a855f7", "VANGUARD");

    context.fillStyle = "#e2e8f0";
    context.font = "600 12px Outfit, sans-serif";
    context.fillText(`Combo ${this.state.combo}`, 662, 34);
    context.fillText(`Threat ${this.state.waveThreat}%`, 662, 54);
    context.fillText(`Acc ${formatAccuracy(this.state.metrics.shotsFired, this.state.metrics.shotsHit)}%`, 662, 74);
    context.fillText(`Kills ${this.state.metrics.enemiesDestroyed}`, 662, 94);
    context.fillText(`Near miss ${this.state.metrics.nearMisses}`, 662, 114);
    context.restore();
  }

  drawMeter(x, y, width, height, ratio, color, label) {
    const context = this.context;
    context.fillStyle = "rgba(15, 23, 42, 0.84)";
    context.fillRect(x, y, width, height);
    context.fillStyle = color;
    context.fillRect(x, y, width * clamp(ratio, 0, 1), height);
    context.fillStyle = "#cbd5e1";
    context.font = "600 10px Outfit, sans-serif";
    context.fillText(label, x + width + 10, y + 9);
  }

  drawOverlays() {
    const context = this.context;
    if (this.state.mode === "menu") {
      context.save();
      context.fillStyle = "rgba(2, 6, 23, 0.74)";
      context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      context.fillStyle = "#f8fafc";
      context.font = "800 34px Bricolage Grotesque, sans-serif";
      context.fillText("Cosmic Vanguard", 64, 120);
      context.font = "500 16px Outfit, sans-serif";
      context.fillStyle = "#cbd5e1";
      const lines = this.locale === "es"
        ? [
            "Shooter espacial original con inercia refinada, Vanguard Drive y bosses con fases.",
            "Pulsa Enter o Espacio para iniciar la corrida.",
            "Controles: A/D rota, W impulsa, S frena, Shift boost, Espacio dispara y E pulso.",
            "Las pasadas al limite recargan energia y activan Vanguard Drive.",
          ]
        : [
            "Original space shooter with refined inertia, Vanguard Drive, and phased bosses.",
            "Press Enter or Space to launch the run.",
            "Controls: A/D rotate, W thrust, S brake, Shift boost, Space fire, and E pulse.",
            "Close passes recharge energy and activate Vanguard Drive.",
          ];
      lines.forEach((line, index) => context.fillText(line, 64, 170 + index * 30));
      context.restore();
    }

    if (this.state.mode === "paused" || this.state.mode === "gameover") {
      context.save();
      context.fillStyle = "rgba(2, 6, 23, 0.58)";
      context.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      context.fillStyle = "#f8fafc";
      context.font = "800 32px Bricolage Grotesque, sans-serif";
      const title =
        this.state.mode === "paused"
          ? this.locale === "es"
            ? "Operacion en pausa"
            : "Operation paused"
          : this.locale === "es"
            ? "Operacion perdida"
            : "Operation failed";
      context.fillText(title, 72, 120);
      context.font = "500 16px Outfit, sans-serif";
      context.fillStyle = "#cbd5e1";
      const accuracy = formatAccuracy(this.state.metrics.shotsFired, this.state.metrics.shotsHit);
      const lines = this.state.mode === "paused"
        ? [
            this.locale === "es" ? "Pulsa P o Escape para volver al combate." : "Press P or Escape to return to combat.",
            this.locale === "es" ? "R reinicia la corrida." : "Press R to restart the run.",
          ]
        : [
            `${this.locale === "es" ? "Score final" : "Final score"}: ${this.state.score}`,
            `${this.locale === "es" ? "Precision" : "Accuracy"}: ${accuracy}%`,
            `${this.locale === "es" ? "Enemigos destruidos" : "Enemies destroyed"}: ${this.state.metrics.enemiesDestroyed}`,
            this.locale === "es" ? "Pulsa Enter o R para una nueva corrida." : "Press Enter or R for a new run.",
          ];
      lines.forEach((line, index) => context.fillText(line, 72, 170 + index * 30));
      context.restore();
    }
  }
}
