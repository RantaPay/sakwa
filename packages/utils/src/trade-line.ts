export type TradeLineInput = {
  bagsSold?: number | null;
  kgSold?: number | null;
  bagsBought?: number | null;
  kgBought?: number | null;
  kgPerBag: number;
  buyingPerKgKobo: number;
  sellingPerKgKobo: number;
};

export type TradeLine = {
  bagsSold: number;
  kgSold: number;
  bagsBought: number;
  kgBought: number;
  salesKobo: number;
  expenseKobo: number;
  profitKobo: number;
};

function clean(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return 0;
  return value;
}

/** Sales use kilograms sold. Expense uses kilograms bought, or the sold kilograms when no purchase was typed. */
export function tradeLine(input: TradeLineInput): TradeLine | { error: string } {
  if (!(input.kgPerBag > 0)) return { error: "Set the kilograms in one bag." };
  if (!(input.buyingPerKgKobo > 0) || !(input.sellingPerKgKobo > 0)) {
    return { error: "Set the buying and selling rate for this store." };
  }
  const bagsSold = clean(input.bagsSold);
  const bagsBought = clean(input.bagsBought);
  let kgSold = clean(input.kgSold);
  let kgBought = clean(input.kgBought);
  if (bagsSold < 0 || bagsBought < 0 || kgSold < 0 || kgBought < 0) {
    return { error: "Bags and kilograms cannot be negative." };
  }
  if (kgSold === 0 && bagsSold > 0) kgSold = bagsSold * input.kgPerBag;
  if (kgBought === 0 && bagsBought > 0) kgBought = bagsBought * input.kgPerBag;
  if (kgSold === 0 && kgBought === 0)
    return { error: "Enter the bags or kilograms sold." };
  if (kgBought === 0) kgBought = kgSold;
  const salesKobo = Math.round(kgSold * input.sellingPerKgKobo);
  const expenseKobo = Math.round(kgBought * input.buyingPerKgKobo);
  return {
    bagsSold,
    kgSold,
    bagsBought,
    kgBought,
    salesKobo,
    expenseKobo,
    profitKobo: salesKobo - expenseKobo,
  };
}
