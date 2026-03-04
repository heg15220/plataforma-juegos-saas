import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlatformerEngine from "./platformer/core/PlatformerEngine";
import { createInitialSnapshot } from "./platformer/ui/hudModel";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const INITIAL_SNAPSHOT = createInitialSnapshot();

const statusByScreen = {
  start: "Ready",
  playing: "Playing",
  level_complete: "Level Clear!",
  game_over: "Game Over",
  game_complete: "Victory!"
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
      level: {
        index: currentSnapshot.levelIndex + 1,
        total: currentSnapshot.levelCount,
        id: currentSnapshot.levelId,
        name: currentSnapshot.levelName
      },
      campaign: {
        route: currentSnapshot.runLevelIds,
        bossLevels: currentSnapshot.runBossLevelCount
      },
      layout: currentSnapshot.levelLayout,
      visualStyle: currentSnapshot.levelVisualStyle,
      isBossLevel: currentSnapshot.isBossLevel,
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
  const coinsProgress =
    snapshot.coinsTotal > 0 ? snapshot.coinsCollected / snapshot.coinsTotal : 0;
  const timeProgress =
    snapshot.timeLimit > 0 ? snapshot.timeLeft / snapshot.timeLimit : 0;
  const stageTitle = snapshot.levelName || `Stage ${snapshot.levelIndex + 1}`;

  const canRestart = useMemo(
    () => snapshot.screen !== "start",
    [snapshot.screen]
  );

  return (
    <div className="mini-game platformer-game">
      <div className="mini-head">
        <div>
          <h4>Sky Runner DX</h4>
          <p>5-stage random run — reach the flag, stomp enemies, collect coins for bonus score.</p>
        </div>
        <div className="platformer-actions">
          <button type="button" onClick={onStart}>
            {snapshot.screen === "start" ? "Start" : "Continue"}
          </button>
          <button type="button" onClick={onRestart} disabled={!canRestart}>
            Restart
          </button>
        </div>
      </div>

      <div className="status-row">
        <span className={`status-pill ${snapshot.screen}`}>{statusLabel}</span>
        <span>Stage <strong>{snapshot.levelIndex + 1}</strong>/{snapshot.levelCount} &mdash; {stageTitle}</span>
        {snapshot.isBossLevel && <span className="status-pill boss">Boss Stage</span>}
        <span>Score: <strong>{snapshot.score}</strong></span>
        <span>Lives: <strong>{snapshot.lives}</strong></span>
      </div>

      <div className="platformer-campaign-strip">
        <span>
          {snapshot.activeBoss
            ? `Boss: ${snapshot.activeBoss.name} — stomp or shoot to damage, then reach the flag`
            : snapshot.screen === "start"
              ? "A/D or arrows to move · W/Space to jump · hold jump for height · F to fire (with power-up)"
              : "Reach the flag! Coins = bonus score."}
        </span>
      </div>

      <div className="meter-stack">
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

      {snapshot.message && (
        <p className="game-message">{snapshot.message}</p>
      )}
    </div>
  );
}

export default PlatformerGame;
