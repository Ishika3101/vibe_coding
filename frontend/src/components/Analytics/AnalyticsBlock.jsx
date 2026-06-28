import React from "react";
import PieChart from "./PieChart";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../../constants";

export default function AnalyticsBlock({ summary }) {
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

      <PieChart categoryTotals={categoryTotals} />

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