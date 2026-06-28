import React, { useState, useEffect } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import Header from "./components/Header";
import AnalyticsBlock from "./components/Analytics/AnalyticsBlock";
import AddTransactionForm from "./components/Transactions/AddTransactionForm";
import TransactionFeed from "./components/Transactions/TransactionFeed";
import FilterBar from "./components/FilterBar";
import { fetchTransactions, addTransaction, updateCategory, deleteTransaction } from "./api/api";

const DEFAULT_SUMMARY = {
  categoryTotals: { "Food & Dining": 0, Travel: 0, Salary: 0, Miscellaneous: 0 },
  totalIncome: 0,
  totalExpense: 0,
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? tx.category === filterCat : true;
    const matchType = filterType === "credit" ? tx.amount > 0 : filterType === "debit" ? tx.amount < 0 : true;
    return matchSearch && matchCat && matchType;
  });

  useEffect(() => { if (token) loadData(); }, [token]);

  async function loadData() {
    try {
      const data = await fetchTransactions();
      if (data.error) { setError(data.error); return; }
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch { setError("Cannot connect to backend. Make sure server is running on port 5000."); }
  }

  async function handleAdd(description, amount, date) {
    const data = await addTransaction(description, amount, date);
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

  function handleLogin(newToken, newUsername) { setToken(newToken); setUsername(newUsername); }

  function handleLogout() {
    localStorage.removeItem("token"); localStorage.removeItem("username");
    setToken(null); setUsername(null); setTransactions([]); setSummary(DEFAULT_SUMMARY);
  }

  if (!token) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="app">
      <Header username={username} onLogout={handleLogout} />
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
            Transaction Feed <span className="tx-count">{filtered.length} transactions</span>
          </h2>
          <FilterBar search={search} setSearch={setSearch}
            filterCat={filterCat} setFilterCat={setFilterCat}
            filterType={filterType} setFilterType={setFilterType} />
          <TransactionFeed transactions={filtered}
            onCategoryChange={handleCategoryChange} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  );
}