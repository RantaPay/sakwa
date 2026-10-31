import { bookDay, deliveryTotalKg, lineTotalKobo, priceForDay } from "@sakwa/utils";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listAllOrders } from "@/features/orders";
import { listMarketPrices } from "@/features/prices/market-prices";
import { listWarehouses } from "@/features/stock";

const SOLD_STATUSES = new Set(["payment_confirmed", "dispatched", "delivered"]);

export type StoreTrade = {
  id: string;
  name: string;
  spentKobo: number;
  soldKobo: number;
  bagsBought: number;
  bagsSold: number;
  kgBought: number;
  kgSold: number;
};

export type TradeBooks = {
  spentKobo: number;
  soldKobo: number;
  interestKobo: number;
  bagsBought: number;
  bagsSold: number;
  kgBought: number;
  kgSold: number;
  priced: boolean;
  stores: StoreTrade[];
};

export async function loadTradeBooks(warehouseIds?: string[]): Promise<TradeBooks> {
  const [deliveries, orders, rates, stores] = await Promise.all([
    listWarehouseDeliveries(),
    listAllOrders(),
    listMarketPrices(),
    listWarehouses(),
  ]);
  const allowed = warehouseIds ? new Set(warehouseIds) : null;
  const names = new Map(stores.map((row) => [row.id, row.name]));
  const byStore = new Map<string, StoreTrade>();

  function storeOf(id: string | null | undefined) {
    if (!id) return null;
    if (allowed && !allowed.has(id)) return null;
    let row = byStore.get(id);
    if (!row) {
      row = {
        id,
        name: names.get(id) ?? "Store",
        spentKobo: 0,
        soldKobo: 0,
        bagsBought: 0,
        bagsSold: 0,
        kgBought: 0,
        kgSold: 0,
      };
      byStore.set(id, row);
    }
    return row;
  }

  for (const row of deliveries) {
    if (row.status !== "confirmed") continue;
    const store = storeOf(row.warehouse_id);
    if (!store) continue;
    const price = priceForDay(rates, bookDay(row.delivered_on));
    const kg = deliveryTotalKg(Number(row.bag_count ?? 0), Number(row.kg_per_bag ?? 0));
    store.spentKobo += lineTotalKobo(
      price?.buying_price_per_kg_kobo ?? 0,
      Number(row.bag_count ?? 0),
      row.kg_per_bag ?? 0,
    );
    store.bagsBought += Number(row.bag_count ?? 0);
    store.kgBought += kg;
  }

  for (const order of orders) {
    if (!SOLD_STATUSES.has(order.status)) continue;
    const store = storeOf(order.warehouse_id);
    if (!store) continue;
    const price = priceForDay(rates, bookDay(order.created_at));
    const kg = deliveryTotalKg(Number(order.bag_count ?? 0), Number(order.kg_per_bag ?? 0));
    store.soldKobo += lineTotalKobo(
      price?.selling_price_per_kg_kobo ?? 0,
      Number(order.bag_count ?? 0),
      order.kg_per_bag ?? 0,
    );
    store.bagsSold += Number(order.bag_count ?? 0);
    store.kgSold += kg;
  }

  const list = [...byStore.values()].sort((a, b) => a.name.localeCompare(b.name));
  const spentKobo = list.reduce((sum, row) => sum + row.spentKobo, 0);
  const soldKobo = list.reduce((sum, row) => sum + row.soldKobo, 0);
  return {
    spentKobo,
    soldKobo,
    interestKobo: soldKobo - spentKobo,
    bagsBought: list.reduce((sum, row) => sum + row.bagsBought, 0),
    bagsSold: list.reduce((sum, row) => sum + row.bagsSold, 0),
    kgBought: list.reduce((sum, row) => sum + row.kgBought, 0),
    kgSold: list.reduce((sum, row) => sum + row.kgSold, 0),
    priced: rates.length > 0,
    stores: list,
  };
}
