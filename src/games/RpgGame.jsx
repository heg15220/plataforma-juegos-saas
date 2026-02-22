import React, { useCallback, useEffect, useMemo, useState } from "react";
import heroRpgSprite from "../assets/sprites/hero-rpg.svg";
import enemyRpgSprite from "../assets/sprites/enemy-rpg.svg";
import gateSprite from "../assets/sprites/gate.svg";
import treeSprite from "../assets/sprites/tree.svg";
import ruinSprite from "../assets/sprites/ruin.svg";
import wallSprite from "../assets/sprites/wall.svg";
import cloudSprite from "../assets/sprites/cloud.svg";
import shrineSprite from "../assets/sprites/shrine.svg";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const MAP_SIZE = 8;
const START_POSITION = { x: 0, y: MAP_SIZE - 1 };
const EXIT_POSITION = { x: MAP_SIZE - 1, y: 0 };
const CONTRACT_GOAL = 3;
const MAX_RELIC_SHARDS = 9;

const WALLS = new Set(["2-1", "2-2", "2-3", "3-5", "4-5", "5-5", "5-4"]);

const SANCTUARIES = [
  { id: "shrine-1", x: 0, y: 5, name: "Santuario del Alba" },
  { id: "shrine-2", x: 3, y: 3, name: "Santuario de Ceniza" },
  { id: "shrine-3", x: 7, y: 7, name: "Santuario del Umbral" }
];

const SCENERY = {
  "1-6": treeSprite,
  "3-6": treeSprite,
  "6-6": treeSprite,
  "1-4": ruinSprite,
  "4-1": ruinSprite,
  "6-3": ruinSprite,
  "0-2": treeSprite,
  "7-5": treeSprite
};

const ENEMY_INTENTS = [
  {
    id: "slash",
    label: "Corte rapido",
    multiplier: 1,
    manaDrain: 0
  },
  {
    id: "crush",
    label: "Golpe demoledor",
    multiplier: 1.28,
    manaDrain: 0
  },
  {
    id: "drain",
    label: "Drenaje arcano",
    multiplier: 0.92,
    manaDrain: 5
  }
];

const ENEMY_SPAWNS = [
  {
    id: "enemy-1",
    name: "Bandido de ceniza",
    x: 1,
    y: 1,
    maxHp: 48,
    minDamage: 7,
    maxDamage: 11,
    xpReward: 40
  },
  {
    id: "enemy-2",
    name: "Wyrm escarlata",
    x: 4,
    y: 2,
    maxHp: 62,
    minDamage: 9,
    maxDamage: 14,
    xpReward: 55
  },
  {
    id: "enemy-3",
    name: "Sentinela runico",
    x: 6,
    y: 4,
    maxHp: 74,
    minDamage: 10,
    maxDamage: 16,
    xpReward: 75
  },
  {
    id: "enemy-4",
    name: "Caballero abisal",
    x: 6,
    y: 1,
    maxHp: 86,
    minDamage: 12,
    maxDamage: 19,
    xpReward: 95
  }
];

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const keyOf = (x, y) => `${x}-${y}`;

const xpToNextLevel = (level) => 80 + level * 35;

const truncateLog = (entries) => entries.slice(0, 10);

const createInitialPlayer = () => ({
  x: START_POSITION.x,
  y: START_POSITION.y,
  level: 1,
  xp: 0,
  hp: 95,
  maxHp: 95,
  mana: 32,
  maxMana: 32,
  potions: 2
});

const createEnemies = () => {
  return ENEMY_SPAWNS.map((enemy) => ({
    ...enemy,
    alive: true
  }));
};

const rollEnemyIntent = () => {
  const value = Math.random();
  if (value < 0.5) {
    return ENEMY_INTENTS[0];
  }
  if (value < 0.82) {
    return ENEMY_INTENTS[1];
  }
  return ENEMY_INTENTS[2];
};

const createInitialState = () => ({
  status: "idle",
  phase: "explore",
  turn: 0,
  contractsCleared: 0,
  relicShards: 0,
  player: createInitialPlayer(),
  enemies: createEnemies(),
  activeEnemyId: null,
  activeEnemyHp: 0,
  activeEnemyMaxHp: 0,
  enemyIntent: null,
  defending: false,
  focusStacks: 0,
  sanctuariesUsed: [],
  message: "Pulsa iniciar aventura para entrar en Emberfall.",
  log: ["Mapa preparado. Esperando al heroe."]
});

const getEnemyById = (enemies, id) => enemies.find((enemy) => enemy.id === id);

const getEnemyAt = (enemies, x, y) => {
  return enemies.find((enemy) => enemy.alive && enemy.x === x && enemy.y === y);
};

const getSanctuaryAt = (x, y) => {
  return SANCTUARIES.find((sanctuary) => sanctuary.x === x && sanctuary.y === y) ?? null;
};

const areAllEnemiesDefeated = (enemies) => {
  return enemies.every((enemy) => !enemy.alive);
};

const canMoveTo = (x, y) => {
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) {
    return false;
  }
  return !WALLS.has(keyOf(x, y));
};

function RpgGame() {
  const [state, setState] = useState(createInitialState);

  const activeEnemy = useMemo(() => {
    return getEnemyById(state.enemies, state.activeEnemyId) ?? null;
  }, [state.enemies, state.activeEnemyId]);

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
        performAction("attack");
      } else if (key === "k") {
        event.preventDefault();
        performAction("skill");
      } else if (key === "l") {
        event.preventDefault();
        performAction("defend");
      } else if (key === "i") {
        event.preventDefault();
        performAction("focus");
      } else if (key === "u") {
        event.preventDefault();
        performAction("summon");
      } else if (key === "p") {
        event.preventDefault();
        performAction("potion");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const startAdventure = () => {
    setState({
      ...createInitialState(),
      status: "playing",
      phase: "explore",
      message: "Explora la mazmorra y derrota a los guardianes.",
      log: ["La expedicion comienza en las ruinas de Emberfall."]
    });
  };

  const movePlayer = (deltaX, deltaY) => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.phase !== "explore") {
        return previous;
      }

      const nextX = previous.player.x + deltaX;
      const nextY = previous.player.y + deltaY;
      if (!canMoveTo(nextX, nextY)) {
        return previous;
      }

      const player = {
        ...previous.player,
        x: nextX,
        y: nextY
      };
      let phase = previous.phase;
      let activeEnemyId = previous.activeEnemyId;
      let activeEnemyHp = previous.activeEnemyHp;
      let activeEnemyMaxHp = previous.activeEnemyMaxHp;
      let enemyIntent = previous.enemyIntent;
      let focusStacks = previous.focusStacks;
      let sanctuariesUsed = previous.sanctuariesUsed;
      let message = `Te mueves a la casilla ${nextX + 1}-${nextY + 1}.`;
      let log = previous.log;

      const sanctuary = getSanctuaryAt(nextX, nextY);
      if (sanctuary && !previous.sanctuariesUsed.includes(sanctuary.id)) {
        sanctuariesUsed = [...previous.sanctuariesUsed, sanctuary.id];
        player.hp = Math.min(player.maxHp, player.hp + 18);
        player.mana = Math.min(player.maxMana, player.mana + 10);
        player.potions = Math.min(3, player.potions + 1);
        focusStacks = Math.min(3, focusStacks + 1);
        message = `${sanctuary.name} activado: recuperas recursos y potencia de enfoque.`;
        log = truncateLog([message, ...log]);
      }

      const enemy = getEnemyAt(previous.enemies, nextX, nextY);
      if (enemy) {
        const encounterScale = 1 + Math.min(0.22, Math.max(0, player.level - 1) * 0.05);
        const scaledHp = Math.round(enemy.maxHp * encounterScale);
        phase = "combat";
        activeEnemyId = enemy.id;
        activeEnemyHp = scaledHp;
        activeEnemyMaxHp = scaledHp;
        enemyIntent = rollEnemyIntent();
        message = `Encuentro iniciado contra ${enemy.name}.`;
        log = truncateLog([message, ...log]);
      } else if (nextX === EXIT_POSITION.x && nextY === EXIT_POSITION.y) {
        if (areAllEnemiesDefeated(previous.enemies)) {
          return {
            ...previous,
            player,
            sanctuariesUsed,
            focusStacks,
            status: "won",
            message: "Abres la puerta final y completas la expedicion.",
            log: truncateLog(["Victoria final en Emberfall.", ...log])
          };
        }
        message = "La puerta final sigue sellada. Faltan enemigos por derrotar.";
        log = truncateLog([message, ...log]);
      }

      return {
        ...previous,
        player,
        phase,
        activeEnemyId,
        activeEnemyHp,
        activeEnemyMaxHp,
        enemyIntent,
        focusStacks,
        sanctuariesUsed,
        message,
        log
      };
    });
  };

  const performAction = (action) => {
    setState((previous) => {
      if (previous.status !== "playing" || previous.phase !== "combat") {
        return previous;
      }

      const enemy = getEnemyById(previous.enemies, previous.activeEnemyId);
      if (!enemy) {
        return previous;
      }

      const player = { ...previous.player };
      let enemies = [...previous.enemies];
      let enemyHp = previous.activeEnemyHp;
      let defending = previous.defending;
      let phase = previous.phase;
      let status = previous.status;
      let message = previous.message;
      let focusStacks = previous.focusStacks;
      let contractsCleared = previous.contractsCleared;
      let relicShards = previous.relicShards;
      let enemyIntent = previous.enemyIntent ?? rollEnemyIntent();
      const logs = [...previous.log];
      const pushLog = (entry) => logs.unshift(entry);

      if (action === "attack") {
        const contractBonus = contractsCleared * 2;
        const damage = randomInt(11, 17) + Math.floor(player.level * 1.5) + contractBonus;
        enemyHp = Math.max(0, enemyHp - damage);
        pushLog(`Atacas y causas ${damage} de dano.`);
      } else if (action === "skill") {
        if (player.mana < 9) {
          pushLog("Mana insuficiente para habilidad.");
          return {
            ...previous,
            log: truncateLog(logs),
            message: "Necesitas mas mana."
          };
        }

        player.mana -= 9;
        const focusBonus = focusStacks * 8;
        const contractBonus = contractsCleared * 3;
        const damage = randomInt(18, 28) + player.level * 2 + focusBonus + contractBonus;
        enemyHp = Math.max(0, enemyHp - damage);
        focusStacks = 0;
        pushLog(`Descarga arcana inflige ${damage} de dano.`);
      } else if (action === "defend") {
        defending = true;
        player.mana = Math.min(player.maxMana, player.mana + 3);
        focusStacks = Math.min(3, focusStacks + 1);
        pushLog("Te cubres y preparas defensa.");
      } else if (action === "focus") {
        player.mana = Math.min(player.maxMana, player.mana + 5);
        focusStacks = Math.min(3, focusStacks + 1);
        pushLog("Canalizas enfoque para potenciar proxima habilidad.");
      } else if (action === "summon") {
        if (relicShards < 3) {
          pushLog("No tienes suficientes fragmentos para invocar.");
          return {
            ...previous,
            log: truncateLog(logs),
            message: "Necesitas 3 fragmentos de reliquia."
          };
        }

        relicShards -= 3;
        const damage = randomInt(24, 34) + player.level * 2;
        enemyHp = Math.max(0, enemyHp - damage);
        player.hp = Math.min(player.maxHp, player.hp + 8);
        pushLog(`Invocacion ancestral: ${damage} de dano y +8 vida.`);
      } else if (action === "potion") {
        if (player.potions <= 0) {
          pushLog("No quedan pociones.");
          return {
            ...previous,
            log: truncateLog(logs),
            message: "Inventario vacio."
          };
        }

        player.potions -= 1;
        const heal = randomInt(18, 28);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        pushLog(`Usas pocion y recuperas ${heal} de vida.`);
      }

      if (enemyHp <= 0) {
        pushLog(`Derrotas a ${enemy.name}.`);
        player.xp += enemy.xpReward;
        player.mana = Math.min(player.maxMana, player.mana + 6);
        focusStacks = Math.min(3, focusStacks + 1);
        const shardDrop = randomInt(1, 2);
        relicShards = Math.min(MAX_RELIC_SHARDS, relicShards + shardDrop);
        contractsCleared = Math.min(CONTRACT_GOAL, contractsCleared + 1);
        pushLog(`Botin: +${shardDrop} fragmentos (${relicShards}/${MAX_RELIC_SHARDS}).`);
        if (contractsCleared >= CONTRACT_GOAL) {
          pushLog("Contrato principal completado: dano base mejorado.");
        }

        while (player.xp >= xpToNextLevel(player.level)) {
          player.xp -= xpToNextLevel(player.level);
          player.level += 1;
          player.maxHp += 14;
          player.maxMana += 7;
          player.hp = Math.min(player.maxHp, player.hp + 18);
          player.mana = Math.min(player.maxMana, player.mana + 10);
          pushLog(`Subes a nivel ${player.level}. Estadisticas aumentadas.`);
        }

        enemies = enemies.map((item) => {
          if (item.id === enemy.id) {
            return { ...item, alive: false };
          }
          return item;
        });

        phase = "explore";
        message = "Combate ganado. Continua explorando hacia la salida.";

        return {
          ...previous,
          turn: previous.turn + 1,
          player,
          enemies,
          phase,
          activeEnemyId: null,
          activeEnemyHp: 0,
          activeEnemyMaxHp: 0,
          enemyIntent: null,
          defending: false,
          focusStacks,
          contractsCleared,
          relicShards,
          message,
          log: truncateLog(logs)
        };
      }

      let enemyDamage = Math.round(
        randomInt(enemy.minDamage, enemy.maxDamage) * enemyIntent.multiplier
      );
      if (defending) {
        enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
        pushLog("Defensa activa: dano reducido.");
      }

      if (enemyIntent.manaDrain > 0) {
        player.mana = Math.max(0, player.mana - enemyIntent.manaDrain);
        pushLog(`El enemigo drena ${enemyIntent.manaDrain} de mana.`);
      }

      player.hp = Math.max(0, player.hp - enemyDamage);
      player.mana = Math.min(player.maxMana, player.mana + 2);
      defending = false;
      pushLog(`${enemy.name} ejecuta ${enemyIntent.label} por ${enemyDamage}.`);

      if (player.hp <= 0) {
        status = "lost";
        message = "Has sido derrotado en Emberfall.";
        pushLog(message);
      } else {
        enemyIntent = rollEnemyIntent();
        message = `Combate activo contra ${enemy.name}.`;
      }

      return {
        ...previous,
        turn: previous.turn + 1,
        player,
        enemies,
        activeEnemyHp: enemyHp,
        enemyIntent,
        defending,
        phase,
        status,
        focusStacks,
        contractsCleared,
        relicShards,
        message,
        log: truncateLog(logs)
      };
    });
  };

  const statusLabel =
    state.status === "won"
      ? "Victoria"
      : state.status === "lost"
        ? "Derrota"
        : state.phase === "combat"
          ? "Combate"
          : "Exploracion";

  const nextLevelXp = xpToNextLevel(state.player.level);
  const xpProgress = (state.player.xp / nextLevelXp) * 100;
  const aliveEnemies = state.enemies.filter((enemy) => enemy.alive).length;
  const contractProgress = (state.contractsCleared / CONTRACT_GOAL) * 100;
  const objectiveProgress =
    ((ENEMY_SPAWNS.length - aliveEnemies) / ENEMY_SPAWNS.length) * 60 +
    (state.sanctuariesUsed.length / SANCTUARIES.length) * 20 +
    contractProgress * 0.2;

  const buildTextPayload = useCallback((snapshot) => {
    return {
      mode: "rpg",
      coordinates: "origin_top_left_x_right_y_down",
      status: snapshot.status,
      phase: snapshot.phase,
      turn: snapshot.turn,
      player: {
        x: snapshot.player.x,
        y: snapshot.player.y,
        level: snapshot.player.level,
        xp: snapshot.player.xp,
        hp: snapshot.player.hp,
        maxHp: snapshot.player.maxHp,
        mana: snapshot.player.mana,
        maxMana: snapshot.player.maxMana,
        potions: snapshot.player.potions,
        focusStacks: snapshot.focusStacks,
        relicShards: snapshot.relicShards,
        contractsCleared: snapshot.contractsCleared
      },
      enemy: snapshot.activeEnemyId
        ? {
          id: snapshot.activeEnemyId,
          hp: snapshot.activeEnemyHp,
          maxHp: snapshot.activeEnemyMaxHp,
          intent: snapshot.enemyIntent?.id ?? null
        }
        : null,
      sanctuariesUsed: snapshot.sanctuariesUsed,
      aliveEnemies: snapshot.enemies.filter((enemy) => enemy.alive).map((enemy) => ({
        id: enemy.id,
        x: enemy.x,
        y: enemy.y
      })),
      exit: EXIT_POSITION,
      message: snapshot.message
    };
  }, []);

  const advanceTime = useCallback(() => {
    // RPG por turnos: el tiempo no avanza sin accion del jugador.
  }, []);

  useGameRuntimeBridge(state, buildTextPayload, advanceTime);

  return (
    <div className="mini-game rpg-game">
      <div className="mini-head">
        <div>
          <h4>Modo RPG</h4>
          <p>Mazmorra 2D con botin, contratos y combate tactico por turnos.</p>
        </div>
        <button type="button" onClick={startAdventure}>
          {state.status === "playing" ? "Reiniciar aventura" : "Iniciar aventura"}
        </button>
      </div>

      <div className="status-row">
        <span className={`status-pill ${state.status}`}>{statusLabel}</span>
        <span>Nivel: {state.player.level}</span>
        <span>Turno: {state.turn}</span>
        <span>Enemigos vivos: {aliveEnemies}</span>
        <span>Pociones: {state.player.potions}</span>
        <span>Fragmentos: {state.relicShards}</span>
        <span>Contratos: {state.contractsCleared}/{CONTRACT_GOAL}</span>
        <span>Enfoque: {state.focusStacks}/3</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Objetivo principal</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: `${objectiveProgress}%` }} />
          </div>
          <strong>{Math.round(objectiveProgress)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Santuarios activados</p>
          <div className="meter-track">
            <span
              className="meter-fill mana"
              style={{ width: `${(state.sanctuariesUsed.length / SANCTUARIES.length) * 100}%` }}
            />
          </div>
          <strong>{state.sanctuariesUsed.length}/{SANCTUARIES.length}</strong>
        </div>
        <div className="meter-line compact">
          <p>Progreso de contrato</p>
          <div className="meter-track">
            <span className="meter-fill race" style={{ width: `${contractProgress}%` }} />
          </div>
          <strong>{state.contractsCleared}/{CONTRACT_GOAL}</strong>
        </div>
      </div>

      <div className="combat-layout">
        <article className="combat-card">
          <h5>Heroe</h5>
          <div className="meter-line compact">
            <p>Vida</p>
            <div className="meter-track">
              <span
                className="meter-fill player"
                style={{ width: `${(state.player.hp / state.player.maxHp) * 100}%` }}
              />
            </div>
            <strong>{state.player.hp}/{state.player.maxHp}</strong>
          </div>
          <div className="meter-line compact">
            <p>Mana</p>
            <div className="meter-track">
              <span
                className="meter-fill mana"
                style={{ width: `${(state.player.mana / state.player.maxMana) * 100}%` }}
              />
            </div>
            <strong>{state.player.mana}/{state.player.maxMana}</strong>
          </div>
          <div className="meter-line compact">
            <p>XP</p>
            <div className="meter-track">
              <span className="meter-fill xp" style={{ width: `${Math.min(100, xpProgress)}%` }} />
            </div>
            <strong>{state.player.xp}/{nextLevelXp}</strong>
          </div>
        </article>

        <article className="combat-card enemy">
          <h5>{activeEnemy ? activeEnemy.name : "Sin combate activo"}</h5>
          <div className="meter-line compact">
            <p>Vida enemiga</p>
            <div className="meter-track">
              <span
                className="meter-fill enemy"
                style={{
                  width: activeEnemy && state.activeEnemyMaxHp > 0
                    ? `${(state.activeEnemyHp / state.activeEnemyMaxHp) * 100}%`
                    : "0%"
                }}
              />
            </div>
            <strong>
              {activeEnemy ? `${state.activeEnemyHp}/${state.activeEnemyMaxHp}` : "-"}
            </strong>
          </div>
          <p className="enemy-step">
            Intencion: {state.enemyIntent ? state.enemyIntent.label : "-"}
          </p>
          <p className="enemy-step">
            Salida: {areAllEnemiesDefeated(state.enemies) ? "Desbloqueada" : "Bloqueada"}
          </p>
        </article>
      </div>

      <div
        className="rpg-map stage-grid"
        style={{ "--stage-cols": MAP_SIZE }}
        aria-label="Mapa RPG"
      >
        <div className="map-sky-strip rpg-sky" aria-hidden="true">
          <img src={cloudSprite} alt="" className="sky-cloud cloud-a" />
          <img src={cloudSprite} alt="" className="sky-cloud cloud-b" />
        </div>

        {Array.from({ length: MAP_SIZE }).map((_, row) =>
          Array.from({ length: MAP_SIZE }).map((__, column) => {
            const isWall = WALLS.has(keyOf(column, row));
            const isExit = column === EXIT_POSITION.x && row === EXIT_POSITION.y;
            const playerHere = state.player.x === column && state.player.y === row;
            const enemyHere = getEnemyAt(state.enemies, column, row);
            const sanctuary = getSanctuaryAt(column, row);
            const sanctuaryUsed = sanctuary && state.sanctuariesUsed.includes(sanctuary.id);
            const scenerySprite = SCENERY[keyOf(column, row)];

            const classes = [
              "stage-cell",
              "rpg-cell",
              isWall ? "wall" : "floor",
              isExit ? "exit" : "",
              sanctuary ? "sanctuary" : "",
              sanctuaryUsed ? "sanctuary-used" : "",
              enemyHere ? "enemy" : "",
              playerHere ? "player" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={`${row}-${column}`} className={classes}>
                {isWall && (
                  <img
                    src={wallSprite}
                    alt=""
                    className="map-scenery wall-art"
                  />
                )}
                {scenerySprite && !isWall && !sanctuary && (
                  <img
                    src={scenerySprite}
                    alt=""
                    className="map-scenery rpg-scenery-art"
                  />
                )}
                {sanctuary && !isWall && (
                  <img
                    src={shrineSprite}
                    alt=""
                    className="map-scenery shrine-art"
                  />
                )}
                {isExit && (
                  <img
                    src={gateSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-gate"
                  />
                )}
                {enemyHere && (
                  <img
                    src={enemyRpgSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-rpg-enemy"
                  />
                )}
                {playerHere && (
                  <img
                    src={heroRpgSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-rpg-hero"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="rpg-move-buttons">
        <button
          type="button"
          onClick={() => movePlayer(0, -1)}
          disabled={state.status !== "playing" || state.phase !== "explore"}
        >
          Arriba
        </button>
        <button
          type="button"
          onClick={() => movePlayer(-1, 0)}
          disabled={state.status !== "playing" || state.phase !== "explore"}
        >
          Izquierda
        </button>
        <button
          type="button"
          onClick={() => movePlayer(1, 0)}
          disabled={state.status !== "playing" || state.phase !== "explore"}
        >
          Derecha
        </button>
        <button
          type="button"
          onClick={() => movePlayer(0, 1)}
          disabled={state.status !== "playing" || state.phase !== "explore"}
        >
          Abajo
        </button>
      </div>

      <div className="rpg-actions">
        <button
          type="button"
          onClick={() => performAction("attack")}
          disabled={state.status !== "playing" || state.phase !== "combat"}
        >
          Atacar
        </button>
        <button
          type="button"
          onClick={() => performAction("skill")}
          disabled={state.status !== "playing" || state.phase !== "combat"}
        >
          Habilidad (9 mana)
        </button>
        <button
          type="button"
          onClick={() => performAction("defend")}
          disabled={state.status !== "playing" || state.phase !== "combat"}
        >
          Defender
        </button>
        <button
          type="button"
          onClick={() => performAction("focus")}
          disabled={state.status !== "playing" || state.phase !== "combat"}
        >
          Enfocar
        </button>
        <button
          type="button"
          onClick={() => performAction("summon")}
          disabled={state.status !== "playing" || state.phase !== "combat" || state.relicShards < 3}
        >
          Invocar (3 fragmentos)
        </button>
        <button
          type="button"
          onClick={() => performAction("potion")}
          disabled={state.status !== "playing" || state.phase !== "combat"}
        >
          Pocion
        </button>
      </div>

      <p className="game-message">{state.message}</p>

      <ul className="game-log">
        {state.log.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default RpgGame;
