export type FocusTimerPhase = "focus" | "break";

export function secondsRemainingUntil(endAt: number, now = Date.now()) {
  if (!Number.isFinite(endAt) || !Number.isFinite(now)) return 0;
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}

