import { useMemo, useState, useEffect } from "react";
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
type AppState = "loading" | "permission" | "login" | "dashboard";

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
  // App States: loading -> permission -> login -> dashboard
  const [appState, setAppState] = useState<AppState>("loading");
  
  // Loading progress states
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Initializing WebAssembly runtime...");

  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard states
  const [range, setRange] = useState<RangeKey>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated Loading Progress
  useEffect(() => {
    if (appState !== "loading") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(interval);
          setLoadingStatus("Complete!");
          setTimeout(() => setAppState("permission"), 500); // transition to permission
          return 100;
        }
        
        // Update statuses based on progress percent
        if (next < 35) {
          setLoadingStatus("Initializing WebAssembly runtime...");
        } else if (next < 70) {
          setLoadingStatus("Connecting to local DuckDB database...");
        } else {
          setLoadingStatus("Syncing MDL context schemas...");
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [appState]);

  // Login submit handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter both username and password.");
      return;
    }
    // Simple mock check
    if (username.toLowerCase() === "admin" && password === "admin") {
      setLoginError("");
      setAppState("dashboard");
    } else {
      setLoginError("Invalid username or password. (Hint: use admin / admin)");
    }
  };

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

  // Render State 1: Simulated Loading Page
  if (appState === "loading") {
    return (
      <div className="flow-container">
        <div className="card form-card loading-card">
          <div className="logo-glow"></div>
          <h2>Quill BI Engine</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">{progress}%</div>
          <p className="loading-status-text">{loadingStatus}</p>
        </div>
      </div>
    );
  }

  // Render State 2: Permission Prompt
  if (appState === "permission") {
    return (
      <div className="flow-container">
        <div className="card form-card permission-card">
          <div className="icon-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2>Access Request</h2>
          <p className="permission-desc">
            Quill requires permission to access the local DuckDB database context and store connection profile caches in your browser.
          </p>
          <div className="permission-actions">
            <button className="btn-primary" onClick={() => setAppState("login")}>
              Grant Access
            </button>
            <button className="btn-secondary" onClick={() => { setProgress(0); setAppState("loading"); }}>
              Deny
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render State 3: Login Page
  if (appState === "login") {
    return (
      <div className="flow-container">
        <div className="card form-card login-card">
          <div className="logo-glow"></div>
          <h2>Sign In</h2>
          <p className="login-desc">Enter credentials to open dashboard</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {loginError && <p className="error-message">{loginError}</p>}
            
            <button type="submit" className="btn-primary">
              Log In
            </button>
          </form>
          
          <div className="credential-tip">
            Hint: Use <code>admin</code> for both username & password.
          </div>
        </div>
      </div>
    );
  }

  // Render State 4: Dashboard Page
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top-row">
          <div className="brand-badge">Quill Engine</div>
          <button className="btn-logout" onClick={() => {
            setUsername("");
            setPassword("");
            setAppState("login");
          }}>
            Log Out
          </button>
        </div>
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
