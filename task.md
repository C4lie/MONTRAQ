# Vaultify – Task & Implementation Plan (For Antigravity Agent)

## IMPORTANT INSTRUCTIONS FOR AGENT

* You MUST read `prd.md` fully before writing any code.
* You MUST implement ONLY what is defined in v1 scope.
* Do NOT add extra features, AI, charts, notifications, or integrations.
* Prioritize mobile-first UI, speed, and clean UX.
* Follow tasks in the exact order below.

---

## PHASE 0 – Project Initialization

### Task 0.1: Repository & Setup

* Initialize Git repository
* Setup React + Vite project
* Configure TypeScript
* Install Tailwind CSS
* Setup basic folder structure:

  * src/components
  * src/pages
  * src/store
  * src/services
  * src/hooks
  * src/utils

### Task 0.2: Core Libraries

Install and configure:

* Zustand (state management)
* Framer Motion (animations)
* Firebase SDK
* Vite PWA plugin

---

## PHASE 1 – Firebase & PWA Foundation

### Task 1.1: Firebase Configuration

* Create Firebase project
* Enable Email/Password Authentication
* Setup Firestore database
* Create firebase config file
* Secure environment variables

### Task 1.2: PWA Setup

* Configure service worker
* Enable offline caching
* Add app manifest
* Configure app icons & splash screen
* Enable install prompt

---

## PHASE 2 – Authentication Flow

### Task 2.1: Auth Pages

* Create Login page
* Create Signup page
* Basic form validation
* Error handling

### Task 2.2: Auth State Handling

* Persist user session
* Redirect logic based on auth state
* Protect private routes

---

## PHASE 3 – Core Data Models

### Task 3.1: Firestore Schema

Create collections:

* users
* monthlyIncome
* mandatoryRules
* categories
* expenses
* savings

Define fields exactly as per PRD.

---

## PHASE 4 – First-Time User Setup Flow

### Task 4.1: Monthly Income Setup

* Page to input monthly income
* Save income to Firestore
* Lock editing after setup

### Task 4.2: Mandatory Rules Setup

* Create rule form (name + amount)
* Allow multiple rules
* Mark rules as locked

### Task 4.3: Category Setup

* Create category list (max 6–8)
* Assign budget amount
* Validate total does not exceed remaining balance

---

## PHASE 5 – Dashboard (Core Screen)

### Task 5.1: Dashboard Layout

* Income summary
* Mandatory spent section (locked cards)
* Category cards with progress bars
* Savings vault card

### Task 5.2: Animations

* Smooth progress fill animations
* Subtle overspend warning animation
* Savings count-up animation

---

## PHASE 6 – Expense Logging

### Task 6.1: Add Expense Flow

* Floating action button
* Add expense modal
* Fields: amount, category, note
* Save to Firestore

### Task 6.2: Budget Updates

* Update category remaining amount
* Reflect changes instantly on dashboard

---

## PHASE 7 – Savings Vault

### Task 7.1: Savings Logic

* Display locked savings amount
* Prevent accidental withdrawal
* Require confirmation to withdraw

### Task 7.2: Monthly Savings Tracking

* Track consistency month-over-month

---

## PHASE 8 – Monthly Lifecycle

### Task 8.1: Month Reset Logic

* Detect new month
* Apply mandatory rules automatically
* Reset category budgets
* Archive previous month data

---

## PHASE 9 – Insights (Minimal)

### Task 9.1: Spending Insights

* Calculate top spending category
* Show % income spent vs saved
* Monthly summary card

(No charts in v1)

---

## PHASE 10 – Responsiveness & Polish

### Task 10.1: Mobile Optimization

* Ensure mobile-first layout
* Touch-friendly buttons

### Task 10.2: Desktop Layout

* Wider dashboard layout
* Maintain minimal design

---

## PHASE 11 – Testing & Stability

### Task 11.1: Edge Case Handling

* Overspending validation
* Zero income handling
* Offline usage testing

### Task 11.2: Performance

* Reduce unnecessary re-renders
* Optimize Firestore reads

---

## PHASE 12 – Deployment

### Task 12.1: Firebase Hosting

* Setup hosting config
* Build production bundle
* Deploy PWA

### Task 12.2: Final Checks

* Test install flow
* Test offline mode
* Test authentication persistence

---

## RULES FOR AGENT (STRICT)

* Do not skip phases
* Do not introduce new features
* Do not redesign UX without reason
* Focus on correctness + clarity

---

**END OF TASK FILE**
