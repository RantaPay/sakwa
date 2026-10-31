export const DELIVERY_STATUSES = ["pending", "confirmed", "rejected"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const ORDER_STATUSES = [
  "placed",
  "payment_recorded",
  "payment_confirmed",
  "dispatched",
  "delivered",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const WITHDRAWAL_STATUSES = [
  "requested",
  "accepted",
  "receipt_sent",
  "paid",
  "rejected",
] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

export const INVESTMENT_REQUEST_STATUSES = [
  "requested",
  "accepted",
  "receipt_sent",
  "confirmed",
  "rejected",
] as const;
export type InvestmentRequestStatus = (typeof INVESTMENT_REQUEST_STATUSES)[number];

export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const TRANSACTION_DIRECTIONS = ["incoming", "outgoing"] as const;
export type TransactionDirection = (typeof TRANSACTION_DIRECTIONS)[number];

export const STOCK_DIRECTIONS = ["in", "out"] as const;
export type StockDirection = (typeof STOCK_DIRECTIONS)[number];

export const OUTBOX_STATUSES = ["pending", "syncing", "failed"] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];
