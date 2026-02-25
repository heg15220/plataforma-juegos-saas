import { describe, expect, it } from "vitest";
import { LEVELS } from "./index";

describe("platformer level catalog", () => {
  it("amplia el numero de mapas y agrega rutas verticales", () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(10);

    const verticalLevels = LEVELS.filter((level) => level.layoutType === "vertical");
    expect(verticalLevels.length).toBeGreaterThanOrEqual(2);
  });

  it("incluye al menos dos mapas de jefe y un jefe final fijo", () => {
    const bossLevels = LEVELS.filter((level) => Boolean(level.boss));
    expect(bossLevels.length).toBeGreaterThanOrEqual(2);

    const finalBossLevels = bossLevels.filter((level) => Boolean(level.boss?.finalBoss));
    expect(finalBossLevels).toHaveLength(1);

    bossLevels.forEach((level) => {
      const hasBossSpawn = (level.enemySpawns || []).some((spawn) => spawn.type === "boss");
      expect(hasBossSpawn, `boss spawn missing in ${level.id}`).toBe(true);
    });
  });
});
