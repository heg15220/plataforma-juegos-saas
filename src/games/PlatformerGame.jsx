import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PlatformerEngine from "./platformer/core/PlatformerEngine";
import { createInitialSnapshot } from "./platformer/ui/hudModel";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";

const INITIAL_SNAPSHOT = createInitialSnapshot();

const statusByScreen = {
  start: "Ready",
  playing: "In run",
  level_complete: "Level clear",
  game_over: "Game over",
  game_complete: "Victory"
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
        name: currentSnapshot.levelName
      },
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
  const playerPowerText = snapshot.player.powerLevel > 0 ? "Fire" : "Small";
  const stageTitle = snapshot.levelName || `Stage ${snapshot.levelIndex + 1}`;

  const canRestart = useMemo(
    () => snapshot.screen !== "start",
    [snapshot.screen]
  );

  return (
    <div className="mini-game platformer-game">
      <div className="mini-head">
        <div>
          <h4>Sky Runner DX - Arcade Platformer</h4>
          <p>Retro pixel campaign with polished visuals, layered parallax and high-feedback combat.</p>
        </div>
        <div className="platformer-actions">
          <button type="button" onClick={onStart}>
            {snapshot.screen === "start" ? "Start run" : "Continue"}
          </button>
          <button type="button" onClick={onRestart} disabled={!canRestart}>
            Restart level
          </button>
        </div>
      </div>

      <div className="status-row">
        <span className={`status-pill ${snapshot.screen}`}>{statusLabel}</span>
        <span>Score: {snapshot.score}</span>
        <span>Lives: {snapshot.lives}</span>
        <span>Level: {snapshot.levelIndex + 1}/{snapshot.levelCount}</span>
        <span>Coins: {snapshot.coinsCollected}/{snapshot.coinsTotal}</span>
        <span>Power: {playerPowerText}</span>
        <span>Time: {Math.max(0, Math.ceil(snapshot.timeLeft))}s</span>
      </div>

      <div className="platformer-campaign-strip">
        <span>Campaign: 7 maps</span>
        <span>Stage: {stageTitle}</span>
        <span>Objective: reach the final flag (coins = bonus)</span>
      </div>

      <div className="meter-stack">
        <div className="meter-line compact">
          <p>Coin progress</p>
          <div className="meter-track">
            <span className="meter-fill quiz" style={{ width: ratioToPercent(coinsProgress) }} />
          </div>
          <strong>{Math.round(coinsProgress * 100)}%</strong>
        </div>
        <div className="meter-line compact">
          <p>Time remaining</p>
          <div className="meter-track">
            <span className="meter-fill timer" style={{ width: ratioToPercent(timeProgress) }} />
          </div>
          <strong>{Math.max(0, Math.ceil(snapshot.timeLeft))}s</strong>
        </div>
      </div>

      <div className="platformer-legend-grid">
        <article>
          <p>Movement Feel</p>
          <strong>Smooth accel/decel + variable jump</strong>
        </article>
        <article>
          <p>Combat Loop</p>
          <strong>Stomp enemies or fire with power-up</strong>
        </article>
        <article>
          <p>Progression</p>
          <strong>Sequential stage unlock (1 to 7)</strong>
        </article>
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

      <p className="game-message">
        {snapshot.message} Controls: A/D or arrows to move, W/up/Space to jump, hold jump for height, F to fire with power-up.
      </p>
    </div>
  );
}

export default PlatformerGame;
