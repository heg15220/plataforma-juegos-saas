import { canEnterTile, nextTileFrom } from "./Collision";
import { DIRECTION_NAMES, oppositeDirection } from "./directions";

export default class NavigationGraph {
  constructor(tileMap) {
    this.tileMap = tileMap;
    this.intersections = this.buildIntersectionList("ghost");
  }

  stepTile(row, col, direction) {
    return nextTileFrom(this.tileMap, row, col, direction);
  }

  directionPriority(direction) {
    const index = DIRECTION_NAMES.indexOf(direction);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }

  getAvailableDirections(
    row,
    col,
    currentDirection,
    { entityType = "ghost", allowReverse = false } = {}
  ) {
    const blockedReverse = allowReverse ? null : oppositeDirection(currentDirection);
    const options = [];

    for (const direction of DIRECTION_NAMES) {
      if (blockedReverse && direction === blockedReverse) {
        continue;
      }
      const nextTile = this.stepTile(row, col, direction);
      if (canEnterTile(this.tileMap, nextTile.row, nextTile.col, entityType)) {
        options.push(direction);
      }
    }

    if (!options.length && !allowReverse) {
      return this.getAvailableDirections(row, col, currentDirection, {
        entityType,
        allowReverse: true
      });
    }

    return options;
  }

  isIntersection(row, col, entityType = "ghost") {
    if (!canEnterTile(this.tileMap, row, col, entityType)) {
      return false;
    }
    const exits = this.getAvailableDirections(row, col, null, {
      entityType,
      allowReverse: true
    });
    return exits.length >= 3;
  }

  buildIntersectionList(entityType = "ghost") {
    const list = [];
    for (let row = 0; row < this.tileMap.rows; row += 1) {
      for (let col = 0; col < this.tileMap.cols; col += 1) {
        if (this.isIntersection(row, col, entityType)) {
          list.push({ row, col });
        }
      }
    }
    return list;
  }
}
