# Vaultify Firestore Schema Documentation

## Overview

This document defines the complete Firestore database schema for Vaultify. All timestamps use Firestore's `Timestamp` type.

---

## Collections

### `users`
**Purpose**: Store user account information and current month tracking.

**Document ID**: Firebase Auth UID

**Fields**:
```typescript
{
  uid: string              // Firebase Auth user ID (same as document ID)
  email: string            // User's email address
  createdAt: Timestamp     // Account creation timestamp
  currentMonth: string     // Current active month in "YYYY-MM" format
}
```

**Example**:
```javascript
{
  uid: "abc123xyz",
  email: "user@example.com",
  createdAt: Timestamp(2026, 1, 15),
  currentMonth: "2026-02"
}
```

**Indexes**: None required (queries by document ID only)

---

### `monthlyIncome`
**Purpose**: Track user's monthly income amounts. One document per user per month.

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string           // Reference to user UID
  month: string            // "YYYY-MM" format
  amount: number           // Monthly income in currency units
  lockedAt: Timestamp      // When the income was locked/confirmed
}
```

**Example**:
```javascript
{
  userId: "abc123xyz",
  month: "2026-02",
  amount: 50000,
  lockedAt: Timestamp(2026, 2, 1)
}
```

**Indexes Required**:
- Composite: `userId` (Ascending) + `month` (Descending)

---

### `mandatoryRules`
**Purpose**: Store recurring mandatory expenses (subscriptions, fixed savings, etc.).

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string           // Reference to user UID
  name: string             // Rule name (e.g., "YouTube Premium")
  amount: number           // Rule amount in currency units
  isActive: boolean        // Whether rule is currently active
  createdAt: Timestamp     // Rule creation timestamp
}
```

**Example**:
```javascript
{
  userId: "abc123xyz",
  name: "Netflix Subscription",
  amount: 199,
  isActive: true,
  createdAt: Timestamp(2026, 1, 15)
}
```

**Indexes Required**:
- Composite: `userId` (Ascending) + `isActive` (Ascending)

---

### `categories`
**Purpose**: Track budget categories and spending for each month.

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string           // Reference to user UID
  month: string            // "YYYY-MM" format
  name: string             // Category name (e.g., "Food", "Transport")
  budgeted: number         // Budgeted amount for this category
  spent: number            // Amount spent so far
  createdAt: Timestamp     // Category creation timestamp
}
```

**Example**:
```javascript
{
  userId: "abc123xyz",
  month: "2026-02",
  name: "Food & Dining",
  budgeted: 5000,
  spent: 2300,
  createdAt: Timestamp(2026, 2, 1)
}
```

**Indexes Required**:
- Composite: `userId` (Ascending) + `month` (Descending)

---

### `expenses`
**Purpose**: Record individual expense transactions.

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string           // Reference to user UID
  month: string            // "YYYY-MM" format for grouping
  categoryId: string       // Reference to category document ID
  amount: number           // Expense amount
  note: string             // Optional expense description
  date: Timestamp          // When the expense occurred
  createdAt: Timestamp     // When the record was created
}
```

**Example**:
```javascript
{
  userId: "abc123xyz",
  month: "2026-02",
  categoryId: "cat_xyz789",
  amount: 450,
  note: "Grocery shopping",
  date: Timestamp(2026, 2, 5),
  createdAt: Timestamp(2026, 2, 5)
}
```

**Indexes Required**:
- Composite: `userId` (Ascending) + `month` (Descending) + `createdAt` (Descending)
- Composite: `userId` (Ascending) + `categoryId` (Ascending) + `date` (Descending)

---

### `savings`
**Purpose**: Track savings deposits from mandatory rules or leftover budget.

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string                      // Reference to user UID
  month: string                       // "YYYY-MM" format
  amount: number                      // Savings amount
  source: "mandatory" | "leftover"    // Where the savings came from
  createdAt: Timestamp                // Savings record timestamp
}
```

**Example**:
```javascript
{
  userId: "abc123xyz",
  month: "2026-02",
  amount: 2000,
  source: "mandatory",
  createdAt: Timestamp(2026, 2, 1)
}
```

**Indexes Required**:
- Composite: `userId` (Ascending) + `month` (Descending)

---

## Security Rules (To Be Implemented)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Monthly income
    match /monthlyIncome/{docId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Mandatory rules
    match /mandatoryRules/{docId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Categories
    match /categories/{docId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Expenses
    match /expenses/{docId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Savings
    match /savings/{docId} {
      allow read, write: if isOwner(resource.data.userId);
    }
  }
}
```

---

## Month Format Standard

All month fields use the **"YYYY-MM"** format:
- ✅ Correct: `"2026-02"`, `"2026-12"`
- ❌ Incorrect: `"02-2026"`, `"2026-2"`, `"Feb 2026"`

This ensures consistent sorting and querying.

---

## Data Migration Strategy

When a new month starts:
1. Detect month change in the app
2. Create new `monthlyIncome` document for new month
3. Apply all active `mandatoryRules` as initial deductions
4. Create fresh `categories` documents for new month (reset budgets)
5. Archive previous month's data (keep for historical reference)
6. Update `users.currentMonth` to new month

---

## Query Patterns

### Get current month income
```typescript
const incomeQuery = query(
  collection(db, 'monthlyIncome'),
  where('userId', '==', userId),
  where('month', '==', currentMonth)
)
```

### Get active mandatory rules
```typescript
const rulesQuery = query(
  collection(db, 'mandatoryRules'),
  where('userId', '==', userId),
  where('isActive', '==', true)
)
```

### Get current month categories
```typescript
const categoriesQuery = query(
  collection(db, 'categories'),
  where('userId', '==', userId),
  where('month', '==', currentMonth)
)
```

### Get expenses for a category
```typescript
const expensesQuery = query(
  collection(db, 'expenses'),
  where('userId', '==', userId),
  where('categoryId', '==', categoryId),
  orderBy('date', 'desc')
)
```
