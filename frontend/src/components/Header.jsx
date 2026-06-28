import React from "react";

export default function Header({ username, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1>🏦 UPI Transaction Manager</h1>
        <p>Smart categorization & spending insights</p>
      </div>
      <div className="header-user">
        <span className="user-badge">👤 {username}</span>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}