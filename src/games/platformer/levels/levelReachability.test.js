import { describe, expect, it } from "vitest";
import { analyzeLevelReachability, createLevelRuntime, getLevelCount, tileKey } from "./levelLoader";

describe("platformer level reachability", () => {
  it("mantiene conectadas todas las superficies utiles y objetivos de ruta", () => {
    const count = getLevelCount();
    for (let index = 0; index < count; index += 1) {
      const level = createLevelRuntime(index);
      const analysis = analyzeLevelReachability(level);

      expect(
        analysis.unreachableNodes,
        `level ${index + 1} (${level.id}) still has unreachable stand nodes`
      ).toHaveLength(0);

      analysis.targets.forEach((target) => {
        const hasReachableProxy = (() => {
          for (let dx = -2; dx <= 2; dx += 1) {
            for (let dy = -2; dy <= 2; dy += 1) {
              if (analysis.reachableKeys.has(tileKey(target.x + dx, target.y + dy))) {
                return true;
              }
            }
          }
          return false;
        })();
        expect(
          hasReachableProxy,
          `target ${tileKey(target.x, target.y)} is not reachable in ${level.id}`
        ).toBe(true);
      });
    }
  });
});
