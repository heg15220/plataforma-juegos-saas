import {
  BASE_DROP_INTERVAL,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DANGER_THRESHOLDS,
  HIDDEN_ROWS,
  LEVEL_BAND_TARGET,
  MAX_PULSE_CHARGES,
  MIN_DROP_INTERVAL,
  PULSE_BAND_STEP,
  TOTAL_ROWS,
} from "./constants";
import { PIECE_BY_ID, PIECE_IDS } from "./pieces";

export function createEmptyRow() {
  return Array.from({ length: BOARD_WIDTH }, () => null);
}

export function createEmptyBoard() {
  return Array.from({ length: TOTAL_ROWS }, () => createEmptyRow());
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function normalizeRotation(rotation) {
  return ((rotation % 4) + 4) % 4;
}

export function rotateCoord([x, y], rotation) {
  const normalized = normalizeRotation(rotation);
  if (normalized === 0) {
    return [x, y];
  }
  if (normalized === 1) {
    return [y, -x];
  }
  if (normalized === 2) {
    return [-x, -y];
  }
  return [-y, x];
}

export function getPieceDefinition(pieceId) {
  return PIECE_BY_ID[pieceId] ?? PIECE_BY_ID.spire;
}

export function createActivePiece(pieceId, overrides = {}) {
  return {
    id: pieceId,
    rotation: 0,
    x: Math.floor(BOARD_WIDTH / 2),
    y: 1,
    ...overrides,
  };
}

export function getPieceCells(activePiece) {
  const definition = getPieceDefinition(activePiece.id);
  const coreSignature = rotateCoord(definition.coreCell, activePiece.rotation).join(",");

  return definition.cells.map((relativeCell, index) => {
    const [offsetX, offsetY] = rotateCoord(relativeCell, activePiece.rotation);
    const signature = [offsetX, offsetY].join(",");

    return {
      index,
      x: activePiece.x + offsetX,
      y: activePiece.y + offsetY,
      color: definition.color,
      accent: definition.accent,
      glow: definition.glow,
      token: definition.token,
      pieceId: definition.id,
      core: signature === coreSignature,
    };
  });
}

export function collides(board, activePiece) {
  return getPieceCells(activePiece).some((cell) => {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= TOTAL_ROWS) {
      return true;
    }
    if (cell.y < 0) {
      return false;
    }
    return Boolean(board[cell.y][cell.x]);
  });
}

export function movePiece(activePiece, dx, dy) {
  return {
    ...activePiece,
    x: activePiece.x + dx,
    y: activePiece.y + dy,
  };
}

export function rotatePiece(board, activePiece, direction) {
  const candidateRotation = normalizeRotation(activePiece.rotation + direction);
  const candidate = {
    ...activePiece,
    rotation: candidateRotation,
  };
  const kicks = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [2, 0],
    [-2, 0],
    [0, -1],
    [0, -2],
  ];

  for (const [kickX, kickY] of kicks) {
    const kicked = {
      ...candidate,
      x: candidate.x + kickX,
      y: candidate.y + kickY,
    };
    if (!collides(board, kicked)) {
      return kicked;
    }
  }

  return activePiece;
}

export function getHardDropDistance(board, activePiece) {
  let distance = 0;
  let probe = activePiece;
  while (!collides(board, movePiece(probe, 0, 1))) {
    probe = movePiece(probe, 0, 1);
    distance += 1;
  }
  return distance;
}

export function lockPiece(board, activePiece) {
  const nextBoard = cloneBoard(board);
  getPieceCells(activePiece).forEach((cell) => {
    if (cell.y >= 0 && cell.y < TOTAL_ROWS) {
      nextBoard[cell.y][cell.x] = {
        pieceId: cell.pieceId,
        token: cell.token,
        color: cell.color,
        accent: cell.accent,
        glow: cell.glow,
        core: cell.core,
      };
    }
  });
  return nextBoard;
}

export function clearBands(board) {
  const clearedRows = [];
  const coreCellsCleared = [];
  const keptRows = [];

  board.forEach((row, rowIndex) => {
    if (row.every(Boolean)) {
      clearedRows.push(rowIndex);
      coreCellsCleared.push(...row.filter((cell) => cell?.core));
    } else {
      keptRows.push(row.map((cell) => (cell ? { ...cell } : null)));
    }
  });

  const rebuilt = Array.from({ length: clearedRows.length }, () => createEmptyRow()).concat(keptRows);

  return {
    board: rebuilt,
    clearedRows,
    coreCellsCleared: coreCellsCleared.length,
  };
}

export function buildVisibleBoard(board) {
  return board.slice(HIDDEN_ROWS);
}

export function buildBoardStrings(board) {
  return buildVisibleBoard(board).map((row) =>
    row.map((cell) => (cell ? cell.token : ".")).join("")
  );
}

export function buildColumnHeights(board) {
  return Array.from({ length: BOARD_WIDTH }, (_, column) => {
    for (let row = HIDDEN_ROWS; row < TOTAL_ROWS; row += 1) {
      if (board[row][column]) {
        return TOTAL_ROWS - row;
      }
    }
    return 0;
  });
}

export function computeDangerRatio(board) {
  const heights = buildColumnHeights(board);
  const maxHeight = Math.max(0, ...heights);
  return Math.max(0, Math.min(1, maxHeight / BOARD_HEIGHT));
}

export function resolveDangerState(dangerRatio) {
  if (dangerRatio >= DANGER_THRESHOLDS.warning) {
    return "critical";
  }
  if (dangerRatio >= DANGER_THRESHOLDS.calm) {
    return "warning";
  }
  return "calm";
}

export function getDropInterval(level) {
  return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - (level - 1) * 68);
}

const SCORE_TABLE = {
  0: 0,
  1: 140,
  2: 360,
  3: 640,
  4: 980,
  5: 1500,
};

export function scoreBandClear({ rowsCleared, level, combo, coreCellsCleared }) {
  const base = SCORE_TABLE[Math.min(rowsCleared, 5)] ?? 0;
  const comboBonus = rowsCleared > 0 ? Math.max(0, combo - 1) * 50 : 0;
  const coreBonus = coreCellsCleared * 30;
  return (base + comboBonus + coreBonus) * level;
}

export function resolveLevel(bandsCleared) {
  return 1 + Math.floor(bandsCleared / LEVEL_BAND_TARGET);
}

export function rewardPulseCharge(currentCharges, currentProgress, clearedRows) {
  if (currentCharges >= MAX_PULSE_CHARGES) {
    return {
      pulseCharges: currentCharges,
      pulseProgress: currentProgress,
      gainedCharge: false,
    };
  }

  let pulseCharges = currentCharges;
  let pulseProgress = currentProgress + clearedRows;
  let gainedCharge = false;

  while (pulseProgress >= PULSE_BAND_STEP && pulseCharges < MAX_PULSE_CHARGES) {
    pulseProgress -= PULSE_BAND_STEP;
    pulseCharges += 1;
    gainedCharge = true;
  }

  if (pulseCharges >= MAX_PULSE_CHARGES) {
    pulseProgress = Math.min(pulseProgress, PULSE_BAND_STEP - 1);
  }

  return {
    pulseCharges,
    pulseProgress,
    gainedCharge,
  };
}

export function findPulseTarget(board) {
  const heights = buildColumnHeights(board);
  const center = (BOARD_WIDTH - 1) / 2;
  let best = null;

  heights.forEach((height, column) => {
    if (height <= 0) {
      return;
    }
    let targetRow = -1;
    for (let row = HIDDEN_ROWS; row < TOTAL_ROWS; row += 1) {
      if (board[row][column]) {
        targetRow = row;
        break;
      }
    }
    if (targetRow < 0) {
      return;
    }

    const candidate = {
      row: targetRow,
      column,
      height,
      centerDistance: Math.abs(column - center),
    };

    if (
      !best ||
      candidate.height > best.height ||
      (candidate.height === best.height && candidate.centerDistance < best.centerDistance)
    ) {
      best = candidate;
    }
  });

  return best;
}

export function applyPulse(board) {
  const target = findPulseTarget(board);
  if (!target) {
    return {
      board,
      removedCell: null,
      column: -1,
      row: -1,
    };
  }

  const nextBoard = cloneBoard(board);
  const removedCell = nextBoard[target.row][target.column];
  nextBoard[target.row][target.column] = null;

  return {
    board: nextBoard,
    removedCell,
    column: target.column,
    row: target.row,
  };
}

export function shuffleBag(random = Math.random) {
  const bag = [...PIECE_IDS];
  for (let index = bag.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }
  return bag;
}
