import React from "react";

function GameCard({ game, index, isActive, onSelect }) {
  return (
    <article
      className={`game-card ${isActive ? "active" : ""}`.trim()}
      style={{ "--delay": `${index * 85}ms` }}
    >
      <img className="card-image" src={game.image} alt={`Portada de ${game.title}`} />

      <div className="card-body">
        <div className="card-topline">
          <span className="tag">{game.category}</span>
          <span className="chip">{game.sessionTime}</span>
        </div>

        <h3>{game.title}</h3>
        <p className="tagline">{game.tagline}</p>

        <div className="card-meta">
          <span>Dificultad: {game.difficulty}</span>
          <span>{game.multiplayer}</span>
        </div>

        <button
          type="button"
          className="enter-btn"
          onClick={() => onSelect(game.id)}
        >
          Entrar al juego
        </button>
      </div>
    </article>
  );
}

export default GameCard;
