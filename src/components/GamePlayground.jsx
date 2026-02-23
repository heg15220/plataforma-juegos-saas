import React, { Suspense, lazy } from "react";
import AdventureGame from "../games/AdventureGame";
import ActionGame from "../games/ActionGame";
import RacingGame from "../games/RacingGame";
import KnowledgeGame from "../games/KnowledgeGame";
import RpgGame from "../games/RpgGame";

const PlatformerGame = lazy(() => import("../games/PlatformerGame"));
const FighterGame = lazy(() => import("../games/FighterGame"));

const GAME_COMPONENTS = {
  "adventure-echoes": AdventureGame,
  "action-core-strike": ActionGame,
  "racing-neon-lanes": RacingGame,
  "knowledge-quiz-nexus": KnowledgeGame,
  "knowledge-logic-vault": KnowledgeGame,
  "rpg-emberfall": RpgGame,
  "platformer-sky-runner": PlatformerGame,
  "fighter-neon-dojo": FighterGame
};

const CONTROL_HINTS = {
  "adventure-echoes": "Movimiento con WASD/flechas + busqueda, escaneo, raciones, baliza y salto (B).",
  "action-core-strike": "Movimiento con WASD/flechas + rafaga, cohete, overdrive, defensa y botiquin en rondas.",
  "racing-neon-lanes": "Carriles con izquierda/derecha, velocidad con arriba/abajo, turbo (espacio) e item (I).",
  "knowledge-quiz-nexus": "Selecciona respuesta por boton y avanza al bloquear la pregunta.",
  "knowledge-logic-vault": "Selecciona respuesta por boton y avanza al bloquear la pregunta.",
  "rpg-emberfall": "Explora con WASD/flechas y usa atacar, habilidad, defender, enfocar, invocar (U) y pocion.",
  "platformer-sky-runner": "Movimiento con A/D o flechas, salto variable con W/arriba/espacio y accion con F.",
  "fighter-neon-dojo": "Combate con A/D o flechas, salto W/arriba, jab J/espacio, heavy K/enter, guardia L/abajo y special U/B."
};

function GamePlayground({ game }) {
  if (!game) {
    return null;
  }

  const ActiveGame = GAME_COMPONENTS[game.id];
  const controlHint = CONTROL_HINTS[game.id];

  return (
    <section className="game-playground">
      <div className="playground-header">
        <h3>Jugar ahora</h3>
        <p>
          Modo interactivo listo para la categoria{" "}
          <strong>{game.category}</strong>.
        </p>
        {controlHint ? <p className="control-hint">{controlHint}</p> : null}
      </div>

      {ActiveGame ? (
        <Suspense fallback={<p className="unsupported-game">Cargando motor del juego...</p>}>
          <ActiveGame />
        </Suspense>
      ) : (
        <p className="unsupported-game">
          Este juego todavia no tiene motor jugable asignado.
        </p>
      )}
    </section>
  );
}

export default GamePlayground;
