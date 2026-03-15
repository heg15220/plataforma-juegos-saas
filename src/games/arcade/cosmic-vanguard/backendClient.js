const FALLBACK_STORAGE_KEY = "cosmic-vanguard-leaderboard";
const PILOT_STORAGE_KEY = "cosmic-vanguard-pilot";
const BACKEND_ROOT =
  import.meta.env.VITE_COSMIC_VANGUARD_BACKEND_URL ?? "http://127.0.0.1:8787";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePilotName(value) {
  const text = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\- ]/g, "");
  return text.slice(0, 12) || "ACE-01";
}

function normalizeEntry(entry, index = 0) {
  return {
    id: String(entry.id ?? `${Date.now()}-${index}`),
    pilot: normalizePilotName(entry.pilot),
    score: clamp(Math.round(Number(entry.score) || 0), 0, 9999999),
    wave: clamp(Math.round(Number(entry.wave) || 1), 1, 999),
    sector: clamp(Math.round(Number(entry.sector) || 1), 1, 999),
    accuracy: clamp(Number(entry.accuracy) || 0, 0, 100),
    enemiesDestroyed: clamp(Math.round(Number(entry.enemiesDestroyed) || 0), 0, 99999),
    asteroidsCleared: clamp(Math.round(Number(entry.asteroidsCleared) || 0), 0, 99999),
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    source: String(entry.source ?? "fallback"),
  };
}

function readFallbackLeaderboard() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeEntry).sort((a, b) => b.score - a.score).slice(0, 12);
  } catch {
    return [];
  }
}

function writeFallbackLeaderboard(entries) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(entries.slice(0, 12)));
  } catch {
    // ignore storage failures
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${BACKEND_ROOT}${path}`, {
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`backend_${response.status}`);
  }
  return response.json();
}

export function loadPilotName() {
  if (typeof window === "undefined") {
    return "ACE-01";
  }
  try {
    return normalizePilotName(window.localStorage.getItem(PILOT_STORAGE_KEY));
  } catch {
    return "ACE-01";
  }
}

export function savePilotName(name) {
  const normalized = normalizePilotName(name);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PILOT_STORAGE_KEY, normalized);
    } catch {
      // ignore storage failures
    }
  }
  return normalized;
}

export async function fetchBackendSnapshot(locale = "en") {
  try {
    const [config, leaderboard] = await Promise.all([
      request("/api/cosmic-vanguard/config"),
      request("/api/cosmic-vanguard/leaderboard"),
    ]);
    return {
      status: "online",
      config,
      leaderboard: Array.isArray(leaderboard.entries)
        ? leaderboard.entries.map(normalizeEntry)
        : [],
      message:
        locale === "es"
          ? "Backend conectado: clasificacion remota disponible."
          : "Backend connected: remote leaderboard available.",
    };
  } catch {
    const leaderboard = readFallbackLeaderboard();
    return {
      status: "offline",
      config: {
        dailySeed: "offline-fallback",
        motd:
          locale === "es"
            ? "Backend offline: persistencia local activa."
            : "Backend offline: local persistence active.",
        generatedAt: new Date().toISOString(),
      },
      leaderboard,
      message:
        locale === "es"
          ? "Backend no disponible: usando clasificacion local."
          : "Backend unavailable: using local leaderboard.",
    };
  }
}

export async function submitRun(payload, locale = "en") {
  const entry = normalizeEntry({
    ...payload,
    id: payload.id ?? `${Date.now()}-${Math.round(Math.random() * 9999)}`,
  });

  try {
    const response = await request("/api/cosmic-vanguard/runs", {
      method: "POST",
      body: JSON.stringify(entry),
    });
    return {
      status: "online",
      leaderboard: Array.isArray(response.entries)
        ? response.entries.map(normalizeEntry)
        : [],
      message:
        locale === "es"
          ? "Run enviada al backend y clasificacion sincronizada."
          : "Run submitted to backend and leaderboard synchronized.",
    };
  } catch {
    const leaderboard = [entry, ...readFallbackLeaderboard()]
      .map(normalizeEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    writeFallbackLeaderboard(leaderboard);
    return {
      status: "offline",
      leaderboard,
      message:
        locale === "es"
          ? "Run guardada en clasificacion local."
          : "Run saved to local leaderboard.",
    };
  }
}
