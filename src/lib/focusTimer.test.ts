import { describe, expect, it } from "vitest";
import { secondsRemainingUntil } from "./focusTimer";

describe("focus timer", () => {
  it("uses the absolute end time after navigating away", () => {
    const startedAt = Date.UTC(2026, 6, 23, 10, 0, 0);
    const endAt = startedAt + 25 * 60 * 1000;

    expect(secondsRemainingUntil(endAt, startedAt + 5 * 60 * 1000)).toBe(20 * 60);
  });

  it("never returns a negative remaining time", () => {
    expect(secondsRemainingUntil(1_000, 2_000)).toBe(0);
  });
});

