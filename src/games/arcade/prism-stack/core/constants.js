export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 18;
export const HIDDEN_ROWS = 3;
export const TOTAL_ROWS = BOARD_HEIGHT + HIDDEN_ROWS;

export const CELL_SIZE = 28;
export const BOARD_PIXEL_WIDTH = BOARD_WIDTH * CELL_SIZE;
export const BOARD_PIXEL_HEIGHT = BOARD_HEIGHT * CELL_SIZE;

export const STAGE_WIDTH = 560;
export const STAGE_HEIGHT = 660;
export const BOARD_OFFSET_X = Math.round((STAGE_WIDTH - BOARD_PIXEL_WIDTH) / 2);
export const BOARD_OFFSET_Y = 72;

export const FRAME_MS = 1000 / 60;
export const BASE_DROP_INTERVAL = 880;
export const MIN_DROP_INTERVAL = 120;
export const SOFT_DROP_MULTIPLIER = 12;
export const LOCK_DELAY_MS = 420;
export const LEVEL_BAND_TARGET = 8;
export const PULSE_BAND_STEP = 4;
export const MAX_PULSE_CHARGES = 2;

export const DANGER_THRESHOLDS = {
  calm: 0.34,
  warning: 0.62,
};
