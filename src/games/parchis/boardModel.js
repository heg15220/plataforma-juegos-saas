export const BOARD_SIZE = 1000;
export const GRID = 15;
export const CELL = BOARD_SIZE / GRID;
export const TRACK_LENGTH = 68;
export const HOME_STRETCH_LENGTH = 8;

export const BOARD_COLORS = ["red", "blue", "yellow", "green"];

export const OWNER_COLOR_BY_ID = {
  human: "red",
  ai: "blue",
  "ai-blue": "blue",
  "ai-yellow": "yellow",
  "ai-green": "green"
};

export const START_INDEX_BY_COLOR = {
  red: 0,
  blue: 17,
  yellow: 34,
  green: 51
};

export const SAFE_TRACK_INDEXES = new Set([0, 5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63]);

const HOME_ZONE_GRID = {
  red: { col: 0, row: 0 },
  blue: { col: 9, row: 0 },
  yellow: { col: 9, row: 9 },
  green: { col: 0, row: 9 }
};

const HOME_SLOT_OFFSETS = [
  [-0.78, -0.78],
  [0.78, -0.78],
  [-0.78, 0.78],
  [0.78, 0.78]
];

const HOME_STRETCH_LINES = {
  red: { from: [7, 1], to: [7, 6] },
  blue: { from: [13, 7], to: [8, 7] },
  yellow: { from: [7, 13], to: [7, 8] },
  green: { from: [1, 7], to: [6, 7] }
};

const TRACK_WAYPOINT_GRID = [
  [6, 1],
  [6, 0],
  [8, 0],
  [8, 6],
  [14, 6],
  [14, 8],
  [8, 8],
  [8, 14],
  [6, 14],
  [6, 8],
  [0, 8],
  [0, 6],
  [6, 6],
  [6, 1]
];

const GOAL_SLOT_OFFSETS = {
  red: [[-36, -36], [-14, -36], [-36, -14], [-14, -14]],
  blue: [[14, -36], [36, -36], [14, -14], [36, -14]],
  yellow: [[14, 14], [36, 14], [14, 36], [36, 36]],
  green: [[-36, 14], [-14, 14], [-36, 36], [-14, 36]]
};

const linePoints = (from, to, count) => {
  if (count <= 1) return [from];
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const ratio = index / (count - 1);
    points.push({
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio
    });
  }
  return points;
};

const loopPoints = (waypoints, count) => {
  if (!waypoints.length || count <= 0) return [];
  if (waypoints.length === 1) return Array.from({ length: count }, () => waypoints[0]);

  const segments = [];
  let totalLength = 0;
  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const from = waypoints[index];
    const to = waypoints[index + 1];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    segments.push({ from, to, length });
    totalLength += length;
  }

  if (!totalLength) return Array.from({ length: count }, () => waypoints[0]);

  const points = [];
  for (let index = 0; index < count; index += 1) {
    let target = (index / count) * totalLength;
    let current = segments[segments.length - 1];
    let consumed = 0;

    for (const segment of segments) {
      if (target <= consumed + segment.length) {
        current = segment;
        target -= consumed;
        break;
      }
      consumed += segment.length;
    }

    const ratio = current.length > 0 ? target / current.length : 0;
    points.push({
      x: current.from.x + (current.to.x - current.from.x) * ratio,
      y: current.from.y + (current.to.y - current.from.y) * ratio
    });
  }
  return points;
};

const gridCenter = (col, row) => ({
  x: col * CELL + CELL / 2,
  y: row * CELL + CELL / 2
});

const gridRect = (col, row, cols = 1, rows = 1) => ({
  x: col * CELL,
  y: row * CELL,
  w: cols * CELL,
  h: rows * CELL
});

const squareFromCenter = (id, type, center, size, color = null, extra = {}) => ({
  id,
  type,
  color,
  x: center.x - size / 2,
  y: center.y - size / 2,
  w: size,
  h: size,
  cx: center.x,
  cy: center.y,
  ...extra
});

export const getOwnerColor = (ownerId) => OWNER_COLOR_BY_ID[ownerId] || "red";

export const createParchisBoardModel = () => {
  const trackCenters = loopPoints(TRACK_WAYPOINT_GRID.map(([col, row]) => gridCenter(col, row)), TRACK_LENGTH);
  const trackSize = CELL * 0.54;
  const laneSize = CELL * 0.52;
  const slotSize = CELL * 0.52;

  const trackSquares = trackCenters.map((center, pathIndex) => {
    const startColor = BOARD_COLORS.find((color) => START_INDEX_BY_COLOR[color] === pathIndex) || null;
    return squareFromCenter(`track-${pathIndex}`, "track", center, trackSize, startColor, {
      pathIndex,
      isSafe: SAFE_TRACK_INDEXES.has(pathIndex),
      isStart: Boolean(startColor),
      startColor
    });
  });

  const homeStretches = {};
  const homeStretchSquares = [];
  for (const color of BOARD_COLORS) {
    const line = HOME_STRETCH_LINES[color];
    const centers = linePoints(gridCenter(line.from[0], line.from[1]), gridCenter(line.to[0], line.to[1]), HOME_STRETCH_LENGTH);
    const ids = [];
    centers.forEach((center, index) => {
      const id = `home-${color}-${index}`;
      ids.push(id);
      homeStretchSquares.push(
        squareFromCenter(id, "home-stretch", center, laneSize, color, {
          laneIndex: index
        })
      );
    });
    homeStretches[color] = ids;
  }

  const homes = {};
  const homeSlotSquares = [];
  for (const color of BOARD_COLORS) {
    const zoneGrid = HOME_ZONE_GRID[color];
    const zone = {
      id: `home-zone-${color}`,
      color,
      ...gridRect(zoneGrid.col, zoneGrid.row, 6, 6)
    };

    const slotIds = [];
    const homeCenter = {
      x: zone.x + zone.w / 2,
      y: zone.y + zone.h / 2
    };

    HOME_SLOT_OFFSETS.forEach(([offsetX, offsetY], index) => {
      const id = `home-${color}-slot-${index}`;
      slotIds.push(id);
      homeSlotSquares.push(
        squareFromCenter(
          id,
          "home-slot",
          {
            x: homeCenter.x + offsetX * CELL,
            y: homeCenter.y + offsetY * CELL
          },
          slotSize,
          color,
          { slotIndex: index }
        )
      );
    });

    homes[color] = { zone, slotIds };
  }

  const goalRect = gridRect(6, 6, 3, 3);
  const goalCenter = {
    x: goalRect.x + goalRect.w / 2,
    y: goalRect.y + goalRect.h / 2
  };

  const goalTriangles = {
    red: `${goalCenter.x},${goalRect.y} ${goalRect.x},${goalCenter.y} ${goalCenter.x},${goalCenter.y}`,
    blue: `${goalRect.x + goalRect.w},${goalCenter.y} ${goalCenter.x},${goalRect.y} ${goalCenter.x},${goalCenter.y}`,
    yellow: `${goalCenter.x},${goalRect.y + goalRect.h} ${goalRect.x + goalRect.w},${goalCenter.y} ${goalCenter.x},${goalCenter.y}`,
    green: `${goalRect.x},${goalCenter.y} ${goalCenter.x},${goalRect.y + goalRect.h} ${goalCenter.x},${goalCenter.y}`
  };

  const goalCenterSquare = squareFromCenter("goal-center", "goal-center", goalCenter, CELL * 1.35, null, {
    isGoal: true
  });

  const goalSlotSquares = [];
  const goalSlotsByColor = {};
  for (const color of BOARD_COLORS) {
    const ids = [];
    GOAL_SLOT_OFFSETS[color].forEach(([offsetX, offsetY], index) => {
      const id = `goal-${color}-slot-${index}`;
      ids.push(id);
      goalSlotSquares.push(
        squareFromCenter(
          id,
          "goal-slot",
          { x: goalCenter.x + offsetX, y: goalCenter.y + offsetY },
          slotSize * 0.92,
          color,
          { slotIndex: index }
        )
      );
    });
    goalSlotsByColor[color] = ids;
  }

  const squares = [
    ...trackSquares,
    ...homeStretchSquares,
    ...homeSlotSquares,
    ...goalSlotSquares,
    goalCenterSquare
  ];

  const squareById = Object.fromEntries(squares.map((square) => [square.id, square]));

  return {
    boardSize: BOARD_SIZE,
    grid: GRID,
    cell: CELL,
    colors: BOARD_COLORS,
    starts: START_INDEX_BY_COLOR,
    safeTrackIndexes: SAFE_TRACK_INDEXES,
    squares,
    squareById,
    trackSquares,
    homes,
    homeStretches,
    goal: {
      id: "goal-center",
      ...goalRect,
      center: goalCenter,
      triangles: goalTriangles,
      slotIdsByColor: goalSlotsByColor
    }
  };
};

export const PARCHIS_BOARD_MODEL = createParchisBoardModel();
