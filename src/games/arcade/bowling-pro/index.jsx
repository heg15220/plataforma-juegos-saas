import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../../../utils/useGameRuntimeBridge";
import resolveBrowserLanguage from "../../../utils/resolveBrowserLanguage";
import { UI_COPY, localizeLabel } from "./copy";
import { ASSET_REFERENCE, RULEBOOK_GROUPS, RULE_STATUS, countRuleStatuses } from "./reference";
import {
  AI_PROFILES,
  AI_PLAYER_COUNT_OPTIONS,
  DEFAULT_CONTROLS,
  beginRoll,
  clamp,
  clampDisplayNumber,
  cloneState,
  createInitialState,
  formatFrameSymbols,
  getDifficultyLabel,
  getLaneLabel,
  getStatusLabel,
  pushLog,
  tickState,
} from "./runtime";
import { buildTextPayload, drawScene } from "./render";

const CONTROL_FEEDBACK_DURATION_MS = 680;

function createControlFeedback(key, previousValue, nextValue) {
  if (!["power", "spin", "loft"].includes(key)) {
    return null;
  }

  if (nextValue === previousValue) {
    return null;
  }

  return {
    key,
    direction: nextValue > previousValue ? "up" : "down",
    value: Number(clampDisplayNumber(nextValue, 2)),
    remainingMs: CONTROL_FEEDBACK_DURATION_MS,
    durationMs: CONTROL_FEEDBACK_DURATION_MS,
  };
}

function BowlingProGame() {
  const locale = useMemo(() => (resolveBrowserLanguage() === "es" ? "es" : "en"), []);
  const ui = UI_COPY[locale] ?? UI_COPY.en;
  const coverage = useMemo(() => countRuleStatuses(), []);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);

  const [game, setGame] = useState(() => createInitialState(locale, "club"));
  const [infoTab, setInfoTab] = useState("rules");
  const aiPlayerOptions = useMemo(
    () =>
      AI_PLAYER_COUNT_OPTIONS.map((count) => ({
        value: count,
        label: locale === "es" ? `${count} IA${count === 1 ? "" : "s"}` : `${count} AI${count === 1 ? "" : "s"}`,
      })),
    [locale]
  );

  useEffect(() => {
    if (canvasRef.current) {
      drawScene(canvasRef.current, game, ui);
    }
  }, [game, ui]);

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        drawScene(canvasRef.current, game, ui);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [game, ui]);

  useEffect(() => {
    let rafId = 0;
    let previousTime = performance.now();

    const loop = (now) => {
      const delta = Math.min(80, now - previousTime);
      previousTime = now;
      setGame((prev) => tickState(prev, delta));
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const startMatch = useCallback(() => {
    setGame((prev) => {
      const next = createInitialState(prev.locale, prev.difficultyKey, undefined, prev.aiPlayerCount);
      next.status = "aim";
      pushLog(
        next,
        next.locale === "es"
          ? "Serie iniciada: 10 cuadros, pistas A/B alternas y marcador oficial activo."
          : "Series started: 10 frames, alternating lane pair, and official scoring active."
      );
      return next;
    });
  }, []);

  const restartMatch = useCallback(() => {
    setGame((prev) => {
      const next = createInitialState(prev.locale, prev.difficultyKey, undefined, prev.aiPlayerCount);
      next.status = "aim";
      pushLog(next, next.locale === "es" ? "Nueva serie preparada." : "New series ready.");
      return next;
    });
  }, []);

  const requestFullscreen = useCallback(async () => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      }
    } catch {
      // Ignore browser fullscreen rejection.
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFullscreen = Boolean(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setGame((prev) =>
        prev.fullscreen === isFullscreen ? prev : { ...prev, fullscreen: isFullscreen }
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const adjustControl = useCallback((key, delta) => {
    setGame((prev) => {
      if (prev.status !== "aim" || prev.players[prev.currentPlayer]?.type !== "human") {
        return prev;
      }
      const next = cloneState(prev);
      const previousValue = next.controls[key];
      if (key === "aim") {
        next.controls.aim = clamp(next.controls.aim + delta, -1, 1);
      } else if (key === "power") {
        next.controls.power = clamp(next.controls.power + delta, 0.35, 1);
      } else if (key === "spin") {
        next.controls.spin = clamp(next.controls.spin + delta, -1, 1);
      } else if (key === "loft") {
        next.controls.loft = clamp(next.controls.loft + delta, 0, 1);
      }
      const feedback = createControlFeedback(key, previousValue, next.controls[key]);
      if (feedback) {
        next.controlFeedback = feedback;
      }
      return next;
    });
  }, []);

  const setControl = useCallback((key, value) => {
    setGame((prev) => {
      if (prev.status !== "aim" || prev.players[prev.currentPlayer]?.type !== "human") {
        return prev;
      }
      const next = cloneState(prev);
      const previousValue = next.controls[key];
      if (key === "aim") {
        next.controls.aim = clamp(value, -1, 1);
      } else if (key === "power") {
        next.controls.power = clamp(value, 0.35, 1);
      } else if (key === "spin") {
        next.controls.spin = clamp(value, -1, 1);
      } else if (key === "loft") {
        next.controls.loft = clamp(value, 0, 1);
      }
      const feedback = createControlFeedback(key, previousValue, next.controls[key]);
      if (feedback) {
        next.controlFeedback = feedback;
      }
      return next;
    });
  }, []);

  const resetAim = useCallback(() => {
    setGame((prev) => {
      if (prev.status !== "aim" || prev.players[prev.currentPlayer]?.type !== "human") {
        return prev;
      }
      const next = cloneState(prev);
      next.controls = { ...DEFAULT_CONTROLS };
      return next;
    });
  }, []);

  const shoot = useCallback(() => {
    setGame((prev) => {
      if (prev.status !== "aim" || prev.players[prev.currentPlayer]?.type !== "human") {
        return prev;
      }
      const next = cloneState(prev);
      return beginRoll(next, next.controls) ? next : prev;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT"
          || target.tagName === "TEXTAREA"
          || target.tagName === "SELECT"
          || target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "a" || event.key === "ArrowLeft") {
        event.preventDefault();
        adjustControl("aim", -0.035);
        return;
      }
      if (key === "d" || event.key === "ArrowRight") {
        event.preventDefault();
        adjustControl("aim", 0.035);
        return;
      }
      if (key === "w" || event.key === "ArrowUp") {
        event.preventDefault();
        adjustControl("power", 0.03);
        return;
      }
      if (key === "s" || event.key === "ArrowDown") {
        event.preventDefault();
        adjustControl("power", -0.03);
        return;
      }
      if (key === "q") {
        event.preventDefault();
        adjustControl("spin", -0.04);
        return;
      }
      if (key === "e") {
        event.preventDefault();
        adjustControl("spin", 0.04);
        return;
      }
      if (key === "z") {
        event.preventDefault();
        adjustControl("loft", -0.03);
        return;
      }
      if (key === "x") {
        event.preventDefault();
        adjustControl("loft", 0.03);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (game.status === "menu" || game.status === "finished") {
          startMatch();
        } else {
          shoot();
        }
        return;
      }
      if (key === "r") {
        event.preventDefault();
        restartMatch();
        return;
      }
      if (key === "f") {
        event.preventDefault();
        requestFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adjustControl, game.status, requestFullscreen, restartMatch, shoot, startMatch]);

  const handleDifficultyChange = useCallback((event) => {
    const difficultyKey = event.target.value;
    if (!AI_PROFILES[difficultyKey]) {
      return;
    }
    setGame((prev) => createInitialState(prev.locale, difficultyKey, undefined, prev.aiPlayerCount));
  }, []);

  const handleAiPlayerCountChange = useCallback((event) => {
    const aiPlayerCount = Number(event.target.value);
    if (!AI_PLAYER_COUNT_OPTIONS.includes(aiPlayerCount)) {
      return;
    }
    setGame((prev) => createInitialState(prev.locale, prev.difficultyKey, undefined, aiPlayerCount));
  }, []);

  const advanceTime = useCallback((milliseconds) => {
    const safeMs = Math.max(0, Number(milliseconds) || 0);
    if (safeMs <= 0) {
      return;
    }

    setGame((prev) => {
      let current = prev;
      let remaining = safeMs;
      while (remaining > 0) {
        const step = Math.min(48, remaining);
        current = tickState(current, step);
        remaining -= step;
      }
      return current;
    });
  }, []);

  useGameRuntimeBridge(game, buildTextPayload, advanceTime);

  const activePlayer = game.players[game.currentPlayer] ?? null;
  const canShoot = game.status === "aim" && activePlayer?.type === "human";
  const statusLabel = getStatusLabel(game, ui);
  const aiDifficultyLabel = getDifficultyLabel(game.difficultyKey, locale);
  const laneLabel = getLaneLabel(game.frameIndex, locale);

  return (
    <div
      ref={rootRef}
      className={[
        "mini-game",
        "bowling-game",
        game.fullscreen ? "bowling-fullscreen" : "",
      ].join(" ")}
    >
      <div className="mini-head">
        <div>
          <h4>{ui.title}</h4>
          <p>{ui.subtitle}</p>
        </div>
        <div className="bowling-head-actions">
          {(game.status === "menu" || game.status === "finished") ? (
            <button id="bowling-start-btn" type="button" onClick={startMatch}>
              {ui.start}
            </button>
          ) : null}
          <button id="bowling-restart-btn" type="button" onClick={restartMatch}>
            {ui.restart}
          </button>
          <button id="bowling-fullscreen-btn" type="button" onClick={requestFullscreen}>
            {ui.fullscreen}
          </button>
        </div>
      </div>

      <div className="bowling-toolbar">
        <label className="bowling-select-field" htmlFor="bowling-ai-count">
          <span>{ui.aiPlayers}</span>
          <select
            id="bowling-ai-count"
            value={game.aiPlayerCount}
            onChange={handleAiPlayerCountChange}
          >
            {aiPlayerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="bowling-select-field" htmlFor="bowling-ai-difficulty">
          <span>{ui.aiDifficulty}</span>
          <select
            id="bowling-ai-difficulty"
            value={game.difficultyKey}
            onChange={handleDifficultyChange}
          >
            {Object.entries(AI_PROFILES).map(([difficultyKey, profile]) => (
              <option key={difficultyKey} value={difficultyKey}>
                {localizeLabel(profile.label, locale)}
              </option>
            ))}
          </select>
        </label>

        <div className="bowling-top-pills">
          <span className="bowling-pill">
            <strong>{ui.lanePair}:</strong> {ui.lanePairValue}
          </span>
          <span className="bowling-pill">
            <strong>{ui.ruleCoverage}:</strong> {coverage.simulated}/{coverage.partial}/
            {coverage.documented}
          </span>
          <span className="bowling-pill">
            <strong>{ui.foul}:</strong> {ui.foulMark}
          </span>
        </div>
      </div>

      <div className="bowling-layout">
        <section className="mini-stage bowling-stage">
          <div className="bowling-canvas-host">
            <canvas className="bowling-canvas" ref={canvasRef} />
          </div>

          {game.status === "menu" ? (
            <div className="bowling-overlay">
              <h5>{ui.title}</h5>
              <p>{ui.menuHint}</p>
              <button type="button" onClick={startMatch}>{ui.start}</button>
            </div>
          ) : null}

          {game.status === "finished" ? (
            <div className="bowling-overlay">
              <h5>{game.winner ? `${ui.winner}: ${game.winner}` : ui.tie}</h5>
              <p>{ui.finishedHint}</p>
              <button type="button" onClick={restartMatch}>{ui.restart}</button>
            </div>
          ) : null}
        </section>

        <aside className="bowling-sidepanel">
          <section className="bowling-panel">
            <header>
              <span>{ui.summary}</span>
              <strong>{statusLabel}</strong>
            </header>
            <div className="bowling-summary-grid">
              <article>
                <h6>{ui.activePlayer}</h6>
                <p>{activePlayer?.name ?? "-"}</p>
              </article>
              <article>
                <h6>{ui.frame}</h6>
                <p>{Math.min(game.frameIndex + 1, 10)}</p>
              </article>
              <article>
                <h6>{ui.lane}</h6>
                <p>{laneLabel}</p>
              </article>
              <article>
                <h6>{ui.livePins}</h6>
                <p>{game.pinsStanding.length}</p>
              </article>
            </div>
            <p>{ui.status}: <strong>{statusLabel}</strong></p>
            <p>{ui.aiPlayers}: <strong>{game.aiPlayerCount}</strong></p>
            <p>{ui.aiDifficulty}: <strong>{aiDifficultyLabel}</strong></p>
            <p>{ui.turnLights}: <strong>{activePlayer?.type === "ai" ? ui.aiTurn : ui.yourTurn}</strong></p>
            {game.lastRoll ? (
              <p>
                {ui.lastRoll}:{" "}
                <strong>
                  {game.lastRoll.playerName} · {game.lastRoll.type} · {game.lastRoll.pinfall}
                  {game.lastRoll.foul ? ` · ${ui.foul}` : ""}
                  {game.lastRoll.split ? ` · ${ui.split}` : ""}
                </strong>
              </p>
            ) : null}
          </section>

          <section className="bowling-panel bowling-scoreboard">
            <header>
              <span>{ui.scoreboard}</span>
              <strong>{ui.frame} {Math.min(game.frameIndex + 1, 10)} · {laneLabel}</strong>
            </header>

            <div className="bowling-score-table-wrap">
              <table className="bowling-score-table">
                <thead>
                  <tr>
                    <th>{ui.player}</th>
                    {Array.from({ length: 10 }, (_, index) => (
                      <th key={`head-${index}`}>{index + 1}</th>
                    ))}
                    <th>{ui.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {game.players.map((player, playerIndex) => (
                    <tr key={player.id} className={playerIndex === game.currentPlayer ? "active" : ""}>
                      <th>{player.name}</th>
                      {player.frames.map((frame, frameIndex) => {
                        const marks = formatFrameSymbols(frameIndex, frame);
                        const cumulative = player.cumulative[frameIndex];
                        return (
                          <td key={`${player.id}-${frameIndex}`}>
                            <div className="bowling-frame-cell">
                              <div className={`bowling-rolls ${frameIndex === 9 ? "tenth" : ""}`}>
                                {marks.map((mark, markIndex) => (
                                  <span
                                    key={`${player.id}-${frameIndex}-${markIndex}`}
                                    className={[
                                      frame.split && markIndex === 0 ? "split" : "",
                                      frame.fouls[markIndex] ? "foul" : "",
                                    ].filter(Boolean).join(" ")}
                                  >
                                    {mark}
                                  </span>
                                ))}
                              </div>
                              <strong>{cumulative == null ? "" : cumulative}</strong>
                            </div>
                          </td>
                        );
                      })}
                      <td className="bowling-total-cell">{player.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bowling-panel">
            <header>
              <span>{ui.stats}</span>
              <strong>{ui.official}</strong>
            </header>
            <div className="bowling-stats-grid">
              {game.players.map((player) => (
                <article key={`stats-${player.id}`}>
                  <h6>{player.name}</h6>
                  <p>X {player.stats.strikes} · / {player.stats.spares} · O {player.stats.opens}</p>
                  <p>
                    {ui.doubles}: {player.stats.doubles} · {ui.triples}: {player.stats.triples}
                  </p>
                  <p>
                    {ui.bestRun}: {player.stats.bestStrikeRun} · {ui.foul}: {player.stats.fouls} · {ui.split}: {player.stats.splits}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="bowling-panel bowling-reference-panel">
            <header>
              <span>{infoTab === "rules" ? ui.rulebook : ui.assetPack}</span>
              <div className="bowling-tabs">
                <button
                  type="button"
                  className={infoTab === "rules" ? "active" : ""}
                  onClick={() => setInfoTab("rules")}
                >
                  {ui.rulebook}
                </button>
                <button
                  type="button"
                  className={infoTab === "assets" ? "active" : ""}
                  onClick={() => setInfoTab("assets")}
                >
                  {ui.assetPack}
                </button>
              </div>
            </header>

            {infoTab === "rules" ? (
              <div className="bowling-rulebook">
                <p className="bowling-panel-note">{ui.rulesPanelHint}</p>
                <div className="bowling-coverage-chips">
                  {Object.entries(coverage).map(([key, value]) => (
                    <span key={key} className={`bowling-rule-chip ${key}`}>
                      {localizeLabel(RULE_STATUS[key], locale)}: {value}
                    </span>
                  ))}
                </div>
                <div className="bowling-rule-groups">
                  {RULEBOOK_GROUPS.map((group) => (
                    <section key={group.id} className="bowling-rule-group">
                      <h6>{localizeLabel(group.title, locale)}</h6>
                      <div className="bowling-rule-list">
                        {group.rules.map((rule) => (
                          <article key={rule.id} className="bowling-rule-item">
                            <div className="bowling-rule-item-head">
                              <strong>R{rule.id}. {localizeLabel(rule.title, locale)}</strong>
                              <span className={`bowling-rule-badge ${rule.status}`}>
                                {localizeLabel(RULE_STATUS[rule.status], locale)}
                              </span>
                            </div>
                            <p>{localizeLabel(rule.summary, locale)}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bowling-assets-panel">
                <p className="bowling-panel-note">{ui.assetsPanelHint}</p>
                <div className="bowling-reference-meta">
                  <p><strong>{ui.sourcePack}:</strong> {ASSET_REFERENCE.name}</p>
                  <p><strong>{ui.sourceRepo}:</strong> <a href={ASSET_REFERENCE.repoUrl} target="_blank" rel="noreferrer">{ASSET_REFERENCE.source}</a></p>
                  <p><strong>{ui.sourceLicense}:</strong> {ASSET_REFERENCE.license}</p>
                </div>

                <div className="bowling-material-swatches">
                  {ASSET_REFERENCE.materials.map((material) => (
                    <article key={material.name} className="bowling-swatch-card">
                      <span
                        className="bowling-swatch-chip"
                        style={{ backgroundColor: material.swatch }}
                      />
                      <div>
                        <strong>{material.name}</strong>
                        <p>{localizeLabel(material.role, locale)}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <p className="bowling-panel-note">{ui.paletteNote}</p>

                <div className="bowling-reference-list">
                  <h6>{ui.fileInventory}</h6>
                  {ASSET_REFERENCE.files.map((file) => (
                    <article key={file.name} className="bowling-file-item">
                      <strong>{file.name}</strong>
                      <span>{file.size}</span>
                      <p>{localizeLabel(file.role, locale)}</p>
                    </article>
                  ))}
                </div>

                <div className="bowling-reference-list">
                  <h6>{ui.environmentCues}</h6>
                  {ASSET_REFERENCE.environmentCues.map((cue, index) => (
                    <p key={`cue-${index}`}>{localizeLabel(cue, locale)}</p>
                  ))}
                </div>

                <div className="bowling-reference-list">
                  <h6>{ui.implementationNotes}</h6>
                  {ASSET_REFERENCE.implementationNotes.map((note, index) => (
                    <p key={`note-${index}`}>{localizeLabel(note, locale)}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="bowling-control-deck">
        <header>{ui.controls}</header>
        <div className="bowling-control-grid">
          <label htmlFor="bowling-aim-slider">
            <span>{ui.aim}</span>
            <input
              id="bowling-aim-slider"
              type="range"
              min={-100}
              max={100}
              value={Math.round(game.controls.aim * 100)}
              onChange={(event) => setControl("aim", Number(event.target.value) / 100)}
              disabled={!canShoot}
            />
            <strong>{clampDisplayNumber(game.controls.aim, 2)}</strong>
          </label>

          <label htmlFor="bowling-power-slider">
            <span>{ui.power}</span>
            <input
              id="bowling-power-slider"
              type="range"
              min={35}
              max={100}
              value={Math.round(game.controls.power * 100)}
              onChange={(event) => setControl("power", Number(event.target.value) / 100)}
              disabled={!canShoot}
            />
            <strong>{Math.round(game.controls.power * 100)}%</strong>
          </label>

          <label htmlFor="bowling-spin-slider">
            <span>{ui.spin}</span>
            <input
              id="bowling-spin-slider"
              type="range"
              min={-100}
              max={100}
              value={Math.round(game.controls.spin * 100)}
              onChange={(event) => setControl("spin", Number(event.target.value) / 100)}
              disabled={!canShoot}
            />
            <strong>{clampDisplayNumber(game.controls.spin, 2)}</strong>
          </label>

          <label htmlFor="bowling-loft-slider">
            <span>{ui.loft}</span>
            <input
              id="bowling-loft-slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(game.controls.loft * 100)}
              onChange={(event) => setControl("loft", Number(event.target.value) / 100)}
              disabled={!canShoot}
            />
            <strong>{Math.round(game.controls.loft * 100)}%</strong>
          </label>
        </div>

        <div className="bowling-control-actions">
          <button
            id="bowling-shoot-btn"
            type="button"
            onClick={shoot}
            disabled={!canShoot}
          >
            {ui.shoot}
          </button>
          <button type="button" onClick={resetAim} disabled={!canShoot}>
            {ui.resetAim}
          </button>
          <button type="button" onClick={() => adjustControl("aim", -0.03)} disabled={!canShoot}>L-</button>
          <button type="button" onClick={() => adjustControl("aim", 0.03)} disabled={!canShoot}>L+</button>
          <button type="button" onClick={() => adjustControl("power", -0.03)} disabled={!canShoot}>P-</button>
          <button type="button" onClick={() => adjustControl("power", 0.03)} disabled={!canShoot}>P+</button>
          <button type="button" onClick={() => adjustControl("spin", -0.03)} disabled={!canShoot}>S-</button>
          <button type="button" onClick={() => adjustControl("spin", 0.03)} disabled={!canShoot}>S+</button>
          <button type="button" onClick={() => adjustControl("loft", -0.03)} disabled={!canShoot}>H-</button>
          <button type="button" onClick={() => adjustControl("loft", 0.03)} disabled={!canShoot}>H+</button>
        </div>
      </section>

      <p className="bowling-help-copy">{ui.help}</p>
      <div className="bowling-log-strip">
        {game.logs.map((line, index) => (
          <span key={`${line}-${index}`}>{line}</span>
        ))}
      </div>
    </div>
  );
}

export default BowlingProGame;
