const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── IN-MEMORY DATA STORE ───────────────────────────────────────────────────
// This acts as our "database". All transactions live here during the session.
let transactions = [
  {
    id: 1,
    description: "Paid Rs. 250 to Zomato",
    amount: -250,
    category: "Food & Dining",
    hasCashback: false,
    date: new Date().toISOString(),
  },
  {
    id: 2,
    description: "Received Rs. 50000 from Private Company Ltd",
    amount: 50000,
    category: "Salary",
    hasCashback: false,
    date: new Date().toISOString(),
  },
  {
    id: 3,
    description: "Paid Rs. 150 to Swiggy",
    amount: -150,
    category: "Food & Dining",
    hasCashback: false,
    date: new Date().toISOString(),
  },
  {
    id: 4,
    description: "Paid Rs. 300 to Uber",
    amount: -300,
    category: "Travel",
    hasCashback: false,
    date: new Date().toISOString(),
  },
  {
    id: 5,
    description: "Cashback from HDFC on Amazon Pay",
    amount: -100,
    category: "Miscellaneous",
    hasCashback: true,
    date: new Date().toISOString(),
  },
];

let nextId = 6;

// ─── KEYWORD PARSER ─────────────────────────────────────────────────────────
// This function reads raw transaction text and auto-assigns a category.
// This is the "Automated Keyword Tagging Parser" from the problem statement.
const KEYWORD_MAP = {
  // Food & Dining keywords
  zomato: "Food & Dining",
  swiggy: "Food & Dining",
  dominos: "Food & Dining",
  mcdonalds: "Food & Dining",
  starbucks: "Food & Dining",
  blinkit: "Food & Dining",

  // Travel keywords
  uber: "Travel",
  ola: "Travel",
  rapido: "Travel",
  irctc: "Travel",
  makemytrip: "Travel",
  redbus: "Travel",

  // Salary keywords
  salary: "Salary",
  "private company": "Salary",
  ltd: "Salary",
  payroll: "Salary",

  // Cashback / Reward partners (for "Vibe Check" feature)
  cashback: "Miscellaneous",
  amazon: "Miscellaneous",
  flipkart: "Miscellaneous",
  paytm: "Miscellaneous",
};

// REWARD PARTNERS - triggers the green "Expected Savings" card
const REWARD_PARTNERS = ["cashback", "amazon pay", "flipkart", "paytm cashback", "hdfc rewards"];

function parseCategory(description) {
  const lower = description.toLowerCase();
  for (const keyword in KEYWORD_MAP) {
    if (lower.includes(keyword)) {
      return KEYWORD_MAP[keyword];
    }
  }
  return "Miscellaneous"; // default fallback
}

function checkCashback(description) {
  const lower = description.toLowerCase();
  return REWARD_PARTNERS.some((partner) => lower.includes(partner));
}

function calculateExpectedSavings(amount) {
  // Simulate 2% cashback reward on outbound transactions
  return Math.abs(amount) * 0.02;
}

// ─── CUMULATIVE METRIC REDUCER ───────────────────────────────────────────────
// Processes all transactions and returns totals per category.
// Separates income (positive) from expenses (negative).
function calculateSummary(txList) {
  const categoryTotals = {
    "Food & Dining": 0,
    Travel: 0,
    Salary: 0,
    Miscellaneous: 0,
  };

  let totalIncome = 0;
  let totalExpense = 0;

  txList.forEach((tx) => {
    if (tx.amount > 0) {
      totalIncome += tx.amount;
    } else {
      totalExpense += Math.abs(tx.amount);
    }

    // Add to category total (use absolute value for display)
    if (categoryTotals[tx.category] !== undefined) {
      categoryTotals[tx.category] += Math.abs(tx.amount);
    }
  });

  return { categoryTotals, totalIncome, totalExpense };
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// GET /api/transactions - returns all transactions + summary
app.get("/api/transactions", (req, res) => {
  const summary = calculateSummary(transactions);

  // Attach expectedSavings to each transaction that has cashback
  const enriched = transactions.map((tx) => ({
    ...tx,
    expectedSavings: tx.hasCashback ? calculateExpectedSavings(tx.amount) : null,
  }));

  res.json({
    transactions: enriched,
    summary,
  });
});

// POST /api/transactions - add a new transaction
app.post("/api/transactions", (req, res) => {
  const { description, amount } = req.body;

  if (!description || amount === undefined) {
    return res.status(400).json({ error: "Description and amount are required." });
  }

  const parsedAmount = parseFloat(amount);
  const autoCategory = parseCategory(description);
  const hasCashback = checkCashback(description);

  const newTransaction = {
    id: nextId++,
    description,
    amount: parsedAmount,
    category: autoCategory,
    hasCashback,
    date: new Date().toISOString(),
  };

  transactions.unshift(newTransaction); // add to front (chronological feed)

  const summary = calculateSummary(transactions);

  res.status(201).json({
    transaction: {
      ...newTransaction,
      expectedSavings: hasCashback ? calculateExpectedSavings(parsedAmount) : null,
    },
    summary,
  });
});

// PATCH /api/transactions/:id/category - update category manually (dropdown)
app.patch("/api/transactions/:id/category", (req, res) => {
  const id = parseInt(req.params.id);
  const { category } = req.body;

  const validCategories = ["Food & Dining", "Travel", "Salary", "Miscellaneous"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: "Invalid category." });
  }

  const tx = transactions.find((t) => t.id === id);
  if (!tx) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  tx.category = category;

  const summary = calculateSummary(transactions);
  res.json({ transaction: tx, summary });
});

// DELETE /api/transactions/:id - delete a transaction
app.delete("/api/transactions/:id", (req, res) => {
  const id = parseInt(req.params.id);
  transactions = transactions.filter((t) => t.id !== id);
  const summary = calculateSummary(transactions);
  res.json({ message: "Deleted", summary });
});

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
