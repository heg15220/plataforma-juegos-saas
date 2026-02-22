import React from "react";
import GameCard from "./GameCard";

function GameGrid({ games, selectedId, onSelectGame }) {
  return (
    <div className="games-grid">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          index={index}
          isActive={game.id === selectedId}
          onSelect={onSelectGame}
        />
      ))}
    </div>
  );
}

export default GameGrid;
