import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import headSoccerGoalLeftUrl      from "../assets/games/head-soccer-goal-left.svg";
import headSoccerGoalRightUrl     from "../assets/games/head-soccer-goal-right.svg";
import headSoccerStadiumBackdropUrl from "../assets/games/head-soccer-stadium-backdrop.svg";
import { createHeadSoccerAudio } from "./headSoccer/audio.js";
import {
  CHARACTERS,
  DIFFICULTY,
  MODES,
  STEP_MS,
  WIDTH,
  HEIGHT,
} from "./headSoccer/config.js";
import {
  applyHeadSoccerConfig,
  createInitialHeadSoccerState,
  createInputState,
  snapshotHeadSoccerState,
  updateHeadSoccer,
} from "./headSoccer/engine.js";
import { renderHeadSoccer } from "./headSoccer/render.js";

const DOUBLE_TAP_MS = 230;

function loadImageAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clearTransientInput(input) {
  input.jump    = false;
  input.kick    = false;
  input.power   = false;
  input.start   = false;
  input.restart = false;
  input.dash    = false;
  input.dashDir = 0;
}

export default function HeadSoccerGame() {
  const canvasRef         = useRef(null);
  const ctxRef            = useRef(null);
  const stateRef          = useRef(createInitialHeadSoccerState());
  const inputRef          = useRef(createInputState());
  const frameRef          = useRef(0);
  const prevTimeRef       = useRef(0);
  const accRef            = useRef(0);
  const audioRef          = useRef(createHeadSoccerAudio());
  const artAssetsRef      = useRef({ backdrop: null, goalLeft: null, goalRight: null });
  const previousScoreRef  = useRef({ player: 0, cpu: 0 });
  const lastTapRef        = useRef({ left: 0, right: 0 });

  const [snapshot, setSnapshot] = useState(() => snapshotHeadSoccerState(stateRef.current));

  const syncSnapshot = useCallback(() => setSnapshot(snapshotHeadSoccerState(stateRef.current)), []);
  const draw         = useCallback((time) => {
    const ctx = ctxRef.current;
    if (ctx) renderHeadSoccer(ctx, stateRef.current, time, artAssetsRef.current);
  }, []);

  const flushOneShot = useCallback(() => {
    updateHeadSoccer(stateRef.current, inputRef.current, STEP_MS / 1000);
    clearTransientInput(inputRef.current);
    draw(performance.now());
    syncSnapshot();
  }, [draw, syncSnapshot]);

  const applyConfig = useCallback((patch) => {
    applyHeadSoccerConfig(stateRef.current, patch);
    syncSnapshot();
    draw(performance.now());
  }, [draw, syncSnapshot]);

  const tap = useCallback((key, cue = null, immediate = false) => {
    inputRef.current[key] = true;
    audioRef.current.unlock();
    if (cue) audioRef.current.play(cue);
    if (immediate) flushOneShot();
  }, [flushOneShot]);

  const hold = useCallback((key, value) => {
    inputRef.current[key] = value;
    audioRef.current.unlock();
  }, []);

  const bindHoldHandlers = useCallback((key) => ({
    onPointerDown:   (e) => { e.preventDefault(); hold(key, true); },
    onPointerUp:     ()  => hold(key, false),
    onPointerLeave:  ()  => hold(key, false),
    onPointerCancel: ()  => hold(key, false),
  }), [hold]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    ctxRef.current = canvas.getContext("2d");
    draw(0);

    const tick = (time) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      let delta = Math.min(40, time - prevTimeRef.current);
      prevTimeRef.current = time;
      accRef.current += delta;

      while (accRef.current >= STEP_MS) {
        updateHeadSoccer(stateRef.current, inputRef.current, STEP_MS / 1000);
        clearTransientInput(inputRef.current);
        accRef.current -= STEP_MS;
      }

      draw(time);
      syncSnapshot();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [draw, syncSnapshot]);

  // Art assets
  useEffect(() => {
    let active = true;
    Promise.all([
      loadImageAsset(headSoccerStadiumBackdropUrl),
      loadImageAsset(headSoccerGoalLeftUrl),
      loadImageAsset(headSoccerGoalRightUrl),
    ])
      .then(([backdrop, goalLeft, goalRight]) => {
        if (!active) return;
        artAssetsRef.current = { backdrop, goalLeft, goalRight };
        draw(performance.now());
      })
      .catch(() => {});
    return () => { active = false; };
  }, [draw]);

  // Keyboard controls with double-tap dash detection
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const now = performance.now();
        if (now - lastTapRef.current.left < DOUBLE_TAP_MS) {
          inputRef.current.dash    = true;
          inputRef.current.dashDir = -1;
          audioRef.current.unlock();
        }
        lastTapRef.current.left = now;
        hold("left", true);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const now = performance.now();
        if (now - lastTapRef.current.right < DOUBLE_TAP_MS) {
          inputRef.current.dash    = true;
          inputRef.current.dashDir = 1;
          audioRef.current.unlock();
        }
        lastTapRef.current.right = now;
        hold("right", true);
      }
      if (e.key === "ArrowUp")   { e.preventDefault(); tap("jump",  "jump",  true); }
      if (e.code === "Space")    { e.preventDefault(); tap("kick",  "kick",  true); }
      if (e.key === "b" || e.key === "B") { e.preventDefault(); tap("power", "power", true); }
      if (e.key === "Enter")     { e.preventDefault(); tap("start", "start", true); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); tap("restart", null, true); }
    };
    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft")  hold("left",  false);
      if (e.key === "ArrowRight") hold("right", false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [hold, tap]);

  // Goal sound
  useEffect(() => {
    const prev = previousScoreRef.current;
    if (snapshot.score.player !== prev.player || snapshot.score.cpu !== prev.cpu) {
      audioRef.current.play("goal");
      previousScoreRef.current = snapshot.score;
    }
  }, [snapshot.score]);

  // Runtime bridge
  const buildTextPayload = useCallback((current) => ({
    mode: "head_soccer_arcade",
    coordinates: "origin_top_left_x_right_y_down",
    status: current.status,
    match: {
      modeId: current.gameModeId, modeLabel: current.gameModeLabel,
      difficultyId: current.difficultyId,
      roundIndex: current.roundIndex, roundLabel: current.roundLabel,
      timer: current.timer, clock: current.clock, goldenGoal: current.goldenGoal,
      score: current.score,
      rival: { name: current.opponentName, nation: current.opponentNation },
    },
    player: { characterId: current.playerCharacterId, characterName: current.playerCharacterName, powerLabel: current.playerPowerLabel, ...current.player },
    cpu:    { characterId: current.cpuCharacterId,    characterName: current.cpuCharacterName,    powerLabel: current.cpuPowerLabel,    ...current.cpu    },
    ball: current.ball, series: current.series, message: current.message, logs: current.logs,
  }), []);

  const advanceTime = useCallback((ms) => {
    const loops = Math.max(1, Math.round(ms / STEP_MS));
    for (let i = 0; i < loops; i++) {
      updateHeadSoccer(stateRef.current, inputRef.current, STEP_MS / 1000);
      clearTransientInput(inputRef.current);
    }
    draw(performance.now());
    syncSnapshot();
  }, [draw, syncSnapshot]);

  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const startLabel = snapshot.status === "playing"    ? "Match Live"
    : snapshot.status === "goal" || snapshot.status === "halftime" || snapshot.status === "fulltime" ? "Stoppage"
    : snapshot.status === "series-end" ? "Play Again"
    : snapshot.status === "round-end"  ? "Next Rival"
    : "Start Match";

  const lastTouchLabel = snapshot.ball.lastTouchType === "kick"
    ? "Kick"
    : snapshot.ball.lastTouchType === "header"
      ? "Header"
      : snapshot.ball.lastTouchType === "head"
        ? "Head"
        : "None";
  const lastTouchOwner = snapshot.ball.lastTouch === "player"
    ? "You"
    : snapshot.ball.lastTouch === "cpu"
      ? "CPU"
      : "Open play";

  const modeOptions       = useMemo(() => Object.values(MODES),       []);
  const characterOptions  = useMemo(() => Object.values(CHARACTERS),  []);
  const difficultyOptions = useMemo(() => Object.values(DIFFICULTY),  []);

  return (
    <div className="mini-game head-soccer-game">
      <div className="mini-head">
        <div>
          <h4>Head Soccer Arena X</h4>
          <p>1v1 football with grounded single-jump physics, halftime resets, headers, kicks and arcade powers.</p>
        </div>
        <div className="head-soccer-actions">
          <button type="button" onClick={() => tap("start",   "start", true)}>{startLabel}</button>
          <button type="button" onClick={() => tap("restart", null,    true)}>Restart Series</button>
        </div>
      </div>

      <div className="head-soccer-shell">
        <aside className="head-soccer-side">
          <section className="head-soccer-panel head-soccer-selectors">
            <label htmlFor="hs-mode">
              Mode
              <select id="hs-mode" value={snapshot.gameModeId}
                onChange={(e) => applyConfig({ gameModeId: e.target.value })}>
                {modeOptions.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            <label htmlFor="hs-char">
              Character
              <select id="hs-char" value={snapshot.playerCharacterId}
                onChange={(e) => applyConfig({ playerCharacterId: e.target.value })}>
                {characterOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label htmlFor="hs-diff">
              CPU
              <select id="hs-diff" value={snapshot.difficultyId}
                onChange={(e) => applyConfig({ difficultyId: e.target.value })}>
                {difficultyOptions.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>
          </section>

          <section className="head-soccer-panel">
            <div className="head-soccer-panel-head">
              <span className={`head-mode-chip ${snapshot.gameModeId}`}>{snapshot.gameModeLabel}</span>
              <strong>{snapshot.roundLabel}</strong>
            </div>
            <p>{snapshot.rules}</p>
            <div className="head-soccer-opponent-card">
              <span>Rival</span>
              <strong>{snapshot.opponentName}</strong>
              <small>{snapshot.opponentNation}</small>
            </div>
          </section>

          <section className="head-soccer-panel">
            <div className="head-soccer-stat-grid">
              <div>
                <span>Player power</span>
                <strong>{Math.round(snapshot.player.powerMeter)}%</strong>
                <em>{snapshot.player.freezeTimer > 0 ? "Frozen" : snapshot.player.giantTimer > 0 ? "Mega head" : snapshot.player.chargedShot ? "Charged!" : "Ready"}</em>
              </div>
              <div>
                <span>CPU power</span>
                <strong>{Math.round(snapshot.cpu.powerMeter)}%</strong>
                <em>{snapshot.cpu.freezeTimer > 0 ? "Frozen" : snapshot.cpu.giantTimer > 0 ? "Mega head" : snapshot.cpu.chargedShot ? "Charged!" : "Ready"}</em>
              </div>
              <div>
                <span>W-L-D</span>
                <strong>{snapshot.series.wins}-{snapshot.series.losses}-{snapshot.series.draws}</strong>
                <em>Pts {snapshot.series.points}</em>
              </div>
              <div>
                <span>Goals</span>
                <strong>{snapshot.series.goalsFor}-{snapshot.series.goalsAgainst}</strong>
                <em>Streak {snapshot.series.bestStreak}</em>
              </div>
              <div>
                <span>Match clock</span>
                <strong>{snapshot.clock.displayLabel}</strong>
                <em>{snapshot.clock.periodLabel}</em>
              </div>
              <div>
                <span>Last contact</span>
                <strong>{lastTouchLabel}</strong>
                <em>{lastTouchOwner}</em>
              </div>
            </div>
          </section>

          <section className="head-soccer-panel">
            <h5>Recent rounds</h5>
            <ul className="head-soccer-history">
              {snapshot.series.history.length ? (
                snapshot.series.history.map((entry, i) => (
                  <li key={`${entry.round}-${i}`}>
                    <strong>{entry.round}</strong>
                    <span>{entry.rival}</span>
                    <em>{entry.score}</em>
                  </li>
                ))
              ) : (
                <li className="empty">No finished rounds yet.</li>
              )}
            </ul>
          </section>
        </aside>

        <section className="head-soccer-stage-wrap">
          <div className="phaser-canvas-shell head-soccer-canvas-frame">
            <div className="phaser-canvas-host">
              <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                aria-label="Head Soccer 1v1 stadium canvas"
              />
            </div>
          </div>

          {/* Mobile controls — matching reference image style */}
          <div className="head-soccer-mobile">
            <div className="hs-touch-dpad">
              <button type="button" className="hs-btn-arrow" {...bindHoldHandlers("left")}>◀ L</button>
              <button type="button" className="hs-btn-arrow" {...bindHoldHandlers("right")}>R ▶</button>
            </div>
            <div className="hs-touch-actions">
              <button type="button" className="hs-btn-action hs-btn-kick" onClick={() => tap("kick", "kick", true)}>Kick</button>
              <button type="button" className="hs-btn-action hs-btn-jump" onClick={() => tap("jump", "jump", true)}>Jump</button>
              <button type="button" className="hs-btn-action hs-btn-power" onClick={() => tap("power", "power", true)}>Power</button>
            </div>
          </div>
        </section>
      </div>

      <p className="game-message">
        {snapshot.message} — ← → move · ↑ single jump · Space kick · B power · double-tap dash · Enter start · R restart
      </p>
      <ul className="game-log">
        {snapshot.logs.map((entry, i) => <li key={`${entry}-${i}`}>{entry}</li>)}
      </ul>
    </div>
  );
}
