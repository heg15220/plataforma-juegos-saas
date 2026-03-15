import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../../../utils/useGameRuntimeBridge";
import resolveBrowserLanguage from "../../../utils/resolveBrowserLanguage";
import CosmicVanguardRuntime, { STAGE_HEIGHT, STAGE_WIDTH } from "./runtime";
import {
  fetchBackendSnapshot,
  loadPilotName,
  savePilotName,
  submitRun,
} from "./backendClient";

const UI = {
  es: {
    title: "Cosmic Vanguard",
    subtitle:
      "Shooter espacial tactico con inercia refinada, pasadas de riesgo/recompensa, bosses por fases y clasificacion persistente.",
    start: "Iniciar corrida",
    restart: "Reiniciar",
    pause: "Pausa",
    fullscreen: "Pantalla completa",
    pilot: "Piloto",
    telemetry: "Telemetria",
    mission: "Control de mision",
    leaderboard: "Clasificacion",
    events: "Registro",
    touch: "Controles tactiles",
    hull: "Casco",
    shield: "Escudo",
    energy: "Energia",
    heat: "Calor",
    vanguard: "Vanguard",
    score: "Score",
    wave: "Oleada",
    sector: "Sector",
    accuracy: "Precision",
    kills: "Bajas",
    asteroids: "Asteroides",
    threat: "Amenaza",
    nearMiss: "Pasadas limite",
    backend: "Backend",
    controls:
      "A/D rota, W impulsa, S frena, Shift boost, Espacio dispara, E pulso EMP, P pausa, R reinicia y F alterna pantalla completa. Las pasadas al limite cargan Vanguard Drive.",
    online: "Remoto",
    offline: "Local",
    noScores: "Sin scores todavia.",
    loading: "Cargando tablero...",
    touchLeft: "Izq",
    touchRight: "Der",
    touchThrust: "Impulso",
    touchFire: "Fuego",
    touchBoost: "Boost",
    touchPulse: "Pulso",
  },
  en: {
    title: "Cosmic Vanguard",
    subtitle:
      "Tactical space shooter with refined inertia, risk-reward close passes, phased bosses, and a persistent leaderboard.",
    start: "Start run",
    restart: "Restart",
    pause: "Pause",
    fullscreen: "Fullscreen",
    pilot: "Pilot",
    telemetry: "Telemetry",
    mission: "Mission control",
    leaderboard: "Leaderboard",
    events: "Event log",
    touch: "Touch controls",
    hull: "Hull",
    shield: "Shield",
    energy: "Energy",
    heat: "Heat",
    vanguard: "Vanguard",
    score: "Score",
    wave: "Wave",
    sector: "Sector",
    accuracy: "Accuracy",
    kills: "Kills",
    asteroids: "Asteroids",
    threat: "Threat",
    nearMiss: "Near misses",
    backend: "Backend",
    controls:
      "A/D rotate, W thrust, S brake, Shift boost, Space fire, E EMP pulse, P pause, R restart, and F toggles fullscreen. Close passes charge Vanguard Drive.",
    online: "Remote",
    offline: "Local",
    noScores: "No scores yet.",
    loading: "Loading leaderboard...",
    touchLeft: "Left",
    touchRight: "Right",
    touchThrust: "Thrust",
    touchFire: "Fire",
    touchBoost: "Boost",
    touchPulse: "Pulse",
  },
};

const DEFAULT_SNAPSHOT = {
  mode: "menu",
  playState: "ready",
  locale: "en",
  coordinates: "origin_top_left_x_right_y_down_pixels_wrap_edges",
  score: 0,
  bestScore: 0,
  wave: 1,
  sector: 1,
  sectorName: "Cobalt Orbit",
  elapsedMs: 0,
  combo: 0,
  comboTimerMs: 0,
  focus: 0,
  vanguardMode: false,
  waveThreat: 0,
  player: {
    x: STAGE_WIDTH / 2,
    y: STAGE_HEIGHT / 2,
    vx: 0,
    vy: 0,
    angleDeg: -90,
    hull: 100,
    shield: 80,
    energy: 100,
    heat: 0,
    overheated: false,
    pulseCooldownMs: 0,
    weaponCooldownMs: 0,
    boosting: false,
  },
  enemies: [],
  asteroids: [],
  bullets: [],
  pickups: [],
  leaderboard: [],
  backendStatus: "loading",
  backendMessage: "",
  backendConfig: { dailySeed: "pending", motd: "" },
  message: "",
  events: [],
  metrics: {
    shotsFired: 0,
    shotsHit: 0,
    enemiesDestroyed: 0,
    asteroidsCleared: 0,
    damageTaken: 0,
    maxCombo: 0,
    accuracy: 0,
    nearMisses: 0,
  },
  fullscreen: false,
};

function resolveDeviceProfile() {
  if (typeof window === "undefined") {
    return "desktop";
  }
  return window.matchMedia?.("(pointer: coarse)")?.matches || (navigator.maxTouchPoints ?? 0) > 0
    ? "touch"
    : "desktop";
}

function formatTime(ms) {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatCooldown(ms) {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export default function CosmicVanguardGame() {
  const locale = useMemo(() => (resolveBrowserLanguage() === "es" ? "es" : "en"), []);
  const copy = UI[locale] ?? UI.en;
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const runtimeRef = useRef(null);
  const [snapshot, setSnapshot] = useState({ ...DEFAULT_SNAPSHOT, locale });
  const [pilotName, setPilotName] = useState(() => loadPilotName());
  const [deviceProfile, setDeviceProfile] = useState(resolveDeviceProfile);

  const requestFullscreen = useCallback(async () => {
    const root = shellRef.current;
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
      // ignore fullscreen failures
    }
  }, []);

  const handleRunFinished = useCallback(
    async (summary) => {
      const result = await submitRun({ ...summary, pilot: pilotName }, locale);
      runtimeRef.current?.applyBackendSnapshot(result);
    },
    [locale, pilotName]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const runtime = new CosmicVanguardRuntime({
      canvas,
      locale,
      onSnapshot: setSnapshot,
      onRunFinished: handleRunFinished,
      onFullscreenRequest: requestFullscreen,
    });
    runtimeRef.current = runtime;
    runtime.start();
    runtime.setPilotName(pilotName);
    return () => {
      runtime.destroy();
      runtimeRef.current = null;
    };
  }, [handleRunFinished, locale, pilotName, requestFullscreen]);

  useEffect(() => {
    let active = true;
    fetchBackendSnapshot(locale).then((result) => {
      if (!active) {
        return;
      }
      runtimeRef.current?.applyBackendSnapshot(result);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    runtimeRef.current?.setPilotName(pilotName);
  }, [pilotName]);

  useEffect(() => {
    const onFullscreenChange = () => {
      runtimeRef.current?.setFullscreenState(
        Boolean(document.fullscreenElement || document.webkitFullscreenElement)
      );
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
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

  const buildTextPayload = useCallback(
    (state) => ({
      mode: "cosmic-vanguard",
      screen: state.mode,
      playState: state.playState,
      coordinates: state.coordinates,
      score: state.score,
      bestScore: state.bestScore,
      wave: state.wave,
      sector: state.sector,
      sectorName: state.sectorName,
      elapsedMs: state.elapsedMs,
      combo: state.combo,
      comboTimerMs: state.comboTimerMs,
      focus: state.focus,
      vanguardMode: state.vanguardMode,
      threat: state.waveThreat,
      player: state.player,
      enemies: state.enemies,
      asteroids: state.asteroids,
      bullets: state.bullets,
      pickups: state.pickups,
      backendStatus: state.backendStatus,
      backendMessage: state.backendMessage,
      leaderboard: state.leaderboard,
      message: state.message,
      metrics: state.metrics,
      fullscreen: state.fullscreen,
    }),
    []
  );

  const advanceTime = useCallback((ms) => runtimeRef.current?.advanceTime(ms), []);
  useGameRuntimeBridge(snapshot, buildTextPayload, advanceTime);

  const setControl = useCallback((control, active) => {
    runtimeRef.current?.setVirtualControl(control, active);
  }, []);

  const holdButtonProps = (control) => ({
    onMouseDown: () => setControl(control, true),
    onMouseUp: () => setControl(control, false),
    onMouseLeave: () => setControl(control, false),
    onTouchStart: (event) => {
      event.preventDefault();
      setControl(control, true);
    },
    onTouchEnd: (event) => {
      event.preventDefault();
      setControl(control, false);
    },
  });

  return (
    <section className="cosmic-vanguard-game" ref={shellRef}>
      <div className="mini-head cosmic-vanguard-head">
        <div>
          <h4>{copy.title}</h4>
          <p>{copy.subtitle}</p>
        </div>
        <div className="cosmic-vanguard-actions">
          <button type="button" onClick={() => runtimeRef.current?.restart()}>{copy.start}</button>
          <button type="button" onClick={() => runtimeRef.current?.togglePause()}>{copy.pause}</button>
          <button type="button" onClick={() => runtimeRef.current?.restart()}>{copy.restart}</button>
          <button type="button" onClick={requestFullscreen}>{copy.fullscreen}</button>
        </div>
      </div>

      <div className="cosmic-vanguard-shell">
        <div className="cosmic-vanguard-stage-panel">
          <div className="cosmic-vanguard-stage">
            <canvas ref={canvasRef} className="cosmic-vanguard-canvas" />
          </div>

          {deviceProfile === "touch" ? (
            <div className="cosmic-vanguard-touch-panel">
              <h5>{copy.touch}</h5>
              <div className="cosmic-vanguard-touch-grid">
                <button type="button" {...holdButtonProps("left")}>{copy.touchLeft}</button>
                <button type="button" {...holdButtonProps("thrust")}>{copy.touchThrust}</button>
                <button type="button" {...holdButtonProps("right")}>{copy.touchRight}</button>
                <button type="button" {...holdButtonProps("fire")}>{copy.touchFire}</button>
                <button type="button" {...holdButtonProps("boost")}>{copy.touchBoost}</button>
                <button type="button" {...holdButtonProps("pulse")}>{copy.touchPulse}</button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="cosmic-vanguard-sidepanel">
          <section className="cosmic-vanguard-panel">
            <header>
              <span>{copy.pilot}</span>
              <strong>{snapshot.mode.toUpperCase()}</strong>
            </header>
            <label className="cosmic-vanguard-pilot-field">
              <span>{copy.pilot}</span>
              <input
                type="text"
                value={pilotName}
                maxLength={12}
                onChange={(event) => {
                  const next = savePilotName(event.target.value);
                  setPilotName(next);
                }}
              />
            </label>
            <p>{copy.controls}</p>
          </section>

          <section className="cosmic-vanguard-panel">
            <header>
              <span>{copy.telemetry}</span>
              <strong>{formatTime(snapshot.elapsedMs)}</strong>
            </header>
            <div className="cosmic-vanguard-stat-grid">
              <article>
                <h6>{copy.score}</h6>
                <p>{snapshot.score}</p>
              </article>
              <article>
                <h6>{copy.wave}</h6>
                <p>{snapshot.wave}</p>
              </article>
              <article>
                <h6>{copy.sector}</h6>
                <p>{snapshot.sector}</p>
              </article>
              <article>
                <h6>{copy.accuracy}</h6>
                <p>{snapshot.metrics.accuracy}%</p>
              </article>
            </div>
            <div className="cosmic-vanguard-meter-list">
              <div>
                <span>{copy.hull}</span>
                <div className="cosmic-vanguard-meter"><div style={{ width: `${snapshot.player.hull}%` }} className="fill hull" /></div>
              </div>
              <div>
                <span>{copy.shield}</span>
                <div className="cosmic-vanguard-meter"><div style={{ width: `${snapshot.player.shield / 0.8}%` }} className="fill shield" /></div>
              </div>
              <div>
                <span>{copy.energy}</span>
                <div className="cosmic-vanguard-meter"><div style={{ width: `${snapshot.player.energy}%` }} className="fill energy" /></div>
              </div>
              <div>
                <span>{copy.heat}</span>
                <div className="cosmic-vanguard-meter"><div style={{ width: `${snapshot.player.heat}%` }} className="fill heat" /></div>
              </div>
              <div>
                <span>{copy.vanguard}</span>
                <div className="cosmic-vanguard-meter"><div style={{ width: `${snapshot.focus}%` }} className="fill focus" /></div>
              </div>
            </div>
            <p>
              {copy.kills}: <strong>{snapshot.metrics.enemiesDestroyed}</strong> · {copy.asteroids}: <strong>{snapshot.metrics.asteroidsCleared}</strong> · {copy.threat}: <strong>{snapshot.waveThreat}%</strong>
            </p>
            <p>
              {copy.nearMiss}: <strong>{snapshot.metrics.nearMisses}</strong> · {copy.vanguard}: <strong>{snapshot.vanguardMode ? "ONLINE" : `${snapshot.focus}%`}</strong>
            </p>
            <p>
              Pulse CD: <strong>{formatCooldown(snapshot.player.pulseCooldownMs)}</strong> · Weapon CD: <strong>{formatCooldown(snapshot.player.weaponCooldownMs)}</strong>
            </p>
          </section>

          <section className="cosmic-vanguard-panel">
            <header>
              <span>{copy.mission}</span>
              <strong>{copy.backend}: {snapshot.backendStatus === "online" ? copy.online : snapshot.backendStatus === "offline" ? copy.offline : copy.loading}</strong>
            </header>
            <p>{snapshot.message}</p>
            <p>{snapshot.backendMessage}</p>
            <p>Seed: <strong>{snapshot.backendConfig.dailySeed}</strong></p>
            <p>{snapshot.backendConfig.motd}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}

