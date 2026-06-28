import React, { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Food & Dining", "Travel", "Salary", "Miscellaneous"];
const CATEGORY_COLORS = {
  "Food & Dining": "#f97316", Travel: "#3b82f6", Salary: "#22c55e", Miscellaneous: "#a855f7",
};
const CATEGORY_ICONS = {
  "Food & Dining": "🍔", Travel: "🚗", Salary: "💰", Miscellaneous: "📦",
};

const API = "http://localhost:5000/api";
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const data = await apiFetch(isLogin ? "/login" : "/register", {
        method: "POST", body: JSON.stringify({ username, password }),
      });
      if (data.error) { setError(data.error); setLoading(false); return; }
      if (!isLogin) {
        setSuccess("✅ Registered! Please login.");
        setIsLogin(true); setUsername(""); setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        onLogin(data.token, data.username);
      }
    } catch { setError("Cannot connect to backend."); }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">🏦</div>
        <h1 className="auth-title">UPI Transaction Manager</h1>
        <p className="auth-subtitle">Smart categorization & spending insights</p>
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>Login</button>
          <button className={`auth-tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>Register</button>
        </div>
        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input type="text" placeholder="Enter username" value={username}
              onChange={(e) => setUsername(e.target.value)} className="form-input" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={password}
              onChange={(e) => setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AnalyticsBlock({ summary }) {
  const { categoryTotals, totalIncome, totalExpense } = summary;
  const maxValue = Math.max(...Object.values(categoryTotals), 1);
  const net = totalIncome - totalExpense;
  return (
    <div className="analytics-block">
      <div className="balance-row">
        <div className="balance-item">
          <span className="balance-label">Total Income</span>
          <span className="balance-value income">₹{totalIncome.toLocaleString()}</span>
        </div>
        <div className="balance-divider" />
        <div className="balance-item">
          <span className="balance-label">Total Expense</span>
          <span className="balance-value expense">₹{totalExpense.toLocaleString()}</span>
        </div>
        <div className="balance-divider" />
        <div className="balance-item">
          <span className="balance-label">Net Balance</span>
          <span className={`balance-value ${net >= 0 ? "income" : "expense"}`}>
            {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="category-tracks">
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <div key={cat} className="category-track">
            <div className="track-label">
              <span>{CATEGORY_ICONS[cat]} {cat}</span>
              <span className="track-amount">₹{total.toLocaleString()}</span>
            </div>
            <div className="track-bar-bg">
              <div className="track-bar-fill"
                style={{ width: `${Math.round((total / maxValue) * 100)}%`, backgroundColor: CATEGORY_COLORS[cat] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionCard({ transaction, onCategoryChange, onDelete }) {
  const isCredit = transaction.amount > 0;
  const d = new Date(transaction.date);
  const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className={`transaction-card ${isCredit ? "credit" : "debit"}`}>
      <div className="card-main">
        <div className="card-left">
          <div className="card-icon" style={{ backgroundColor: CATEGORY_COLORS[transaction.category] + "22" }}>
            {CATEGORY_ICONS[transaction.category]}
          </div>
          <div className="card-details">
            <p className="card-description">{transaction.description}</p>
            <div className="card-meta">
              <span className="card-date">📅 {dateStr}</span>
              <span className="card-time">🕐 {timeStr}</span>
            </div>
          </div>
        </div>
        <div className="card-right">
          <span className={`card-amount ${isCredit ? "credit-amount" : "debit-amount"}`}>
            {isCredit ? "+" : "−"} ₹{Math.abs(transaction.amount).toLocaleString()}
          </span>
          <select className="category-dropdown" value={transaction.category}
            onChange={(e) => onCategoryChange(transaction.id, e.target.value)}
            style={{ borderColor: CATEGORY_COLORS[transaction.category] }}>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button className="delete-btn" onClick={() => onDelete(transaction.id)}>✕</button>
        </div>
      </div>
      {transaction.hasCashback && transaction.expectedSavings && (
        <div className="cashback-row">
          <span>✨</span>
          <span className="cashback-text">Expected Savings: <strong>₹{transaction.expectedSavings.toFixed(2)}</strong> (2% reward)</span>
        </div>
      )}
    </div>
  );
}

function AddTransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setLoading(true);
    const isoDate = date && time ? new Date(`${date}T${time}:00`).toISOString() : new Date().toISOString();
    await onAdd(description, amount, isoDate);
    setDescription(""); setAmount("");
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
    setLoading(false);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input type="text" placeholder='e.g. "Paid Rs. 200 to Swiggy"'
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="form-input flex-2" required />
        <input type="number" placeholder="Amount (-200 for expense)"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="form-input flex-1" required />
      </div>
      <div className="form-row">
        <div className="date-group">
          <label className="date-label">📅 Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
        </div>
        <div className="date-group">
          <label className="date-label">🕐 Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-input" />
        </div>
        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? "Adding..." : "+ Add Transaction"}
        </button>
      </div>
    </form>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    categoryTotals: { "Food & Dining": 0, Travel: 0, Salary: 0, Miscellaneous: 0 },
    totalIncome: 0, totalExpense: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => { if (token) loadData(); }, [token]);

  async function loadData() {
    try {
      const data = await apiFetch("/transactions");
      if (data.error) { setError(data.error); return; }
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch { setError("Cannot connect to backend. Make sure server is running on port 5000."); }
  }

  async function handleAdd(description, amount, date) {
    const data = await apiFetch("/transactions", {
      method: "POST", body: JSON.stringify({ description, amount: parseFloat(amount), date }),
    });
    setTransactions((prev) => [data.transaction, ...prev]);
    setSummary(data.summary);
  }

  async function handleCategoryChange(id, category) {
    const data = await apiFetch(`/transactions/${id}/category`, {
      method: "PATCH", body: JSON.stringify({ category }),
    });
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? data.transaction : tx)));
    setSummary(data.summary);
  }

  async function handleDelete(id) {
    const data = await apiFetch(`/transactions/${id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setSummary(data.summary);
  }

  function handleLogin(newToken, newUsername) { setToken(newToken); setUsername(newUsername); }

  function handleLogout() {
    localStorage.removeItem("token"); localStorage.removeItem("username");
    setToken(null); setUsername(null); setTransactions([]);
  }

  if (!token) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🏦 UPI Transaction Manager</h1>
          <p>Smart categorization & spending insights</p>
        </div>
        <div className="header-user">
          <span className="user-badge">👤 {username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="app-main">
        {error && <div className="error-banner">⚠️ {error}</div>}
        <AnalyticsBlock summary={summary} />
        <section className="section">
          <h2 className="section-title">Add New Transaction</h2>
          <AddTransactionForm onAdd={handleAdd} />
          <p className="hint">💡 Try "Zomato", "Uber", "Swiggy", "Cashback" — they auto-categorize!</p>
        </section>
        <section className="section">
          <h2 className="section-title">
            Transaction Feed <span className="tx-count">{transactions.length} transactions</span>
          </h2>
          <div className="transaction-feed">
            {transactions.length === 0 ? (
              <div className="empty-state">No transactions yet. Add one above!</div>
            ) : (
              transactions.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx}
                  onCategoryChange={handleCategoryChange} onDelete={handleDelete} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}