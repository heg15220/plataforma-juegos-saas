import React, { useCallback, useEffect, useState } from "react";
import heroActionSprite from "../assets/sprites/hero-action.svg";
import enemyActionSprite from "../assets/sprites/enemy-action.svg";
import wallSprite from "../assets/sprites/wall.svg";
import cloudSprite from "../assets/sprites/cloud.svg";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const ARENA_WIDTH = 11;
const ARENA_HEIGHT = 7;
const MAX_HP = 100;
const MAX_AMMO = 24;
const MAX_GRENADES = 3;
const MAX_FOCUS = 100;
const MAX_MEDKITS = 2;
const COMBAT_TIME = 42;
const TOTAL_ROUNDS = 3;
const ROUND_HP_STEP = 18;

const ENEMY_SPAWN_POINTS = [
  { x: 9, y: 3 },
  { x: 9, y: 1 },
  { x: 9, y: 5 },
  { x: 7, y: 2 },
  { x: 7, y: 4 }
];

const WALLS = new Set([
  "4-1",
  "5-1",
  "6-1",
  "4-5",
  "5-5",
  "6-5",
  "2-3",
  "8-3"
]);

const ENEMY_INTENTS = {
  advance: {
    id: "advance",
    label: "Reposicion tactica",
    minDamage: 0,
    maxDamage: 0
  },
  suppress: {
    id: "suppress",
    label: "Fuego de supresion",
    minDamage: 7,
    maxDamage: 12
  },
  precision: {
    id: "precision",
    label: "Disparo de precision",
    minDamage: 10,
    maxDamage: 16
  },
  breach: {
    id: "breach",
    label: "Asalto cercano",
    minDamage: 11,
    maxDamage: 17
  }
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const keyOf = (x, y) => `${x}-${y}`;

const isBlocked = (x, y) => {
  if (x < 0 || y < 0 || x >= ARENA_WIDTH || y >= ARENA_HEIGHT) {
    return true;
  }
  return WALLS.has(keyOf(x, y));
};

const distance = (pointA, pointB) => {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
};

const hasLineOfSight = (from, to) => {
  if (from.x !== to.x && from.y !== to.y) {
    return false;
  }

  if (from.x === to.x) {
    const minY = Math.min(from.y, to.y);
    const maxY = Math.max(from.y, to.y);
    for (let y = minY + 1; y < maxY; y += 1) {
      if (WALLS.has(keyOf(from.x, y))) {
        return false;
      }
    }
    return true;
  }

  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  for (let x = minX + 1; x < maxX; x += 1) {
    if (WALLS.has(keyOf(x, from.y))) {
      return false;
    }
  }
  return true;
};

const chooseEnemyIntent = (enemy, player, timeLeft) => {
  const range = distance(enemy, player);
  const inSight = hasLineOfSight(enemy, player) && range <= 4;

  if (range <= 1) {
    return ENEMY_INTENTS.breach;
  }

  if (!inSight) {
    return ENEMY_INTENTS.advance;
  }

  if (timeLeft <= 14 && Math.random() < 0.45) {
    return ENEMY_INTENTS.precision;
  }
  if (Math.random() < 0.26) {
    return ENEMY_INTENTS.precision;
  }
  return ENEMY_INTENTS.suppress;
};

const prependLog = (entry, previousLog, secondEntry = null) => {
  const nextLog = secondEntry
    ? [secondEntry, entry, ...previousLog]
    : [entry, ...previousLog];
  return nextLog.slice(0, 10);
};

const createEnemyForRound = (round, player) => {
  const availableSpawns = ENEMY_SPAWN_POINTS.filter((spawn) => {
    return !(spawn.x === player.x && spawn.y === player.y);
  });
  const fallback = ENEMY_SPAWN_POINTS[0];
  const chosen = availableSpawns.length > 0
    ? availableSpawns[randomInt(0, availableSpawns.length - 1)]
    : fallback;
  const hp = MAX_HP + (round - 1) * ROUND_HP_STEP;

  return {
    x: chosen.x,
    y: chosen.y,
    hp
  };
};

const resolveEnemyDefeat = (previous, enemyHp, playerAfterAction) => {
  const player = playerAfterAction ?? previous.player;
  if (enemyHp > 0) {
    const currentEnemy = { ...previous.enemy, hp: enemyHp };
    return {
      enemy: currentEnemy,
      status: previous.status,
      round: previous.round,
      eliminations: previous.eliminations,
      score: previous.score,
      enemyIntent: chooseEnemyIntent(currentEnemy, player, previous.timeLeft),
      resolutionLog: null
    };
  }

  const bonusScore = 110 + previous.round * 40 + Math.max(0, previous.timeLeft);
  const eliminations = previous.eliminations + 1;
  const score = previous.score + bonusScore;

  if (previous.round >= TOTAL_ROUNDS) {
    return {
      enemy: { ...previous.enemy, hp: 0 },
      status: "won",
      round: previous.round,
      eliminations,
      score,
      enemyIntent: null,
      resolutionLog: `Ronda ${previous.round} superada. Victoria final (+${bonusScore} pts).`
    };
  }

  const nextRound = previous.round + 1;
  const nextEnemy = createEnemyForRound(nextRound, player);
  return {
    enemy: nextEnemy,
    status: previous.status,
    round: nextRound,
    eliminations,
    score,
    enemyIntent: chooseEnemyIntent(nextEnemy, player, previous.timeLeft),
    resolutionLog: `Ronda ${previous.round} superada (+${bonusScore} pts). Entra rival de ronda ${nextRound}.`
  };
};

const createInitialState = () => {
  const player = { x: 1, y: 3, hp: MAX_HP };
  const enemy = createEnemyForRound(1, player);
  return {
    status: "idle",
    round: 1,
    eliminations: 0,
    score: 0,
    player,
    enemy,
    ammo: MAX_AMMO,
    grenades: MAX_GRENADES,
    focus: 25,
    medkits: MAX_MEDKITS,
    guard: false,
    timeLeft: COMBAT_TIME,
    burstCooldown: 0,
    rocketCooldown: 0,
    dashCooldown: 0,
    overdriveCooldown: 0,
    guardCooldown: 0,
    reloadCooldown: 0,
    medkitCooldown: 0,
    enemyIntent: chooseEnemyIntent(enemy, player, COMBAT_TIME),
    log: ["Pulsa iniciar combate para entrar en la arena."]
  };
};

const getStepTowardsTarget = (from, target, blocker) => {
  const deltaX = target.x - from.x;
  const deltaY = target.y - from.y;

  const candidates = [];
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    candidates.push({ x: from.x + Math.sign(deltaX), y: from.y });
    candidates.push({ x: from.x, y: from.y + Math.sign(deltaY) });
  } else {
    candidates.push({ x: from.x, y: from.y + Math.sign(deltaY) });
    candidates.push({ x: from.x + Math.sign(deltaX), y: from.y });
  }

  candidates.push({ x: from.x + Math.sign(deltaX), y: from.y });
  candidates.push({ x: from.x, y: from.y + Math.sign(deltaY) });

  for (const candidate of candidates) {
    if (candidate.x === from.x && candidate.y === from.y) {
      continue;
    }

    if (
      !isBlocked(candidate.x, candidate.y) &&
      !(candidate.x === blocker.x && candidate.y === blocker.y)
    ) {
      return candidate;
    }
  }

  return from;
};

const resolveTick = (previous) => {
  if (previous.status !== "playing") {
    return previous;
  }

  const nextTime = Math.max(0, previous.timeLeft - 1);
  let status = previous.status;
  let player = { ...previous.player };
  let enemy = { ...previous.enemy };
  let guard = previous.guard;
  let focus = clamp(previous.focus - 2, 0, MAX_FOCUS);
  let enemyIntent = previous.enemyIntent ?? chooseEnemyIntent(enemy, player, nextTime);

  const burstCooldown = Math.max(0, previous.burstCooldown - 1);
  const rocketCooldown = Math.max(0, previous.rocketCooldown - 1);
  const dashCooldown = Math.max(0, previous.dashCooldown - 1);
  const overdriveCooldown = Math.max(0, previous.overdriveCooldown - 1);
  const guardCooldown = Math.max(0, previous.guardCooldown - 1);
  const reloadCooldown = Math.max(0, previous.reloadCooldown - 1);
  const medkitCooldown = Math.max(0, previous.medkitCooldown - 1);

  const playerInMelee = distance(enemy, player) <= 1;
  const playerInSight = hasLineOfSight(enemy, player) && distance(enemy, player) <= 4;
  let enemyActionLog = "El rival reajusta su posicion.";

  if (enemyIntent.id === "advance" || (!playerInSight && !playerInMelee)) {
    const repositioned = getStepTowardsTarget(enemy, player, player);
    enemy = {
      ...enemy,
      x: repositioned.x,
      y: repositioned.y
    };
    enemyActionLog = "El rival flanquea para buscar mejor linea de tiro.";
  } else {
    const minDamage = enemyIntent.id === "breach"
      ? ENEMY_INTENTS.breach.minDamage
      : enemyIntent.minDamage;
    const maxDamage = enemyIntent.id === "breach"
      ? ENEMY_INTENTS.breach.maxDamage
      : enemyIntent.maxDamage;
    const rawDamage = randomInt(minDamage, maxDamage);
    const appliedDamage = guard ? Math.max(2, Math.floor(rawDamage * 0.45)) : rawDamage;
    player.hp = Math.max(0, player.hp - appliedDamage);
    focus = clamp(focus + (guard ? 8 : 5), 0, MAX_FOCUS);
    enemyActionLog = guard
      ? `Bloqueas parte del ataque (${enemyIntent.label}). Recibes ${appliedDamage}.`
      : `El rival ejecuta ${enemyIntent.label}: ${appliedDamage} de dano.`;
  }

  guard = false;
  let resolutionLog = null;

  if (player.hp <= 0) {
    status = "lost";
    resolutionLog = "Has caido en combate.";
  } else if (nextTime === 0 && enemy.hp > 0) {
    status = "lost";
    resolutionLog = "Se agota el tiempo y el rival sigue en pie.";
  }

  if (status === "playing" && enemy.hp > 0) {
    enemyIntent = chooseEnemyIntent(enemy, player, nextTime);
  }

  return {
    ...previous,
    player,
    enemy,
    guard,
    focus,
    timeLeft: nextTime,
    burstCooldown,
    rocketCooldown,
    dashCooldown,
    overdriveCooldown,
    guardCooldown,
    reloadCooldown,
    medkitCooldown,
    enemyIntent,
    status,
    log: prependLog(enemyActionLog, previous.log, resolutionLog)
  };
};

function ActionGame() {
  const [state, setState] = useState(createInitialState);

  useEffect(() => {
    if (state.status !== "playing") {
      return undefined;
    }

    const tickId = window.setInterval(() => {
      setState((previous) => resolveTick(previous));
    }, 900);

    return () => {
      window.clearInterval(tickId);
    };
  }, [state.status]);

  const movePlayer = (deltaX, deltaY) => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }

      const targetX = previous.player.x + deltaX;
      const targetY = previous.player.y + deltaY;
      if (isBlocked(targetX, targetY)) {
        return previous;
      }
      if (targetX === previous.enemy.x && targetY === previous.enemy.y) {
        return previous;
      }

      return {
        ...previous,
        player: { ...previous.player, x: targetX, y: targetY },
        focus: clamp(previous.focus + 2, 0, MAX_FOCUS)
      };
    });
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const directionMap = {
        arrowup: [0, -1],
        w: [0, -1],
        arrowdown: [0, 1],
        s: [0, 1],
        arrowleft: [-1, 0],
        a: [-1, 0],
        arrowright: [1, 0],
        d: [1, 0]
      };

      const delta = directionMap[key];
      if (delta) {
        event.preventDefault();
        movePlayer(delta[0], delta[1]);
        return;
      }

      if (key === "j") {
        event.preventDefault();
        burstFire();
      } else if (key === "k") {
        event.preventDefault();
        rocketStrike();
      } else if (key === "u") {
        event.preventDefault();
        dashStrike();
      } else if (key === "l") {
        event.preventDefault();
        overdriveShot();
      } else if (key === "i") {
        event.preventDefault();
        guardUp();
      } else if (key === "o") {
        event.preventDefault();
        reloadWeapon();
      } else if (key === "p") {
        event.preventDefault();
        useMedkit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const startCombat = () => {
    const initial = createInitialState();
    setState({
      ...initial,
      status: "playing",
      enemyIntent: chooseEnemyIntent(initial.enemy, initial.player, COMBAT_TIME),
      log: [`La arena se activa. Objetivo: ${TOTAL_ROUNDS} rondas.`]
    });
  };

  const burstFire = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.burstCooldown > 0) {
        return previous;
      }
      if (previous.ammo < 4) {
        return {
          ...previous,
          log: prependLog("Municion insuficiente para rafaga.", previous.log)
        };
      }

      const ammo = previous.ammo - 4;
      const inSight =
        hasLineOfSight(previous.player, previous.enemy) &&
        distance(previous.player, previous.enemy) <= 4;

      if (!inSight) {
        return {
          ...previous,
          ammo,
          focus: clamp(previous.focus + 4, 0, MAX_FOCUS),
          burstCooldown: 1,
          log: prependLog("Rafaga sin linea de tiro.", previous.log)
        };
      }

      const damage = randomInt(12, 18) + Math.floor(previous.focus / 40);
      const enemyHp = Math.max(0, previous.enemy.hp - damage);
      const outcome = resolveEnemyDefeat(previous, enemyHp, previous.player);

      return {
        ...previous,
        enemy: outcome.enemy,
        round: outcome.round,
        eliminations: outcome.eliminations,
        score: outcome.score,
        ammo,
        focus: clamp(previous.focus + 8, 0, MAX_FOCUS),
        burstCooldown: 1,
        enemyIntent: outcome.enemyIntent,
        status: outcome.status,
        log: prependLog(`Rafaga conecta por ${damage} de dano.`, previous.log, outcome.resolutionLog)
      };
    });
  };

  const rocketStrike = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.rocketCooldown > 0) {
        return previous;
      }
      if (previous.grenades <= 0) {
        return {
          ...previous,
          log: prependLog("Sin cohetes disponibles.", previous.log)
        };
      }

      const inRange = distance(previous.player, previous.enemy) <= 5;
      const inSight = hasLineOfSight(previous.player, previous.enemy);
      const canHitDirect = inRange || inSight;
      const damage = canHitDirect ? randomInt(24, 34) : randomInt(5, 9);
      const enemyHp = Math.max(0, previous.enemy.hp - damage);
      const outcome = resolveEnemyDefeat(previous, enemyHp, previous.player);

      return {
        ...previous,
        enemy: outcome.enemy,
        round: outcome.round,
        eliminations: outcome.eliminations,
        score: outcome.score,
        grenades: previous.grenades - 1,
        focus: clamp(previous.focus + 6, 0, MAX_FOCUS),
        rocketCooldown: 3,
        enemyIntent: outcome.enemyIntent,
        status: outcome.status,
        log: prependLog(`Cohete impacta por ${damage} de dano.`, previous.log, outcome.resolutionLog)
      };
    });
  };

  const dashStrike = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.dashCooldown > 0) {
        return previous;
      }

      const nextPos = getStepTowardsTarget(previous.player, previous.enemy, previous.enemy);
      let damage = 0;
      let enemyHp = previous.enemy.hp;

      if (distance(nextPos, previous.enemy) <= 1) {
        damage = randomInt(8, 14);
        enemyHp = Math.max(0, previous.enemy.hp - damage);
      }

      const dashLog =
        damage > 0
          ? `Embestida: reposicion y ${damage} de dano.`
          : "Embestida tactica sin impacto directo.";
      const outcome = resolveEnemyDefeat(previous, enemyHp, nextPos);

      return {
        ...previous,
        player: { ...previous.player, x: nextPos.x, y: nextPos.y },
        enemy: outcome.enemy,
        round: outcome.round,
        eliminations: outcome.eliminations,
        score: outcome.score,
        focus: clamp(previous.focus + (damage > 0 ? 9 : 4), 0, MAX_FOCUS),
        dashCooldown: 4,
        enemyIntent: outcome.enemyIntent,
        status: outcome.status,
        log: prependLog(dashLog, previous.log, outcome.resolutionLog)
      };
    });
  };

  const overdriveShot = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.overdriveCooldown > 0) {
        return previous;
      }
      if (previous.focus < 55) {
        return {
          ...previous,
          log: prependLog("Foco insuficiente para overdrive.", previous.log)
        };
      }
      if (previous.ammo < 6) {
        return {
          ...previous,
          log: prependLog("Municion insuficiente para overdrive.", previous.log)
        };
      }

      const inSight =
        hasLineOfSight(previous.player, previous.enemy) &&
        distance(previous.player, previous.enemy) <= 5;
      const damage = inSight ? randomInt(26, 36) : randomInt(10, 14);
      const enemyHp = Math.max(0, previous.enemy.hp - damage);
      const outcome = resolveEnemyDefeat(previous, enemyHp, previous.player);

      return {
        ...previous,
        enemy: outcome.enemy,
        round: outcome.round,
        eliminations: outcome.eliminations,
        score: outcome.score,
        ammo: previous.ammo - 6,
        focus: clamp(previous.focus - 55, 0, MAX_FOCUS),
        overdriveCooldown: 4,
        burstCooldown: Math.max(1, previous.burstCooldown),
        enemyIntent: outcome.enemyIntent,
        status: outcome.status,
        log: prependLog(
          `Overdrive impacta por ${damage} de dano.`,
          previous.log,
          outcome.resolutionLog
        )
      };
    });
  };

  const guardUp = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.guardCooldown > 0) {
        return previous;
      }

      return {
        ...previous,
        guard: true,
        focus: clamp(previous.focus + 5, 0, MAX_FOCUS),
        guardCooldown: 3,
        log: prependLog("Postura defensiva activada.", previous.log)
      };
    });
  };

  const reloadWeapon = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.reloadCooldown > 0) {
        return previous;
      }
      if (previous.ammo >= MAX_AMMO) {
        return {
          ...previous,
          log: prependLog("Municion completa.", previous.log)
        };
      }

      const recovered = Math.min(MAX_AMMO, previous.ammo + 8);
      return {
        ...previous,
        ammo: recovered,
        focus: clamp(previous.focus + 3, 0, MAX_FOCUS),
        reloadCooldown: 2,
        log: prependLog(`Recarga completada: ${recovered}/${MAX_AMMO}.`, previous.log)
      };
    });
  };

  const useMedkit = () => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.medkitCooldown > 0) {
        return previous;
      }
      if (previous.medkits <= 0) {
        return {
          ...previous,
          log: prependLog("No quedan botiquines.", previous.log)
        };
      }
      if (previous.player.hp >= MAX_HP) {
        return {
          ...previous,
          log: prependLog("Vida al maximo, guarda el botiquin.", previous.log)
        };
      }

      const heal = randomInt(18, 28);
      const hp = Math.min(MAX_HP, previous.player.hp + heal);
      return {
        ...previous,
        player: { ...previous.player, hp },
        medkits: previous.medkits - 1,
        focus: clamp(previous.focus + 10, 0, MAX_FOCUS),
        medkitCooldown: 3,
        log: prependLog(`Botiquin aplicado: +${heal} vida.`, previous.log)
      };
    });
  };

  const statusLabel =
    state.status === "won"
      ? "Victoria"
      : state.status === "lost"
        ? "Derrota"
        : state.status === "playing"
          ? "Combate activo"
          : "Pendiente";

  const enemyHasSight =
    hasLineOfSight(state.enemy, state.player) && distance(state.enemy, state.player) <= 4;
  const playerHasSight =
    hasLineOfSight(state.player, state.enemy) && distance(state.player, state.enemy) <= 4;
  const enemyMaxHp = MAX_HP + (state.round - 1) * ROUND_HP_STEP;

  const buildTextPayload = useCallback((snapshot) => {
    const snapshotEnemyMaxHp = MAX_HP + (snapshot.round - 1) * ROUND_HP_STEP;
    return {
      mode: "action",
      coordinates: "origin_top_left_x_right_y_down",
      status: snapshot.status,
      timeLeft: snapshot.timeLeft,
      rounds: {
        current: snapshot.round,
        total: TOTAL_ROUNDS,
        eliminations: snapshot.eliminations
      },
      score: snapshot.score,
      player: {
        x: snapshot.player.x,
        y: snapshot.player.y,
        hp: snapshot.player.hp,
        ammo: snapshot.ammo,
        grenades: snapshot.grenades,
        focus: snapshot.focus,
        medkits: snapshot.medkits,
        guard: snapshot.guard
      },
      enemy: {
        x: snapshot.enemy.x,
        y: snapshot.enemy.y,
        hp: snapshot.enemy.hp,
        maxHp: snapshotEnemyMaxHp
      },
      intent: snapshot.enemyIntent
        ? {
          id: snapshot.enemyIntent.id,
          label: snapshot.enemyIntent.label,
          projectedDamage: [snapshot.enemyIntent.minDamage, snapshot.enemyIntent.maxDamage]
        }
        : null,
      cooldowns: {
        burst: snapshot.burstCooldown,
        rocket: snapshot.rocketCooldown,
        dash: snapshot.dashCooldown,
        overdrive: snapshot.overdriveCooldown,
        guard: snapshot.guardCooldown,
        reload: snapshot.reloadCooldown,
        medkit: snapshot.medkitCooldown
      },
      walls: [...WALLS],
      log: snapshot.log.slice(0, 3)
    };
  }, []);

  const advanceTime = useCallback((ms) => {
    const steps = Math.floor(ms / 900);
    if (steps <= 0) {
      return;
    }
    setState((previous) => {
      let next = previous;
      for (let index = 0; index < steps; index += 1) {
        next = resolveTick(next);
      }
      return next;
    });
  }, []);

  useGameRuntimeBridge(state, buildTextPayload, advanceTime);

  return (
    <div className="mini-game action-game">
      <div className="mini-head">
        <div>
          <h4>Modo Accion</h4>
          <p>Arena shooter por rondas cortas, al estilo browser arcade competitivo.</p>
        </div>
        <button type="button" onClick={startCombat}>
          {state.status === "playing" ? "Reiniciar combate" : "Iniciar combate"}
        </button>
      </div>

      <div className="status-row">
        <span className={`status-pill ${state.status}`}>{statusLabel}</span>
        <span>Tiempo: {state.timeLeft}s</span>
        <span>Ronda: {state.round}/{TOTAL_ROUNDS}</span>
        <span>Municion: {state.ammo}/{MAX_AMMO}</span>
        <span>Cohetes: {state.grenades}/{MAX_GRENADES}</span>
        <span>Foco: {state.focus}%</span>
        <span>Score: {state.score}</span>
        <span>Botiquines: {state.medkits}</span>
      </div>

      <p className="intent-banner">
        Intencion rival: {state.enemyIntent?.label ?? "-"}{" "}
        {state.enemyIntent
          ? `(${state.enemyIntent.minDamage}-${state.enemyIntent.maxDamage} dano potencial)`
          : ""}
      </p>

      <div className="meter-stack">
        <div className="meter-line">
          <p>Rondas completadas</p>
          <div className="meter-track">
            <span
              className="meter-fill race"
              style={{ width: `${(state.eliminations / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
          <strong>{state.eliminations}/{TOTAL_ROUNDS}</strong>
        </div>
        <div className="meter-line">
          <p>Vida heroe</p>
          <div className="meter-track">
            <span className="meter-fill player" style={{ width: `${state.player.hp}%` }} />
          </div>
          <strong>{state.player.hp}</strong>
        </div>
        <div className="meter-line">
          <p>Vida rival</p>
          <div className="meter-track">
            <span
              className="meter-fill enemy"
              style={{
                width: `${Math.min(100, Math.max(0, (state.enemy.hp / enemyMaxHp) * 100))}%`
              }}
            />
          </div>
          <strong>{state.enemy.hp}/{enemyMaxHp}</strong>
        </div>
        <div className="meter-line">
          <p>Cargador</p>
          <div className="meter-track">
            <span
              className="meter-fill quiz"
              style={{ width: `${(state.ammo / MAX_AMMO) * 100}%` }}
            />
          </div>
          <strong>{Math.round((state.ammo / MAX_AMMO) * 100)}%</strong>
        </div>
        <div className="meter-line">
          <p>Foco tactico</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: `${state.focus}%` }} />
          </div>
          <strong>{state.focus}%</strong>
        </div>
      </div>

      <div
        className="action-arena stage-grid"
        style={{ "--stage-cols": ARENA_WIDTH }}
        aria-label="Mapa de accion"
      >
        <div className="map-sky-strip arena-sky" aria-hidden="true">
          <img src={cloudSprite} alt="" className="sky-cloud cloud-a" />
          <img src={cloudSprite} alt="" className="sky-cloud cloud-b" />
        </div>

        {Array.from({ length: ARENA_HEIGHT }).map((_, row) =>
          Array.from({ length: ARENA_WIDTH }).map((__, column) => {
            const wall = WALLS.has(keyOf(column, row));
            const isPlayer = state.player.x === column && state.player.y === row;
            const isEnemy = state.enemy.x === column && state.enemy.y === row;
            const nearRange = distance(state.player, { x: column, y: row }) <= 1;
            const inPlayerLine =
              !wall &&
              ((column === state.player.x && Math.abs(row - state.player.y) <= 4) ||
                (row === state.player.y && Math.abs(column - state.player.x) <= 4));

            const classes = [
              "stage-cell",
              "action-cell",
              wall ? "wall" : "floor",
              nearRange ? "near-range" : "",
              inPlayerLine ? "line-sight" : "",
              isPlayer ? "player" : "",
              isEnemy ? "enemy" : "",
              state.guard && isPlayer ? "guarding" : "",
              enemyHasSight && isPlayer ? "enemy-aiming" : "",
              playerHasSight && isEnemy ? "target-lock" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={`${row}-${column}`} className={classes}>
                {wall && (
                  <img
                    src={wallSprite}
                    alt=""
                    className="map-scenery wall-art"
                  />
                )}
                {isPlayer && (
                  <img
                    src={heroActionSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-action-hero"
                  />
                )}
                {isEnemy && (
                  <img
                    src={enemyActionSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-action-enemy"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="action-move-buttons">
        <button type="button" onClick={() => movePlayer(0, -1)} disabled={state.status !== "playing"}>
          Arriba
        </button>
        <button type="button" onClick={() => movePlayer(-1, 0)} disabled={state.status !== "playing"}>
          Izquierda
        </button>
        <button type="button" onClick={() => movePlayer(1, 0)} disabled={state.status !== "playing"}>
          Derecha
        </button>
        <button type="button" onClick={() => movePlayer(0, 1)} disabled={state.status !== "playing"}>
          Abajo
        </button>
      </div>

      <div className="action-buttons">
        <button
          type="button"
          onClick={burstFire}
          disabled={state.status !== "playing" || state.burstCooldown > 0}
        >
          Rafaga {state.burstCooldown > 0 ? `(${state.burstCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={rocketStrike}
          disabled={state.status !== "playing" || state.rocketCooldown > 0}
        >
          Cohete {state.rocketCooldown > 0 ? `(${state.rocketCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={dashStrike}
          disabled={state.status !== "playing" || state.dashCooldown > 0}
        >
          Embestida {state.dashCooldown > 0 ? `(${state.dashCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={overdriveShot}
          disabled={state.status !== "playing" || state.overdriveCooldown > 0 || state.focus < 55}
        >
          Overdrive {state.overdriveCooldown > 0 ? `(${state.overdriveCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={guardUp}
          disabled={state.status !== "playing" || state.guardCooldown > 0}
        >
          Guardia {state.guardCooldown > 0 ? `(${state.guardCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={reloadWeapon}
          disabled={state.status !== "playing" || state.reloadCooldown > 0}
        >
          Recargar {state.reloadCooldown > 0 ? `(${state.reloadCooldown})` : ""}
        </button>
        <button
          type="button"
          onClick={useMedkit}
          disabled={state.status !== "playing" || state.medkitCooldown > 0 || state.medkits <= 0}
        >
          Botiquin {state.medkitCooldown > 0 ? `(${state.medkitCooldown})` : ""}
        </button>
      </div>

      <ul className="game-log">
        {state.log.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default ActionGame;
