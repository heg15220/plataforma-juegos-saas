import { canMoveFromTile, moveEntityOnGrid } from "../world/Collision";
import { directionVector, isDirection, isPerpendicularTurn, oppositeDirection } from "../world/directions";

export default class Pacman {
  constructor({ spawnTile, speed, tileMap }) {
    this.spawnTile = { ...spawnTile };
    this.speed = speed;
    this.direction = "left";
    this.queuedDirection = "left";
    this.mouthPhase = 0;
    this.radius = tileMap.tileSize * 0.42;

    const spawn = tileMap.tileToWorld(spawnTile.row, spawnTile.col);
    this.x = spawn.x;
    this.y = spawn.y;
    this.row = spawnTile.row;
    this.col = spawnTile.col;
  }

  setQueuedDirection(direction) {
    if (isDirection(direction)) {
      this.queuedDirection = direction;
    }
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  reset(tileMap) {
    const spawn = tileMap.tileToWorld(this.spawnTile.row, this.spawnTile.col);
    this.x = spawn.x;
    this.y = spawn.y;
    this.row = this.spawnTile.row;
    this.col = this.spawnTile.col;
    this.direction = "left";
    this.queuedDirection = "left";
    this.mouthPhase = 0;
  }

  tryApplyBufferedTurn(tileMap, navigationGraph, cornerBufferPx) {
    if (!this.queuedDirection) return;

    const tile = tileMap.worldToClampedTile(this.x, this.y);
    const center = tileMap.tileToWorld(tile.row, tile.col);
    const nearCenter = tileMap.isNearTileCenter(this.x, this.y, cornerBufferPx);
    const currentVector = directionVector(this.direction);
    const bufferedVector = directionVector(this.queuedDirection);

    const perpendicular = this.direction
      ? isPerpendicularTurn(this.direction, this.queuedDirection)
      : false;

    const axisOffset = this.direction
      ? currentVector.x !== 0
        ? Math.abs(this.y - center.y)
        : Math.abs(this.x - center.x)
      : Number.POSITIVE_INFINITY;

    const canUseBuffer = nearCenter || (perpendicular && axisOffset <= cornerBufferPx);
    if (!canUseBuffer) {
      return;
    }

    const canTurn = canMoveFromTile(
      tileMap,
      tile.row,
      tile.col,
      this.queuedDirection,
      "pacman"
    );

    if (!canTurn) {
      return;
    }

    const nextVector = directionVector(this.queuedDirection);

    // Snap to the lane required by the target direction so turns are reliable.
    if (nextVector.x !== 0) {
      this.y = center.y;
    }
    if (nextVector.y !== 0) {
      this.x = center.x;
    }

    if (!this.direction) {
      this.x = center.x;
      this.y = center.y;
    }

    this.direction = this.queuedDirection;
    this.row = tile.row;
    this.col = tile.col;
  }

  update(deltaSeconds, { tileMap, navigationGraph, inputDirection, cornerBufferPx }) {
    if (isDirection(inputDirection)) {
      this.queuedDirection = inputDirection;
    }

    if (this.direction && this.queuedDirection === oppositeDirection(this.direction)) {
      this.direction = this.queuedDirection;
    }

    this.tryApplyBufferedTurn(tileMap, navigationGraph, cornerBufferPx);

    const tile = tileMap.worldToClampedTile(this.x, this.y);
    const nearCenter = tileMap.isNearTileCenter(this.x, this.y, cornerBufferPx * 0.5);
    if (nearCenter && this.direction && !canMoveFromTile(tileMap, tile.row, tile.col, this.direction, "pacman")) {
      this.direction = null;
    }

    if (this.direction) {
      moveEntityOnGrid({
        tileMap,
        entity: this,
        direction: this.direction,
        distance: this.speed * deltaSeconds,
        entityType: "pacman"
      });
    }

    const currentTile = tileMap.worldToClampedTile(this.x, this.y);
    this.row = currentTile.row;
    this.col = currentTile.col;
    this.mouthPhase = (this.mouthPhase + deltaSeconds * 12) % (Math.PI * 2);
  }
}
