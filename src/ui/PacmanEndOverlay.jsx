import React from "react";

function PacmanEndOverlay({ mode, score, highScore, onRestart }) {
  const isWin = mode === "win";

  return (
    <div className="pacman-overlay-card" role="dialog" aria-label={isWin ? "Pac-Man victory" : "Pac-Man game over"}>
      <h5>{isWin ? "Victory" : "Game Over"}</h5>
      <p>{isWin ? "All configured levels completed." : "No lives left."}</p>
      <p>Score: <strong>{score}</strong> | High Score: <strong>{highScore}</strong></p>
      <div className="pacman-overlay-actions">
        <button type="button" onClick={onRestart}>Play again</button>
      </div>
    </div>
  );
}

export default PacmanEndOverlay;
