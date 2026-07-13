import { describe, expect, it } from "vitest";
import { normalizePriceData } from "./priceData";

describe("normalizePriceData", () => {
  it("falls back to seeded demo data when live rows are empty", () => {
    const result = normalizePriceData([], []);

    expect(result.cities.length).toBeGreaterThan(0);
    expect(result.prices.length).toBeGreaterThan(0);
    expect(result.prices[0]).toMatchObject({
      cities: { name: expect.any(String) },
    });
  });
});
