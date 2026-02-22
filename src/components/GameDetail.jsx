import React from "react";
import GamePlayground from "./GamePlayground";

function GameDetail({ game }) {
  if (!game) {
    return (
      <article className="game-detail">
        <p>No hay juegos disponibles para esta categoria.</p>
      </article>
    );
  }

  return (
    <article className="game-detail">
      <img
        className="detail-image"
        src={game.image}
        alt={`Imagen ampliada de ${game.title}`}
      />

      <div className="detail-content">
        <p className="detail-category">{game.category}</p>
        <h2>{game.title}</h2>
        <p className="detail-description">{game.description}</p>

        <div className="direction-grid">
          <article>
            <p>Direccion visual</p>
            <strong>{game.visualStyle}</strong>
          </article>
          <article>
            <p>Upgrade tecnico</p>
            <strong>{game.techFocus}</strong>
          </article>
        </div>

        <ul className="detail-highlights">
          {game.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="detail-meta">
          <article>
            <p>Dificultad</p>
            <strong>{game.difficulty}</strong>
          </article>
          <article>
            <p>Sesion</p>
            <strong>{game.sessionTime}</strong>
          </article>
          <article>
            <p>Modo</p>
            <strong>{game.multiplayer}</strong>
          </article>
        </div>

        <p className="viability">
          Viabilidad tecnica: <strong>{game.viability}</strong>
        </p>

        <GamePlayground game={game} />
      </div>
    </article>
  );
}

export default GameDetail;
