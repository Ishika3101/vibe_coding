const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "upi_secret_123";
let users = [];
let transactions = [];
let nextId = 1;

const KEYWORD_MAP = {
  "Food & Dining": ["zomato", "swiggy", "restaurant", "food", "cafe", "pizza", "burger", "meal"],
  Travel: ["uber", "ola", "rapido", "metro", "bus", "flight", "train", "fuel", "petrol"],
  Salary: ["salary", "stipend", "payroll", "company", "employer", "income", "credited"],
  Miscellaneous: [],
};

const CASHBACK_KEYWORDS = ["cashback", "reward", "amazon pay", "hdfc", "paytm", "phonepe", "gpay"];

function categorize(description) {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Miscellaneous";
}

function computeSummary() {
  const categoryTotals = { "Food & Dining": 0, Travel: 0, Salary: 0, Miscellaneous: 0 };
  let totalIncome = 0, totalExpense = 0;
  for (const tx of transactions) {
    if (tx.amount > 0) totalIncome += tx.amount;
    else totalExpense += Math.abs(tx.amount);
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  }
  return { categoryTotals, totalIncome, totalExpense };
}

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  if (users.find((u) => u.username === username)) return res.status(400).json({ error: "User already exists" });
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: users.length + 1, username, password: hashedPassword });
  res.status(201).json({ message: "Registered successfully" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "2h" });
  res.json({ token, username: user.username });
});

function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

app.get("/api/transactions", verifyToken, (req, res) => {
  res.json({ transactions: [...transactions].reverse(), summary: computeSummary() });
});

app.post("/api/transactions", verifyToken, (req, res) => {
  const { description, amount, date } = req.body;
  if (!description || amount === undefined) return res.status(400).json({ error: "Description and amount required" });
  const lower = description.toLowerCase();
  const hasCashback = CASHBACK_KEYWORDS.some((kw) => lower.includes(kw));
  const tx = {
    id: nextId++,
    description,
    amount: parseFloat(amount),
    category: categorize(description),
    date: date || new Date().toISOString(),
    hasCashback,
    expectedSavings: hasCashback ? Math.abs(parseFloat(amount)) * 0.02 : null,
  };
  transactions.push(tx);
  res.status(201).json({ transaction: tx, summary: computeSummary() });
});

app.patch("/api/transactions/:id/category", verifyToken, (req, res) => {
  const tx = transactions.find((t) => t.id === parseInt(req.params.id));
  if (!tx) return res.status(404).json({ error: "Transaction not found" });
  tx.category = req.body.category;
  res.json({ transaction: tx, summary: computeSummary() });
});

app.delete("/api/transactions/:id", verifyToken, (req, res) => {
  const index = transactions.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Transaction not found" });
  transactions.splice(index, 1);
  res.json({ message: "Deleted", summary: computeSummary() });
});

app.listen(5000, () => console.log("✅ Backend running at http://localhost:5000"));