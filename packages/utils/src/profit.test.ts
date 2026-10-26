import { describe, expect, it } from "vitest";
import { profitKobo } from "./profit";

describe("profitKobo", () => {
  it("is incoming minus outgoing", () => {
    expect(profitKobo({ incomingKobo: 900_000n, outgoingKobo: 400_000n })).toBe(500_000n);
  });
});
