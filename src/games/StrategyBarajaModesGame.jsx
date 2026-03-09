import React, { useMemo, useState } from "react";
import StrategyBriscaDeckGame from "./StrategyBriscaDeckGame";
import StrategyMusDeckGame from "./StrategyMusDeckGame";

const isEs = () =>
  typeof navigator !== "undefined" &&
  String(navigator.language || "").toLowerCase().startsWith("es");

const TEXT = {
  es: {
    brisca: "Brisca/Tute",
    mus: "Mus",
    helper: "Selecciona modalidad de baraja",
  },
  en: {
    brisca: "Brisca/Tute",
    mus: "Mus",
    helper: "Select card mode",
  },
};

function StrategyBarajaModesGame() {
  const locale = useMemo(() => (isEs() ? "es" : "en"), []);
  const t = TEXT[locale] || TEXT.en;
  const [mode, setMode] = useState("brisca");

  return (
    <div className="strategy-baraja-modes">
      <div className="baraja-mode-switch" role="group" aria-label={t.helper}>
        <button
          type="button"
          className={mode === "brisca" ? "active" : ""}
          onClick={() => setMode("brisca")}
          data-mode="brisca"
        >
          {t.brisca}
        </button>
        <button
          type="button"
          className={mode === "mus" ? "active" : ""}
          onClick={() => setMode("mus")}
          data-mode="mus"
        >
          {t.mus}
        </button>
      </div>
      {mode === "mus" ? <StrategyMusDeckGame /> : <StrategyBriscaDeckGame />}
    </div>
  );
}

export default StrategyBarajaModesGame;
