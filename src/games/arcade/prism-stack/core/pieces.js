const createPiece = ({ id, name, token, color, accent, glow, cells, coreCell }) => ({
  id,
  name,
  token,
  color,
  accent,
  glow,
  cells,
  coreCell,
});

export const PRISM_PIECES = [
  createPiece({
    id: "spire",
    name: "Spire",
    token: "S",
    color: "#ff8d5f",
    accent: "#ffe1bf",
    glow: "rgba(255, 141, 95, 0.32)",
    cells: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
    coreCell: [0, 0],
  }),
  createPiece({
    id: "hook",
    name: "Hook",
    token: "H",
    color: "#51c8b8",
    accent: "#dffff8",
    glow: "rgba(81, 200, 184, 0.3)",
    cells: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    coreCell: [1, 0],
  }),
  createPiece({
    id: "crown",
    name: "Crown",
    token: "C",
    color: "#ffd166",
    accent: "#fff4c8",
    glow: "rgba(255, 209, 102, 0.3)",
    cells: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ],
    coreCell: [0, 0],
  }),
  createPiece({
    id: "wave",
    name: "Wave",
    token: "W",
    color: "#65a9ff",
    accent: "#deecff",
    glow: "rgba(101, 169, 255, 0.32)",
    cells: [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    coreCell: [0, 1],
  }),
  createPiece({
    id: "lattice",
    name: "Lattice",
    token: "L",
    color: "#f7799f",
    accent: "#ffe1ea",
    glow: "rgba(247, 121, 159, 0.28)",
    cells: [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    coreCell: [0, 0],
  }),
  createPiece({
    id: "nova",
    name: "Nova",
    token: "N",
    color: "#c48bff",
    accent: "#f2e4ff",
    glow: "rgba(196, 139, 255, 0.3)",
    cells: [
      [0, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    coreCell: [0, 0],
  }),
];

export const PIECE_IDS = PRISM_PIECES.map((piece) => piece.id);

export const PIECE_BY_ID = Object.fromEntries(
  PRISM_PIECES.map((piece) => [piece.id, piece])
);

export function getPreviewMatrix(pieceId) {
  const piece = PIECE_BY_ID[pieceId];
  if (!piece) {
    return Array.from({ length: 5 }, () => Array(5).fill(null));
  }

  const matrix = Array.from({ length: 5 }, () => Array(5).fill(null));
  const xs = piece.cells.map(([x]) => x);
  const ys = piece.cells.map(([, y]) => y);
  const offsetX = 2 - Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
  const offsetY = 2 - Math.round((Math.min(...ys) + Math.max(...ys)) / 2);

  piece.cells.forEach(([x, y]) => {
    const column = x + offsetX;
    const row = y + offsetY;
    if (row >= 0 && row < 5 && column >= 0 && column < 5) {
      matrix[row][column] = {
        color: piece.color,
        accent: piece.accent,
      };
    }
  });

  return matrix;
}
