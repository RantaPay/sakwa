import { describe, expect, it } from "vitest";
import { deliveryTotalKg, stockOnHand } from "./stock";

describe("stockOnHand", () => {
  it("subtracts releases from confirmed intake", () => {
    expect(
      stockOnHand({ bagsIn: 120, bagsOut: 40, kgIn: 6000, kgOut: 2000 }),
    ).toEqual({ bags: 80, kg: 4000 });
  });
});

describe("deliveryTotalKg", () => {
  it("multiplies bags by kg per bag", () => {
    expect(deliveryTotalKg(20, 50)).toBe(1000);
  });
});
