// Real jaffle_shop snapshot exported from data/jaffle_shop.duckdb — the same
// database the quill CLI queries through the semantic layer. In a live
// deployment this asset is queried client-side via quill-core-wasm.
import snapshot from "./snapshot.json";

export interface Customer {
  id: number;
  name: string | null; // NULL for guest checkouts, per the model description
}

export interface Order {
  id: number;
  customer_id: number;
  amount: number;
  ordered_at: string; // ISO date
  status: string;
}

export const customers: Customer[] = snapshot.customers;
export const orders: Order[] = snapshot.orders;

// Latest order date in the snapshot — the dashboard's "today".
export const snapshotEnd: string = orders.reduce(
  (max, o) => (o.ordered_at > max ? o.ordered_at : max),
  orders[0]?.ordered_at ?? "1970-01-01",
);

const byId = new Map(customers.map((c) => [c.id, c]));

export function customerName(id: number): string {
  return byId.get(id)?.name ?? `Guest #${id}`;
}
