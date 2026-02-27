import React, { Suspense, useEffect } from "react";
import { useTranslations, getLocalizedGame } from "../i18n";
import { getGameComponent, CONTROL_HINTS_BY_LOCALE } from "../games/registry.jsx";

function GameLaunchModal({ game, onClose }) {
  const { t, locale } = useTranslations();
  const lg = getLocalizedGame(game, locale);
  const ActiveGame = getGameComponent(game.id);
  const controlHint = CONTROL_HINTS_BY_LOCALE[locale]?.[game.id];

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="launch-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={lg.title}
    >
      {/* ── Sticky top-bar ─────────────────────────────────────────────── */}
      <div className="launch-topbar">
        <button
          type="button"
          className="launch-back-btn"
          onClick={onClose}
          aria-label={t("back")}
        >
          {t("back")}
        </button>

        <div className="launch-topbar-meta">
          <span className="tag">{lg.category}</span>
          <span className="launch-topbar-title">{lg.title}</span>
        </div>

        <div className="launch-topbar-badges">
          <span className="chip">{game.sessionTime}</span>
          <span className="chip">{lg.difficulty}</span>
        </div>
      </div>

      {/* ── Compact info strip ──────────────────────────────────────────── */}
      <header className="launch-info">
        <p className="launch-tagline">{lg.tagline}</p>

        <dl className="launch-facts">
          {lg.objective && (
            <div className="launch-fact">
              <dt>{t("objective")}</dt>
              <dd>{lg.objective}</dd>
            </div>
          )}

          {lg.howToPlay && (
            <div className="launch-fact">
              <dt>{t("howToPlay")}</dt>
              <dd>{lg.howToPlay}</dd>
            </div>
          )}

          {controlHint && (
            <div className="launch-fact">
              <dt>{t("controls")}</dt>
              <dd>{controlHint}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* ── Game area (large, centered) ─────────────────────────────────── */}
      <section className="launch-game-area" aria-label={t("playNow")}>
        {ActiveGame ? (
          <Suspense
            fallback={
              <div className="launch-loading">
                <span className="launch-loading-dot" />
                <span className="launch-loading-dot" />
                <span className="launch-loading-dot" />
                <p>{t("loading")}</p>
              </div>
            }
          >
            <ActiveGame />
          </Suspense>
        ) : (
          <p className="launch-unsupported">{t("unsupported")}</p>
        )}
      </section>
    </div>
  );
}

export default GameLaunchModal;
