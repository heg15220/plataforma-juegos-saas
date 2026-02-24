import { isDirection } from "../world/directions";

const DIRECTION_KEYS = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowDown: "down",
  KeyS: "down",
  ArrowRight: "right",
  KeyD: "right"
};

const CONTROL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Enter",
  "Escape",
  "KeyP",
  "KeyR",
  "KeyM",
  "KeyG"
]);

export default class InputManager {
  constructor(target = window) {
    this.target = target;
    this.queuedDirection = null;
    this.virtualDirection = null;
    this.actions = {
      start: false,
      pause: false,
      restart: false,
      toggleSound: false,
      toggleDebug: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
  }

  onKeyDown(event) {
    if (CONTROL_KEYS.has(event.code)) {
      event.preventDefault();
    }

    const direction = DIRECTION_KEYS[event.code];
    if (direction) {
      this.queuedDirection = direction;
      return;
    }

    if (event.code === "Enter" || event.code === "Space") {
      this.actions.start = true;
    } else if (event.code === "Escape" || event.code === "KeyP") {
      this.actions.pause = true;
    } else if (event.code === "KeyR") {
      this.actions.restart = true;
    } else if (event.code === "KeyM") {
      this.actions.toggleSound = true;
    } else if (event.code === "KeyG") {
      this.actions.toggleDebug = true;
    }
  }

  onKeyUp() {
    // Keyup is intentionally no-op: Pac-Man movement uses buffered direction.
  }

  queueDirection(direction) {
    if (isDirection(direction)) {
      this.queuedDirection = direction;
    }
  }

  setVirtualDirection(direction) {
    if (direction === null) {
      this.virtualDirection = null;
      return;
    }
    if (isDirection(direction)) {
      this.virtualDirection = direction;
    }
  }

  peekDirection() {
    return this.virtualDirection ?? this.queuedDirection;
  }

  clearQueuedDirection() {
    this.queuedDirection = null;
  }

  consumeAction(actionName) {
    const value = Boolean(this.actions[actionName]);
    this.actions[actionName] = false;
    return value;
  }

  destroy() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
  }
}
