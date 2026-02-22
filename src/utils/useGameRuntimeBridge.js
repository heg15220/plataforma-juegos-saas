import { useEffect, useRef } from "react";

const toSafeNumber = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, numeric);
};

export default function useGameRuntimeBridge(
  state,
  buildTextPayload,
  advanceTimeHandler
) {
  const stateRef = useRef(state);
  const payloadBuilderRef = useRef(buildTextPayload);
  const advanceTimeRef = useRef(advanceTimeHandler);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    payloadBuilderRef.current = buildTextPayload;
  }, [buildTextPayload]);

  useEffect(() => {
    advanceTimeRef.current = advanceTimeHandler;
  }, [advanceTimeHandler]);

  useEffect(() => {
    const renderState = () => {
      try {
        return JSON.stringify(payloadBuilderRef.current(stateRef.current));
      } catch (error) {
        return JSON.stringify({
          mode: "error",
          message: "render_state_failed"
        });
      }
    };

    const advanceTime = (ms = 0) => {
      const safeMs = toSafeNumber(ms);
      const handler = advanceTimeRef.current;
      if (typeof handler === "function") {
        return handler(safeMs);
      }
      return undefined;
    };

    window.render_game_to_text = renderState;
    window.advanceTime = advanceTime;

    return () => {
      if (window.render_game_to_text === renderState) {
        window.render_game_to_text = undefined;
      }
      if (window.advanceTime === advanceTime) {
        window.advanceTime = undefined;
      }
    };
  }, []);
}
