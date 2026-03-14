import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlatformerEngine from "./platformer/core/PlatformerEngine";
import { createInitialSnapshot } from "./platformer/ui/hudModel";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const INITIAL_SNAPSHOT = createInitialSnapshot();

const statusByScreen = {
  start: "Ready",
  playing: "Playing",
  level_complete: "Sector Clear",
  game_over: "Run Failed",
  game_complete: "Route Cleared"
};

const ratioToPercent = (value) => `${Math.max(0, Math.min(100, value * 100)).toFixed(1)}%`;

function PlatformerGame() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) {
      return undefined;
    }

    let isMounted = true;
    const engine = new PlatformerEngine(canvasRef.current, {
      onSnapshot: (nextSnapshot) => {
        if (!isMounted) {
          return;
        }
        setSnapshot(nextSnapshot);
      }
    });

    engineRef.current = engine;

    return () => {
      isMounted = false;
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const withEngine = (callback) => (event) => {
    if (event?.cancelable) {
      event.preventDefault();
    }
    if (!engineRef.current) {
      return;
    }
    callback(engineRef.current);
  };

  const onAxisPress = useCallback((axis) => withEngine((engine) => engine.setVirtualAxis(axis)), []);
  const onAxisRelease = useCallback(withEngine((engine) => engine.setVirtualAxis(0)), []);
  const onStart = useCallback(withEngine((engine) => engine.start()), []);
  const onRestart = useCallback(withEngine((engine) => engine.restart()), []);
  const onAction = useCallback(withEngine((engine) => engine.action()), []);
  const onJumpDown = useCallback(
    withEngine((engine) => {
      engine.setVirtualJumpHeld(true);
      engine.jump();
    }),
    []
  );
  const onJumpUp = useCallback(withEngine((engine) => engine.setVirtualJumpHeld(false)), []);

  const buildTextPayload = useCallback((currentSnapshot) => {
    return {
      mode: "platformer_arcade",
      coordinates: currentSnapshot.coordinates,
      screen: currentSnapshot.screen,
      catalogLevelCount: currentSnapshot.catalogLevelCount,
      level: {
        index: currentSnapshot.levelIndex + 1,
        total: currentSnapshot.levelCount,
        id: currentSnapshot.levelId,
        name: currentSnapshot.levelName,
        biome: currentSnapshot.levelBiome,
        subtitle: currentSnapshot.levelSubtitle,
        difficulty: currentSnapshot.levelDifficulty,
        mechanics: currentSnapshot.levelMechanics
      },
      campaign: {
        route: currentSnapshot.runLevelIds,
        stages: currentSnapshot.runStages,
        bossLevels: currentSnapshot.runBossLevelCount
      },
      layout: currentSnapshot.levelLayout,
      visualStyle: currentSnapshot.levelVisualStyle,
      isBossLevel: currentSnapshot.isBossLevel,
      checkpoints: currentSnapshot.checkpoints,
      activeWind: currentSnapshot.activeWind,
      hazardCount: currentSnapshot.hazardCount,
      boss: currentSnapshot.activeBoss,
      score: currentSnapshot.score,
      lives: currentSnapshot.lives,
      timeLeft: currentSnapshot.timeLeft,
      coins: {
        collected: currentSnapshot.coinsCollected,
        total: currentSnapshot.coinsTotal
      },
      player: currentSnapshot.player,
      enemies: currentSnapshot.enemies,
      items: currentSnapshot.items,
      projectiles: currentSnapshot.projectiles,
      goal: currentSnapshot.goal,
      camera: currentSnapshot.camera,
      message: currentSnapshot.message
    };
  }, []);

  const advanceTime = useCallback((ms) => {
    return engineRef.current?.advanceTime(ms);
  }, []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const statusLabel = statusByScreen[snapshot.screen] || snapshot.screen;
  const coinsProgress = snapshot.coinsTotal > 0 ? snapshot.coinsCollected / snapshot.coinsTotal : 0;
  const timeProgress = snapshot.timeLimit > 0 ? snapshot.timeLeft / snapshot.timeLimit : 0;
  const routeProgress = snapshot.levelCount > 0 ? snapshot.levelIndex / snapshot.levelCount : 0;
  const bossProgress = snapshot.runBossLevelCount > 0 && snapshot.runStages.length
    ? snapshot.runStages
      .slice(0, snapshot.levelIndex + (snapshot.screen === "level_complete" || snapshot.screen === "game_complete" ? 1 : 0))
      .filter((stage) => stage.isBossLevel).length / snapshot.runBossLevelCount
    : 0;
  const canRestart = useMemo(() => snapshot.screen !== "start", [snapshot.screen]);
  const mechanics = snapshot.levelMechanics || [];
  const routeStages = snapshot.runStages || [];

  return (
    <div className="mini-game platformer-game">
      <div className="mini-head platformer-briefing-head">
        <div>
          <h4>Sky Runner DX</h4>
          <p>
            32 sectores artesanales, ruta de {snapshot.levelCount} fases por run, bosses con variantes,
            checkpoints, springs, viento y hazards bien telegráficos.
          </p>
        </div>
        <div className="platformer-actions">
          <button type="button" onClick={onStart}>
            {snapshot.screen === "start" ? "Start Route" : "Continue"}
          </button>
          <button type="button" onClick={onRestart} disabled={!canRestart}>
            Restart Sector
          </button>
        </div>
      </div>

      <div className="status-row platformer-status-row">
        <span className={`status-pill ${snapshot.screen}`}>{statusLabel}</span>
        <span>Sector <strong>{snapshot.levelIndex + 1}</strong>/{snapshot.levelCount}</span>
        <span>Biome <strong>{snapshot.levelBiome}</strong></span>
        <span>Difficulty <strong>{snapshot.levelDifficulty}/5</strong></span>
        {snapshot.isBossLevel && <span className="status-pill boss">Boss Sector</span>}
        <span>Score <strong>{snapshot.score}</strong></span>
        <span>Lives <strong>{snapshot.lives}</strong></span>
      </div>

      <section className="platformer-command-deck">
        <article className="platformer-command-card hero">
          <p className="eyebrow">Current Sector</p>
          <h5>{snapshot.levelName}</h5>
          <strong>{snapshot.levelBiome}</strong>
          <span>{snapshot.levelSubtitle || "Handcrafted platforming sector with deterministic physics."}</span>
        </article>

        <article className="platformer-command-card">
          <p className="eyebrow">Environment</p>
          <strong>{snapshot.activeWind ? snapshot.activeWind.label : "Calm Air"}</strong>
          <span>
            {snapshot.activeWind
              ? `Wind ${snapshot.activeWind.forceX}/${snapshot.activeWind.forceY}`
              : "No active gust zones around the player."}
          </span>
        </article>

        <article className="platformer-command-card">
          <p className="eyebrow">Checkpoints</p>
          <strong>{snapshot.checkpoints.activated}/{snapshot.checkpoints.total}</strong>
          <span>
            {snapshot.checkpoints.activeId
              ? `Active: ${snapshot.checkpoints.activeId}`
              : "Respawn anchored at sector start."}
          </span>
        </article>

        <article className="platformer-command-card">
          <p className="eyebrow">Hazards</p>
          <strong>{snapshot.hazardCount}</strong>
          <span>{snapshot.hazardCount ? "Telegraphed danger lanes in this sector." : "Pure traversal sector."}</span>
        </article>
      </section>

      <div className="platformer-route-strip">
        {routeStages.map((stage, index) => (
          <span
            key={`${stage.id}-${index}`}
            className={[
              "platformer-route-node",
              index === snapshot.levelIndex ? "active" : "",
              index < snapshot.levelIndex ? "cleared" : "",
              stage.isBossLevel ? "boss" : ""
            ].join(" ").trim()}
          >
            {index + 1}. {stage.name}
          </span>
        ))}
      </div>

      <div className="meter-stack platformer-meter-stack">
        <div className="meter-line compact">
          <p>Coins</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: ratioToPercent(coinsProgress) }} />
          </div>
          <strong>{snapshot.coinsCollected}/{snapshot.coinsTotal}</strong>
        </div>
        <div className="meter-line compact">
          <p>Time</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: ratioToPercent(timeProgress) }} />
          </div>
          <strong>{Math.max(0, Math.ceil(snapshot.timeLeft))}s</strong>
        </div>
        <div className="meter-line compact">
          <p>Route</p>
          <div className="meter-track">
            <span className="meter-fill action" style={{ width: ratioToPercent(routeProgress) }} />
          </div>
          <strong>{snapshot.levelIndex}/{snapshot.levelCount}</strong>
        </div>
        <div className="meter-line compact">
          <p>Bosses</p>
          <div className="meter-track">
            <span className="meter-fill boss" style={{ width: ratioToPercent(bossProgress) }} />
          </div>
          <strong>{snapshot.runBossLevelCount}</strong>
        </div>
      </div>

      <div className="platformer-mechanics-band">
        {mechanics.map((mechanic) => (
          <span key={mechanic}>{mechanic}</span>
        ))}
      </div>

      <div className="phaser-canvas-shell platformer-stage-shell">
        <div className="phaser-canvas-host">
          <canvas ref={canvasRef} aria-label="Arcade platformer canvas" />
        </div>
      </div>

      <div className="phaser-controls">
        <button
          className="platformer-ctrl move"
          type="button"
          onMouseDown={onAxisPress(-1)}
          onMouseUp={onAxisRelease}
          onMouseLeave={onAxisRelease}
          onTouchStart={onAxisPress(-1)}
          onTouchEnd={onAxisRelease}
          onTouchCancel={onAxisRelease}
        >
          Left
        </button>
        <button
          className="platformer-ctrl move"
          type="button"
          onMouseDown={onAxisPress(1)}
          onMouseUp={onAxisRelease}
          onMouseLeave={onAxisRelease}
          onTouchStart={onAxisPress(1)}
          onTouchEnd={onAxisRelease}
          onTouchCancel={onAxisRelease}
        >
          Right
        </button>
        <button
          className="platformer-ctrl jump"
          type="button"
          onMouseDown={onJumpDown}
          onMouseUp={onJumpUp}
          onMouseLeave={onJumpUp}
          onTouchStart={onJumpDown}
          onTouchEnd={onJumpUp}
          onTouchCancel={onJumpUp}
        >
          Jump
        </button>
        <button className="platformer-ctrl action" type="button" onClick={onAction}>
          Action
        </button>
        <button className="platformer-ctrl system" type="button" onClick={onStart}>
          Start
        </button>
      </div>

      {snapshot.message && <p className="game-message">{snapshot.message}</p>}
    </div>
  );
}

export default PlatformerGame;
