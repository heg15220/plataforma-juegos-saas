import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import PacmanRuntime from "../game/PacmanRuntime";
import PacmanHUD from "../ui/PacmanHUD";
import PacmanMenu from "../ui/PacmanMenu";
import PacmanPauseOverlay from "../ui/PacmanPauseOverlay";
import PacmanEndOverlay from "../ui/PacmanEndOverlay";

const createDefaultSnapshot = () => ({
  variant: "pacman",
  coordinates: "origin_top_left_x_right_y_down_tile_centers",
  score: 0,
  highScore: 0,
  lives: 3,
  level: 1,
  mode: "menu",
  message: "Press Start to play.",
  fps: 60,
  frameTime: 16.67,
  debug: false,
  soundEnabled: true,
  maxLevel: 3,
  pelletsRemaining: 0,
  frightenedRemaining: 0,
  phaseMode: "scatter",
  pacman: null,
  ghosts: [],
  map: { rows: 0, cols: 0, tileSize: 0 }
});

function PacmanGame() {
  const canvasRef = useRef(null);
  const runtimeRef = useRef(null);
  const [snapshot, setSnapshot] = useState(createDefaultSnapshot);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const runtime = new PacmanRuntime({
      canvas,
      onSnapshot: (nextSnapshot) => setSnapshot(nextSnapshot),
      maxLevel: 3
    });

    runtimeRef.current = runtime;
    runtime.start();

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, []);

  const startGame = useCallback(() => runtimeRef.current?.startGame(), []);
  const restartGame = useCallback(() => runtimeRef.current?.restartGame(), []);
  const togglePause = useCallback(() => runtimeRef.current?.togglePause(), []);
  const toggleSound = useCallback(() => runtimeRef.current?.toggleSound(), []);
  const toggleDebug = useCallback(() => runtimeRef.current?.toggleDebug(), []);

  const setVirtualDirection = useCallback((direction) => {
    runtimeRef.current?.setVirtualDirection(direction);
    if (direction) {
      runtimeRef.current?.queueDirection(direction);
    }
  }, []);

  const clearVirtualDirection = useCallback(() => {
    runtimeRef.current?.clearVirtualDirection();
  }, []);

  const buildTextPayload = useCallback((state) => ({
    mode: "pacman_arcade",
    coordinates: state.coordinates,
    status: state.mode,
    score: state.score,
    highScore: state.highScore,
    lives: state.lives,
    level: state.level,
    pelletsRemaining: state.pelletsRemaining,
    phaseMode: state.phaseMode,
    frightenedRemaining: state.frightenedRemaining,
    fps: state.fps,
    frameTime: state.frameTime,
    pacman: state.pacman,
    ghosts: state.ghosts,
    message: state.message,
    map: state.map,
    controls: {
      keyboard: "WASD/Arrows move, Enter/Space start, P/Esc pause, R restart",
      touch: "D-pad buttons queue/hold direction"
    }
  }), []);

  const advanceTime = useCallback((ms) => {
    runtimeRef.current?.advanceTime(ms);
  }, []);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const showMenu = snapshot.mode === "menu";
  const showPause = snapshot.mode === "paused";
  const showEnd = snapshot.mode === "gameover" || snapshot.mode === "win";

  const statusMessage = useMemo(() => {
    if (snapshot.mode === "levelTransition") {
      return `Level ${snapshot.level} clear. Loading next maze...`;
    }
    if (snapshot.mode === "lifeLost") {
      return "Life lost. Respawning...";
    }
    return snapshot.message;
  }, [snapshot.level, snapshot.message, snapshot.mode]);

  return (
    <div className="mini-game pacman-game">
      <div className="mini-head">
        <div>
          <h4>Pac-Man Maze Protocol</h4>
          <p>Arcade chase con FSM de fantasmas, pellets, power mode, vidas y progresion por nivel.</p>
        </div>
      </div>

      <PacmanHUD
        snapshot={snapshot}
        onPause={togglePause}
        onRestart={restartGame}
        onToggleSound={toggleSound}
        onToggleDebug={toggleDebug}
      />

      <div className="pacman-stage-shell">
        <canvas
          ref={canvasRef}
          className="pacman-canvas"
          aria-label="Pac-Man game canvas"
        />

        {showMenu ? <PacmanMenu onStart={startGame} onToggleSound={toggleSound} soundEnabled={snapshot.soundEnabled} /> : null}
        {showPause ? <PacmanPauseOverlay onResume={togglePause} onRestart={restartGame} /> : null}
        {showEnd ? <PacmanEndOverlay mode={snapshot.mode} score={snapshot.score} highScore={snapshot.highScore} onRestart={restartGame} /> : null}
      </div>

      <div className="pacman-touch-controls" role="group" aria-label="Pac-Man touch controls">
        <button
          type="button"
          onMouseDown={() => setVirtualDirection("up")}
          onMouseUp={clearVirtualDirection}
          onMouseLeave={clearVirtualDirection}
          onTouchStart={() => setVirtualDirection("up")}
          onTouchEnd={clearVirtualDirection}
          onTouchCancel={clearVirtualDirection}
        >
          Up
        </button>
        <button
          type="button"
          onMouseDown={() => setVirtualDirection("left")}
          onMouseUp={clearVirtualDirection}
          onMouseLeave={clearVirtualDirection}
          onTouchStart={() => setVirtualDirection("left")}
          onTouchEnd={clearVirtualDirection}
          onTouchCancel={clearVirtualDirection}
        >
          Left
        </button>
        <button
          type="button"
          onMouseDown={() => setVirtualDirection("down")}
          onMouseUp={clearVirtualDirection}
          onMouseLeave={clearVirtualDirection}
          onTouchStart={() => setVirtualDirection("down")}
          onTouchEnd={clearVirtualDirection}
          onTouchCancel={clearVirtualDirection}
        >
          Down
        </button>
        <button
          type="button"
          onMouseDown={() => setVirtualDirection("right")}
          onMouseUp={clearVirtualDirection}
          onMouseLeave={clearVirtualDirection}
          onTouchStart={() => setVirtualDirection("right")}
          onTouchEnd={clearVirtualDirection}
          onTouchCancel={clearVirtualDirection}
        >
          Right
        </button>
        <button type="button" onClick={togglePause}>Pause</button>
      </div>

      <p className="game-message">{statusMessage}</p>
    </div>
  );
}

export default PacmanGame;
