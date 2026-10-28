/**
 * Consolidated Mock Simulation Data for Sakwa Agro Enterprise.
 * Used ONLY when NEXT_PUBLIC_DEMO_MODE=true.
 * In production (NEXT_PUBLIC_DEMO_MODE=false), this file is completely bypassed.
 */

export const DEMO_WAREHOUSES = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Main store",
    location: "Kaduna Depot, Central Grain Market",
    is_active: true,
    created_at: "2026-09-01T08:00:00Z",
    updated_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Second store",
    location: "Kano Silos, Dawanau Market Road",
    is_active: true,
    created_at: "2026-09-15T09:00:00Z",
    updated_at: "2026-09-15T09:00:00Z",
  },
];

export const DEMO_WAREHOUSE_STAFF = [
  {
    id: "ws-0001",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    user_id: "a0000000-0000-4000-8000-000000000004", // Demo Store
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "ws-0002",
    warehouse_id: "22222222-2222-2222-2222-222222222222",
    user_id: "a0000000-0000-4000-8000-000000000004", // Demo Store
    created_at: "2026-09-15T09:00:00Z",
  },
];

export const DEMO_AGENT_ADVANCES = [
  {
    id: "adv-0001",
    agent_id: "a0000000-0000-4000-8000-000000000005", // Demo Agent
    amount_kobo: 500000000, // ₦5,000,000
    advanced_on: "2026-10-10",
    notes: "First field advance for harvest cluster sourcing",
    recorded_by: "a0000000-0000-4000-8000-000000000003", // Accountant
    created_at: "2026-10-10T09:30:00Z",
    updated_at: "2026-10-10T09:30:00Z",
  },
  {
    id: "adv-0002",
    agent_id: "a0000000-0000-4000-8000-000000000005",
    amount_kobo: 300000000, // ₦3,000,000
    advanced_on: "2026-10-22",
    notes: "Second advance for additional milling batches",
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-10-22T11:00:00Z",
    updated_at: "2026-10-22T11:00:00Z",
  },
];

export const DEMO_AGENT_DELIVERIES = [
  {
    id: "del-0001",
    agent_id: "a0000000-0000-4000-8000-000000000005",
    warehouse_id: "11111111-1111-1111-1111-111111111111", // Main store
    bag_count: 80,
    kg_per_bag: "50.000",
    amount_spent_kobo: 360000000, // ₦3,600,000
    delivered_on: "2026-10-15",
    notes: "Grade A Long Grain parboiled rice",
    status: "confirmed",
    rejection_reason: null,
    confirmed_by: "a0000000-0000-4000-8000-000000000004", // Store
    confirmed_at: "2026-10-15T16:00:00Z",
    created_at: "2026-10-15T14:00:00Z",
    updated_at: "2026-10-15T16:00:00Z",
  },
  {
    id: "del-0002",
    agent_id: "a0000000-0000-4000-8000-000000000005",
    warehouse_id: "22222222-2222-2222-2222-222222222222", // Second store
    bag_count: 40,
    kg_per_bag: "50.000",
    amount_spent_kobo: 180000000, // ₦1,800,000
    delivered_on: "2026-10-20",
    notes: "Clean dry milled rice sacks",
    status: "confirmed",
    rejection_reason: null,
    confirmed_by: "a0000000-0000-4000-8000-000000000004",
    confirmed_at: "2026-10-20T17:00:00Z",
    created_at: "2026-10-20T15:30:00Z",
    updated_at: "2026-10-20T17:00:00Z",
  },
  {
    id: "del-0003",
    agent_id: "a0000000-0000-4000-8000-000000000005",
    warehouse_id: "11111111-1111-1111-1111-111111111111", // Main store
    bag_count: 50,
    kg_per_bag: "50.000",
    amount_spent_kobo: 225000000, // ₦2,250,000
    delivered_on: "2026-10-26",
    notes: "Morning intake, awaiting offloading inspection",
    status: "pending",
    rejection_reason: null,
    confirmed_by: null,
    confirmed_at: null,
    created_at: "2026-10-26T08:30:00Z",
    updated_at: "2026-10-26T08:30:00Z",
  },
];

// Derived: Advanced (₦8M) - Confirmed spent (₦5.4M) = ₦2.6M left
export const DEMO_AGENT_BALANCES = [
  {
    agent_id: "a0000000-0000-4000-8000-000000000005",
    advanced_kobo: 800000000, // ₦8,000,000
    spent_kobo: 540000000, // ₦5,400,000 (confirmed deliveries 1 & 2)
    balance_kobo: 260000000, // ₦2,600,000 (cash left with agent)
  },
];

export const DEMO_STOCK_MOVEMENTS = [
  {
    id: "sm-0001",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    direction: "in",
    bag_count: 80,
    total_kg: "4000.000",
    delivery_id: "del-0001",
    order_id: null,
    recorded_by: "a0000000-0000-4000-8000-000000000004",
    created_at: "2026-10-15T16:00:00Z",
  },
  {
    id: "sm-0002",
    warehouse_id: "22222222-2222-2222-2222-222222222222",
    direction: "in",
    bag_count: 40,
    total_kg: "2000.000",
    delivery_id: "del-0002",
    order_id: null,
    recorded_by: "a0000000-0000-4000-8000-000000000004",
    created_at: "2026-10-20T17:00:00Z",
  },
  {
    id: "sm-0003",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    direction: "out",
    bag_count: 30,
    total_kg: "1500.000",
    delivery_id: null,
    order_id: "ord-0001",
    recorded_by: "a0000000-0000-4000-8000-000000000004",
    created_at: "2026-10-23T14:30:00Z",
  },
];

// Derived: Main store (80 in, 30 out -> 50 on hand), Second store (40 in, 0 out -> 40 on hand)
export const DEMO_WAREHOUSE_STOCK = [
  {
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    bags_in: 80,
    bags_out: 30,
    bags_on_hand: 50,
    kg_in: 4000.0,
    kg_out: 1500.0,
    kg_on_hand: 2500.0,
  },
  {
    warehouse_id: "22222222-2222-2222-2222-222222222222",
    bags_in: 40,
    bags_out: 0,
    bags_on_hand: 40,
    kg_in: 2000.0,
    kg_out: 0.0,
    kg_on_hand: 2000.0,
  },
];

export const DEMO_ORDERS = [
  {
    id: "ord-0001",
    customer_id: "a0000000-0000-4000-8000-000000000007", // Demo Customer
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    bag_count: 30,
    kg_per_bag: "50.000",
    price_per_bag_kobo: 5200000, // ₦52,000 / bag
    status: "delivered",
    delivery_details: "Plot 14, Commercial District, Wuse 2, Abuja",
    notes: "Completed retail delivery to store warehouse",
    dispatched_at: "2026-10-23T12:00:00Z",
    delivered_at: "2026-10-23T14:30:00Z",
    created_at: "2026-10-21T10:00:00Z",
    updated_at: "2026-10-23T14:30:00Z",
  },
  {
    id: "ord-0002",
    customer_id: "a0000000-0000-4000-8000-000000000007",
    warehouse_id: "11111111-1111-1111-1111-111111111111",
    bag_count: 25,
    kg_per_bag: "50.000",
    price_per_bag_kobo: 5300000, // ₦53,000 / bag
    status: "payment_confirmed", // Ready in Outgoing for release!
    delivery_details: "Shop 4, Garki Modern Market, Abuja",
    notes: "Payment verified by accountant, awaiting truck release",
    dispatched_at: null,
    delivered_at: null,
    created_at: "2026-10-25T11:00:00Z",
    updated_at: "2026-10-25T15:00:00Z",
  },
  {
    id: "ord-0003",
    customer_id: "a0000000-0000-4000-8000-000000000007",
    warehouse_id: null,
    bag_count: 20,
    kg_per_bag: "50.000",
    price_per_bag_kobo: 0,
    status: "placed", // New order waiting for Accountant pricing
    delivery_details: "Area 11, Garki, Abuja",
    notes: "New wholesale request",
    dispatched_at: null,
    delivered_at: null,
    created_at: "2026-10-26T09:15:00Z",
    updated_at: "2026-10-26T09:15:00Z",
  },
];

export const DEMO_CUSTOMER_PAYMENTS = [
  {
    id: "pay-0001",
    order_id: "ord-0001",
    amount_kobo: 156000000, // ₦1,560,000 (30 bags * ₦52,000)
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    confirmed_by: "a0000000-0000-4000-8000-000000000003",
    confirmed_at: "2026-10-22T14:00:00Z",
    notes: "Direct bank transfer to enterprise account",
    created_at: "2026-10-22T11:00:00Z",
    updated_at: "2026-10-22T14:00:00Z",
  },
  {
    id: "pay-0002",
    order_id: "ord-0002",
    amount_kobo: 132500000, // ₦1,325,000 (25 bags * ₦53,000)
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    confirmed_by: "a0000000-0000-4000-8000-000000000003",
    confirmed_at: "2026-10-25T15:00:00Z",
    notes: "GTBank online deposit reference confirmed",
    created_at: "2026-10-25T14:00:00Z",
    updated_at: "2026-10-25T15:00:00Z",
  },
];

export const DEMO_TRANSACTIONS = [
  {
    id: "tx-0001",
    direction: "incoming",
    amount_kobo: 35000000, // ₦350,000
    occurred_on: "2026-10-24",
    category: "Chaff and milling by-product sales",
    description: "Sold 35 sacks of rice bran and husk from milling batch",
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-10-24T16:00:00Z",
    updated_at: "2026-10-24T16:00:00Z",
  },
  {
    id: "tx-0002",
    direction: "outgoing",
    amount_kobo: 8500000, // ₦85,000
    occurred_on: "2026-10-18",
    category: "Logistics and hauling",
    description: "Interstate truck conveyance from Kaduna to Abuja terminal",
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-10-18T12:00:00Z",
    updated_at: "2026-10-18T12:00:00Z",
  },
  {
    id: "tx-0003",
    direction: "outgoing",
    amount_kobo: 4500000, // ₦45,000
    occurred_on: "2026-10-21",
    category: "Packaging materials",
    description: "Purchased 200 units of Sakwa branded 50kg woven poly bags",
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-10-21T10:00:00Z",
    updated_at: "2026-10-21T10:00:00Z",
  },
];

export const DEMO_INVESTMENTS = [
  {
    id: "inv-0001",
    investor_id: "a0000000-0000-4000-8000-000000000006", // Demo Investor
    amount_kobo: 1000000000, // ₦10,000,000 capital
    invested_on: "2026-09-01",
    notes: "Primary capital investment into harvest cycle",
    recorded_by: "a0000000-0000-4000-8000-000000000003",
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
];

export const DEMO_INVESTOR_RETURNS = [
  {
    id: "ret-0001",
    investor_id: "a0000000-0000-4000-8000-000000000006",
    cycle_start: "2026-10-06",
    cycle_end: "2026-10-12",
    amount_kobo: 20000000, // ₦200,000 (2% on ₦10M)
    formula_kind: "fixed_weekly_percent",
    created_at: "2026-10-12T18:00:00Z",
  },
  {
    id: "ret-0002",
    investor_id: "a0000000-0000-4000-8000-000000000006",
    cycle_start: "2026-10-13",
    cycle_end: "2026-10-19",
    amount_kobo: 20000000, // ₦200,000
    formula_kind: "fixed_weekly_percent",
    created_at: "2026-10-19T18:00:00Z",
  },
  {
    id: "ret-0003",
    investor_id: "a0000000-0000-4000-8000-000000000006",
    cycle_start: "2026-10-20",
    cycle_end: "2026-10-26",
    amount_kobo: 20000000, // ₦200,000
    formula_kind: "fixed_weekly_percent",
    created_at: "2026-10-26T18:00:00Z",
  },
];

export const DEMO_WITHDRAWAL_REQUESTS = [
  {
    id: "wth-0001",
    investor_id: "a0000000-0000-4000-8000-000000000006",
    amount_kobo: 20000000, // ₦200,000
    cycle_start: "2026-10-13",
    status: "paid",
    rejection_reason: null,
    reviewed_by: "a0000000-0000-4000-8000-000000000002", // Director
    reviewed_at: "2026-10-14T10:00:00Z",
    paid_by: "a0000000-0000-4000-8000-000000000003", // Accountant
    paid_at: "2026-10-15T11:00:00Z",
    created_at: "2026-10-13T09:00:00Z",
    updated_at: "2026-10-15T11:00:00Z",
  },
  {
    id: "wth-0002",
    investor_id: "a0000000-0000-4000-8000-000000000006",
    amount_kobo: 15000000, // ₦150,000
    cycle_start: "2026-10-20",
    status: "requested", // Waiting for Director approval!
    rejection_reason: null,
    reviewed_by: null,
    reviewed_at: null,
    paid_by: null,
    paid_at: null,
    created_at: "2026-10-25T16:00:00Z",
    updated_at: "2026-10-25T16:00:00Z",
  },
];

// Derived: Capital: ₦10M, Returns: ₦600k, Withdrawn or Pending: ₦350k, Withdrawable: ₦250k
export const DEMO_INVESTOR_POSITIONS = [
  {
    investor_id: "a0000000-0000-4000-8000-000000000006",
    capital_kobo: 1000000000,
    returns_kobo: 60000000,
    withdrawn_or_pending_kobo: 35000000,
    withdrawable_kobo: 25000000,
  },
];

export const DEMO_ENQUIRIES = [
  {
    id: "enq-0001",
    name: "Alhaji Ibrahim Danjuma",
    phone: "08031234567",
    email: "danjuma@gmail.com",
    intended_amount_naira: "15,000,000",
    message: "We run a distribution business in Abuja and want to partner on weekly harvest supply and financing.",
    status: "new",
    created_at: "2026-10-25T14:20:00Z",
    updated_at: "2026-10-25T14:20:00Z",
  },
  {
    id: "enq-0002",
    name: "Dr. Ngozi Eze",
    phone: "08029876543",
    email: "ngozi.eze@outlook.com",
    intended_amount_naira: "5,000,000",
    message: "Interested in the agricultural capital program. Please send the memorandum.",
    status: "contacted",
    created_at: "2026-10-22T09:10:00Z",
    updated_at: "2026-10-23T11:00:00Z",
  },
];

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif-0001",
    user_id: "a0000000-0000-4000-8000-000000000005", // Agent
    title: "Cash given",
    body: "Cash advance of ₦3,000,000 recorded.",
    kind: "advance_recorded",
    entity_table: "agent_cash_advances",
    entity_id: "adv-0002",
    read_at: null,
    created_at: "2026-10-22T11:00:00Z",
  },
  {
    id: "notif-0002",
    user_id: "a0000000-0000-4000-8000-000000000004", // Store
    title: "Delivery recorded",
    body: "An agent delivered 50 bags to Main store awaiting confirmation.",
    kind: "delivery_recorded",
    entity_table: "agent_deliveries",
    entity_id: "del-0003",
    read_at: null,
    created_at: "2026-10-26T08:30:00Z",
  },
  {
    id: "notif-0003",
    user_id: "a0000000-0000-4000-8000-000000000002", // Director
    title: "Investor enquiry",
    body: "Alhaji Ibrahim Danjuma sent an enquiry.",
    kind: "enquiry_received",
    entity_table: "investor_enquiries",
    entity_id: "enq-0001",
    read_at: null,
    created_at: "2026-10-25T14:20:00Z",
  },
  {
    id: "notif-0004",
    user_id: "a0000000-0000-4000-8000-000000000003", // Accountant
    title: "Order placed",
    body: "A customer placed an order for 20 bags.",
    kind: "order_placed",
    entity_table: "orders",
    entity_id: "ord-0003",
    read_at: null,
    created_at: "2026-10-26T09:15:00Z",
  },
];

export const DEMO_AUDIT_LOG = [
  {
    id: "aud-0001",
    table_name: "agent_deliveries",
    row_id: "del-0001",
    action: "insert",
    actor_id: "a0000000-0000-4000-8000-000000000005",
    before_value: null,
    after_value: { bag_count: 80, kg_per_bag: 50, amount_spent: 3600000 },
    created_at: "2026-10-15T14:00:00Z",
  },
  {
    id: "aud-0002",
    table_name: "agent_deliveries",
    row_id: "del-0001",
    action: "update",
    actor_id: "a0000000-0000-4000-8000-000000000004",
    before_value: { status: "pending" },
    after_value: { status: "confirmed" },
    created_at: "2026-10-15T16:00:00Z",
  },
  {
    id: "aud-0003",
    table_name: "orders",
    row_id: "ord-0002",
    action: "update",
    actor_id: "a0000000-0000-4000-8000-000000000003",
    before_value: { status: "placed" },
    after_value: { status: "payment_confirmed", price_per_bag_kobo: 5300000 },
    created_at: "2026-10-25T15:00:00Z",
  },
];

/**
 * Universal table-to-data mapper for demo client
 */
export const DEMO_TABLE_DATA: Record<string, unknown[]> = {
  warehouses: DEMO_WAREHOUSES,
  warehouse_staff: DEMO_WAREHOUSE_STAFF,
  agent_cash_advances: DEMO_AGENT_ADVANCES,
  agent_deliveries: DEMO_AGENT_DELIVERIES,
  agent_balances: DEMO_AGENT_BALANCES,
  stock_movements: DEMO_STOCK_MOVEMENTS,
  warehouse_stock: DEMO_WAREHOUSE_STOCK,
  orders: DEMO_ORDERS,
  customer_payments: DEMO_CUSTOMER_PAYMENTS,
  transactions: DEMO_TRANSACTIONS,
  investments: DEMO_INVESTMENTS,
  investor_returns: DEMO_INVESTOR_RETURNS,
  withdrawal_requests: DEMO_WITHDRAWAL_REQUESTS,
  investor_positions: DEMO_INVESTOR_POSITIONS,
  investor_enquiries: DEMO_ENQUIRIES,
  notifications: DEMO_NOTIFICATIONS,
  audit_log: DEMO_AUDIT_LOG,
};
