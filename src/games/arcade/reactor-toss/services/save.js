import { BALL_SKINS } from "../core/level/themes";

export const SAVE_VERSION = 1;
export const STORAGE_KEY = "arcade_flux_basin_save_v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDefaultSave(levels = []) {
  const firstLevelId = levels[0]?.id ?? null;
  return {
    version: SAVE_VERSION,
    currentLevelId: firstLevelId,
    selectedSkinId: "ember-core",
    unlockedSkinIds: ["ember-core"],
    settings: {
      soundEnabled: true,
      vibrationEnabled: true,
      inputProfile: "standard",
      showTrajectoryHelp: true,
      autoRetry: true,
    },
    levels: Object.fromEntries(
      levels.map((level, index) => [
        level.id,
        {
          unlocked: index === 0,
          completed: false,
          stars: 0,
          attempts: 0,
          bestScore: 0,
          bestTimeMs: null,
          bestBounces: null,
          firstShotWin: false,
        },
      ])
    ),
    totals: {
      stars: 0,
      levelsCompleted: 0,
      totalShots: 0,
      totalRetries: 0,
      totalRebounds: 0,
    },
  };
}

function sanitizeLevelProgress(progress, fallbackUnlocked) {
  return {
    unlocked: Boolean(progress?.unlocked ?? fallbackUnlocked),
    completed: Boolean(progress?.completed),
    stars: Math.max(0, Math.min(3, Number(progress?.stars) || 0)),
    attempts: Math.max(0, Number(progress?.attempts) || 0),
    bestScore: Math.max(0, Number(progress?.bestScore) || 0),
    bestTimeMs: Number.isFinite(Number(progress?.bestTimeMs)) ? Number(progress.bestTimeMs) : null,
    bestBounces: Number.isFinite(Number(progress?.bestBounces)) ? Number(progress.bestBounces) : null,
    firstShotWin: Boolean(progress?.firstShotWin),
  };
}

function unlockSkins(save) {
  const totalStars = save.totals.stars;
  const unlocked = new Set(save.unlockedSkinIds);
  BALL_SKINS.forEach((skin) => {
    if (totalStars >= skin.unlockedByStars) {
      unlocked.add(skin.id);
    }
  });
  save.unlockedSkinIds = [...unlocked];
  if (!unlocked.has(save.selectedSkinId)) {
    save.selectedSkinId = "ember-core";
  }
  return save;
}

export function recomputeTotals(save, levels = []) {
  let totalStars = 0;
  let completed = 0;

  levels.forEach((level, index) => {
    const progress = sanitizeLevelProgress(save.levels[level.id], index === 0);
    save.levels[level.id] = progress;
    totalStars += progress.stars;
    if (progress.completed) {
      completed += 1;
      const nextLevel = levels[index + 1];
      if (nextLevel) {
        const nextProgress = sanitizeLevelProgress(save.levels[nextLevel.id], false);
        nextProgress.unlocked = true;
        save.levels[nextLevel.id] = nextProgress;
      }
    }
  });

  save.totals.stars = totalStars;
  save.totals.levelsCompleted = completed;
  return unlockSkins(save);
}

export function loadFluxSave(levels = []) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return unlockSkins(createDefaultSave(levels));
    }

    const parsed = JSON.parse(raw);
    const next = createDefaultSave(levels);

    next.currentLevelId = parsed?.currentLevelId ?? next.currentLevelId;
    next.selectedSkinId = parsed?.selectedSkinId ?? next.selectedSkinId;
    next.unlockedSkinIds = Array.isArray(parsed?.unlockedSkinIds) ? [...parsed.unlockedSkinIds] : ["ember-core"];
    next.settings = {
      ...next.settings,
      ...(parsed?.settings ?? {}),
    };
    next.levels = Object.fromEntries(
      levels.map((level, index) => [
        level.id,
        sanitizeLevelProgress(parsed?.levels?.[level.id], index === 0),
      ])
    );
    next.totals = {
      stars: 0,
      levelsCompleted: 0,
      totalShots: Math.max(0, Number(parsed?.totals?.totalShots) || 0),
      totalRetries: Math.max(0, Number(parsed?.totals?.totalRetries) || 0),
      totalRebounds: Math.max(0, Number(parsed?.totals?.totalRebounds) || 0),
    };

    return recomputeTotals(next, levels);
  } catch {
    return unlockSkins(createDefaultSave(levels));
  }
}

export function persistFluxSave(save) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // ignore storage failures
  }
}

export function applyLevelResult(save, levels, levelId, result) {
  const next = clone(save);
  const levelIndex = levels.findIndex((level) => level.id === levelId);
  if (levelIndex < 0) {
    return next;
  }

  const previous = next.levels[levelId] ?? sanitizeLevelProgress(null, levelIndex === 0);
  next.levels[levelId] = {
    ...previous,
    unlocked: true,
    completed: true,
    stars: Math.max(previous.stars, result.stars),
    attempts: previous.attempts + Math.max(1, result.attemptsSpent ?? 1),
    bestScore: Math.max(previous.bestScore, result.score ?? 0),
    bestTimeMs:
      previous.bestTimeMs == null ? result.timeMs : Math.min(previous.bestTimeMs, result.timeMs),
    bestBounces:
      previous.bestBounces == null ? result.bounces : Math.min(previous.bestBounces, result.bounces),
    firstShotWin: previous.firstShotWin || Boolean(result.firstAttempt),
  };

  next.totals.totalShots += Math.max(1, result.shots ?? 1);
  next.totals.totalRebounds += Math.max(0, result.bounces ?? 0);

  const nextLevel = levels[levelIndex + 1];
  if (nextLevel) {
    const unlocked = sanitizeLevelProgress(next.levels[nextLevel.id], false);
    unlocked.unlocked = true;
    next.levels[nextLevel.id] = unlocked;
    next.currentLevelId = nextLevel.id;
  } else {
    next.currentLevelId = levelId;
  }

  return recomputeTotals(next, levels);
}

export function incrementRetryCount(save) {
  const next = clone(save);
  next.totals.totalRetries += 1;
  return next;
}

export function updateSettings(save, patch) {
  const next = clone(save);
  next.settings = {
    ...next.settings,
    ...patch,
  };
  return next;
}

export function selectSkin(save, skinId) {
  const next = clone(save);
  if (next.unlockedSkinIds.includes(skinId)) {
    next.selectedSkinId = skinId;
  }
  return next;
}
