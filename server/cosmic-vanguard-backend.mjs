import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "cosmic-vanguard-leaderboard.json");
const port = Number(process.env.PORT || 8787);

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function createDailySeed() {
  const today = new Date().toISOString().slice(0, 10);
  return `cv-${today}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEntry(entry, index = 0) {
  const pilot = String(entry.pilot ?? "ACE-01")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\- ]/g, "")
    .slice(0, 12) || "ACE-01";
  return {
    id: String(entry.id ?? `${Date.now()}-${index}`),
    pilot,
    score: clamp(Math.round(Number(entry.score) || 0), 0, 9999999),
    wave: clamp(Math.round(Number(entry.wave) || 1), 1, 999),
    sector: clamp(Math.round(Number(entry.sector) || 1), 1, 999),
    accuracy: clamp(Number(entry.accuracy) || 0, 0, 100),
    enemiesDestroyed: clamp(Math.round(Number(entry.enemiesDestroyed) || 0), 0, 99999),
    asteroidsCleared: clamp(Math.round(Number(entry.asteroidsCleared) || 0), 0, 99999),
    createdAt: String(entry.createdAt ?? new Date().toISOString()),
    source: String(entry.source ?? "backend"),
  };
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.entries)) {
      return parsed;
    }
  } catch {
    // fall through
  }
  const initial = {
    updatedAt: new Date().toISOString(),
    entries: [],
  };
  await writeFile(dataFile, JSON.stringify(initial, null, 2));
  return initial;
}

async function readStore() {
  return ensureStore();
}

async function writeStore(store) {
  const next = {
    updatedAt: new Date().toISOString(),
    entries: Array.isArray(store.entries) ? store.entries.map(normalizeEntry) : [],
  };
  await writeFile(dataFile, JSON.stringify(next, null, 2));
  return next;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `127.0.0.1:${port}`}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, { ok: true, service: "cosmic-vanguard-backend" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/cosmic-vanguard/config") {
    const store = await readStore();
    json(res, 200, {
      dailySeed: createDailySeed(),
      motd: "Cosmic Vanguard backend online. Top 20 runs retained.",
      generatedAt: store.updatedAt,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/cosmic-vanguard/leaderboard") {
    const store = await readStore();
    json(res, 200, {
      entries: store.entries
        .map(normalizeEntry)
        .sort((left, right) => right.score - left.score || right.wave - left.wave || right.accuracy - left.accuracy)
        .slice(0, 20),
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/cosmic-vanguard/runs") {
    const store = await readStore();
    const payload = normalizeEntry(await readBody(req));
    const entries = [payload, ...store.entries.map(normalizeEntry)]
      .sort((left, right) => right.score - left.score || right.wave - left.wave || right.accuracy - left.accuracy)
      .slice(0, 20);
    const nextStore = await writeStore({ entries });
    json(res, 201, { accepted: true, entry: payload, entries: nextStore.entries });
    return;
  }

  json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`Cosmic Vanguard backend listening on http://127.0.0.1:${port}`);
});
