import GhostBase from "./GhostBase";
import { getGhostChaseTarget } from "../ai/Targeting";

export default class Blinky extends GhostBase {
  constructor(config) {
    super({
      ...config,
      id: "blinky",
      color: "#ef4444",
      speedFactor: 1.04
    });
  }

  resolveChaseTarget(context) {
    return getGhostChaseTarget({
      ghostId: "blinky",
      ...context
    });
  }
}
