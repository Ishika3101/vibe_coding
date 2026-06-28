import React from "react";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from "../../constants";

export default function TransactionCard({ transaction, onCategoryChange, onDelete }) {
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
          <span className="cashback-text">
            Expected Savings: <strong>₹{transaction.expectedSavings.toFixed(2)}</strong> (2% reward)
          </span>
        </div>
      )}
    </div>
  );
}