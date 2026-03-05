import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import {
  BLOCKED_RULES,
  COLORS,
  applyMistake,
  cloneCheckersState,
  createInitialCheckersState,
  findLegalMove,
  getPieceSummary,
  indexToSquare,
  isDarkSquare,
  makeMove,
  resignPlayer,
  toIndex,
  toRow
} from "./checkers/checkersEngine";
import {
  CHECKERS_AI_LEVELS,
  chooseAIMove,
  getAiLevelById
} from "./checkers/checkersAI";

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;

const SIDE_OPTIONS = {
  white: { id: "white", label: "Blancas" },
  black: { id: "black", label: "Negras" },
  random: { id: "random", label: "Aleatorio" }
};

const BLOCKED_RULE_OPTIONS = {
  [BLOCKED_RULES.LOSE]: "Pierde quien queda bloqueado",
  [BLOCKED_RULES.DRAW]: "Tablas por bloqueo",
  [BLOCKED_RULES.MATERIAL]: "Bloqueo por material"
};

const END_OVERLAY_TITLES = {
  no_pieces: "Sin piezas rivales",
  blocked: "Bloqueo total",
  blocked_material: "Bloqueo por material",
  blocked_material_kings: "Bloqueo por damas",
  mistakes_limit: "Limite de errores",
  resign: "Rendicion",
  blocked_draw: "Tablas por bloqueo",
  blocked_draw_equal_material: "Tablas por bloqueo",
  no_capture_limit: "Tablas sin capturas",
  threefold_repetition: "Tablas por repeticion"
};

const resolvePlayerColor = (sideOption) => {
  if (sideOption === SIDE_OPTIONS.white.id) return WHITE;
  if (sideOption === SIDE_OPTIONS.black.id) return BLACK;
  return Math.random() < 0.5 ? WHITE : BLACK;
};

const createVisualAxis = (playerColor) => {
  const rows = playerColor === WHITE ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = playerColor === WHITE ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  return { rows, cols };
};

const safeMs = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return numeric;
};

const formatTurn = (color) => (color === WHITE ? "Blancas" : "Negras");
const defaultCursorForColor = (color) => (color === WHITE ? toIndex(5, 2) : toIndex(2, 5));

function CheckersGame() {
  const containerRef = useRef(null);

  const [sideOption, setSideOption] = useState(SIDE_OPTIONS.white.id);
  const [difficultyId, setDifficultyId] = useState("intermediate");
  const [blockedRule, setBlockedRule] = useState(BLOCKED_RULES.LOSE);
  const [playerColor, setPlayerColor] = useState(WHITE);
  const [started, setStarted] = useState(false);

  const [gameState, setGameState] = useState(() =>
    createInitialCheckersState({ blockedRule: BLOCKED_RULES.LOSE })
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [cursorSquare, setCursorSquare] = useState(defaultCursorForColor(WHITE));
  const [aiThinking, setAiThinking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [logs, setLogs] = useState([
    "Configura color, dificultad y regla de bloqueo. Luego inicia la partida."
  ]);

  const gameStateRef = useRef(gameState);
  const playerColorRef = useRef(playerColor);
  const difficultyRef = useRef(difficultyId);
  const startedRef = useRef(started);
  const cursorSquareRef = useRef(cursorSquare);
  const handleSquareClickRef = useRef(null);

  const aiThinkingRef = useRef(false);
  const aiDelayRef = useRef(0);
  const frameRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    playerColorRef.current = playerColor;
  }, [playerColor]);

  useEffect(() => {
    difficultyRef.current = difficultyId;
  }, [difficultyId]);

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    cursorSquareRef.current = cursorSquare;
  }, [cursorSquare]);

  const pushLog = useCallback((line) => {
    setLogs((previous) => [line, ...previous].slice(0, 14));
  }, []);

  const stopAiThinking = useCallback(() => {
    aiThinkingRef.current = false;
    aiDelayRef.current = 0;
    setAiThinking(false);
  }, []);

  const aiColorForPlayer = useCallback(
    () => (playerColorRef.current === WHITE ? BLACK : WHITE),
    []
  );

  const scheduleAiIfNeeded = useCallback(
    (nextState) => {
      if (!startedRef.current || nextState.result) {
        stopAiThinking();
        return;
      }
      const aiColor = aiColorForPlayer();
      if (nextState.turn !== aiColor) {
        stopAiThinking();
        return;
      }
      aiThinkingRef.current = true;
      aiDelayRef.current = getAiLevelById(difficultyRef.current).thinkDelayMs;
      setAiThinking(true);
    },
    [aiColorForPlayer, stopAiThinking]
  );

  const commitGameState = useCallback(
    (nextState, options = {}) => {
      const { pushUndo = true, keepSelection = false } = options;
      const current = gameStateRef.current;
      if (pushUndo) {
        setUndoStack((previous) => [...previous, cloneCheckersState(current)].slice(-220));
      }
      setGameState(nextState);
      gameStateRef.current = nextState;
      if (!keepSelection) {
        setSelectedSquare(nextState.forcedPiece ?? null);
      }
      if (nextState.result) {
        stopAiThinking();
      } else {
        scheduleAiIfNeeded(nextState);
      }
    },
    [scheduleAiIfNeeded, stopAiThinking]
  );

  const startMatch = useCallback(() => {
    const resolvedPlayerColor = resolvePlayerColor(sideOption);
    const initial = createInitialCheckersState({
      blockedRule
    });
    const playerText = resolvedPlayerColor === WHITE ? "blancas" : "negras";

    stopAiThinking();
    startedRef.current = true;
    setStarted(true);
    setPlayerColor(resolvedPlayerColor);
    setUndoStack([]);
    setSelectedSquare(null);
    setCursorSquare(defaultCursorForColor(resolvedPlayerColor));

    setGameState(initial);
    gameStateRef.current = initial;
    setLogs([
      `Partida iniciada. Juegas con ${playerText}.`,
      "Reglas activas: captura opcional, prioridad de damas al capturar y limite de 3 errores."
    ]);

    if (resolvedPlayerColor === BLACK) {
      pushLog("La IA abre la partida con blancas.");
      scheduleAiIfNeeded(initial);
    }
  }, [blockedRule, pushLog, scheduleAiIfNeeded, sideOption, stopAiThinking]);

  const restartMatch = useCallback(() => {
    startMatch();
  }, [startMatch]);

  const undoLastMove = useCallback(() => {
    let restored = null;
    setUndoStack((previous) => {
      if (!previous.length) return previous;
      restored = previous[previous.length - 1];
      return previous.slice(0, -1);
    });
    if (!restored) return;

    stopAiThinking();
    setSelectedSquare(null);
    setGameState(restored);
    gameStateRef.current = restored;
    pushLog("Se deshizo el ultimo movimiento.");
    scheduleAiIfNeeded(restored);
  }, [pushLog, scheduleAiIfNeeded, stopAiThinking]);

  const registerPlayerMistake = useCallback(
    (reason) => {
      const current = gameStateRef.current;
      if (!startedRef.current || current.result || current.turn !== playerColorRef.current) return;

      const next = applyMistake(current, playerColorRef.current);
      if (next === current) return;
      setGameState(next);
      gameStateRef.current = next;
      setSelectedSquare(current.forcedPiece ?? null);
      pushLog(`${reason} Error ${next.mistakes[playerColorRef.current]}/${next.settings.maxMistakes}.`);
      if (next.result) {
        pushLog(next.statusText);
        stopAiThinking();
      }
    },
    [pushLog, stopAiThinking]
  );

  const performMove = useCallback(
    (move, actor) => {
      const current = gameStateRef.current;
      const next = makeMove(current, move);
      if (next === current) return false;

      const notation = next.lastMove
        ? `${indexToSquare(next.lastMove.from)}${next.lastMove.captureIndex != null ? "x" : "-"}${indexToSquare(next.lastMove.to)}`
        : "";
      commitGameState(next, { pushUndo: true });
      pushLog(`${actor === "ai" ? "IA" : "Tu"}: ${notation}`);
      if (next.result) {
        pushLog(next.statusText);
      }
      return true;
    },
    [commitGameState, pushLog]
  );

  const executeAiMove = useCallback(() => {
    const current = gameStateRef.current;
    if (!startedRef.current || current.result) {
      stopAiThinking();
      return;
    }
    const aiColor = aiColorForPlayer();
    if (current.turn !== aiColor) {
      stopAiThinking();
      return;
    }
    const selectedMove = chooseAIMove(current, difficultyRef.current);
    stopAiThinking();
    if (!selectedMove) return;
    performMove(selectedMove, "ai");
  }, [aiColorForPlayer, performMove, stopAiThinking]);

  const tickAi = useCallback(
    (ms) => {
      if (!aiThinkingRef.current) return;
      aiDelayRef.current -= ms;
      if (aiDelayRef.current <= 0) {
        executeAiMove();
      }
    },
    [executeAiMove]
  );

  const advanceTime = useCallback(
    (ms) => {
      let remaining = safeMs(ms);
      while (remaining > 0 && aiThinkingRef.current) {
        const step = Math.min(60, remaining);
        tickAi(step);
        remaining -= step;
      }
    },
    [tickAi]
  );

  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }
      const delta = Math.min(120, timestamp - lastFrameRef.current);
      lastFrameRef.current = timestamp;
      tickAi(delta);
      frameRef.current = window.requestAnimationFrame(animate);
    };
    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [tickAi]);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await element.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const surrenderMatch = useCallback(() => {
    if (!startedRef.current) return;
    const current = gameStateRef.current;
    if (current.result) return;
    const next = resignPlayer(current, playerColorRef.current);
    commitGameState(next, { pushUndo: true });
    pushLog("Te retiraste de la partida.");
    pushLog(next.statusText);
  }, [commitGameState, pushLog]);

  const moveCursorBy = useCallback((dr, dc) => {
    setCursorSquare((previous) => {
      const row = Math.max(0, Math.min(7, toRow(previous) + dr));
      const col = Math.max(0, Math.min(7, (previous % 8) + dc));
      return toIndex(row, col);
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      const targetTag = event.target?.tagName;
      if (targetTag === "INPUT" || targetTag === "SELECT" || targetTag === "TEXTAREA") {
        return;
      }
      if (event.code === "KeyF") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (!startedRef.current && event.code === "Enter") {
        event.preventDefault();
        startMatch();
        return;
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
        moveCursorBy(-1, 0);
        return;
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        moveCursorBy(1, 0);
        return;
      }
      if (event.code === "ArrowLeft") {
        event.preventDefault();
        moveCursorBy(0, -1);
        return;
      }
      if (event.code === "ArrowRight") {
        event.preventDefault();
        moveCursorBy(0, 1);
        return;
      }
      if (
        startedRef.current &&
        (event.code === "Enter" || event.code === "Space") &&
        !aiThinkingRef.current
      ) {
        const current = gameStateRef.current;
        if (!current.result && current.turn === playerColorRef.current) {
          event.preventDefault();
          handleSquareClickRef.current?.(cursorSquareRef.current);
          return;
        }
      }
      if (event.code === "KeyR") {
        event.preventDefault();
        restartMatch();
        return;
      }
      if (event.code === "KeyU") {
        event.preventDefault();
        undoLastMove();
        return;
      }
      if (event.code === "KeyX") {
        event.preventDefault();
        surrenderMatch();
        return;
      }
      if (event.code === "Escape") {
        event.preventDefault();
        setSelectedSquare(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveCursorBy, restartMatch, startMatch, surrenderMatch, toggleFullscreen, undoLastMove]);

  const boardAxis = useMemo(() => createVisualAxis(playerColor), [playerColor]);

  const selectedMoves = useMemo(() => {
    if (selectedSquare == null) return [];
    return gameState.legalMoves.filter((move) => move.from === selectedSquare);
  }, [gameState.legalMoves, selectedSquare]);

  const targetMap = useMemo(() => {
    const map = new Map();
    for (const move of selectedMoves) {
      map.set(move.to, {
        capture: move.captureIndex != null
      });
    }
    return map;
  }, [selectedMoves]);

  const pieceSummary = useMemo(() => getPieceSummary(gameState.board), [gameState.board]);
  const kingCapturePriorityActive = useMemo(() => {
    if (!gameState.settings.kingCapturePriority || gameState.forcedPiece != null) return false;
    return gameState.legalMoves.some((move) => {
      if (move.captureIndex == null) return false;
      const piece = gameState.board[move.from];
      return Boolean(piece?.king);
    });
  }, [gameState.board, gameState.forcedPiece, gameState.legalMoves, gameState.settings.kingCapturePriority]);

  const handleSquareClick = useCallback(
    (square) => {
      const current = gameStateRef.current;
      if (!startedRef.current || current.result || aiThinkingRef.current) return;
      if (current.turn !== playerColorRef.current) return;
      if (!isDarkSquare(toRow(square), square % 8)) return;

      const piece = current.board[square];

      if (selectedSquare == null) {
        if (!piece || piece.color !== playerColorRef.current) return;
        if (current.forcedPiece != null && square !== current.forcedPiece) {
          registerPlayerMistake("Debes continuar la cadena de captura.");
          return;
        }
        setSelectedSquare(square);
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }

      if (piece && piece.color === playerColorRef.current) {
        if (current.forcedPiece != null && square !== current.forcedPiece) {
          registerPlayerMistake("Debes mover la misma ficha en cadena.");
          return;
        }
        setSelectedSquare(square);
        return;
      }

      const candidate = findLegalMove(current, selectedSquare, square);
      if (!candidate) {
        registerPlayerMistake("Movimiento no permitido.");
        return;
      }

      performMove(candidate, "player");
    },
    [performMove, registerPlayerMistake, selectedSquare]
  );

  useEffect(() => {
    handleSquareClickRef.current = handleSquareClick;
  }, [handleSquareClick]);

  const bridgeState = useMemo(
    () => ({
      started,
      playerColor,
      difficultyId,
      blockedRule,
      aiThinking,
      selectedSquare,
      cursorSquare,
      gameState
    }),
    [started, playerColor, difficultyId, blockedRule, aiThinking, selectedSquare, cursorSquare, gameState]
  );

  const payloadBuilder = useCallback((snapshot) => {
    const pieces = [];
    for (let index = 0; index < snapshot.gameState.board.length; index += 1) {
      const piece = snapshot.gameState.board[index];
      if (!piece) continue;
      pieces.push({
        square: indexToSquare(index),
        row: toRow(index),
        col: index % 8,
        color: piece.color,
        king: piece.king
      });
    }
    return {
      mode: "strategy-checkers-professional",
      coordinates: "row_0_rank_8_col_0_file_a",
      started: snapshot.started,
      playerColor: snapshot.playerColor,
      aiColor: snapshot.playerColor === WHITE ? BLACK : WHITE,
      difficultyId: snapshot.difficultyId,
      blockedRule: snapshot.blockedRule,
      aiThinking: snapshot.aiThinking,
      turn: snapshot.gameState.turn,
      forcedPiece:
        snapshot.gameState.forcedPiece == null
          ? null
          : indexToSquare(snapshot.gameState.forcedPiece),
      noCapturePly: snapshot.gameState.noCapturePly,
      legalMovesCount: snapshot.gameState.legalMoves.length,
      legalMoves: snapshot.gameState.legalMoves.map((move) => ({
        from: indexToSquare(move.from),
        to: indexToSquare(move.to),
        capture:
          move.captureIndex == null ? null : indexToSquare(move.captureIndex)
      })),
      mistakes: snapshot.gameState.mistakes,
      result: snapshot.gameState.result,
      statusText: snapshot.gameState.statusText,
      selectedSquare:
        snapshot.selectedSquare == null ? null : indexToSquare(snapshot.selectedSquare),
      cursorSquare: indexToSquare(snapshot.cursorSquare),
      moveHistory: snapshot.gameState.moveHistory.slice(-24).map((move) => move.notation),
      pieces
    };
  }, []);

  useGameRuntimeBridge(bridgeState, payloadBuilder, advanceTime);

  const moveRows = useMemo(() => {
    const rows = [];
    for (let index = 0; index < gameState.moveHistory.length; index += 2) {
      rows.push({
        number: index / 2 + 1,
        white: gameState.moveHistory[index]?.notation || "-",
        black: gameState.moveHistory[index + 1]?.notation || "-"
      });
    }
    return rows;
  }, [gameState.moveHistory]);

  const outcome = gameState.result;
  const outcomeTitle = outcome ? END_OVERLAY_TITLES[outcome.reason] || "Partida terminada" : null;

  return (
    <div className="mini-game checkers-game" ref={containerRef}>
      <div className="mini-head">
        <div>
          <h4>Damas Estrategia Pro</h4>
          <p>Tablero 8x8 profesional con IA por niveles, errores reglados y reglas avanzadas.</p>
        </div>
        <div className="checkers-head-actions">
          <button type="button" onClick={started ? restartMatch : startMatch}>
            {started ? "Nueva partida" : "Iniciar partida"}
          </button>
          <button type="button" onClick={undoLastMove} disabled={!undoStack.length || aiThinking}>
            Deshacer
          </button>
          <button type="button" onClick={toggleFullscreen}>
            {fullscreen ? "Salir pantalla completa" : "Pantalla completa"}
          </button>
        </div>
      </div>

      <div className="checkers-config">
        <label htmlFor="checkers-side">
          Tu color
          <select
            id="checkers-side"
            value={sideOption}
            onChange={(event) => setSideOption(event.target.value)}
            disabled={started && gameState.moveHistory.length > 0}
          >
            {Object.values(SIDE_OPTIONS).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="checkers-difficulty">
          Dificultad IA
          <select
            id="checkers-difficulty"
            value={difficultyId}
            onChange={(event) => setDifficultyId(event.target.value)}
          >
            {Object.values(CHECKERS_AI_LEVELS).map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="checkers-blocked-rule">
          Regla de bloqueo
          <select
            id="checkers-blocked-rule"
            value={blockedRule}
            onChange={(event) => setBlockedRule(event.target.value)}
            disabled={started && gameState.moveHistory.length > 0}
          >
            {Object.entries(BLOCKED_RULE_OPTIONS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="status-row checkers-status-row">
        <span className={`status-pill ${outcome ? "finished" : aiThinking ? "playing" : "idle"}`}>
          {outcome ? "finalizada" : aiThinking ? "ia pensando" : "en juego"}
        </span>
        <span>Turno: {formatTurn(gameState.turn)}</span>
        <span>Juegas: {formatTurn(playerColor)}</span>
        <span>IA: {getAiLevelById(difficultyId).label}</span>
        <span>Movs: {gameState.moveHistory.length}</span>
        <span>Sin captura: {gameState.noCapturePly}/{gameState.settings.drawNoCapturePly}</span>
        {gameState.forcedPiece != null ? <span>Cadena activa</span> : null}
      </div>

      <div className="checkers-scoreboard">
        <article className="checkers-score-card">
          <p>Blancas</p>
          <strong>{pieceSummary[WHITE].pieces}</strong>
          <span>Damas: {pieceSummary[WHITE].kings}</span>
          <span>Errores: {gameState.mistakes[WHITE]}/{gameState.settings.maxMistakes}</span>
        </article>
        <article className="checkers-score-card">
          <p>Negras</p>
          <strong>{pieceSummary[BLACK].pieces}</strong>
          <span>Damas: {pieceSummary[BLACK].kings}</span>
          <span>Errores: {gameState.mistakes[BLACK]}/{gameState.settings.maxMistakes}</span>
        </article>
      </div>

      <div className="checkers-board-shell">
        <div className="checkers-board-grid" role="grid" aria-label="Tablero de damas 8x8">
          {boardAxis.rows.map((row, visualRow) =>
            boardAxis.cols.map((col, visualCol) => {
              const square = toIndex(row, col);
              const piece = gameState.board[square];
              const target = targetMap.get(square);
              const isSelected = selectedSquare === square;
              const isCursor = cursorSquare === square;
              const isLastMove =
                gameState.lastMove &&
                (gameState.lastMove.from === square || gameState.lastMove.to === square);
              const isForcedPiece = gameState.forcedPiece === square;
              const showRank = visualCol === 0;
              const showFile = visualRow === 7;
              const rankText = String(8 - row);
              const fileText = String.fromCharCode(97 + col);

              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  className={[
                    "checkers-square",
                    isDarkSquare(row, col) ? "dark" : "light",
                    isSelected ? "selected" : "",
                    isCursor ? "cursor" : "",
                    target ? "target" : "",
                    target?.capture ? "capture" : "",
                    isLastMove ? "last" : "",
                    isForcedPiece ? "forced" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSquareClick(square)}
                  disabled={!started || Boolean(outcome)}
                >
                  {showRank ? <span className="coord rank">{rankText}</span> : null}
                  {showFile ? <span className="coord file">{fileText}</span> : null}
                  {piece ? (
                    <span
                      className={[
                        "checkers-piece",
                        piece.color === WHITE ? "white" : "black",
                        piece.king ? "king" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="piece-core" />
                      {piece.king ? <span className="piece-crown">K</span> : null}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {outcome ? (
          <div
            className={`checkers-end-overlay ${outcome.type === "draw" ? "draw" : outcome.winner === playerColor ? "win" : "lose"}`}
            role="status"
            aria-live="polite"
          >
            <div className="checkers-end-badge">
              <strong>
                {outcome.type === "draw"
                  ? "Tablas"
                  : outcome.winner === playerColor
                    ? "Victoria"
                    : "Derrota"}
              </strong>
              <span>{outcomeTitle}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="checkers-action-row">
        <button type="button" className="secondary" onClick={() => setSelectedSquare(null)}>
          Limpiar seleccion
        </button>
        <button type="button" className="danger" onClick={surrenderMatch} disabled={!started || Boolean(outcome)}>
          Retirarse
        </button>
      </div>

      <div className="checkers-rule-chips">
        <span>Captura obligatoria: no</span>
        <span>Prioridad dama al capturar: {gameState.settings.kingCapturePriority ? "si" : "no"}</span>
        <span>Movimiento extra con 1 ficha: {gameState.settings.extraMoveSinglePiece ? "si" : "no"}</span>
        <span>Regla bloqueo: {BLOCKED_RULE_OPTIONS[blockedRule]}</span>
        <span>Teclado: flechas + Enter/Espacio</span>
      </div>

      {kingCapturePriorityActive ? (
        <p className="checkers-priority-hint">
          Hay capturas disponibles con dama: esas capturas tienen prioridad sobre otras piezas.
        </p>
      ) : null}

      <div className="checkers-move-table" role="table" aria-label="Historial de movimientos">
        <div className="checkers-move-head" role="row">
          <span>#</span>
          <span>Blancas</span>
          <span>Negras</span>
        </div>
        <div className="checkers-move-body">
          {moveRows.length ? (
            moveRows.map((row) => (
              <div key={`checkers-move-${row.number}`} className="checkers-move-row" role="row">
                <span>{row.number}</span>
                <span>{row.white || "-"}</span>
                <span>{row.black || "-"}</span>
              </div>
            ))
          ) : (
            <div className="checkers-move-row empty">
              <span>-</span>
              <span>Sin movimientos</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>

      <p className="game-message checkers-message">
        {gameState.statusText} Controles: clic o flechas + Enter/Espacio para mover, R reinicia, U deshace, X retiro y F pantalla completa.
      </p>

      <ul className="game-log checkers-log">
        {logs.map((entry, index) => (
          <li key={`checkers-log-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default CheckersGame;
