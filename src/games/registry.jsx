/**
 * Game Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Central registry that maps game IDs to their React components.
 *
 * ADDING A NEW GAME
 * 1. Create your game component under src/games/{category}/{game-id}/index.jsx
 * 2. Import it here (use lazy() for heavy engines to keep the initial bundle small)
 * 3. Add an entry to GAME_REGISTRY: "your-game-id": YourGameComponent
 * 4. Add the game metadata to src/data/games.js
 * 5. Add control hint strings to CONTROL_HINTS_BY_LOCALE below
 *
 * FOLDER CONVENTION FOR NEW GAMES
 * src/games/
 *   {category}/            e.g. action/, adventure/, arcade/, …
 *     {game-id}/
 *       index.jsx          main component (default export)
 *       engine.js          optional: game logic / canvas engine
 *       assets/            optional: sprites, sounds specific to this game
 */

import React, { lazy } from "react";
import AdventureGame from "./AdventureGame";
import ActionGame from "./ActionGame";
import RacingGame from "./RacingGame";
import KnowledgeGame from "./KnowledgeGame";
import KnowledgeArcadeGame from "./KnowledgeArcadeGame";
import RpgGame from "./RpgGame";
import HeadSoccerGame from "./HeadSoccerGame";
import PacmanGame from "./PacmanGame";
import PongGame from "./PongGame";
import ChessGame from "./ChessGame";
import DominoStrategyGame from "./DominoStrategyGame";
import RaceGame2DPro from "./RaceGame2DPro";

// Heavy engines use lazy() to keep initial bundle small
const PlatformerGame = lazy(() => import("./PlatformerGame"));
const FighterGame = lazy(() => import("./FighterGame"));

// KnowledgeArcadeGame variants
const KnowledgeSudokuGame    = () => <KnowledgeArcadeGame variant="sudoku" />;
const KnowledgeAhorcadoGame  = () => <KnowledgeArcadeGame variant="ahorcado" />;
const KnowledgePacienciaGame = () => <KnowledgeArcadeGame variant="paciencia" />;
const KnowledgePuzleGame     = () => <KnowledgeArcadeGame variant="puzle" />;
const KnowledgeCrucigramaGame  = () => <KnowledgeArcadeGame variant="crucigrama" />;
const KnowledgeSopaLetrasGame  = () => <KnowledgeArcadeGame variant="sopa-letras" />;

// ─── Registry ─────────────────────────────────────────────────────────────
export const GAME_REGISTRY = {
  "adventure-echoes":            AdventureGame,
  "action-core-strike":          ActionGame,
  "racing-neon-lanes":           RacingGame,
  "knowledge-quiz-nexus":        KnowledgeGame,
  "knowledge-logic-vault":       KnowledgeGame,
  "knowledge-sudoku-sprint":     KnowledgeSudokuGame,
  "knowledge-domino-chain":      DominoStrategyGame,
  "knowledge-ahorcado-flash":    KnowledgeAhorcadoGame,
  "knowledge-paciencia-lite":    KnowledgePacienciaGame,
  "knowledge-puzle-deslizante":  KnowledgePuzleGame,
  "knowledge-crucigrama-mini":   KnowledgeCrucigramaGame,
  "knowledge-sopa-letras-mega":  KnowledgeSopaLetrasGame,
  "strategy-chess-grandmaster":  ChessGame,
  "rpg-emberfall":               RpgGame,
  "platformer-sky-runner":       PlatformerGame,
  "fighter-neon-dojo":           FighterGame,
  "sports-head-soccer-arena":    HeadSoccerGame,
  "arcade-pacman-maze-protocol": PacmanGame,
  "arcade-pong-neon-arena":      PongGame,
  "racing-race2dpro":            RaceGame2DPro,
};

export function getGameComponent(gameId) {
  return GAME_REGISTRY[gameId] ?? null;
}

// ─── Control hints (bilingual) ────────────────────────────────────────────
export const CONTROL_HINTS_BY_LOCALE = {
  es: {
    "adventure-echoes":            "WASD/flechas para moverse. Buscar, escanear, raciones, baliza y salto táctico (B).",
    "action-core-strike":          "WASD/flechas para moverse. Ráfaga, cohete, overdrive, defensa y botiquín por rondas.",
    "racing-neon-lanes":           "Izq/der cambia carril, arriba/abajo velocidad, espacio turbo, I item.",
    "knowledge-quiz-nexus":        "Selecciona respuesta por botón y avanza al bloquear la pregunta.",
    "knowledge-logic-vault":       "Selecciona respuesta por botón y avanza al bloquear la pregunta.",
    "knowledge-sudoku-sprint":     "Flechas para navegar, 1-4 / A/S/D/F para rellenar, Backspace borra, R partida aleatoria.",
    "knowledge-domino-chain":      "Izq/der elige ficha, arriba/abajo extremo, Enter juega, P pasa, N avanza ronda, R reinicia.",
    "knowledge-ahorcado-flash":    "Escribe letras para adivinar; Enter o botón para nueva partida.",
    "knowledge-paciencia-lite":    "D roba, A descarte, Q/W/E/R columnas, flechas destino, Enter/Espacio mueve, P nueva partida.",
    "knowledge-puzle-deslizante":  "Flechas mueven el hueco o pulsa fichas adyacentes. R para nueva partida.",
    "knowledge-crucigrama-mini":   "Flechas navegan, letras escriben, Backspace borra, Enter comprueba, botón nueva partida.",
    "knowledge-sopa-letras-mega":  "Arrastra o marca inicio-fin en horizontal, vertical o diagonal (también al revés). R nueva partida.",
    "strategy-chess-grandmaster":  "Clic para mover, U deshace, D reclama tablas, F pantalla completa.",
    "rpg-emberfall":               "WASD/flechas para explorar. Atacar, habilidad, defender, enfocar, invocar (U) y poción.",
    "platformer-sky-runner":       "A/D o flechas para moverse, W/arriba/espacio para saltar, F acción.",
    "fighter-neon-dojo":           "A/D moverse, W saltar, J jab, K heavy, L guardia, U/B especial.",
    "sports-head-soccer-arena":    "Izq/der mover, arriba saltar, Espacio disparar, B habilidad.",
    "arcade-pacman-maze-protocol": "WASD/flechas mover, Enter/Espacio empezar, P/Esc pausa, R reinicia, M sonido.",
    "arcade-pong-neon-arena":      "W/S o flechas arriba/abajo para mover vertical. A/D o flechas izq/der para avanzar o retroceder (sin cruzar el centro). Ratón también controla vertical. Enter/Espacio empezar, P pausa, R reinicia, M sonido, F pantalla completa.",
    "racing-race2dpro":            "Arriba/abajo acelerar/frenar, izq/der girar. Móvil: joystick táctil izq. + botones der. Espacio turbo. R reinicia.",
  },
  en: {
    "adventure-echoes":            "WASD/arrows to move. Search, scan, rations, beacon and tactical jump (B).",
    "action-core-strike":          "WASD/arrows to move. Burst, rocket, overdrive, defense and medkit across rounds.",
    "racing-neon-lanes":           "Left/right changes lane, up/down speed, space turbo, I item.",
    "knowledge-quiz-nexus":        "Select an answer button and advance after locking the question.",
    "knowledge-logic-vault":       "Select an answer button and advance after locking the question.",
    "knowledge-sudoku-sprint":     "Arrows to navigate, 1-4 / A/S/D/F to fill, Backspace clears, R random match.",
    "knowledge-domino-chain":      "Left/right chooses tile, up/down edge, Enter plays, P passes, N advances round, R restarts.",
    "knowledge-ahorcado-flash":    "Type letters to guess; Enter or button for a new word.",
    "knowledge-paciencia-lite":    "D draws, A waste, Q/W/E/R columns, arrows change target, Enter/Space moves, P new match.",
    "knowledge-puzle-deslizante":  "Arrows move the blank or click adjacent tiles. R for a new match.",
    "knowledge-crucigrama-mini":   "Arrows navigate, letters type, Backspace clears, Enter checks, button for new puzzle.",
    "knowledge-sopa-letras-mega":  "Drag or click start-end horizontally, vertically or diagonally (reverse also works). R new match.",
    "strategy-chess-grandmaster":  "Click to move, U undo, D claim draw, F fullscreen.",
    "rpg-emberfall":               "WASD/arrows to explore. Attack, skill, defend, focus, summon (U) and potion.",
    "platformer-sky-runner":       "A/D or arrows to move, W/up/space to jump, F action.",
    "fighter-neon-dojo":           "A/D move, W jump, J jab, K heavy, L guard, U/B special.",
    "sports-head-soccer-arena":    "Left/right move, up jump, Space shoot, B ability.",
    "arcade-pacman-maze-protocol": "WASD/arrows move, Enter/Space start, P/Esc pause, R restart, M sound.",
    "arcade-pong-neon-arena":      "W/S or up/down arrows for vertical. A/D or left/right arrows to advance or retreat (cannot cross centre line). Mouse also controls vertical. Enter/Space start, P pause, R restart, M sound, F fullscreen.",
    "racing-race2dpro":            "Up/down throttle/brake, left/right steer. Mobile: left touch joystick + right buttons. Space turbo. R restart.",
  },
};
