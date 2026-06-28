# Bank Transaction UPI Summary & Categorization

An automated money manager that parses UPI transaction alerts, auto-categorizes them, and visualizes spending habits.

## Tech Stack

- **Frontend:** React (Create React App)
- **Backend:** Node.js + Express
- **Storage:** In-memory (no database required)

## Project Structure

```
bank-transaction-app/
├── backend/
│   ├── server.js        ← Express server, all business logic
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js       ← React UI components
│   │   ├── App.css      ← All styles
│   │   └── index.js     ← React entry point
│   └── package.json
└── README.md
```

## Features

### ✅ Transaction Stream
- Chronological feed of transaction cards
- Each card shows description, amount, date, category dropdown

### ✅ Visual Analytics Block
- Progress bars for Food & Dining, Travel, Salary, Miscellaneous
- Total Income / Expense / Net Balance summary

### ✅ Automated Keyword Tagging Parser
- Detects keywords: Zomato, Swiggy → Food & Dining
- Detects: Uber, Ola → Travel
- Detects: salary, Ltd → Salary
- Default fallback: Miscellaneous

### ✅ Category Dropdown (manual override)
- Users can manually change auto-assigned category

### ✅ Vibe Check - Expected Savings
- Detects "Cashback", "Amazon Pay", reward partners
- Injects green savings row showing 2% projected reward

### ✅ Cumulative Metric Reducer
- All calculations on the server side
- Separates income vs expense, sums per category

## How to Run

### Step 1: Start Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on http://localhost:5000

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | Get all transactions + summary |
| POST | /api/transactions | Add new transaction (auto-categorizes) |
| PATCH | /api/transactions/:id/category | Update category manually |
| DELETE | /api/transactions/:id | Delete a transaction |

## Sample API Request

```json
POST /api/transactions
{
  "description": "Paid Rs. 250 to Zomato",
  "amount": -250
}
```

Response:
```json
{
  "transaction": {
    "id": 6,
    "description": "Paid Rs. 250 to Zomato",
    "amount": -250,
    "category": "Food & Dining",
    "hasCashback": false,
    "date": "2024-06-28T..."
  },
  "summary": {
    "categoryTotals": { "Food & Dining": 500, ... },
    "totalIncome": 50000,
    "totalExpense": 800
  }
}
```
