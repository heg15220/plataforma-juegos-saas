const AXIS_DEAD_ZONE = 0.22;

const KEY_GROUPS = {
  left: new Set(["ArrowLeft", "KeyA"]),
  right: new Set(["ArrowRight", "KeyD"]),
  down: new Set(["ArrowDown", "KeyS"]),
  jump: new Set(["ArrowUp", "KeyW", "Space"]),
  action: new Set(["KeyF", "KeyJ", "KeyB"]),
  start: new Set(["Enter"]),
  restart: new Set(["KeyR"])
};

const GAMEPAD_BUTTONS = {
  jump: 0,
  action: 1,
  restart: 8,
  start: 9
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hasNavigatorGamepads = () =>
  typeof navigator !== "undefined" && typeof navigator.getGamepads === "function";

const isAnyKeyDown = (keys, pressedKeys) => Array.from(keys).some((key) => pressedKeys.has(key));

export default class InputController {
  constructor() {
    this.attachedTarget = null;
    this.keysDown = new Set();
    this.jumpQueued = false;
    this.actionQueued = false;
    this.startQueued = false;
    this.restartQueued = false;
    this.virtualAxis = 0;
    this.virtualJumpHeld = false;
    this.virtualDownHeld = false;

    this.gamepadAxis = 0;
    this.gamepadHeld = {
      jump: false,
      down: false
    };
    this.prevGamepadPressed = {
      jump: false,
      action: false,
      start: false,
      restart: false
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  attach(target = window) {
    if (this.attachedTarget || !target?.addEventListener) {
      return;
    }
    this.attachedTarget = target;
    target.addEventListener("keydown", this.handleKeyDown);
    target.addEventListener("keyup", this.handleKeyUp);
  }

  detach() {
    if (!this.attachedTarget) {
      return;
    }
    this.attachedTarget.removeEventListener("keydown", this.handleKeyDown);
    this.attachedTarget.removeEventListener("keyup", this.handleKeyUp);
    this.attachedTarget = null;
  }

  destroy() {
    this.detach();
    this.keysDown.clear();
  }

  handleKeyDown(event) {
    const code = event.code;
    if (this.keysDown.has(code)) {
      return;
    }
    this.keysDown.add(code);

    if (KEY_GROUPS.jump.has(code)) {
      this.jumpQueued = true;
    }
    if (KEY_GROUPS.action.has(code)) {
      this.actionQueued = true;
    }
    if (KEY_GROUPS.start.has(code)) {
      this.startQueued = true;
    }
    if (KEY_GROUPS.restart.has(code)) {
      this.restartQueued = true;
    }
  }

  handleKeyUp(event) {
    this.keysDown.delete(event.code);
  }

  setVirtualAxis(axis) {
    this.virtualAxis = clamp(Number(axis) || 0, -1, 1);
  }

  setVirtualJumpHeld(value) {
    this.virtualJumpHeld = Boolean(value);
    if (this.virtualJumpHeld) {
      this.jumpQueued = true;
    }
  }

  setVirtualDownHeld(value) {
    this.virtualDownHeld = Boolean(value);
  }

  queueJump() {
    this.jumpQueued = true;
  }

  queueAction() {
    this.actionQueued = true;
  }

  queueStart() {
    this.startQueued = true;
  }

  queueRestart() {
    this.restartQueued = true;
  }

  updateGamepad() {
    if (!hasNavigatorGamepads()) {
      return;
    }

    const gamepads = navigator.getGamepads();
    const activePad = Array.from(gamepads || []).find((pad) => pad && pad.connected);

    if (!activePad) {
      this.gamepadAxis = 0;
      this.gamepadHeld.jump = false;
      this.gamepadHeld.down = false;
      this.prevGamepadPressed.jump = false;
      this.prevGamepadPressed.action = false;
      this.prevGamepadPressed.start = false;
      this.prevGamepadPressed.restart = false;
      return;
    }

    const axisX = Number(activePad.axes?.[0] || 0);
    this.gamepadAxis = Math.abs(axisX) > AXIS_DEAD_ZONE ? axisX : 0;

    const pressedNow = {
      jump: Boolean(activePad.buttons?.[GAMEPAD_BUTTONS.jump]?.pressed),
      action: Boolean(activePad.buttons?.[GAMEPAD_BUTTONS.action]?.pressed),
      start: Boolean(activePad.buttons?.[GAMEPAD_BUTTONS.start]?.pressed),
      restart: Boolean(activePad.buttons?.[GAMEPAD_BUTTONS.restart]?.pressed)
    };

    if (pressedNow.jump && !this.prevGamepadPressed.jump) {
      this.jumpQueued = true;
    }
    if (pressedNow.action && !this.prevGamepadPressed.action) {
      this.actionQueued = true;
    }
    if (pressedNow.start && !this.prevGamepadPressed.start) {
      this.startQueued = true;
    }
    if (pressedNow.restart && !this.prevGamepadPressed.restart) {
      this.restartQueued = true;
    }

    this.gamepadHeld.jump = pressedNow.jump;
    this.gamepadHeld.down = Number(activePad.axes?.[1] || 0) > 0.4;
    this.prevGamepadPressed = pressedNow;
  }

  consume() {
    this.updateGamepad();

    const keyboardAxis = (isAnyKeyDown(KEY_GROUPS.right, this.keysDown) ? 1 : 0)
      - (isAnyKeyDown(KEY_GROUPS.left, this.keysDown) ? 1 : 0);

    let axis = keyboardAxis;
    if (axis === 0 && Math.abs(this.gamepadAxis) > AXIS_DEAD_ZONE) {
      axis = this.gamepadAxis > 0 ? 1 : -1;
    }
    if (Math.abs(this.virtualAxis) > 0.01) {
      axis = this.virtualAxis > 0 ? 1 : -1;
    }
    axis = clamp(axis, -1, 1);

    const jumpHeld =
      this.virtualJumpHeld ||
      this.gamepadHeld.jump ||
      isAnyKeyDown(KEY_GROUPS.jump, this.keysDown);
    const downHeld =
      this.virtualDownHeld ||
      this.gamepadHeld.down ||
      isAnyKeyDown(KEY_GROUPS.down, this.keysDown);

    const payload = {
      axis,
      jumpHeld,
      downHeld,
      jumpPressed: this.jumpQueued,
      actionPressed: this.actionQueued,
      startPressed: this.startQueued,
      restartPressed: this.restartQueued
    };

    this.jumpQueued = false;
    this.actionQueued = false;
    this.startQueued = false;
    this.restartQueued = false;

    return payload;
  }
}
