import GhostBase from "./GhostBase";
import { getGhostChaseTarget } from "../ai/Targeting";

export default class Inky extends GhostBase {
  constructor(config) {
    super({
      ...config,
      id: "inky",
      color: "#22d3ee",
      speedFactor: 0.98
    });
  }

  resolveChaseTarget(context) {
    return getGhostChaseTarget({
      ghostId: "inky",
      ...context
    });
  }
}
