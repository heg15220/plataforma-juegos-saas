import React, { Suspense, lazy, useMemo } from "react";
import AdventureGame from "../games/AdventureGame";
import ActionGame from "../games/ActionGame";
import RacingGame from "../games/RacingGame";
import KnowledgeGame from "../games/KnowledgeGame";
import KnowledgeArcadeGame from "../games/KnowledgeArcadeGame";
import RpgGame from "../games/RpgGame";
import HeadSoccerGame from "../games/HeadSoccerGame";
import PacmanGame from "../games/PacmanGame";
import MinesweeperGame from "../games/MinesweeperGame";
import ChessGame from "../games/ChessGame";
import CheckersGame from "../games/CheckersGame";
import DominoStrategyGame from "../games/DominoStrategyGame";
import PokerTexasHoldemGame from "../games/PokerTexasHoldemGame";
import ParchisStrategyGame from "../games/ParchisStrategyGame";
import RaceGame2DPro from "../games/RaceGame2DPro";
import resolveBrowserLanguage from "../utils/resolveBrowserLanguage";

const PlatformerGame = lazy(() => import("../games/PlatformerGame"));
const FighterGame = lazy(() => import("../games/FighterGame"));
const KnowledgeSudokuGame = () => <KnowledgeArcadeGame variant="sudoku" />;
const KnowledgeAhorcadoGame = () => <KnowledgeArcadeGame variant="ahorcado" />;
const KnowledgePacienciaGame = () => <KnowledgeArcadeGame variant="paciencia" />;
const KnowledgePuzleGame = () => <KnowledgeArcadeGame variant="puzle" />;
const KnowledgeCrucigramaGame = () => <KnowledgeArcadeGame variant="crucigrama" />;
const KnowledgeSopaLetrasGame = () => <KnowledgeArcadeGame variant="sopa-letras" />;

const GAME_COMPONENTS = {
  "adventure-echoes": AdventureGame,
  "action-core-strike": ActionGame,
  "racing-neon-lanes": RacingGame,
  "knowledge-quiz-nexus": KnowledgeGame,
  "knowledge-logic-vault": KnowledgeGame,
  "knowledge-sudoku-sprint": KnowledgeSudokuGame,
  "knowledge-domino-chain": DominoStrategyGame,
  "knowledge-ahorcado-flash": KnowledgeAhorcadoGame,
  "knowledge-paciencia-lite": KnowledgePacienciaGame,
  "knowledge-puzle-deslizante": KnowledgePuzleGame,
  "knowledge-crucigrama-mini": KnowledgeCrucigramaGame,
  "knowledge-sopa-letras-mega": KnowledgeSopaLetrasGame,
  "strategy-chess-grandmaster": ChessGame,
  "strategy-damas-clasicas": CheckersGame,
  "strategy-poker-holdem-no-bet": PokerTexasHoldemGame,
  "strategy-parchis-ludoteka": ParchisStrategyGame,
  "rpg-emberfall": RpgGame,
  "platformer-sky-runner": PlatformerGame,
  "fighter-neon-dojo": FighterGame,
  "sports-head-soccer-arena": HeadSoccerGame,
  "arcade-pacman-maze-protocol": PacmanGame,
  "arcade-buscaminas-classic": MinesweeperGame,
  "racing-race2dpro": RaceGame2DPro,
};

const CONTROL_HINTS_BY_LOCALE = {
  es: {
    "adventure-echoes": "Movimiento con WASD/flechas + busqueda, escaneo, raciones, baliza y salto (B).",
    "action-core-strike": "Movimiento con WASD/flechas + rafaga, cohete, overdrive, defensa y botiquin en rondas.",
    "racing-neon-lanes": "Carriles con izquierda/derecha, velocidad con arriba/abajo, turbo (espacio) e item (I).",
    "knowledge-quiz-nexus": "Selecciona respuesta por boton y avanza al bloquear la pregunta.",
    "knowledge-logic-vault": "Selecciona respuesta por boton y avanza al bloquear la pregunta.",
    "knowledge-sudoku-sprint": "Mueve seleccion con flechas, escribe 1-4 (o A/S/D/F), limpia con Backspace/Delete y R para partida aleatoria.",
    "knowledge-domino-chain": "Domino clasico 4P por parejas: flechas izq/der eligen ficha, arriba/abajo extremo, Enter juega, P pasa, N avanza ronda y R reinicia.",
    "knowledge-ahorcado-flash": "Escribe letras para adivinar y, al terminar, usa Enter o el boton de partida aleatoria.",
    "knowledge-paciencia-lite": "D roba, A selecciona descarte, Q/W/E/R columnas, flechas cambian destino, Enter/Espacio mueven y P lanza partida aleatoria.",
    "knowledge-puzle-deslizante": "Usa flechas para mover el hueco o pulsa fichas adyacentes. R carga partida aleatoria.",
    "knowledge-crucigrama-mini": "Selecciona longitud maxima (6-10), flechas para navegar, letras para escribir, Backspace para borrar, Enter para comprobar y boton de partida aleatoria.",
    "knowledge-sopa-letras-mega": "Arrastra o marca inicio-fin para seleccionar palabras en horizontal, vertical o diagonal (tambien al reves). R carga partida aleatoria.",
    "strategy-chess-grandmaster": "Clic para mover, promocion al coronar, U deshace, D reclama tablas y F alterna pantalla completa.",
    "strategy-damas-clasicas": "Damas 8x8: clic para mover en diagonal, capturas encadenadas, U deshace, X retiro, R reinicia y F alterna pantalla completa.",
    "strategy-poker-holdem-no-bet": "Poker clasico 5 cartas con apuestas reales: ciegas, bote y acciones call/raise/fold/all-in. Enter accion principal, U subir, A all-in, F retirarse, 1-5 seleccionar descarte, D descartar, S servirse, N siguiente mano y R reiniciar.",
    "strategy-parchis-ludoteka": "S/Enter inicia partida, R/Enter/Space tira dado, 1..9 elige jugada, Enter primera jugada, X continua sin jugada y N nueva partida.",
    "rpg-emberfall": "Explora con WASD/flechas y usa atacar, habilidad, defender, enfocar, invocar (U) y pocion.",
    "platformer-sky-runner": "Movimiento con A/D o flechas, salto variable con W/arriba/espacio y accion con F en rutas aleatorias de 5 mapas con jefes.",
    "fighter-neon-dojo": "Combate con A/D o flechas, salto W/arriba, jab J/espacio, heavy K/enter, guardia L/abajo y special U/B.",
    "sports-head-soccer-arena": "Flechas izquierda/derecha para mover, arriba para salto, Space para disparo y B para habilidad.",
    "arcade-pacman-maze-protocol": "WASD o flechas para mover, Enter/Espacio para empezar, P/Esc para pausa, R reinicia, M sonido y G debug.",
    "arcade-buscaminas-classic": "Click izq abre, click der o pulsacion larga marca bandera. Flechas mueven cursor, Enter/Espacio abre, F marca, H sugiere IA, A ejecuta IA, R reinicia. En competitivo puntuan celdas + tiempo.",
    "racing-race2dpro": "Arriba/abajo acelerar/frenar, izq/der girar. Móvil: joystick táctil izq. + botones der. Espacio turbo. R reinicia.",
  },
  en: {
    "adventure-echoes": "Move with WASD/arrows plus search, scan, rations, beacon and jump (B).",
    "action-core-strike": "Move with WASD/arrows plus burst, rocket, overdrive, defense and medkit in rounds.",
    "racing-neon-lanes": "Lane driving with left/right, speed with up/down, turbo (space) and item (I).",
    "knowledge-quiz-nexus": "Choose an answer button and continue after locking the question.",
    "knowledge-logic-vault": "Choose an answer button and continue after locking the question.",
    "knowledge-sudoku-sprint": "Move selection with arrows, type 1-4 (or A/S/D/F), clear with Backspace/Delete and press R for a random match.",
    "knowledge-domino-chain": "Classic 4-player team domino: left/right chooses tile, up/down edge, Enter plays, P passes, N advances round, and R restarts.",
    "knowledge-ahorcado-flash": "Type letters to guess the word and, after finishing, use Enter or the random-match button.",
    "knowledge-paciencia-lite": "D draws, A selects waste, Q/W/E/R selects columns, arrows change target, Enter/Space moves, and P loads a random match.",
    "knowledge-puzle-deslizante": "Use arrows to move the blank or click adjacent tiles. Press R for a random match.",
    "knowledge-crucigrama-mini": "Choose max length (6-10), arrows navigate, letters write, Backspace clears, Enter checks, and the random-match button loads another puzzle.",
    "knowledge-sopa-letras-mega": "Drag or click start-end to select words horizontally, vertically, or diagonally (reverse also works). Press R for a random match.",
    "strategy-chess-grandmaster": "Click pieces to move, choose promotion on last rank, U undo, D claim draw, and F toggles fullscreen.",
    "strategy-damas-clasicas": "8x8 checkers: click to move diagonally, chain captures, U undo, X resign, R restart, and F toggle fullscreen.",
    "strategy-poker-holdem-no-bet": "Classic 5-card draw with real betting: blinds, pot play, and check/call/raise/fold/all-in decisions. Enter main action, U raise, A all-in, F fold, 1-5 select discard, D discard, S stand pat, N next hand, and R restart.",
    "strategy-parchis-ludoteka": "S/Enter starts the match, R/Enter/Space rolls the die, 1..9 picks a move, Enter takes the first move, X continues without move, and N starts a new match.",
    "rpg-emberfall": "Explore with WASD/arrows and use attack, skill, defend, focus, summon (U) and potion.",
    "platformer-sky-runner": "Move with A/D or arrows, use variable jump with W/up/space and F action in randomized 5-map runs with boss fights.",
    "fighter-neon-dojo": "Fight with A/D or arrows, jump W/up, jab J/space, heavy K/enter, guard L/down and special U/B.",
    "sports-head-soccer-arena": "Left/right arrows move, up jumps, Space shoots and B triggers skill.",
    "arcade-pacman-maze-protocol": "Use arrows or WASD to move, Enter/Space to start, P/Esc to pause, R restart, M sound and G debug.",
    "arcade-buscaminas-classic": "Left click reveals, right click or long press marks. Arrows move cursor, Enter/Space reveals, F marks, H asks AI hint, A runs AI move, R restarts. Competitive mode scores cells + time.",
    "racing-race2dpro": "Up/down throttle/brake, left/right steer. Mobile: left touch joystick + right buttons. Space turbo. R restart.",
  }
};

const UI_COPY_BY_LOCALE = {
  es: {
    playNow: "Jugar ahora",
    readyMode: "Modo interactivo listo para la categoria",
    loading: "Cargando motor del juego...",
    unsupported: "Este juego todavia no tiene motor jugable asignado."
  },
  en: {
    playNow: "Play now",
    readyMode: "Interactive mode is ready for category",
    loading: "Loading game engine...",
    unsupported: "This game does not have a playable engine assigned yet."
  }
};

function GamePlayground({ game }) {
  const locale = useMemo(resolveBrowserLanguage, []);
  const resolvedLocale = locale === "es" ? "es" : "en";
  const copy = UI_COPY_BY_LOCALE[resolvedLocale] ?? UI_COPY_BY_LOCALE.en;

  if (!game) {
    return null;
  }

  const ActiveGame = GAME_COMPONENTS[game.id];
  const localizedHints = CONTROL_HINTS_BY_LOCALE[resolvedLocale] ?? CONTROL_HINTS_BY_LOCALE.es;
  const controlHint = localizedHints[game.id] ?? CONTROL_HINTS_BY_LOCALE.es[game.id];

  return (
    <section className="game-playground">
      <div className="playground-header">
        <h3>{copy.playNow}</h3>
        <p>
          {copy.readyMode}{" "}
          <strong>{game.category}</strong>.
        </p>
        {controlHint ? <p className="control-hint">{controlHint}</p> : null}
      </div>

      {ActiveGame ? (
        <Suspense fallback={<p className="unsupported-game">{copy.loading}</p>}>
          <ActiveGame />
        </Suspense>
      ) : (
        <p className="unsupported-game">
          {copy.unsupported}
        </p>
      )}
    </section>
  );
}

export default GamePlayground;

