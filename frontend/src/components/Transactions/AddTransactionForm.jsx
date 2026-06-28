import React, { useState, useEffect } from "react";

export default function AddTransactionForm({ onAdd }) {
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