import { describe, expect, it } from "vitest";
import { toDeliveryRow } from "./map-delivery";

describe("toDeliveryRow", () => {
  it("stores spend as kobo and marks the row waiting", () => {
    const row = toDeliveryRow({
      id: "11111111-1111-1111-1111-111111111111",
      agentId: "22222222-2222-2222-2222-222222222222",
      warehouseId: "33333333-3333-3333-3333-333333333333",
      bagCount: 10,
      kgPerBag: 50,
      amountSpentNaira: 1250,
      deliveredOn: "2026-10-25",
    });
    expect(row.amount_spent_kobo).toBe(125000);
    expect(row.status).toBe("pending");
    expect(row.kg_per_bag).toBe("50");
  });
});
