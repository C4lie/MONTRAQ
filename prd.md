# Money Tracker PWA – Product Requirement Document (PRD)

## 1. Project Title

**Vaultify** (working name)

A minimal, rule-based personal money tracker built as a Progressive Web App (PWA), focused on *discipline-first budgeting* rather than passive expense logging.

---

## 2. Abstract

Vaultify is a personal finance PWA designed to help users consciously control how their money is spent each month. Unlike traditional expense trackers that only record spending, Vaultify enforces **pre-defined financial rules** such as mandatory subscriptions, fixed savings, and category budgets before any discretionary spending occurs.

The application follows a **mobile-first, minimal, animated UI/UX**, inspired by modern fintech and budgeting apps. It works offline, syncs automatically when online, and can be installed directly from the browser like a native app.

The primary goal is behavioral: reduce impulsive spending by forcing clarity, limits, and accountability.

---

## 3. Target User

* Students with fixed monthly income
* Young professionals managing limited budgets
* Users who want simplicity, not complex finance tools

---

## 4. Core Principles

* **Rule before spend** (decisions first, expenses later)
* **Minimal UI, maximum clarity**
* **Fast interactions (<5 seconds per action)**
* **Offline-first**
* **No bank/API dependency**

---

## 5. Tech Stack (Deployment-Friendly)

### Frontend

* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion
* **State Management:** Zustand

### Backend / Data

* **Platform:** Firebase

  * Firestore (database)
  * Firebase Auth (email/password)

### PWA

* Service Workers (Vite PWA plugin)
* Offline caching
* App install banner
* Splash screen & icons

### Hosting

* Firebase Hosting

**Reasoning:**

* Zero server management
* Easy PWA deployment
* Scales well for personal + small public use
* Minimal DevOps complexity

---

## 6. Features

### 6.1 Authentication

* Email & password login
* Anonymous guest mode (optional future)

---

### 6.2 Monthly Income Setup

* User sets monthly income (e.g. ₹2000)
* Editable once per month
* Month reset handled automatically

---

### 6.3 Mandatory Allocations (Rules Engine)

Users define fixed rules such as:

* Subscriptions (YouTube Premium – ₹500)
* Fixed savings (₹200)

Rules:

* Auto-deducted at month start
* Locked visually
* Cannot be bypassed accidentally

---

### 6.4 Category Budgets

* Limited set of categories (6–8 max)
* Each category includes:

  * Budgeted amount
  * Spent amount
  * Remaining balance

---

### 6.5 Expense Logging

* Quick add expense
* Fields:

  * Amount
  * Category
  * Optional note
* Default date: today

---

### 6.6 Savings Vault

* Separate from categories
* Visually isolated
* Withdrawal requires confirmation
* Monthly savings consistency tracked

---

### 6.7 Monthly Dashboard

Displays:

* Total income
* Mandatory spent
* Flexible spent
* Saved amount
* Remaining balance

---

### 6.8 Insights (Simple & Honest)

* Top spending category
* % income spent vs saved
* Monthly consistency indicator

No complex charts in v1.

---

## 7. User Flow

### First-Time User Flow

1. Open website
2. Sign up / Login
3. Set monthly income
4. Define mandatory rules
5. Create categories
6. Reach dashboard

---

### Daily Usage Flow

1. Open app
2. Add expense
3. Dashboard updates instantly
4. Visual feedback if limit exceeded

---

### Month Reset Flow

1. Month changes automatically
2. Mandatory rules applied
3. Categories reset
4. Previous month archived

---

## 8. UI / UX Guidelines

* Dark mode first
* Large typography
* Glassmorphism cards
* Smooth progress animations
* Subtle warnings on overspend

Inspired by:

* Fintech mobile dashboards
* Minimal budgeting apps
* Modern insurance & finance UI

---

## 9. PWA Requirements

* Offline usage supported
* Auto sync on reconnect
* Installable from browser
* Fullscreen experience
* App icon + splash screen

---

## 10. Out of Scope (v1)

* Bank integrations
* AI budgeting
* Notifications & reminders
* Multi-currency support
* Data export

---

## 11. Success Metrics

* App used daily for 30 days
* Expenses logged consistently
* Savings rule followed monthly
* User installs PWA instead of browser-only usage

---

## 12. Future Enhancements

* Charts & trends
* Smart nudges
* CSV export
* Cloud backup toggle
* Multiple income sources

---

## 13. Build Instruction for Antigravity Agent

The agent should:

1. Read this PRD completely
2. Scaffold React + Vite project
3. Configure Firebase
4. Implement PWA setup early
5. Build features in listed order
6. Prioritize UX speed & animations

---

**End of PRD**
