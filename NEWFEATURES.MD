# PHASE 10 – UI Polish & Advanced Interactions (STRICT)

## PURPOSE OF THIS FILE

This file defines **ONLY Phase 10 responsibilities** for the Antigravity agent.

Phase 10 is **visual & interaction enhancement only**.
❌ No business logic changes
❌ No data model changes
❌ No feature additions

The agent MUST complete Phases 0–9 before executing this file.

---

## GLOBAL RULES FOR AGENT (NON-NEGOTIABLE)

* Do NOT refactor existing logic
* Do NOT change Firestore schema
* Do NOT introduce new routes or screens
* Do NOT add animations that block usability
* If performance drops on mobile, DISABLE the effect

Phase 10 is allowed to **enhance UX**, not redefine it.

---

## PRE-FLIGHT VERIFICATION (MANDATORY)

Before implementing anything, VERIFY the following:

### 1. TypeScript

* `tsconfig.json` exists
* Project uses `.ts` / `.tsx` files

### 2. Tailwind CSS v4

* Tailwind is installed
* Tailwind classes are compiling correctly
* Dark mode is enabled

### 3. shadcn/ui

If shadcn/ui is NOT installed:

1. Run:

```
npx shadcn@latest init
```

2. Choose:

* TypeScript: YES
* Tailwind CSS: YES
* Components path: `components/ui`
* Utils path: `lib/utils`

### IMPORTANT

If `components/ui` does not exist, CREATE IT.

This folder is REQUIRED for:

* Shared UI primitives
* Aceternity UI components
* Long-term maintainability

---

## TASK 10.1 – Floating Dock Navigation (Aceternity UI)

### Purpose

Provide an animated, minimal navigation dock that replaces traditional navbars.

### Installation

```
npx shadcn@latest add @aceternity/floating-dock
```

### Dependencies to Verify

* `motion`
* `@tabler/icons-react`

### File Creation

#### File: `components/ui/floating-dock.tsx`

* Copy-paste the provided Aceternity Floating Dock implementation EXACTLY
* Do not modify logic

#### File: `components/floating-dock-demo.tsx`

* Paste provided demo code
* Replace demo links with real routes:

  * Dashboard
  * Add Expense
  * Categories
  * Savings
  * Settings

### Integration Rules

* Desktop: fixed bottom center
* Mobile: floating bottom-right toggle
* Dock must be visible on all primary screens

---

## TASK 10.2 – 3D Card Effect (Aceternity UI)

### Purpose

Add premium interaction to **key cards only**.

### Installation

```
npx shadcn@latest add @aceternity/3d-card
```

### File Creation

#### File: `components/ui/3d-card.tsx`

* Paste provided implementation EXACTLY

#### File: `components/3d-card-demo.tsx`

* Paste demo usage code

### Usage Rules (STRICT)

3D Card may be used ONLY on:

* Monthly Income Card
* Savings Vault Card

❌ Do NOT apply to:

* Expense lists
* Category lists
* Modals

If animation causes lag:

* Disable on mobile
* Fallback to normal card

---

## TASK 10.3 – Encrypted Text Effect (Aceternity UI)

### Purpose

Subtle animated text reveal for static headings.

### Installation

```
npx shadcn@latest add @aceternity/encrypted-text
```

### File Creation

#### File: `components/ui/encrypted-text.tsx`

* Paste provided implementation EXACTLY

#### File: `components/encrypted-text-demo-2.tsx`

* Paste demo usage code

### Usage Rules (STRICT)

EncryptedText may be used ONLY for:

* Welcome headline
* Month-start summary text
* Empty state messages

❌ Do NOT use for:

* Numbers
* Balances
* Dynamic values

---

## TASK 10.4 – Responsiveness Rules

* Mobile-first layout is mandatory
* Touch targets must be ≥ 44px
* No hover-only interactions on mobile
* Floating Dock must not block FAB or modals

---

## COMPLETION CHECKLIST

Phase 10 is complete ONLY if:

* App works normally with effects disabled
* Animations enhance clarity, not distraction
* No performance regression on low-end devices
* UI still usable offline

---

## FINAL NOTE TO AGENT

If ANY instruction here conflicts with `prd.md` or `tasks.md`,
THOSE FILES TAKE PRIORITY.

Do not improvise.
Do not optimize prematurely.
Do not add features.

---

**END OF PHASE 10 FILE**
