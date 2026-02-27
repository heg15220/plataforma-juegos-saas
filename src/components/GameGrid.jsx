import React from "react";
import GameCard from "./GameCard";
import { useTranslations } from "../i18n";

function GameGrid({ games, onLaunchGame }) {
  const { t, locale } = useTranslations();

  return (
    <div className="games-grid">
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          game={game}
          index={index}
          locale={locale}
          t={t}
          onLaunch={onLaunchGame}
        />
      ))}
    </div>
  );
}

export default GameGrid;
