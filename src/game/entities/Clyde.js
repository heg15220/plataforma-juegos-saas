import GhostBase from "./GhostBase";
import { getGhostChaseTarget } from "../ai/Targeting";

export default class Clyde extends GhostBase {
  constructor(config) {
    super({
      ...config,
      id: "clyde",
      color: "#fb923c",
      speedFactor: 0.95
    });
  }

  resolveChaseTarget(context) {
    return getGhostChaseTarget({
      ghostId: "clyde",
      ...context
    });
  }
}
