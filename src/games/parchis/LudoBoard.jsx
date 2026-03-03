import React, { useMemo } from "react";

const DEFAULT_THEME = {
  boardBg: "#f1efe9",
  frameOuter: "#8e805f",
  frameInner: "#c6b796",
  line: "#2f2f2f",
  crossBg: "#f7f4ea",
  squareBg: "#fbfbfb",
  safeBg: "#e8ecef",
  highlight: "#1f6cc3",
  glow: "rgba(31, 108, 195, 0.34)",
  tokenRing: "#ffffff",
  colors: {
    red: "#e01b1b",
    blue: "#1486cd",
    yellow: "#e8d013",
    green: "#108a3a"
  }
};

const STACK_LAYOUTS = {
  1: [{ x: 0, y: 0 }],
  2: [{ x: -0.48, y: 0 }, { x: 0.48, y: 0 }],
  3: [{ x: 0, y: -0.45 }, { x: -0.45, y: 0.34 }, { x: 0.45, y: 0.34 }],
  4: [{ x: -0.44, y: -0.44 }, { x: 0.44, y: -0.44 }, { x: -0.44, y: 0.44 }, { x: 0.44, y: 0.44 }]
};

const mergeTheme = (theme) => ({
  ...DEFAULT_THEME,
  ...theme,
  colors: {
    ...DEFAULT_THEME.colors,
    ...(theme?.colors || {})
  }
});

const toSet = (values) => new Set(Array.isArray(values) ? values : []);

const buildTokenMap = (positions) => {
  const map = new Map();
  const tokens = Array.isArray(positions?.tokens) ? positions.tokens : [];
  for (const token of tokens) {
    if (!token?.squareId) continue;
    if (!map.has(token.squareId)) map.set(token.squareId, []);
    map.get(token.squareId).push(token);
  }
  return map;
};

const keyActivate = (event, onActivate) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onActivate();
};

const squareAriaLabel = (square) => {
  if (square.type === "track") {
    const bits = [`Casilla de recorrido ${square.pathIndex + 1}`];
    if (square.isStart) bits.push(`salida ${square.startColor}`);
    if (square.isSafe) bits.push("segura");
    return bits.join(", ");
  }
  if (square.type === "home-stretch") return `Pasillo final ${square.color}, casilla ${square.laneIndex + 1}`;
  if (square.type === "goal-center") return "Meta central";
  return `Casilla ${square.id}`;
};

function BoardBase({ model }) {
  const homeZones = Object.values(model.homes).map((entry) => entry.zone);
  const startArrow = { red: "▼", blue: "◀", yellow: "▲", green: "▶" };

  return (
    <g className="ludo-board__decor" pointerEvents="none">
      <rect x="14" y="14" width={model.boardSize - 28} height={model.boardSize - 28} rx="44" className="ludo-frame-outer" />
      <rect x="28" y="28" width={model.boardSize - 56} height={model.boardSize - 56} rx="34" className="ludo-frame-inner" />
      <rect x="40" y="40" width={model.boardSize - 80} height={model.boardSize - 80} rx="24" className="ludo-board-surface" />

      <rect x={6 * model.cell} y="0" width={3 * model.cell} height={model.boardSize} className="ludo-cross-arm" />
      <rect x="0" y={6 * model.cell} width={model.boardSize} height={3 * model.cell} className="ludo-cross-arm" />

      {homeZones.map((zone) => {
        const cx = zone.x + zone.w / 2;
        const cy = zone.y + zone.h / 2;
        const outerRadius = zone.w * 0.28;
        const innerRadius = zone.w * 0.185;
        return (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              className={`ludo-home-zone ludo-home-zone--${zone.color}`}
            />
            <circle cx={cx} cy={cy} r={outerRadius} className={`ludo-home-ring ludo-home-ring--${zone.color}`} />
            <circle cx={cx} cy={cy} r={innerRadius} className="ludo-home-ring-inner" />
            <circle cx={cx} cy={cy} r={innerRadius * 0.56} className={`ludo-home-core ludo-home-core--${zone.color}`} />
            <text x={cx} y={cy + 5} textAnchor="middle" className="ludo-home-rosette">
              ✹
            </text>
          </g>
        );
      })}

      {Object.entries(model.goal.triangles).map(([color, points]) => (
        <polygon key={`goal-${color}`} points={points} className={`ludo-goal-slice ludo-goal-slice--${color}`} />
      ))}
      <circle cx={model.goal.center.x} cy={model.goal.center.y} r={model.cell * 0.32} className="ludo-goal-core" />

      {model.squares
        .filter((square) => square.type === "home-slot")
        .map((slot) => (
          <circle
            key={slot.id}
            cx={slot.cx}
            cy={slot.cy}
            r={slot.w * 0.37}
            className={`ludo-slot ludo-slot--home ludo-slot--${slot.color}`}
          />
        ))}

      {model.squares
        .filter((square) => square.type === "goal-slot")
        .map((slot) => (
          <circle
            key={slot.id}
            cx={slot.cx}
            cy={slot.cy}
            r={slot.w * 0.32}
            className={`ludo-slot ludo-slot--goal ludo-slot--${slot.color}`}
          />
        ))}

      {model.trackSquares
        .filter((square) => square.isStart)
        .map((square) => (
          <text key={`start-arrow-${square.id}`} x={square.cx} y={square.cy + 6} textAnchor="middle" className="ludo-start-arrow">
            {startArrow[square.startColor] || "▲"}
          </text>
        ))}
    </g>
  );
}

function SquaresLayer({ model, highlightedSet, onSquareClick }) {
  const squares = model.squares.filter(
    (square) => square.type === "track" || square.type === "home-stretch" || square.type === "goal-center"
  );

  return (
    <g className="ludo-board__squares" shapeRendering="geometricPrecision">
      {squares.map((square) => {
        const highlighted = highlightedSet.has(square.id);
        const interactive = highlighted && typeof onSquareClick === "function";
        const className = [
          "ludo-square",
          `ludo-square--${square.type}`,
          square.color ? `color-${square.color}` : "",
          square.isSafe ? "is-safe" : "",
          square.isStart ? "is-start" : "",
          highlighted ? "is-highlighted" : "",
          interactive ? "is-interactive" : ""
        ]
          .filter(Boolean)
          .join(" ");

        const activate = () => {
          if (interactive) onSquareClick(square.id);
        };

        return (
          <g
            key={square.id}
            className="ludo-square-hit"
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? squareAriaLabel(square) : undefined}
            onClick={interactive ? activate : undefined}
            onKeyDown={interactive ? (event) => keyActivate(event, activate) : undefined}
          >
            <rect
              x={square.x}
              y={square.y}
              width={square.w}
              height={square.h}
              rx={square.type === "goal-center" ? square.w * 0.18 : square.w * 0.22}
              className={className}
            />
            {(square.type === "track" || square.type === "home-stretch") ? (
              <text
                x={square.cx}
                y={square.cy + 4}
                textAnchor="middle"
                className={`ludo-square-label ${square.isStart ? "is-start-label" : ""}`}
              >
                {square.type === "track" ? square.pathIndex + 1 : square.laneIndex + 1}
              </text>
            ) : null}
            {square.isSafe ? (
              <text
                x={square.cx}
                y={square.cy + square.w * 0.14}
                className={`ludo-safe-icon ${square.isStart ? "is-start-safe" : ""}`}
                textAnchor="middle"
              >
                ✹
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function OverlayLayer({ model, highlightedSet }) {
  if (!highlightedSet.size) return null;

  return (
    <g className="ludo-board__overlay" pointerEvents="none">
      {[...highlightedSet].map((squareId) => {
        const square = model.squareById[squareId];
        if (!square) return null;
        return (
          <rect
            key={`highlight-${square.id}`}
            x={square.x - 2}
            y={square.y - 2}
            width={square.w + 4}
            height={square.h + 4}
            rx={square.w * 0.24}
            className="ludo-highlight-ring"
          />
        );
      })}
    </g>
  );
}

function TokensLayer({ model, tokenMap, theme, onTokenClick }) {
  const entries = [...tokenMap.entries()];

  return (
    <g className="ludo-board__tokens">
      {entries.flatMap(([squareId, tokens]) => {
        const square = model.squareById[squareId];
        if (!square || !tokens.length) return [];

        const ordered = [...tokens].sort((a, b) => {
          const weightA = a.selected ? 2 : a.movable ? 1 : 0;
          const weightB = b.selected ? 2 : b.movable ? 1 : 0;
          return weightA - weightB;
        });

        const isWallPair =
          ordered.length === 2 &&
          Boolean(ordered[0]?.color) &&
          ordered.every((token) => token.color === ordered[0].color);
        const stackSize = Math.max(1, Math.min(4, ordered.length));
        const pattern = isWallPair
          ? [{ x: -0.88, y: 0 }, { x: 0.88, y: 0 }]
          : STACK_LAYOUTS[stackSize] || STACK_LAYOUTS[4];
        const offsetUnit = Math.min(square.w, square.h) * (isWallPair ? 0.35 : 0.24);
        const tokenRadius = Math.min(square.w, square.h) * (isWallPair ? 0.29 : 0.34);

        return ordered.map((token, index) => {
          const slot = pattern[Math.min(index, pattern.length - 1)] || { x: 0, y: 0 };
          const cx = square.cx + slot.x * offsetUnit;
          const cy = square.cy + slot.y * offsetUnit;
          const interactive = typeof onTokenClick === "function" && (token.movable || token.selected || token.interactive);
          const fill = theme.colors[token.color] || "#666666";
          const ring = theme.tokenRing;
          const className = [
            "ludo-token",
            isWallPair ? "is-wall" : "",
            token.selected ? "is-selected" : "",
            token.movable ? "is-movable" : "",
            interactive ? "is-interactive" : ""
          ]
            .filter(Boolean)
            .join(" ");

          const activate = () => {
            if (interactive) onTokenClick(token.tokenId);
          };

          return (
            <g
              key={token.tokenId}
              className={className}
              style={{ transform: `translate(${cx}px, ${cy}px)` }}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? `Ficha ${token.color} ${token.label || token.tokenId}` : undefined}
              onClick={interactive ? activate : undefined}
              onKeyDown={interactive ? (event) => keyActivate(event, activate) : undefined}
            >
              <circle className="ludo-token-shadow" cx="0" cy={tokenRadius * 0.78} r={tokenRadius * 0.7} />
              <circle className="ludo-token-outline" r={tokenRadius * 1.08} />
              <circle className="ludo-token-piece" r={tokenRadius} style={{ fill }} />
              <circle className="ludo-token-ring" r={tokenRadius * 0.98} style={{ stroke: ring }} />
              <circle className="ludo-token-shine" cx={-tokenRadius * 0.36} cy={-tokenRadius * 0.38} r={tokenRadius * 0.24} />
              {token.label ? (
                <text className="ludo-token-label" textAnchor="middle" dominantBaseline="central">
                  {token.label}
                </text>
              ) : null}
            </g>
          );
        });
      })}
    </g>
  );
}

function LudoBoard({
  model,
  positions,
  highlightedSquares = [],
  onSquareClick,
  onTokenClick,
  theme
}) {
  const mergedTheme = useMemo(() => mergeTheme(theme), [theme]);
  const highlightedSet = useMemo(() => toSet(highlightedSquares), [highlightedSquares]);
  const tokenMap = useMemo(() => buildTokenMap(positions), [positions]);

  const style = {
    "--ludo-board-bg": mergedTheme.boardBg,
    "--ludo-frame-outer": mergedTheme.frameOuter,
    "--ludo-frame-inner": mergedTheme.frameInner,
    "--ludo-line": mergedTheme.line,
    "--ludo-cross-bg": mergedTheme.crossBg,
    "--ludo-square-bg": mergedTheme.squareBg,
    "--ludo-safe-bg": mergedTheme.safeBg,
    "--ludo-highlight": mergedTheme.highlight,
    "--ludo-glow": mergedTheme.glow
  };

  return (
    <svg
      className="ludo-board"
      viewBox={`0 0 ${model.boardSize} ${model.boardSize}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Tablero de parchis"
      style={style}
    >
      <defs>
        <pattern id="ludo-paper-texture" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="transparent" />
          <circle cx="4" cy="5" r="0.75" fill="rgba(87, 66, 41, 0.1)" />
          <circle cx="13" cy="10" r="0.75" fill="rgba(87, 66, 41, 0.08)" />
        </pattern>
      </defs>
      <BoardBase model={model} />
      <rect x="40" y="40" width={model.boardSize - 80} height={model.boardSize - 80} rx="24" className="ludo-texture-layer" />
      <SquaresLayer model={model} highlightedSet={highlightedSet} onSquareClick={onSquareClick} />
      <OverlayLayer model={model} highlightedSet={highlightedSet} />
      <TokensLayer model={model} tokenMap={tokenMap} theme={mergedTheme} onTokenClick={onTokenClick} />
    </svg>
  );
}

export default LudoBoard;
