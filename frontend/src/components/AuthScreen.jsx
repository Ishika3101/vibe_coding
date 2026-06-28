import React, { useState } from "react";
import { loginUser, registerUser } from "../api/api";

export default function AuthScreen({ onLogin }) {
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
      const data = isLogin
        ? await loginUser(username, password)
        : await registerUser(username, password);
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