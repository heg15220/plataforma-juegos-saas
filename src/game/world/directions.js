export const DIRECTION_NAMES = ["up", "left", "down", "right"];

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 }
};

export const OPPOSITE_DIRECTION = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export const isDirection = (value) => Object.prototype.hasOwnProperty.call(DIRECTION_VECTORS, value);

export const oppositeDirection = (direction) => OPPOSITE_DIRECTION[direction] ?? null;

export const directionVector = (direction) => DIRECTION_VECTORS[direction] ?? { x: 0, y: 0 };

export const isPerpendicularTurn = (currentDirection, nextDirection) => {
  const current = directionVector(currentDirection);
  const next = directionVector(nextDirection);
  return (current.x !== 0 && next.y !== 0) || (current.y !== 0 && next.x !== 0);
};
