import { describe, expect, it } from "vitest";
import { formatNaira, nairaToKobo } from "./money";

describe("nairaToKobo", () => {
  it("stores whole naira as kobo", () => {
    expect(nairaToKobo(1_250_000)).toBe(125_000_000n);
  });

  it("reads comma grouped strings", () => {
    expect(nairaToKobo("1,250,000")).toBe(125_000_000n);
  });
});

describe("formatNaira", () => {
  it("formats the brief example", () => {
    expect(formatNaira(125_000_000n)).toBe("₦1,250,000");
  });
});
