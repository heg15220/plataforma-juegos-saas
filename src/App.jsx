import React, { useMemo, useState } from "react";
import GameGrid from "./components/GameGrid";
import GameLaunchModal from "./components/GameLaunchModal";
import { games } from "./data/games";
import { useTranslations, localizeCategory } from "./i18n";

// Internal sentinel for "show all categories" — never shown to the user directly
const ALL_KEY = "__all__";

const getInitialGameIdFromHash = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const gameId = params.get("game");
  return games.some((g) => g.id === gameId) ? gameId : null;
};

function App() {
  const { t, locale } = useTranslations();

  const [activeCategory, setActiveCategory] = useState(ALL_KEY);
  // ID of the game being *played* in the modal (null = modal closed)
  const [launchedGameId, setLaunchedGameId] = useState(getInitialGameIdFromHash);

  // Unique category keys (from the raw data, language-neutral)
  const categoryKeys = useMemo(
    () => [...new Set(games.map((g) => g.category))],
    []
  );

  const filteredGames = useMemo(() => {
    if (activeCategory === ALL_KEY) return games;
    return games.filter((g) => g.category === activeCategory);
  }, [activeCategory]);

  const launchedGame = useMemo(
    () => games.find((g) => g.id === launchedGameId) ?? null,
    [launchedGameId]
  );

  const launchGame = (gameId) => {
    setLaunchedGameId(gameId);
    window.history.replaceState(null, "", `#game=${encodeURIComponent(gameId)}`);
  };

  const closeModal = () => {
    setLaunchedGameId(null);
    window.history.replaceState(null, "", " ");
  };

  const selectCategory = (key) => {
    setActiveCategory(key);
  };

  return (
    <>
      <div className="app-shell">
        <div className="background-orb orb-a" aria-hidden="true" />
        <div className="background-orb orb-b" aria-hidden="true" />

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="hero">
          <p className="pill">{t("pill")}</p>
          <h1>{t("heroTitle")}</h1>
          <p className="hero-copy">{t("heroCopy")}</p>

          <div className="stats">
            <article>
              <p>{t("statsGames")}</p>
              <strong>{games.length}</strong>
            </article>
            <article>
              <p>{t("statsThemes")}</p>
              <strong>{categoryKeys.length}</strong>
            </article>
            <article>
              <p>{t("statsViability")}</p>
              <strong>{t("statsViabilityValue")}</strong>
            </article>
          </div>
        </header>

        {/* ── Catalog toolbar ───────────────────────────────────────────── */}
        <section className="catalog-toolbar">
          <h2>{t("exploreTitle")}</h2>
          <div className="filter-group">
            {/* "All" button */}
            <button
              key={ALL_KEY}
              type="button"
              className={activeCategory === ALL_KEY ? "active" : ""}
              onClick={() => selectCategory(ALL_KEY)}
            >
              {t("allCategories")}
            </button>

            {categoryKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={activeCategory === key ? "active" : ""}
                onClick={() => selectCategory(key)}
              >
                {localizeCategory(key, locale)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Game catalog grid ─────────────────────────────────────────── */}
        <main>
          <GameGrid
            games={filteredGames}
            onLaunchGame={launchGame}
            locale={locale}
          />
        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="footer-note">
          <p>{t("footerNote")}</p>
        </footer>
      </div>

      {/* ── Launch modal (portal-like, rendered outside app-shell) ────── */}
      {launchedGame && (
        <GameLaunchModal game={launchedGame} onClose={closeModal} />
      )}
    </>
  );
}

export default App;
