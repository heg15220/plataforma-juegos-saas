import React, { useMemo, useState } from "react";
import StrategyBriscaDeckGame from "./StrategyBriscaDeckGame";
import StrategyMusDeckGame from "./StrategyMusDeckGame";
import StrategyEscobaDeckGame from "./StrategyEscobaDeckGame";

const isEs = () =>
  typeof navigator !== "undefined" &&
  String(navigator.language || "").toLowerCase().startsWith("es");

const TEXT = {
  es: {
    brisca: "Brisca/Tute",
    mus: "Mus",
    escoba: "Escoba",
    helper: "Selecciona modalidad de baraja",
    modeLabel: "Modo",
    activeMode: "Activo",
  },
  en: {
    brisca: "Brisca/Tute",
    mus: "Mus",
    escoba: "Escoba",
    helper: "Select card mode",
    modeLabel: "Mode",
    activeMode: "Active",
  },
};

function StrategyBarajaModesGame() {
  const locale = useMemo(() => (isEs() ? "es" : "en"), []);
  const t = TEXT[locale] || TEXT.en;
  const [mode, setMode] = useState("brisca");
  const modeLabel = mode === "mus" ? t.mus : mode === "escoba" ? t.escoba : t.brisca;

  return (
    <div className="strategy-baraja-modes">
      <div className="baraja-mode-switch" aria-label={t.helper}>
        <label htmlFor="baraja-mode-select">
          <span>{t.modeLabel}</span>
          <select
            id="baraja-mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            data-mode-select="baraja"
          >
            <option value="brisca" data-mode="brisca">
              {t.brisca}
            </option>
            <option value="mus" data-mode="mus">
              {t.mus}
            </option>
            <option value="escoba" data-mode="escoba">
              {t.escoba}
            </option>
          </select>
        </label>
        <p className="baraja-mode-active">
          {t.activeMode}: <strong>{modeLabel}</strong>
        </p>
      </div>
      {mode === "mus" ? (
        <StrategyMusDeckGame />
      ) : mode === "escoba" ? (
        <StrategyEscobaDeckGame />
      ) : (
        <StrategyBriscaDeckGame />
      )}
    </div>
  );
}

export default StrategyBarajaModesGame;
