import React, { useState, useEffect } from "react";
import "./App.css";

const CATEGORIES = ["Food & Dining", "Travel", "Salary", "Miscellaneous"];

const CATEGORY_COLORS = {
  "Food & Dining": "#f97316",
  "Travel": "#3b82f6",
  "Salary": "#22c55e",
  "Miscellaneous": "#a855f7",
};

const CATEGORY_ICONS = {
  "Food & Dining": "🍔",
  "Travel": "🚗",
  "Salary": "💰",
  "Miscellaneous": "📦",
};

async function fetchTransactions() {
  const res = await fetch("http://localhost:5000/api/transactions");
  return res.json();
}

async function addTransaction(description, amount) {
  const res = await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, amount: parseFloat(amount) }),
  });
  return res.json();
}

async function updateCategory(id, category) {
  const res = await fetch(`http://localhost:5000/api/transactions/${id}/category`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  });
  return res.json();
}

async function deleteTransaction(id) {
  const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

function AnalyticsBlock({ summary }) {
  const { categoryTotals, totalIncome, totalExpense } = summary;
  const maxValue = Math.max(...Object.values(categoryTotals), 1);

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
          <span className={`balance-value ${totalIncome - totalExpense >= 0 ? "income" : "expense"}`}>
            ₹{(totalIncome - totalExpense).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="category-tracks">
        {Object.entries(categoryTotals).map(([cat, total]) => {
          const percentage = Math.round((total / maxValue) * 100);
          return (
            <div key={cat} className="category-track">
              <div className="track-label">
                <span>{CATEGORY_ICONS[cat]} {cat}</span>
                <span className="track-amount">₹{total.toLocaleString()}</span>
              </div>
              <div className="track-bar-bg">
                <div
                  className="track-bar-fill"
                  style={{ width: `${percentage}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransactionCard({ transaction, onCategoryChange, onDelete }) {
  const isCredit = transaction.amount > 0;

  return (
    <div className={`transaction-card ${isCredit ? "credit" : "debit"}`}>
      <div className="card-main">
        <div className="card-left">
          <div className="card-icon" style={{ backgroundColor: CATEGORY_COLORS[transaction.category] + "22" }}>
            {CATEGORY_ICONS[transaction.category]}
          </div>
          <div className="card-details">
            <p className="card-description">{transaction.description}</p>
            <p className="card-date">
  {new Date(transaction.date).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  })}
</p>
          </div>
        </div>
        <div className="card-right">
          <span className={`card-amount ${isCredit ? "credit-amount" : "debit-amount"}`}>
            {isCredit ? "+" : "−"} ₹{Math.abs(transaction.amount).toLocaleString()}
          </span>
          <select
            className="category-dropdown"
            value={transaction.category}
            onChange={(e) => onCategoryChange(transaction.id, e.target.value)}
            style={{ borderColor: CATEGORY_COLORS[transaction.category] }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="delete-btn" onClick={() => onDelete(transaction.id)}>✕</button>
        </div>
      </div>

      {transaction.hasCashback && transaction.expectedSavings && (
        <div className="cashback-row">
          <span>✨</span>
          <span className="cashback-text">
            Expected Savings: <strong>₹{transaction.expectedSavings.toFixed(2)}</strong> (2% reward)
          </span>
        </div>
      )}
    </div>
  );
}

function AddTransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setLoading(true);
    await onAdd(description, amount);
    setDescription("");
    setAmount("");
    setLoading(false);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder='e.g. "Paid Rs. 200 to Swiggy" or "Received Rs. 5000 from Company"'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-input"
        required
      />
      <input
        type="number"
        placeholder="Amount (negative for expense e.g. -200)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="form-input"
        required
      />
      <button type="submit" className="add-btn" disabled={loading}>
        {loading ? "Adding..." : "+ Add Transaction"}
      </button>
    </form>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    categoryTotals: { "Food & Dining": 0, Travel: 0, Salary: 0, Miscellaneous: 0 },
    totalIncome: 0,
    totalExpense: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await fetchTransactions();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (err) {
      setError("Cannot connect to backend. Make sure server is running on port 5000.");
    }
  }

  async function handleAdd(description, amount) {
    const data = await addTransaction(description, amount);
    setTransactions((prev) => [data.transaction, ...prev]);
    setSummary(data.summary);
  }

  async function handleCategoryChange(id, category) {
    const data = await updateCategory(id, category);
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? data.transaction : tx)));
    setSummary(data.summary);
  }

  async function handleDelete(id) {
    const data = await deleteTransaction(id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setSummary(data.summary);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏦 UPI Transaction Manager</h1>
        <p>Smart categorization & spending insights</p>
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
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onCategoryChange={handleCategoryChange}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}