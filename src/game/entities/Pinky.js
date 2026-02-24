import GhostBase from "./GhostBase";
import { getGhostChaseTarget } from "../ai/Targeting";

export default class Pinky extends GhostBase {
  constructor(config) {
    super({
      ...config,
      id: "pinky",
      color: "#f472b6",
      speedFactor: 1
    });
  }

  resolveChaseTarget(context) {
    return getGhostChaseTarget({
      ghostId: "pinky",
      ...context
    });
  }
}
