import { describe, expect, it } from "vitest";
import { lineTotalKobo, orderLineKobo, priceForDay, pricePerKgKobo } from "./pricing";

describe("price per kg", () => {
  it("keeps a stored per-kg price", () => {
    expect(pricePerKgKobo({ price_per_kg_kobo: 104000, price_per_bag_kobo: 5200000, kg_per_bag: 50 })).toBe(
      104000,
    );
  });

  it("derives per kg from an older per-bag price", () => {
    expect(pricePerKgKobo({ price_per_bag_kobo: 5200000, kg_per_bag: "50.000" })).toBe(104000);
  });

  it("prices the line from total kg, not from the bag count", () => {
    expect(lineTotalKobo(104000, 30, 50)).toBe(156000000);
    expect(
      orderLineKobo({
        price_per_bag_kobo: 5300000,
        bag_count: 25,
        kg_per_bag: "50.000",
      }),
    ).toBe(132500000);
  });

  it("prices a bought lot and a sold lot from the house rates", () => {
    const bought = lineTotalKobo(91000, 240, 50);
    const sold = lineTotalKobo(106000, 200, 50);
    expect(bought).toBe(1_092_000_000);
    expect(sold).toBe(1_060_000_000);
    expect(sold - bought).toBe(-32_000_000);
  });
});

describe("priceForDay", () => {
  const rates = [
    {
      effective_on: "2026-10-26",
      created_at: "2026-10-26T08:00:00Z",
      buying_price_per_kg_kobo: 91000,
      selling_price_per_kg_kobo: 106000,
    },
    {
      effective_on: "2026-10-20",
      created_at: "2026-10-20T08:00:00Z",
      buying_price_per_kg_kobo: 90000,
      selling_price_per_kg_kobo: 104000,
    },
  ];

  it("uses the latest price already in force", () => {
    expect(priceForDay(rates, "2026-10-25")?.buying_price_per_kg_kobo).toBe(90000);
    expect(priceForDay(rates, "2026-10-26")?.selling_price_per_kg_kobo).toBe(106000);
  });

  it("falls back to the earliest price before any rate starts", () => {
    expect(priceForDay(rates, "2026-10-01")?.buying_price_per_kg_kobo).toBe(90000);
  });
});
