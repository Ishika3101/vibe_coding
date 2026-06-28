const API = "http://localhost:5000/api";

function getToken() { return localStorage.getItem("token"); }

export async function apiFetch(path, options = {}) {
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

export const fetchTransactions = () => apiFetch("/transactions");

export const addTransaction = (description, amount, date) =>
  apiFetch("/transactions", {
    method: "POST",
    body: JSON.stringify({ description, amount: parseFloat(amount), date }),
  });

export const updateCategory = (id, category) =>
  apiFetch(`/transactions/${id}/category`, {
    method: "PATCH",
    body: JSON.stringify({ category }),
  });

export const deleteTransaction = (id) =>
  apiFetch(`/transactions/${id}`, { method: "DELETE" });

export const loginUser = (username, password) =>
  apiFetch("/login", { method: "POST", body: JSON.stringify({ username, password }) });

export const registerUser = (username, password) =>
  apiFetch("/register", { method: "POST", body: JSON.stringify({ username, password }) });