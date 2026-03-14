const STORAGE_KEY = "plataforma-juegos-saas:arcade-prism-stack-protocol:v1";

export function loadPrismStackProfile() {
  if (typeof window === "undefined") {
    return {
      bestScore: 0,
      bestBands: 0,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        bestScore: 0,
        bestBands: 0,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      bestScore: Number.isFinite(parsed.bestScore) ? parsed.bestScore : 0,
      bestBands: Number.isFinite(parsed.bestBands) ? parsed.bestBands : 0,
    };
  } catch {
    return {
      bestScore: 0,
      bestBands: 0,
    };
  }
}

export function savePrismStackProfile(profile) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage failures
  }
}
