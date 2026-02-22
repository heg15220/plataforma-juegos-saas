import React, { useCallback, useEffect, useState } from "react";
import adventurerSprite from "../assets/sprites/adventurer.svg";
import relicSprite from "../assets/sprites/relic.svg";
import baseSprite from "../assets/sprites/base-camp.svg";
import treeSprite from "../assets/sprites/tree.svg";
import ruinSprite from "../assets/sprites/ruin.svg";
import waterSprite from "../assets/sprites/water.svg";
import duneSprite from "../assets/sprites/dune.svg";
import mountainSprite from "../assets/sprites/mountain.svg";
import cloudSprite from "../assets/sprites/cloud.svg";
import beaconSprite from "../assets/sprites/beacon.svg";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const MAP_SIZE = 8;
const MAX_HEALTH = 14;
const MAX_STAMINA = 24;
const MAX_DAYLIGHT = 20;
const MAX_THREAT = 100;
const SCAN_DURATION = 3;
const BEACON_DURATION = 4;
const JUMP_DURATION = 2;
const START_POSITION = { x: 0, y: MAP_SIZE - 1 };
const TERRAINS = ["trail", "forest", "ruins", "water", "dunes"];

const TERRAIN_ICONS = {
  trail: mountainSprite,
  forest: treeSprite,
  ruins: ruinSprite,
  water: waterSprite,
  dunes: duneSprite
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

const tileKey = (x, y) => `${x}-${y}`;

const createTerrainMap = () => {
  return Array.from({ length: MAP_SIZE }, () => {
    return Array.from({ length: MAP_SIZE }, () => {
      return TERRAINS[randomInt(0, TERRAINS.length - 1)];
    });
  });
};

const createRelicPosition = () => {
  let x = START_POSITION.x;
  let y = START_POSITION.y;

  while (x === START_POSITION.x && y === START_POSITION.y) {
    x = randomInt(0, MAP_SIZE - 1);
    y = randomInt(0, MAP_SIZE - 1);
  }

  return { x, y };
};

const prependLog = (entry, previousLog) => [entry, ...previousLog].slice(0, 9);

const isAtBase = (point) => {
  return point.x === START_POSITION.x && point.y === START_POSITION.y;
};

const isExpeditionComplete = (snapshot) => {
  return snapshot.hasRelic && isAtBase(snapshot.player);
};

const distanceToRelic = (player, relic) => {
  return Math.abs(player.x - relic.x) + Math.abs(player.y - relic.y);
};

const getThreatTier = (threat) => {
  if (threat >= 76) {
    return "Extrema";
  }
  if (threat >= 52) {
    return "Alta";
  }
  if (threat >= 30) {
    return "Media";
  }
  return "Baja";
};

const describeRelicDistance = (distance) => {
  if (distance <= 1) {
    return "La reliquia esta practicamente encima de ti.";
  }
  if (distance <= 3) {
    return "Senal intensa: la reliquia esta muy cerca.";
  }
  if (distance <= 5) {
    return "Eco moderado: sigues una pista valida.";
  }
  return "Senal debil: explora otra zona del templo.";
};

const describeDirectionToRelic = (player, relic) => {
  const deltaX = relic.x - player.x;
  const deltaY = relic.y - player.y;
  const horizontal = deltaX > 0 ? "este" : deltaX < 0 ? "oeste" : "";
  const vertical = deltaY > 0 ? "sur" : deltaY < 0 ? "norte" : "";

  if (!horizontal && !vertical) {
    return "en tu misma posicion";
  }
  if (horizontal && vertical) {
    return `${vertical}-${horizontal}`;
  }
  return horizontal || vertical;
};

const createInitialState = () => {
  const relic = createRelicPosition();
  return {
    terrainMap: createTerrainMap(),
    player: { ...START_POSITION },
    relic,
    visited: new Set([tileKey(START_POSITION.x, START_POSITION.y)]),
    hasRelic: false,
    health: MAX_HEALTH,
    stamina: MAX_STAMINA,
    daylight: MAX_DAYLIGHT,
    threat: 18,
    scanCharges: 2,
    scanTurns: 0,
    rations: 2,
    beacons: 1,
    beaconTurns: 0,
    jumps: 2,
    jumpTurns: 0,
    distance: 0,
    turns: 0,
    hintDistance: distanceToRelic(START_POSITION, relic),
    status: "playing",
    message: "Explora el mapa, ubica la reliquia y vuelve al campamento.",
    log: ["Comienza la expedicion desde el campamento base."]
  };
};

const applyFailureChecks = (snapshot) => {
  if (snapshot.health <= 0) {
    return {
      ...snapshot,
      status: "lost",
      message: "Una emboscada termina la expedicion.",
      health: 0
    };
  }

  if (snapshot.daylight <= 0 && !isExpeditionComplete(snapshot)) {
    return {
      ...snapshot,
      status: "lost",
      message: "La noche cae y pierdes la ruta de salida.",
      daylight: 0
    };
  }

  if (snapshot.stamina <= 0 && !isExpeditionComplete(snapshot)) {
    return {
      ...snapshot,
      status: "lost",
      message: "Te quedaste sin energia antes de volver al campamento.",
      stamina: 0
    };
  }

  if (isExpeditionComplete(snapshot)) {
    return {
      ...snapshot,
      status: "won",
      message: "Regresas con la reliquia. Mision completada."
    };
  }

  return snapshot;
};

const resolveMove = (previous, deltaX, deltaY) => {
  if (previous.status !== "playing") {
    return previous;
  }

  const nextX = previous.player.x + deltaX;
  const nextY = previous.player.y + deltaY;

  if (nextX < 0 || nextX >= MAP_SIZE || nextY < 0 || nextY >= MAP_SIZE) {
    const message = "El borde del mapa bloquea el avance.";
    return {
      ...previous,
      message,
      log: prependLog(message, previous.log)
    };
  }

  const terrain = previous.terrainMap[nextY][nextX];
  const terrainThreatDelta = {
    trail: -3,
    forest: -1,
    ruins: 8,
    water: 5,
    dunes: 3
  };
  const jumpActive = previous.jumpTurns > 0;

  let health = previous.health;
  let stamina = previous.stamina - (terrain === "water" ? (jumpActive ? 1 : 2) : 1);
  let daylight = previous.daylight - 1;
  let threat = clamp(
    previous.threat +
      terrainThreatDelta[terrain] +
      (previous.daylight <= 7 ? 4 : 0) +
      (jumpActive ? -4 : 0),
    0,
    MAX_THREAT
  );
  let message = `Te desplazas a ${nextX + 1}-${nextY + 1}.`;

  const ruinsTrapChance = clamp(0.18 + previous.threat * 0.0022, 0.18, 0.52);
  const forestHealChance = clamp(0.32 - previous.threat * 0.0018, 0.12, 0.34);

  if (terrain === "ruins" && Math.random() < ruinsTrapChance) {
    if (jumpActive) {
      message += " Salto perfecto: esquivas una trampa de ruinas.";
    } else {
      const damage = randomInt(1, 3);
      health -= damage;
      message += ` Trampa en ruinas: -${damage} vida.`;
    }
  } else if (terrain === "forest" && Math.random() < forestHealChance) {
    const heal = randomInt(1, 2);
    health = Math.min(MAX_HEALTH, health + heal);
    threat = clamp(threat - 4, 0, MAX_THREAT);
    message += ` Hierbas curativas: +${heal} vida.`;
  } else if (terrain === "dunes" && Math.random() < 0.28) {
    stamina = Math.min(MAX_STAMINA, stamina + 2);
    daylight = Math.min(MAX_DAYLIGHT, daylight + 1);
    message += " Encuentras una ruta rapida entre dunas.";
  } else if (terrain === "trail" && Math.random() < 0.26) {
    daylight = Math.min(MAX_DAYLIGHT, daylight + 1);
    threat = clamp(threat - 5, 0, MAX_THREAT);
    message += " El sendero despejado te permite reagruparte.";
  } else if (terrain === "water" && Math.random() < 0.22) {
    if (jumpActive) {
      message += " Salto largo: evitas la corriente hostil.";
    } else {
      const damage = randomInt(1, 2);
      health -= damage;
      message += ` Corriente hostil: -${damage} vida.`;
    }
  }

  const visited = new Set(previous.visited);
  visited.add(tileKey(nextX, nextY));

  const player = { x: nextX, y: nextY };
  const resolved = applyFailureChecks({
    ...previous,
    player,
    visited,
    health: Math.max(0, health),
    stamina: Math.max(0, stamina),
    daylight: Math.max(0, daylight),
    threat,
    scanTurns: Math.max(0, previous.scanTurns - 1),
    beaconTurns: Math.max(0, previous.beaconTurns - 1),
    jumpTurns: Math.max(0, previous.jumpTurns - 1),
    distance: previous.distance + 1,
    turns: previous.turns + 1,
    hintDistance: distanceToRelic(player, previous.relic),
    message
  });

  return {
    ...resolved,
    log: prependLog(resolved.message, previous.log)
  };
};

const resolveIdleDrain = (previous) => {
  if (previous.status !== "playing") {
    return previous;
  }

  const drained = applyFailureChecks({
    ...previous,
    daylight: Math.max(0, previous.daylight - 1),
    threat: clamp(previous.threat + 2, 0, MAX_THREAT),
    scanTurns: Math.max(0, previous.scanTurns - 1),
    beaconTurns: Math.max(0, previous.beaconTurns - 1),
    jumpTurns: Math.max(0, previous.jumpTurns - 1),
    turns: previous.turns + 1,
    message: "El tiempo avanza. La visibilidad disminuye."
  });

  return {
    ...drained,
    log: prependLog(drained.message, previous.log)
  };
};

function AdventureGame() {
  const [state, setState] = useState(createInitialState);

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
        setState((previous) => resolveMove(previous, delta[0], delta[1]));
        return;
      }

      if (key === "e") {
        event.preventDefault();
        searchRelic();
      } else if (key === "q") {
        event.preventDefault();
        scanArea();
      } else if (key === "r") {
        event.preventDefault();
        useRation();
      } else if (key === "f") {
        event.preventDefault();
        deployBeacon();
      } else if (key === "b") {
        event.preventDefault();
        performJump();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const resetGame = () => {
    setState(createInitialState());
  };

  const move = (deltaX, deltaY) => {
    setState((previous) => resolveMove(previous, deltaX, deltaY));
  };

  const searchRelic = () => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }

      let stamina = previous.stamina - 1;
      let daylight = previous.daylight - 1;
      let hasRelic = previous.hasRelic;
      let threat = clamp(previous.threat + 2, 0, MAX_THREAT);
      let message = "No hay rastro claro de la reliquia en esta casilla.";

      if (previous.hasRelic) {
        message = "Ya llevas la reliquia. Vuelve al campamento base.";
      } else if (
        previous.player.x === previous.relic.x &&
        previous.player.y === previous.relic.y
      ) {
        hasRelic = true;
        stamina = Math.min(MAX_STAMINA, stamina + 2);
        daylight = Math.min(MAX_DAYLIGHT, daylight + 3);
        threat = clamp(threat - 10, 0, MAX_THREAT);
        message = "Encuentras la reliquia antigua y marcas ruta de extraccion.";
      } else {
        const hintDistance = distanceToRelic(previous.player, previous.relic);
        message = `${describeRelicDistance(hintDistance)} Direccion aproximada: ${describeDirectionToRelic(previous.player, previous.relic)}.`;
      }

      const resolved = applyFailureChecks({
        ...previous,
        stamina: Math.max(0, stamina),
        daylight: Math.max(0, daylight),
        threat,
        hasRelic,
        scanTurns: Math.max(0, previous.scanTurns - 1),
        beaconTurns: Math.max(0, previous.beaconTurns - 1),
        jumpTurns: Math.max(0, previous.jumpTurns - 1),
        turns: previous.turns + 1,
        hintDistance: distanceToRelic(previous.player, previous.relic),
        message
      });

      return {
        ...resolved,
        log: prependLog(resolved.message, previous.log)
      };
    });
  };

  const scanArea = () => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }
      if (previous.scanCharges <= 0) {
        const message = "No quedan cargas de escaner.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }
      if (previous.stamina < 2) {
        const message = "Energia insuficiente para escanear el area.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }

      const hintDistance = distanceToRelic(previous.player, previous.relic);
      const direction = describeDirectionToRelic(previous.player, previous.relic);
      const message = previous.hasRelic
        ? "Escaneo activo para cobertura. Prioriza extraccion."
        : `Escaneo activo: eco ${describeRelicDistance(hintDistance).toLowerCase()} Direccion: ${direction}.`;

      return {
        ...previous,
        stamina: previous.stamina - 2,
        daylight: Math.max(0, previous.daylight - 1),
        threat: clamp(previous.threat - 5, 0, MAX_THREAT),
        scanCharges: previous.scanCharges - 1,
        scanTurns: SCAN_DURATION,
        beaconTurns: Math.max(0, previous.beaconTurns - 1),
        jumpTurns: Math.max(0, previous.jumpTurns - 1),
        turns: previous.turns + 1,
        hintDistance,
        message,
        log: prependLog(message, previous.log)
      };
    });
  };

  const useRation = () => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }
      if (previous.rations <= 0) {
        const message = "No quedan raciones de emergencia.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }

      const message = "Usas una racion: recuperas energia y estabilizas la ruta.";
      const resolved = applyFailureChecks({
        ...previous,
        rations: previous.rations - 1,
        stamina: Math.min(MAX_STAMINA, previous.stamina + 6),
        daylight: Math.min(MAX_DAYLIGHT, Math.max(0, previous.daylight - 1) + 2),
        health: Math.min(MAX_HEALTH, previous.health + 1),
        threat: clamp(previous.threat - 8, 0, MAX_THREAT),
        scanTurns: Math.max(0, previous.scanTurns - 1),
        beaconTurns: Math.max(0, previous.beaconTurns - 1),
        jumpTurns: Math.max(0, previous.jumpTurns - 1),
        turns: previous.turns + 1,
        message
      });

      return {
        ...resolved,
        log: prependLog(message, previous.log)
      };
    });
  };

  const deployBeacon = () => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }
      if (previous.beacons <= 0) {
        const message = "La baliza de señal ya fue utilizada.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }
      if (previous.beaconTurns > 0) {
        const message = "La baliza sigue activa. Aprovecha la vision extendida.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }

      const message = "Baliza activada: visibilidad ampliada y menor presion de amenaza.";
      const resolved = applyFailureChecks({
        ...previous,
        beacons: previous.beacons - 1,
        beaconTurns: BEACON_DURATION,
        daylight: Math.max(0, previous.daylight - 1),
        threat: clamp(previous.threat - 10, 0, MAX_THREAT),
        scanTurns: Math.max(0, previous.scanTurns - 1),
        jumpTurns: Math.max(0, previous.jumpTurns - 1),
        turns: previous.turns + 1,
        message
      });

      return {
        ...resolved,
        log: prependLog(message, previous.log)
      };
    });
  };

  const performJump = () => {
    setState((previous) => {
      if (previous.status !== "playing") {
        return previous;
      }
      if (previous.jumps <= 0) {
        const message = "No quedan saltos tacticos disponibles.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }
      if (previous.stamina < 2) {
        const message = "Energia insuficiente para salto tactico.";
        return {
          ...previous,
          message,
          log: prependLog(message, previous.log)
        };
      }

      const message = "Salto tactico activo: durante 2 turnos esquivas mejor trampas.";
      const resolved = applyFailureChecks({
        ...previous,
        jumps: previous.jumps - 1,
        jumpTurns: JUMP_DURATION,
        stamina: Math.max(0, previous.stamina - 2),
        daylight: Math.max(0, previous.daylight - 1),
        threat: clamp(previous.threat - 6, 0, MAX_THREAT),
        scanTurns: Math.max(0, previous.scanTurns - 1),
        beaconTurns: Math.max(0, previous.beaconTurns - 1),
        turns: previous.turns + 1,
        message
      });

      return {
        ...resolved,
        log: prependLog(message, previous.log)
      };
    });
  };

  const isDiscoveredTile = (x, y) => {
    if (state.visited.has(tileKey(x, y))) {
      return true;
    }

    const scanRadius = state.scanTurns > 0 ? 2 : 1;
    const beaconRadius = state.beaconTurns > 0 ? 1 : 0;
    const visionRadius = scanRadius + beaconRadius;
    const distance = Math.abs(state.player.x - x) + Math.abs(state.player.y - y);
    return distance <= visionRadius;
  };

  const statusLabel =
    state.status === "won"
      ? "Victoria"
      : state.status === "lost"
        ? "Derrota"
        : "Explorando";

  const controlsDisabled = state.status !== "playing";
  const explorationProgress = (state.visited.size / (MAP_SIZE * MAP_SIZE)) * 100;
  const extractionDistance = Math.abs(state.player.x - START_POSITION.x) +
    Math.abs(state.player.y - START_POSITION.y);
  const threatClass = state.threat >= 76 ? "extreme" : state.threat >= 52 ? "high" : "";

  const buildTextPayload = useCallback((snapshot) => {
    const scanRadius = snapshot.scanTurns > 0 ? 2 : 1;
    const beaconRadius = snapshot.beaconTurns > 0 ? 1 : 0;
    const snapshotExtractionDistance =
      Math.abs(snapshot.player.x - START_POSITION.x) +
      Math.abs(snapshot.player.y - START_POSITION.y);
    const visibleTiles = [];

    for (let row = 0; row < MAP_SIZE; row += 1) {
      for (let column = 0; column < MAP_SIZE; column += 1) {
        const visited = snapshot.visited.has(tileKey(column, row));
        const distanceToPlayer =
          Math.abs(snapshot.player.x - column) + Math.abs(snapshot.player.y - row);
        const visible = visited || distanceToPlayer <= scanRadius + beaconRadius;
        if (!visible) {
          continue;
        }

        visibleTiles.push({
          x: column,
          y: row,
          terrain: snapshot.terrainMap[row][column],
          visited
        });
      }
    }

    return {
      mode: "adventure",
      coordinates: "origin_top_left_x_right_y_down",
      status: snapshot.status,
      turn: snapshot.turns,
      player: {
        x: snapshot.player.x,
        y: snapshot.player.y,
        health: snapshot.health,
        stamina: snapshot.stamina,
        daylight: snapshot.daylight,
        hasRelic: snapshot.hasRelic
      },
      objectives: {
        base: { ...START_POSITION },
        relicKnown: snapshot.hasRelic || snapshot.status === "won",
        relicDistanceHint: snapshot.hintDistance,
        extractionDistance: snapshotExtractionDistance
      },
      resources: {
        threat: snapshot.threat,
        threatTier: getThreatTier(snapshot.threat),
        scanCharges: snapshot.scanCharges,
        scanTurns: snapshot.scanTurns,
        rations: snapshot.rations,
        beacons: snapshot.beacons,
        beaconTurns: snapshot.beaconTurns,
        jumps: snapshot.jumps,
        jumpTurns: snapshot.jumpTurns
      },
      map: {
        size: MAP_SIZE,
        visibleTiles
      },
      message: snapshot.message
    };
  }, []);

  const advanceTime = useCallback((ms) => {
    const steps = Math.floor(ms / 1200);
    if (steps <= 0) {
      return;
    }
    setState((previous) => {
      let next = previous;
      for (let index = 0; index < steps; index += 1) {
        next = resolveIdleDrain(next);
      }
      return next;
    });
  }, []);

  useGameRuntimeBridge(state, buildTextPayload, advanceTime);

  return (
    <div className="mini-game adventure-game">
      <div className="mini-head">
        <div>
          <h4>Modo Aventura</h4>
          <p>Expedicion tactica con amenaza dinamica y herramientas de supervivencia.</p>
        </div>
        <button type="button" onClick={resetGame}>
          Nueva expedicion
        </button>
      </div>

      <div className="status-row">
        <span className={`status-pill ${state.status}`}>{statusLabel}</span>
        <span>Vida: {state.health}</span>
        <span>Energia: {state.stamina}</span>
        <span>Luz: {state.daylight}</span>
        <span>Amenaza: {state.threat}</span>
        <span>Salto: {state.jumpTurns > 0 ? `Activo (${state.jumpTurns})` : "Listo"}</span>
        <span>Reliquia: {state.hasRelic ? "Si" : "No"}</span>
      </div>

      <p className={`threat-banner ${threatClass}`}>Nivel de amenaza: {getThreatTier(state.threat)}</p>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Exploracion de mapa</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: `${explorationProgress}%` }} />
          </div>
          <strong>{Math.round(explorationProgress)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Distancia de extraccion</p>
          <div className="meter-track">
            <span
              className="meter-fill race"
              style={{
                width: `${state.hasRelic ? Math.max(0, 100 - extractionDistance * 12) : 0}%`
              }}
            />
          </div>
          <strong>{state.hasRelic ? extractionDistance : "-"}</strong>
        </div>
        <div className="meter-line compact">
          <p>Presion de amenaza</p>
          <div className="meter-track">
            <span className="meter-fill enemy" style={{ width: `${state.threat}%` }} />
          </div>
          <strong>{state.threat}%</strong>
        </div>
      </div>

      <div className="map-legend">
        <span><img src={mountainSprite} alt="" className="legend-icon" />Sendero</span>
        <span><img src={treeSprite} alt="" className="legend-icon" />Bosque</span>
        <span><img src={ruinSprite} alt="" className="legend-icon" />Ruinas</span>
        <span><img src={waterSprite} alt="" className="legend-icon" />Agua</span>
        <span><img src={duneSprite} alt="" className="legend-icon" />Dunas</span>
      </div>

      <div
        className="adventure-map stage-grid"
        style={{ "--stage-cols": MAP_SIZE }}
        aria-label="Mapa de aventura"
      >
        <div className="map-sky-strip" aria-hidden="true">
          <img src={cloudSprite} alt="" className="sky-cloud cloud-a" />
          <img src={cloudSprite} alt="" className="sky-cloud cloud-b" />
        </div>

        {Array.from({ length: MAP_SIZE }).map((_, row) =>
          Array.from({ length: MAP_SIZE }).map((__, column) => {
            const discovered = isDiscoveredTile(column, row);
            const terrain = state.terrainMap[row][column];
            const isPlayer = state.player.x === column && state.player.y === row;
            const isBase = column === START_POSITION.x && row === START_POSITION.y;
            const isRelic = column === state.relic.x && row === state.relic.y;
            const revealRelic = state.hasRelic || state.status === "won";

            const classes = [
              "stage-cell",
              "adventure-cell",
              discovered ? `terrain-${terrain}` : "fog",
              isBase ? "base" : "",
              isRelic && revealRelic ? "relic" : "",
              isPlayer ? "player" : "",
              state.beaconTurns > 0 && isPlayer ? "beacon-active" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={`${row}-${column}`} className={classes}>
                {discovered && (
                  <img
                    src={TERRAIN_ICONS[terrain]}
                    alt=""
                    className="map-scenery terrain-art"
                  />
                )}
                {isBase && (
                  <img
                    src={baseSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-base"
                  />
                )}
                {isRelic && revealRelic && (
                  <img
                    src={relicSprite}
                    alt=""
                    className="map-sprite sprite-img sprite-relic"
                  />
                )}
                {isPlayer && (
                  <>
                    {state.beaconTurns > 0 && (
                      <img
                        src={beaconSprite}
                        alt=""
                        className="map-sprite sprite-img sprite-beacon"
                      />
                    )}
                    <img
                      src={adventurerSprite}
                      alt=""
                      className="map-sprite sprite-img sprite-adventurer"
                    />
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="adventure-controls">
        <div className="control-pad">
          <button type="button" onClick={() => move(0, -1)} disabled={controlsDisabled}>
            Arriba
          </button>
          <button type="button" onClick={() => move(-1, 0)} disabled={controlsDisabled}>
            Izquierda
          </button>
          <button type="button" onClick={() => move(1, 0)} disabled={controlsDisabled}>
            Derecha
          </button>
          <button type="button" onClick={() => move(0, 1)} disabled={controlsDisabled}>
            Abajo
          </button>
        </div>
        <div className="action-buttons">
          <button type="button" onClick={searchRelic} disabled={controlsDisabled}>
            Buscar reliquia
          </button>
          <button type="button" onClick={scanArea} disabled={controlsDisabled}>
            Escanear ({state.scanCharges})
          </button>
          <button type="button" onClick={useRation} disabled={controlsDisabled}>
            Racion ({state.rations})
          </button>
          <button type="button" onClick={deployBeacon} disabled={controlsDisabled}>
            Baliza ({state.beacons})
          </button>
          <button type="button" onClick={performJump} disabled={controlsDisabled}>
            Salto tactico ({state.jumps})
          </button>
        </div>
      </div>

      <p className="clue-banner">
        Pista actual: {describeRelicDistance(state.hintDistance)} Distancia estimada: {state.hintDistance}.
      </p>

      <p className="game-message">{state.message}</p>

      <ul className="game-log">
        {state.log.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdventureGame;
