import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../../../utils/useGameRuntimeBridge";
import resolveBrowserLanguage from "../../../utils/resolveBrowserLanguage";
import { getPreviewMatrix, PIECE_BY_ID } from "./core/pieces";
import PrismStackRuntime from "./runtime";
import { UI_COPY, localize } from "./copy";

const DEFAULT_SNAPSHOT = {
  mode: "menu",
  playState: "idle",
  locale: "en",
  board: [],
  boardRows: [],
  columnHeights: [],
  activePiece: null,
  queue: [],
  score: 0,
  bestScore: 0,
  bands: 0,
  bestBands: 0,
  level: 1,
  phaseLabel: "Calibration",
  combo: 0,
  elapsedMs: 0,
  pulseCharges: 1,
  pulseProgress: 0,
  pulseGoal: 4,
  dangerRatio: 0,
  dangerState: "calm",
  dangerLabel: "Stable",
  message: "",
  callout: "",
  lastClearCount: 0,
  soundEnabled: true,
  fullscreen: false,
  deviceProfile: "desktop",
  dropIntervalMs: 0,
  pulseColumn: -1,
  pulseFxMs: 0,
  clearFlashMs: 0,
  coordinates: "origin_top_left_x_right_y_down_board_cells",
};

function resolveDeviceProfile() {
  if (typeof window === "undefined") {
    return "desktop";
  }
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;
  return coarsePointer || hasTouchPoints ? "touch" : "desktop";
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function QueuePreview({ pieceId, title, subtitle }) {
  const matrix = getPreviewMatrix(pieceId);

  return (
    <div className="prism-stack-preview-card">
      <div className="prism-stack-preview-copy">
        <strong>{title}</strong>
        <span>{subtitle ?? PIECE_BY_ID[pieceId]?.name ?? pieceId}</span>
      </div>
      <div className="prism-stack-preview-grid" aria-hidden="true">
        {matrix.flatMap((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <span
              key={`${pieceId}-${rowIndex}-${columnIndex}`}
              className={cell ? "filled" : ""}
              style={
                cell
                  ? {
                      background: `linear-gradient(135deg, ${cell.accent}, ${cell.color})`,
                      boxShadow: `0 0 10px ${cell.color}55`,
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function PrismStackGame() {
  const locale = useMemo(() => (resolveBrowserLanguage() === "es" ? "es" : "en"), []);
  const ui = useMemo(() => localize(UI_COPY, locale), [locale]);
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const runtimeRef = useRef(null);
  const [deviceProfile, setDeviceProfile] = useState(resolveDeviceProfile);
  const [snapshot, setSnapshot] = useState(DEFAULT_SNAPSHOT);

  const requestFullscreen = useCallback(async () => {
    const element = shellRef.current;
    if (!element) {
      return;
    }
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    } catch {
      // ignore fullscreen failures
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const runtime = new PrismStackRuntime({
      canvas,
      locale,
      ui,
      onSnapshot: setSnapshot,
      onFullscreenRequest: requestFullscreen,
      deviceProfile,
    });
    runtimeRef.current = runtime;
    runtime.start();

    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, [deviceProfile, locale, requestFullscreen, ui]);

  useEffect(() => {
    const onChange = () => {
      runtimeRef.current?.setFullscreenState(
        Boolean(document.fullscreenElement || document.webkitFullscreenElement)
      );
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const media = window.matchMedia?.("(pointer: coarse)");
    const updateProfile = () => setDeviceProfile(resolveDeviceProfile());
    updateProfile();
    window.addEventListener("resize", updateProfile);
    media?.addEventListener?.("change", updateProfile);
    return () => {
      window.removeEventListener("resize", updateProfile);
      media?.removeEventListener?.("change", updateProfile);
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.setDeviceProfile(deviceProfile);
  }, [deviceProfile]);

  const buildTextPayload = useCallback(
    (state) => ({
      mode: "prism-stack-protocol",
      screen: state.mode,
      playState: state.playState,
      coordinates: state.coordinates,
      score: state.score,
      bestScore: state.bestScore,
      bands: state.bands,
      bestBands: state.bestBands,
      level: state.level,
      phase: state.phaseLabel,
      combo: state.combo,
      elapsedMs: state.elapsedMs,
      pulse: {
        charges: state.pulseCharges,
        progress: state.pulseProgress,
        goal: state.pulseGoal,
      },
      pressure: {
        ratio: state.dangerRatio,
        state: state.dangerState,
        label: state.dangerLabel,
      },
      boardRows: state.boardRows,
      columnHeights: state.columnHeights,
      activePiece: state.activePiece,
      queue: state.queue,
      message: state.message,
      callout: state.callout,
      soundEnabled: state.soundEnabled,
      fullscreen: state.fullscreen,
      deviceProfile: state.deviceProfile,
    }),
    []
  );

  const advanceTime = useCallback((ms) => runtimeRef.current?.advanceTime(ms), []);
  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const holdButtonProps = (name) => ({
    onMouseDown: () => runtimeRef.current?.setVirtualControl(name, true),
    onMouseUp: () => runtimeRef.current?.setVirtualControl(name, false),
    onMouseLeave: () => runtimeRef.current?.setVirtualControl(name, false),
    onTouchStart: (event) => {
      event.preventDefault();
      runtimeRef.current?.setVirtualControl(name, true);
    },
    onTouchEnd: (event) => {
      event.preventDefault();
      runtimeRef.current?.setVirtualControl(name, false);
    },
    onTouchCancel: () => runtimeRef.current?.setVirtualControl(name, false),
  });

  const activeDeviceProfile = snapshot.deviceProfile ?? deviceProfile;
  const controlsCopy =
    activeDeviceProfile === "touch" ? ui.sections.controlsTouch : ui.sections.controls;

  return (
    <div className={`mini-game prism-stack-game prism-stack-game--${activeDeviceProfile}`}>
      <div className="mini-head prism-stack-head">
        <div>
          <p className="prism-stack-world">{ui.worldLabel}</p>
          <h4>{ui.title}</h4>
          <p>{ui.subtitle}</p>
        </div>
        <div className="prism-stack-actions">
          <button type="button" onClick={() => runtimeRef.current?.startRun()}>
            {ui.labels.play}
          </button>
          <button type="button" onClick={() => runtimeRef.current?.togglePause()}>
            {snapshot.mode === "paused" ? ui.labels.resume : ui.labels.pause}
          </button>
          <button type="button" onClick={() => runtimeRef.current?.toggleAudio()}>
            {ui.labels.audio}: {snapshot.soundEnabled ? "On" : "Off"}
          </button>
          <button type="button" onClick={requestFullscreen}>
            {ui.labels.fullscreen}
          </button>
        </div>
      </div>

      <div className="prism-stack-shell">
        <aside className="prism-stack-panel prism-stack-panel--left">
          <div className="prism-stack-panel-copy">
            <span>{ui.labels.objective}</span>
            <strong>{ui.sections.objective}</strong>
            <p>{ui.sections.identity}</p>
          </div>

          <div className="prism-stack-stat-grid">
            <div>
              <span>{ui.labels.score}</span>
              <strong>{snapshot.score}</strong>
            </div>
            <div>
              <span>{ui.labels.best}</span>
              <strong>{snapshot.bestScore}</strong>
            </div>
            <div>
              <span>{ui.labels.bands}</span>
              <strong>{snapshot.bands}</strong>
            </div>
            <div>
              <span>{ui.labels.level}</span>
              <strong>{snapshot.phaseLabel}</strong>
            </div>
            <div>
              <span>{ui.labels.combo}</span>
              <strong>x{Math.max(1, snapshot.combo || 0)}</strong>
            </div>
            <div>
              <span>{ui.labels.time}</span>
              <strong>{formatTime(snapshot.elapsedMs)}</strong>
            </div>
          </div>

          <div className="prism-stack-system-card">
            <div className="prism-stack-system-head">
              <span>{ui.labels.pulse}</span>
              <strong>
                {snapshot.pulseCharges}/{2}
              </strong>
            </div>
            <div className="prism-stack-gauge">
              <span
                style={{
                  width: `${(snapshot.pulseProgress / Math.max(1, snapshot.pulseGoal)) * 100}%`,
                }}
              />
            </div>
            <p>{ui.sections.system}</p>
          </div>
        </aside>

        <div className="prism-stack-stage-wrap">
          <div className="prism-stack-stage-head">
            <div className="prism-stack-stage-copy">
              <strong>{snapshot.phaseLabel}</strong>
              <p>{snapshot.message}</p>
            </div>
            <div className="prism-stack-stage-chips">
              <span>
                {ui.labels.pressure}: {snapshot.dangerLabel}
              </span>
              <span>
                {ui.labels.bands}: {snapshot.bands}
              </span>
              <span>
                {ui.labels.pulse}: {snapshot.pulseCharges}
              </span>
            </div>
          </div>

          <div ref={shellRef} className="prism-stack-canvas-shell">
            <canvas
              ref={canvasRef}
              className="prism-stack-canvas"
              width="560"
              height="660"
            />

            {snapshot.mode === "menu" ? (
              <div className="prism-stack-overlay">
                <div className="prism-stack-overlay-card">
                  <p className="prism-stack-overlay-eyebrow">{ui.overlays.menuTitle}</p>
                  <h5>{ui.sections.menuTagline}</h5>
                  <p>{ui.overlays.menuBody}</p>
                  <p>{ui.overlays.menuCta}</p>
                  <div className="prism-stack-overlay-actions">
                    <button type="button" onClick={() => runtimeRef.current?.startRun()}>
                      {ui.labels.play}
                    </button>
                    <button type="button" onClick={requestFullscreen}>
                      {ui.labels.fullscreen}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {snapshot.mode === "paused" ? (
              <div className="prism-stack-overlay prism-stack-overlay--subtle">
                <div className="prism-stack-overlay-card prism-stack-overlay-card--compact">
                  <h5>{ui.overlays.pausedTitle}</h5>
                  <p>{ui.overlays.pausedBody}</p>
                  <div className="prism-stack-overlay-actions">
                    <button type="button" onClick={() => runtimeRef.current?.togglePause()}>
                      {ui.labels.resume}
                    </button>
                    <button type="button" onClick={() => runtimeRef.current?.startRun()}>
                      {ui.labels.restart}
                    </button>
                    <button type="button" onClick={() => runtimeRef.current?.returnToMenu()}>
                      {ui.labels.menu}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {snapshot.mode === "gameover" ? (
              <div className="prism-stack-overlay prism-stack-overlay--subtle">
                <div className="prism-stack-overlay-card">
                  <p className="prism-stack-overlay-eyebrow">{ui.overlays.gameOverTitle}</p>
                  <h5>
                    {ui.labels.score}: {snapshot.score}
                  </h5>
                  <p>{ui.overlays.gameOverBody}</p>
                  <p>
                    {ui.labels.bands}: {snapshot.bands} · {ui.labels.best}: {snapshot.bestScore}
                  </p>
                  <div className="prism-stack-overlay-actions">
                    <button type="button" onClick={() => runtimeRef.current?.startRun()}>
                      {ui.labels.restart}
                    </button>
                    <button type="button" onClick={() => runtimeRef.current?.returnToMenu()}>
                      {ui.labels.menu}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="prism-stack-stage-footer">
            <p>{controlsCopy}</p>
          </div>

          <div className="prism-stack-touch-controls">
            <button type="button" {...holdButtonProps("left")}>
              Left
            </button>
            <button type="button" onClick={() => runtimeRef.current?.rotateCounterClockwise()}>
              CCW
            </button>
            <button type="button" onClick={() => runtimeRef.current?.rotateClockwise()}>
              CW
            </button>
            <button type="button" {...holdButtonProps("down")}>
              Drop
            </button>
            <button type="button" onClick={() => runtimeRef.current?.hardDrop()}>
              Slam
            </button>
            <button type="button" onClick={() => runtimeRef.current?.triggerPulse()}>
              Pulse
            </button>
            <button type="button" {...holdButtonProps("right")}>
              Right
            </button>
          </div>
        </div>

        <aside className="prism-stack-panel prism-stack-panel--right">
          <div className="prism-stack-panel-copy">
            <span>{ui.labels.queue}</span>
            <strong>
              {snapshot.activePiece?.id ? PIECE_BY_ID[snapshot.activePiece.id]?.name : ui.title}
            </strong>
            <p>{ui.sections.controls}</p>
          </div>

          <div className="prism-stack-preview-list">
            {snapshot.queue.map((pieceId, index) => (
              <QueuePreview
                key={`${pieceId}-${index}`}
                pieceId={pieceId}
                title={`+${index + 1}`}
                subtitle={PIECE_BY_ID[pieceId]?.name}
              />
            ))}
          </div>

          <div className="prism-stack-system-card">
            <div className="prism-stack-system-head">
              <span>{ui.labels.system}</span>
              <strong>{snapshot.callout}</strong>
            </div>
            <p>{controlsCopy}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PrismStackGame;
