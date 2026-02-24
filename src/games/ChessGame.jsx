import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameRuntimeBridge from "../utils/useGameRuntimeBridge";
import {
  COLORS,
  PIECES,
  canClaimDraw,
  claimDraw,
  cloneGameState,
  createInitialChessState,
  getMoveHistoryRows,
  getPieceSummary,
  indexToSquare,
  makeMove,
  moveToUci,
  toCol,
  toRow
} from "./chess/chessEngine";
import {
  CHESS_AI_LEVELS,
  chooseAIMove,
  getAiLevelById
} from "./chess/chessAI";

const WHITE = COLORS.WHITE;
const BLACK = COLORS.BLACK;
const AI_MOVE_DELAY_MS = 2000;
const PIECE_LABEL = {
  [PIECES.KING]: "R",
  [PIECES.QUEEN]: "D",
  [PIECES.ROOK]: "T",
  [PIECES.BISHOP]: "A",
  [PIECES.KNIGHT]: "C",
  [PIECES.PAWN]: "P"
};
const PIECE_GLYPH = {
  [WHITE]: {
    [PIECES.KING]: "♚",
    [PIECES.QUEEN]: "♛",
    [PIECES.ROOK]: "♜",
    [PIECES.BISHOP]: "♝",
    [PIECES.KNIGHT]: "♞",
    [PIECES.PAWN]: "♟"
  },
  [BLACK]: {
    [PIECES.KING]: "♚",
    [PIECES.QUEEN]: "♛",
    [PIECES.ROOK]: "♜",
    [PIECES.BISHOP]: "♝",
    [PIECES.KNIGHT]: "♞",
    [PIECES.PAWN]: "♟"
  }
};

const SIDE_OPTIONS = {
  white: { id: "white", label: "Blancas" },
  black: { id: "black", label: "Negras" },
  random: { id: "random", label: "Aleatorio" }
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

const formatCapturedLabel = (pieceType, pieceColor) => (
  PIECE_GLYPH[pieceColor]?.[pieceType] || PIECE_LABEL[pieceType] || "?"
);

const squareColorClass = (square) => ((toRow(square) + toCol(square)) % 2 === 0 ? "light" : "dark");

const safeNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  return numeric;
};

function ChessGame() {
  const containerRef = useRef(null);

  const [sideOption, setSideOption] = useState(SIDE_OPTIONS.white.id);
  const [difficultyId, setDifficultyId] = useState("intermediate");
  const [playerColor, setPlayerColor] = useState(WHITE);
  const [started, setStarted] = useState(false);

  const [gameState, setGameState] = useState(() => createInitialChessState());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [logs, setLogs] = useState(["Configura tu color y dificultad, luego inicia la partida."]);
  const [undoStack, setUndoStack] = useState([]);

  const gameStateRef = useRef(gameState);
  const playerColorRef = useRef(playerColor);
  const difficultyRef = useRef(difficultyId);
  const startedRef = useRef(started);

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

  const pushLog = useCallback((text) => {
    setLogs((previous) => [text, ...previous].slice(0, 10));
  }, []);

  const stopAiThinking = useCallback(() => {
    aiThinkingRef.current = false;
    aiDelayRef.current = 0;
    setAiThinking(false);
  }, []);

  const aiColorForCurrentPlayer = useCallback(() => (
    playerColorRef.current === WHITE ? BLACK : WHITE
  ), []);

  const scheduleAiIfNeeded = useCallback((state) => {
    if (!startedRef.current) {
      stopAiThinking();
      return;
    }

    const aiColor = aiColorForCurrentPlayer();
    if (state.result || state.turn !== aiColor) {
      stopAiThinking();
      return;
    }

    aiThinkingRef.current = true;
    aiDelayRef.current = AI_MOVE_DELAY_MS;
    setAiThinking(true);
  }, [aiColorForCurrentPlayer, stopAiThinking]);

  const commitGameState = useCallback((nextState, options = {}) => {
    const { pushUndo = true } = options;
    const current = gameStateRef.current;
    if (pushUndo) {
      setUndoStack((previous) => [...previous, cloneGameState(current)].slice(-220));
    }

    setGameState(nextState);
    gameStateRef.current = nextState;

    if (nextState.result) {
      pushLog(nextState.statusText);
      stopAiThinking();
    } else {
      scheduleAiIfNeeded(nextState);
    }
  }, [pushLog, scheduleAiIfNeeded, stopAiThinking]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setPendingPromotion(null);
  }, []);

  const performMove = useCallback((move, actor) => {
    const current = gameStateRef.current;
    const next = makeMove(current, move);
    if (next === current) {
      return false;
    }

    commitGameState(next, { pushUndo: true });
    clearSelection();

    const san = next.lastMove?.san || moveToUci(move);
    if (actor === "ai") {
      pushLog(`IA juega ${san}`);
    } else {
      pushLog(`Tu juegas ${san}`);
    }

    return true;
  }, [clearSelection, commitGameState, pushLog]);

  const startMatch = useCallback(() => {
    const resolvedPlayerColor = resolvePlayerColor(sideOption);
    const initial = createInitialChessState();

    stopAiThinking();
    setStarted(true);
    setPlayerColor(resolvedPlayerColor);

    gameStateRef.current = initial;
    setGameState(initial);
    setUndoStack([]);
    clearSelection();

    const sideText = resolvedPlayerColor === WHITE ? "blancas" : "negras";
    setLogs([`Partida iniciada. Juegas con ${sideText}.`]);

    if (resolvedPlayerColor === BLACK) {
      scheduleAiIfNeeded(initial);
      pushLog("La IA mueve primero con blancas.");
    }
  }, [clearSelection, pushLog, scheduleAiIfNeeded, sideOption, stopAiThinking]);

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
    clearSelection();
    setGameState(restored);
    gameStateRef.current = restored;
    pushLog("Ultimo movimiento deshecho.");
  }, [clearSelection, pushLog, stopAiThinking]);

  const claimDrawIfAvailable = useCallback(() => {
    const current = gameStateRef.current;
    const next = claimDraw(current);
    if (next === current) {
      return;
    }
    setGameState(next);
    gameStateRef.current = next;
    pushLog(next.statusText);
    stopAiThinking();
  }, [pushLog, stopAiThinking]);

  const executeAiMove = useCallback(() => {
    const current = gameStateRef.current;
    if (!startedRef.current || current.result) {
      stopAiThinking();
      return;
    }

    const aiColor = aiColorForCurrentPlayer();
    if (current.turn !== aiColor) {
      stopAiThinking();
      return;
    }

    const move = chooseAIMove(current, difficultyRef.current);
    stopAiThinking();
    if (!move) {
      return;
    }
    performMove(move, "ai");
  }, [aiColorForCurrentPlayer, performMove, stopAiThinking]);

  const tickAi = useCallback((ms) => {
    if (!aiThinkingRef.current) return;
    aiDelayRef.current -= ms;
    if (aiDelayRef.current <= 0) {
      executeAiMove();
    }
  }, [executeAiMove]);

  const advanceTime = useCallback((ms) => {
    let remaining = safeNumber(ms);
    while (remaining > 0 && aiThinkingRef.current) {
      const step = Math.min(60, remaining);
      tickAi(step);
      remaining -= step;
    }
  }, [tickAi]);

  useEffect(() => {
    const animate = (time) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = time;
      }
      const delta = Math.min(120, time - lastFrameRef.current);
      lastFrameRef.current = time;
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

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "KeyF") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }
      if (event.code === "Escape") {
        if (pendingPromotion) {
          event.preventDefault();
          setPendingPromotion(null);
          return;
        }
        if (selectedSquare != null) {
          event.preventDefault();
          setSelectedSquare(null);
          return;
        }
      }
      if (event.code === "Enter" && !startedRef.current) {
        event.preventDefault();
        startMatch();
        return;
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
      if (event.code === "KeyD") {
        event.preventDefault();
        claimDrawIfAvailable();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    claimDrawIfAvailable,
    pendingPromotion,
    restartMatch,
    selectedSquare,
    startMatch,
    toggleFullscreen,
    undoLastMove
  ]);

  const boardAxis = useMemo(() => createVisualAxis(playerColor), [playerColor]);

  const selectedMoves = useMemo(() => {
    if (selectedSquare == null) {
      return [];
    }
    return gameState.legalMoves.filter((move) => move.from === selectedSquare);
  }, [gameState.legalMoves, selectedSquare]);

  const targetInfo = useMemo(() => {
    const map = new Map();
    selectedMoves.forEach((move) => {
      const current = map.get(move.to) || { capture: false, promotions: [] };
      current.capture = current.capture || Boolean(move.capture || move.isEnPassant);
      if (move.promotion) {
        current.promotions.push(move.promotion);
      }
      map.set(move.to, current);
    });
    return map;
  }, [selectedMoves]);

  const checkedKingSquare = useMemo(() => {
    if (!gameState.inCheck) return null;
    return gameState.kingPos[gameState.turn];
  }, [gameState.inCheck, gameState.kingPos, gameState.turn]);

  const capturedSummary = useMemo(() => getPieceSummary(gameState.board), [gameState.board]);
  const moveRows = useMemo(() => getMoveHistoryRows(gameState.moveHistory), [gameState.moveHistory]);
  const drawClaimAvailable = canClaimDraw(gameState);

  const handleSquareClick = useCallback((square) => {
    if (!startedRef.current || gameStateRef.current.result || aiThinkingRef.current || pendingPromotion) {
      return;
    }

    const current = gameStateRef.current;
    if (current.turn !== playerColorRef.current) {
      return;
    }

    const piece = current.board[square];

    if (selectedSquare == null) {
      if (piece && piece.color === playerColorRef.current) {
        setSelectedSquare(square);
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare(null);
      return;
    }

    if (piece && piece.color === playerColorRef.current) {
      setSelectedSquare(square);
      return;
    }

    const matching = current.legalMoves.filter((move) => move.from === selectedSquare && move.to === square);
    if (!matching.length) {
      setSelectedSquare(null);
      return;
    }

    if (matching.length > 1) {
      setPendingPromotion({
        from: selectedSquare,
        to: square,
        moves: matching
      });
      return;
    }

    performMove(matching[0], "player");
  }, [pendingPromotion, performMove, selectedSquare]);

  const choosePromotion = useCallback((promotionType) => {
    if (!pendingPromotion) return;
    const move = pendingPromotion.moves.find((candidate) => candidate.promotion === promotionType);
    if (!move) return;
    performMove(move, "player");
  }, [pendingPromotion, performMove]);

  const bridgeState = useMemo(() => ({
    started,
    playerColor,
    difficultyId,
    aiThinking,
    selectedSquare,
    pendingPromotion,
    gameState
  }), [started, playerColor, difficultyId, aiThinking, selectedSquare, pendingPromotion, gameState]);

  const payloadBuilder = useCallback((snapshot) => {
    const boardPieces = [];
    for (let square = 0; square < snapshot.gameState.board.length; square += 1) {
      const piece = snapshot.gameState.board[square];
      if (!piece) continue;
      boardPieces.push({
        square: indexToSquare(square),
        row: toRow(square),
        col: toCol(square),
        color: piece.color,
        type: piece.type
      });
    }

    return {
      mode: "chess_fide_board",
      coordinates: "row_0_rank_8_col_0_file_a",
      started: snapshot.started,
      playerColor: snapshot.playerColor,
      aiColor: snapshot.playerColor === WHITE ? BLACK : WHITE,
      difficultyId: snapshot.difficultyId,
      aiThinking: snapshot.aiThinking,
      turn: snapshot.gameState.turn,
      inCheck: snapshot.gameState.inCheck,
      statusText: snapshot.gameState.statusText,
      result: snapshot.gameState.result,
      drawClaims: snapshot.gameState.drawClaims,
      selectedSquare: snapshot.selectedSquare == null ? null : indexToSquare(snapshot.selectedSquare),
      pendingPromotion: snapshot.pendingPromotion
        ? {
          from: indexToSquare(snapshot.pendingPromotion.from),
          to: indexToSquare(snapshot.pendingPromotion.to),
          options: snapshot.pendingPromotion.moves.map((move) => move.promotion)
        }
        : null,
      legalMovesCount: snapshot.gameState.legalMoves.length,
      legalMoves: snapshot.gameState.legalMoves.map((move) => moveToUci(move)),
      lastMove: snapshot.gameState.lastMove,
      moveHistory: snapshot.gameState.moveHistory.slice(-24).map((move) => move.san),
      boardPieces
    };
  }, []);

  useGameRuntimeBridge(bridgeState, payloadBuilder, advanceTime);

  return (
    <div className="mini-game chess-game" ref={containerRef}>
      <div className="mini-head">
        <div>
          <h4>Ajedrez FIDE Arena</h4>
          <p>Motor completo con reglas FIDE, notacion algebraica y IA por niveles.</p>
        </div>
        <div className="chess-head-actions">
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

      <div className="chess-config">
        <label htmlFor="chess-side">
          Tu color
          <select
            id="chess-side"
            value={sideOption}
            onChange={(event) => setSideOption(event.target.value)}
            disabled={started && gameState.moveHistory.length > 0}
          >
            {Object.values(SIDE_OPTIONS).map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>

        <label htmlFor="chess-difficulty">
          Dificultad IA
          <select
            id="chess-difficulty"
            value={difficultyId}
            onChange={(event) => setDifficultyId(event.target.value)}
          >
            {Object.values(CHESS_AI_LEVELS).map((level) => (
              <option key={level.id} value={level.id}>{level.label}</option>
            ))}
          </select>
        </label>

        <button type="button" className="secondary" onClick={restartMatch}>
          Reiniciar tablero
        </button>
      </div>

      <div className="status-row chess-status-row">
        <span className={`status-pill ${gameState.result ? "finished" : gameState.inCheck ? "playing" : "idle"}`}>
          {gameState.result ? "finalizada" : aiThinking ? "ia pensando" : "en juego"}
        </span>
        <span>Turno: {gameState.turn === WHITE ? "Blancas" : "Negras"}</span>
        <span>Juegas: {playerColor === WHITE ? "Blancas" : "Negras"}</span>
        <span>IA: {getAiLevelById(difficultyId).label}</span>
        <span>Movs: {gameState.moveHistory.length}</span>
        {gameState.drawClaims.threefold ? <span>Triple repeticion disponible</span> : null}
        {gameState.drawClaims.fiftyMove ? <span>Regla 50 movimientos disponible</span> : null}
      </div>

      <div className="chess-captured-row">
        <div>
          <strong>Capturadas blancas</strong>
          <div className="chess-captured-list">
            {capturedSummary.w.length ? capturedSummary.w.map((piece, index) => (
              <span key={`cw-${piece}-${index}`} className="chip-piece white">{formatCapturedLabel(piece, WHITE)}</span>
            )) : <span className="chip-piece muted">-</span>}
          </div>
        </div>
        <div>
          <strong>Capturadas negras</strong>
          <div className="chess-captured-list">
            {capturedSummary.b.length ? capturedSummary.b.map((piece, index) => (
              <span key={`cb-${piece}-${index}`} className="chip-piece black">{formatCapturedLabel(piece, BLACK)}</span>
            )) : <span className="chip-piece muted">-</span>}
          </div>
        </div>
      </div>

      <div className="chess-board-shell">
        <div className="chess-board-grid" role="grid" aria-label="Tablero de ajedrez 8x8">
          {boardAxis.rows.map((row, visualRowIndex) =>
            boardAxis.cols.map((col, visualColIndex) => {
              const square = row * 8 + col;
              const piece = gameState.board[square];
              const target = targetInfo.get(square);
              const isSelected = square === selectedSquare;
              const isLastMove = gameState.lastMove && (square === gameState.lastMove.from || square === gameState.lastMove.to);
              const isCheckedKing = checkedKingSquare === square;
              const rankLabelVisible = visualColIndex === 0;
              const fileLabelVisible = visualRowIndex === 7;
              const rankText = String(8 - row);
              const fileText = String.fromCharCode(97 + col);

              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  className={[
                    "chess-square",
                    squareColorClass(square),
                    isSelected ? "selected" : "",
                    target ? "target" : "",
                    target?.capture ? "capture" : "",
                    isLastMove ? "last" : "",
                    isCheckedKing ? "checked" : ""
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSquareClick(square)}
                >
                  {rankLabelVisible ? <span className="coord rank">{rankText}</span> : null}
                  {fileLabelVisible ? <span className="coord file">{fileText}</span> : null}
                  {piece ? (
                    <span className={`chess-piece ${piece.color === WHITE ? "white" : "black"}`}>
                      {PIECE_GLYPH[piece.color]?.[piece.type] || PIECE_LABEL[piece.type]}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {pendingPromotion ? (
        <div className="chess-promotion-overlay" role="dialog" aria-label="Elegir promocion">
          <p>Elige pieza de promocion</p>
          <div className="chess-promotion-options">
            {[PIECES.QUEEN, PIECES.ROOK, PIECES.BISHOP, PIECES.KNIGHT].map((pieceType) => (
              <button
                key={pieceType}
                type="button"
                onClick={() => choosePromotion(pieceType)}
              >
                {PIECE_GLYPH[playerColor]?.[pieceType] || PIECE_LABEL[pieceType]}
              </button>
            ))}
          </div>
          <button type="button" className="cancel" onClick={() => setPendingPromotion(null)}>
            Cancelar
          </button>
        </div>
      ) : null}

      <div className="chess-footer-actions">
        <button type="button" onClick={claimDrawIfAvailable} disabled={!drawClaimAvailable || aiThinking}>
          Reclamar tablas
        </button>
        <button type="button" className="secondary" onClick={clearSelection}>
          Limpiar seleccion
        </button>
      </div>

      <div className="chess-move-table" role="table" aria-label="Historial de movimientos">
        <div className="chess-move-head" role="row">
          <span>#</span>
          <span>Blancas</span>
          <span>Negras</span>
        </div>
        <div className="chess-move-body">
          {moveRows.length ? moveRows.map((row) => (
            <div key={`mv-${row.number}`} className="chess-move-row" role="row">
              <span>{row.number}</span>
              <span>{row.white || "-"}</span>
              <span>{row.black || "-"}</span>
            </div>
          )) : (
            <div className="chess-move-row empty">
              <span>-</span>
              <span>Sin movimientos</span>
              <span>-</span>
            </div>
          )}
        </div>
      </div>

      <p className="game-message chess-message">
        {gameState.statusText} Controles: clic para mover, Enter iniciar, R reiniciar, U deshacer, D reclamar tablas, F pantalla completa.
      </p>

      <ul className="game-log chess-log">
        {logs.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default ChessGame;
