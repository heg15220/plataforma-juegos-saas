import React from "react";

function PacmanMenu({ onStart, onToggleSound, soundEnabled }) {
  return (
    <div className="pacman-overlay-card" role="dialog" aria-label="Pac-Man menu">
      <h5>Pac-Man Maze Protocol</h5>
      <p>Eat all pellets, trigger power mode, and survive the ghosts.</p>
      <ul>
        <li>Move: arrows or WASD</li>
        <li>Pause: P or Esc</li>
        <li>Restart: R</li>
        <li>Debug: G</li>
      </ul>
      <div className="pacman-overlay-actions">
        <button type="button" onClick={onStart}>Start</button>
        <button type="button" onClick={onToggleSound}>{soundEnabled ? "Sound On" : "Sound Off"}</button>
      </div>
    </div>
  );
}

export default PacmanMenu;
