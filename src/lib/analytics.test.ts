import { describe, expect, it } from "vitest";
import { average, pearsonCorrelation } from "./analytics";

describe("analytics", () => {
  it("calculates averages", () => {
    expect(average([1, 2, 3])).toBe(2);
    expect(average([])).toBe(0);
  });

  it("calculates positive correlations", () => {
    expect(pearsonCorrelation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });

  it("needs at least three values", () => {
    expect(pearsonCorrelation([1, 2], [1, 2])).toBeNull();
  });
});
