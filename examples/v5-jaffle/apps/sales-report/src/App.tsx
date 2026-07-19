import { useMemo, useState } from "react";
import { orders, customerName, snapshotEnd } from "./data";
import { RevenueChart, MonthPoint } from "./RevenueChart";
import { TopCustomersChart, CustomerRow } from "./TopCustomersChart";

const SNAPSHOT_END = new Date(snapshotEnd);

const RANGES = [
  { key: "all", label: "All time", days: 100000 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "30d", label: "Last 30 days", days: 30 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

const usd = (n: number, digits = 0) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const MONTH_LABEL: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export default function App() {
  const [range, setRange] = useState<RangeKey>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const view = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    const cutoff = new Date(SNAPSHOT_END);
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    const scoped = orders.filter((o) => o.ordered_at >= cutoffIso);

    // Calc metrics
    const totalRevenue = scoped.reduce((s, o) => s + o.amount, 0);
    const orderCount = scoped.length;
    const activeCustomers = new Set(scoped.map((o) => o.customer_id)).size;

    // Monthly revenue points
    const byMonth = new Map<string, number>();
    for (const o of scoped) {
      const m = o.ordered_at.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + o.amount);
    }
    const monthly: MonthPoint[] = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([m, revenue]) => ({
        key: m,
        label: `${MONTH_LABEL[m.slice(5)]} ${m.slice(2, 4)}`,
        revenue,
      }));

    // Customer revenue points
    const byCustomer = new Map<number, { revenue: number; count: number }>();
    for (const o of scoped) {
      const cur = byCustomer.get(o.customer_id) ?? { revenue: 0, count: 0 };
      cur.revenue += o.amount;
      cur.count += 1;
      byCustomer.set(o.customer_id, cur);
    }
    const topCustomers: CustomerRow[] = [...byCustomer.entries()]
      .map(([id, v]) => ({ name: customerName(id), ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const recent = [...scoped]
      .sort((a, b) => b.ordered_at.localeCompare(a.ordered_at) || b.id - a.id)
      .slice(0, 10);

    // Full orders mapped with customer names
    const allMappedOrders = scoped.map((o) => ({
      ...o,
      customerName: customerName(o.customer_id),
    }));

    return { totalRevenue, orderCount, activeCustomers, monthly, topCustomers, recent, allMappedOrders };
  }, [range]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return view.allMappedOrders;
    const q = searchQuery.toLowerCase();
    return view.allMappedOrders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.id.toString().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [view.allMappedOrders, searchQuery]);

  const avgOrder = view.orderCount ? view.totalRevenue / view.orderCount : 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-badge">Quill Engine</div>
        <h1>Sales Report & Dashboard</h1>
        <p>Rebranded semantic BI layer · Connected to test.main via WebAssembly · Latest order: {snapshotEnd}</p>
      </header>

      <div className="dashboard-navigation">
        <div className="tabs">
          <button 
            className={activeTab === "overview" ? "active" : ""} 
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={activeTab === "transactions" ? "active" : ""} 
            onClick={() => setActiveTab("transactions")}
          >
            All Transactions ({filteredOrders.length})
          </button>
        </div>

        <div className="filters" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          <div className="tiles">
            <div className="card tile hero">
              <div className="tile-label">Total Revenue</div>
              <div className="tile-value">{usd(view.totalRevenue, 2)}</div>
            </div>
            <div className="card tile">
              <div className="tile-label">Orders Count</div>
              <div className="tile-value">{view.orderCount.toLocaleString()}</div>
            </div>
            <div className="card tile">
              <div className="tile-label">Avg Order Value</div>
              <div className="tile-value">{usd(avgOrder, 2)}</div>
            </div>
            <div className="card tile">
              <div className="tile-label">Active Customers</div>
              <div className="tile-value">{view.activeCustomers}</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card chart-container">
              <h2>Monthly Revenue Trend</h2>
              <div className="chart-wrapper">
                <RevenueChart data={view.monthly} />
              </div>
            </div>

            <div className="card chart-container">
              <h2>Top Performing Customers</h2>
              <div className="chart-wrapper">
                <TopCustomersChart data={view.topCustomers} />
              </div>
            </div>
          </div>

          <div className="card table-container">
            <h2>Recent Orders</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {view.recent.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{customerName(o.customer_id)}</td>
                      <td>{o.ordered_at}</td>
                      <td>
                        <span className={`badge badge-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="amount">{usd(o.amount, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card transactions-card">
          <div className="transactions-header">
            <h2>Detailed Transaction Log</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search customer, ID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive all-transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td className="customer-name">{o.customerName}</td>
                      <td>{o.ordered_at}</td>
                      <td>
                        <span className={`badge badge-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="amount">{usd(o.amount, 2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="no-results">
                      No matching transactions found for "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
