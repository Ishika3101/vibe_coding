import React from "react";
import TransactionCard from "./TransactionCard";

export default function TransactionFeed({ transactions, onCategoryChange, onDelete }) {
  if (transactions.length === 0) {
    return <div className="empty-state">No transactions match your filter.</div>;
  }
  return (
    <div className="transaction-feed">
      {transactions.map((tx) => (
        <TransactionCard key={tx.id} transaction={tx}
          onCategoryChange={onCategoryChange} onDelete={onDelete} />
      ))}
    </div>
  );
}