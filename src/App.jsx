import { useMemo, useRef, useState } from "react";
import GameGrid from "./components/GameGrid";
import GameDetail from "./components/GameDetail";
import { games } from "./data/games";
import React from "react";

const ALL_CATEGORIES = "Todas";
const REFERENCE_PROFILES = [
  {
    title: "Carreras Arcade",
    hint: "HUD de posicion, vuelta, velocidad y turbo.",
    tag: "Ref #1 + #2"
  },
  {
    title: "Accion Tactica",
    hint: "Ritmo shooter con recursos, cooldowns y lectura inmediata.",
    tag: "Ref #4"
  },
  {
    title: "Aventura Plataforma",
    hint: "Exploracion con capas visuales, objetivos claros y feedback continuo.",
    tag: "Ref #3"
  }
];

const getInitialGameIdFromHash = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const gameId = params.get("game");
  return games.some((game) => game.id === gameId) ? gameId : games[0].id;
};

function App() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [selectedGameId, setSelectedGameId] = useState(getInitialGameIdFromHash);
  const detailRef = useRef(null);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...new Set(games.map((game) => game.category))],
    []
  );

  const filteredGames = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) {
      return games;
    }
    return games.filter((game) => game.category === activeCategory);
  }, [activeCategory]);

  const selectedGame = useMemo(() => {
    return (
      filteredGames.find((game) => game.id === selectedGameId) ??
      filteredGames[0] ??
      null
    );
  }, [filteredGames, selectedGameId]);

  const selectCategory = (category) => {
    setActiveCategory(category);
    const firstGame = category === ALL_CATEGORIES
      ? games[0]
      : games.find((game) => game.category === category);

    if (firstGame) {
      setSelectedGameId(firstGame.id);
      window.history.replaceState(null, "", `#game=${encodeURIComponent(firstGame.id)}`);
    }
  };

  const openGame = (gameId) => {
    setSelectedGameId(gameId);
    window.history.replaceState(null, "", `#game=${encodeURIComponent(gameId)}`);

    if (window.matchMedia("(max-width: 959px)").matches) {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  };

  return (
    <div className="app-shell">
      <div className="background-orb orb-a" aria-hidden="true" />
      <div className="background-orb orb-b" aria-hidden="true" />

      <header className="hero">
        <p className="pill">SaaS de juegos web</p>
        <h1>Playforge Studio</h1>
        <p className="hero-copy">
          Catalogo de juegos jugables y tecnicamente viables. Cada categoria
          incorpora direccion artistica de referencia y mejoras de motor para
          llevar la experiencia a un nivel mas profesional en movil, tablet y
          escritorio.
        </p>

        <div className="stats">
          <article>
            <p>Juegos base</p>
            <strong>{games.length}</strong>
          </article>
          <article>
            <p>Tematicas activas</p>
            <strong>{categories.length - 1}</strong>
          </article>
          <article>
            <p>Referencias visuales</p>
            <strong>4 integradas</strong>
          </article>
          <article>
            <p>Viabilidad tecnica</p>
            <strong>100% Alta</strong>
          </article>
        </div>
      </header>

      <section className="reference-strip" aria-label="Direccion visual de referencia">
        {REFERENCE_PROFILES.map((profile) => (
          <article key={profile.title} className="reference-card">
            <p className="reference-tag">{profile.tag}</p>
            <h3>{profile.title}</h3>
            <p>{profile.hint}</p>
          </article>
        ))}
      </section>

      <section className="catalog-toolbar">
        <h2>Explorar juegos</h2>
        <div className="filter-group">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? "active" : ""}
              onClick={() => selectCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <main className="content-layout">
        <section aria-label="Catalogo de juegos">
          <GameGrid
            games={filteredGames}
            selectedId={selectedGame?.id ?? null}
            onSelectGame={openGame}
          />
        </section>

        <aside className="detail-column" ref={detailRef}>
          <GameDetail key={selectedGame?.id ?? "empty"} game={selectedGame} />
        </aside>
      </main>

      <footer className="footer-note">
        <p>
          Plataforma orientada a modelo SaaS: cada categoria puede crecer con
          nuevos juegos completos sin romper la arquitectura del frontend.
        </p>
      </footer>
    </div>
  );
}

export default App;
