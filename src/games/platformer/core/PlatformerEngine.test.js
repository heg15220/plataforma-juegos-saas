import { describe, expect, it } from "vitest";
import { shouldGrantBossEntryPower } from "./PlatformerEngine";

describe("shouldGrantBossEntryPower", () => {
  it("activa poder si el jugador entra a un boss sin fire", () => {
    expect(shouldGrantBossEntryPower({ isBossLevel: true }, { powerLevel: 0 })).toBe(true);
    expect(shouldGrantBossEntryPower({ isBossLevel: true }, { powerLevel: -1 })).toBe(true);
  });

  it("no modifica niveles normales ni jugadores ya potenciados", () => {
    expect(shouldGrantBossEntryPower({ isBossLevel: false }, { powerLevel: 0 })).toBe(false);
    expect(shouldGrantBossEntryPower({ isBossLevel: true }, { powerLevel: 1 })).toBe(false);
  });
});
