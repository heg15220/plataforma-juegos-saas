import { BEAT_SECONDS, BEATS_PER_BAR } from "../constants";

const SECTION_SCHEDULE = [
  { id: "intro", bars: 8 },
  { id: "build", bars: 8 },
  { id: "drop", bars: 16 },
  { id: "outro", bars: 8 },
];

export function createBeatState() {
  return {
    timer: 0,
    index: 0,
    bar: 0,
    pulse: 0,
    lanePulses: [0, 0, 0, 0, 0, 0],
    section: "intro",
    sectionBeat: 0,
    cycleBeats: 0,
  };
}

function resolveSection(cycleBeats) {
  let cursor = 0;
  for (const section of SECTION_SCHEDULE) {
    const sectionBeats = section.bars * BEATS_PER_BAR;
    if (cycleBeats < cursor + sectionBeats) {
      return {
        sectionId: section.id,
        sectionBeat: cycleBeats - cursor,
      };
    }
    cursor += sectionBeats;
  }
  return {
    sectionId: SECTION_SCHEDULE[SECTION_SCHEDULE.length - 1].id,
    sectionBeat: 0,
  };
}

export function getBeatOffsetSeconds(beat) {
  return Math.min(beat.timer, BEAT_SECONDS - beat.timer);
}

export function getBeatRating(beat, difficulty) {
  const offset = getBeatOffsetSeconds(beat);
  if (offset <= difficulty.perfectWindow) {
    return { rating: "perfect", offset };
  }
  if (offset <= difficulty.goodWindow) {
    return { rating: "good", offset };
  }
  return { rating: "miss", offset };
}

export function updateBeatState(beat, dt) {
  let beatHit = false;
  beat.timer += dt;

  while (beat.timer >= BEAT_SECONDS) {
    beat.timer -= BEAT_SECONDS;
    beat.index += 1;
    beat.bar = Math.floor(beat.index / BEATS_PER_BAR);
    beat.pulse = 1;
    beatHit = true;

    const laneIndex = beat.index % beat.lanePulses.length;
    beat.lanePulses[laneIndex] = 1;

    const cycleLength = SECTION_SCHEDULE.reduce((sum, section) => sum + section.bars * BEATS_PER_BAR, 0);
    beat.cycleBeats = beat.index % cycleLength;
    const resolved = resolveSection(beat.cycleBeats);
    beat.section = resolved.sectionId;
    beat.sectionBeat = resolved.sectionBeat;
  }

  beat.pulse = Math.max(0, beat.pulse - dt * 2.8);
  for (let i = 0; i < beat.lanePulses.length; i += 1) {
    beat.lanePulses[i] = Math.max(0, beat.lanePulses[i] - dt * 3.4);
  }

  return beatHit;
}

export function msToNextBeat(beat) {
  return Math.round((BEAT_SECONDS - beat.timer) * 1000);
}

export function isBeatAligned(beat, difficulty) {
  return getBeatOffsetSeconds(beat) <= difficulty.goodWindow;
}
