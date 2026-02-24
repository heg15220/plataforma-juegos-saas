import { describe, expect, it } from "vitest";
import GhostFSM from "./GhostFSM";

describe("GhostFSM", () => {
  it("transitions from scatter to chase by timer", () => {
    const fsm = new GhostFSM(1);

    expect(fsm.mode).toBe("scatter");

    fsm.update(7.1);

    expect(fsm.mode).toBe("chase");
  });

  it("enters and exits frightened mode", () => {
    const fsm = new GhostFSM(1);

    const changed = fsm.enterFrightened(2);
    expect(changed).toBe(true);
    expect(fsm.mode).toBe("frightened");

    fsm.update(1.5);
    expect(fsm.mode).toBe("frightened");

    fsm.update(0.6);
    expect(fsm.mode).toBe("scatter");
  });

  it("scales ghost bonus while frightened", () => {
    const fsm = new GhostFSM(1);
    fsm.enterFrightened(5);

    expect(fsm.registerGhostEaten()).toBe(200);
    expect(fsm.registerGhostEaten()).toBe(400);
    expect(fsm.registerGhostEaten()).toBe(800);
    expect(fsm.registerGhostEaten()).toBe(1600);
  });
});
