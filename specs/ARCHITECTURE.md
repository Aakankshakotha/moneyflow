# MoneyFlow — Architecture Document

> Last updated: March 2026

---

## 1. Overview

MoneyFlow is a **client-side personal finance tracker** built with React + TypeScript. All data currently lives in browser localStorage. The app follows a **double-entry bookkeeping model** — every transaction is a transfer between two accounts.

---

## 2. Tech Stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| UI Framework  | React 18 + TypeScript          |
| Build Tool    | Vite                           |
| UI Components | Material UI (MUI) v5           |
| Charts        | Recharts                       |
| Routing       | React Router v6                |
| Testing       | Vitest + React Testing Library |
| Storage       | Browser localStorage (current) |

---

## 3. Project Structure

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Router + layout shell
├── index.css                # Global styles
├── vite-env.d.ts
│
├── types/                   # TypeScript interfaces & types
│   ├── account.ts
│   ├── transaction.ts
│   ├── recurring.ts
│   ├── netWorth.ts
│   ├── investment.ts
│   └── common.ts
│
├── services/                # Business logic & storage layer
│   ├── storageService.ts        # Raw read/write (localStorage)
│   ├── accountService.ts        # Account CRUD + balance logic
│   ├── transactionService.ts    # Transaction CRUD + filtering
│   ├── recurringService.ts      # Recurring tx CRUD + processing
│   ├── netWorthService.ts       # Net worth snapshots + calculations
│   ├── investmentSnapshotService.ts  # Investment value history
│   ├── categoryService.ts       # Category lookup helpers
│   └── validationService.ts     # Cross-service validation rules
│
├── hooks/                   # React data hooks (state bridge)
│   ├── useAccounts.ts
│   ├── useTransactions.ts
│   ├── useDashboardData.ts
│   ├── useTransactionForm.ts
│   ├── useTransactionFilters.ts
│   └── useTrendData.ts
│
├── pages/                   # Top-level route pages
│   ├── Dashboard.tsx
│   ├── Accounts.tsx
│   ├── Transactions.tsx
│   ├── Recurring.tsx
│   └── Investments.tsx
│
├── components/
│   ├── Navigation.tsx
│   ├── common/              # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   └── StatCard.tsx
│   └── features/            # Domain-specific components
│       ├── accounts/
│       ├── charts/
│       ├── recurring/
│       └── transactions/
│
├── contexts/
│   └── ThemeContext.tsx      # Light/dark theme toggle
│
├── constants/
│   └── categories.ts        # Transaction category definitions
│
├── theme/
│   ├── MuiAppThemeProvider.tsx
│   └── theme.d.ts
│
└── utils/
    ├── currencyUtils.ts     # Cents ↔ display formatting
    ├── dateUtils.ts         # Date parsing/formatting helpers
    └── validationUtils.ts   # Low-level field validators
```

---

## 4. Data Model

### 4.1 Core Principle — Double-Entry

Every transaction moves money **from** one account **to** another. Amounts are always positive. What the transaction means depends on the account types involved.

```
income account  →  asset account     = earning money
asset account   →  expense account   = spending money
asset account   →  liability account = paying a bill
asset account   →  asset account     = transfer between accounts
```

### 4.2 Entity Schemas

#### Account

```typescript
interface Account {
  id: string // UUID v4
  name: string // 1-100 chars, unique within type
  type: AccountType // 'asset' | 'liability' | 'income' | 'expense'
  parentAccountId?: string // Optional parent for sub-accounts
  balance: number // Current balance in CENTS (integer)
  costBasis?: number // For investment accounts — amount originally invested (cents)
  status: AccountStatus // 'active' | 'archived'
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
```

**Account type rules:**
| Type | Direction | Notes |
|---|---|---|
| `asset` | Both in & out | Bank accounts, cash, investments |
| `liability` | Both in & out | Credit cards, loans |
| `income` | Source only (from) | Salary, freelance — cannot receive transfers |
| `expense` | Destination only (to) | Food, rent — cannot send transfers |

#### Transaction

```typescript
interface Transaction {
  id: string
  fromAccountId: string // Source account UUID
  toAccountId: string // Destination account UUID
  amount: number // In CENTS, always positive integer
  description: string
  date: string // YYYY-MM-DD
  category?: string // Category ID (see categories.ts)
  tags?: string[]
  createdAt: string // ISO 8601
}
```

#### RecurringTransaction

```typescript
interface RecurringTransaction {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number // In cents
  description: string
  frequency: RecurrenceFrequency // 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: RecurringStatus // 'active' | 'paused'
  lastProcessedDate?: string // YYYY-MM-DD
  createdAt: string
  updatedAt: string
}
```

#### NetWorthSnapshot

```typescript
interface NetWorthSnapshot {
  id: string
  date: string // YYYY-MM-DD
  totalAssets: number // Sum of all asset balances (cents)
  totalLiabilities: number // Sum of all liability balances (cents)
  netWorth: number // totalAssets - totalLiabilities (cents)
  createdAt: string
}
```

#### InvestmentSnapshot

```typescript
interface InvestmentSnapshot {
  id: string
  accountId: string // References an asset-type account
  date: string // YYYY-MM-DD (latest entry per day overwrites)
  value: number // Current market value (cents)
  costBasis: number // Amount originally invested (cents)
  createdAt: string
}
```

### 4.3 Amount Convention

> **All monetary values are stored as integers in cents.**
> ₹1,000.50 is stored as `100050`.
> Display formatting is handled by `currencyUtils.ts`.

---

## 5. Service Layer

Services are plain TypeScript classes. They receive a `StorageService` instance (dependency injection pattern) and contain all business logic.

```
StorageService          ← raw persistence (localStorage today, Drive/DB tomorrow)
    ↑
AccountService          ← account CRUD, balance recalculation
TransactionService      ← transaction CRUD, filtering, pagination
RecurringService        ← recurring CRUD, due-date processing
NetWorthService         ← snapshot creation, trend queries
InvestmentSnapshotService ← snapshot CRUD for investment accounts
CategoryService         ← static category lookup
ValidationService       ← cross-entity business rule checks
```

### All service methods return `Result<T, E>`

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
```

This means **no thrown exceptions** — callers always check `result.success` before using `result.data`.

---

## 6. Hooks (State Bridge)

Hooks wrap services with React state management. Pages never call services directly.

| Hook                    | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| `useAccounts`           | Account list, CRUD operations, active/archived filter                           |
| `useTransactions`       | Transaction list, CRUD, filtering                                               |
| `useDashboardData`      | Pre-computed metrics for Dashboard (net worth, income, expenses, deltas)        |
| `useTransactionForm`    | Add transaction form state — account options per mode (income/expense/transfer) |
| `useTransactionFilters` | URL-synced filter state for Transactions page                                   |
| `useTrendData`          | Net worth + cash flow trend arrays for charts                                   |

---

## 7. Pages & Routing

```
/              → Dashboard.tsx     — Overview: metrics, charts, recent transactions
/accounts      → Accounts.tsx      — Account list + detail panel (side-by-side)
/transactions  → Transactions.tsx  — Full transaction table with filters
/recurring     → Recurring.tsx     — Recurring transaction management
/investments   → Investments.tsx   — Investment account tracking + snapshots
```

---

## 8. Component Architecture

```
App.tsx
└── Navigation.tsx (sidebar)
└── <Routes>
    └── Dashboard / Accounts / Transactions / Recurring / Investments
        └── Feature components (AccountList, TransactionTable, etc.)
            └── Common components (Button, Card, Modal, MetricCard, etc.)
```

**Feature components** are domain-specific and import hooks/services.
**Common components** are pure UI — no data fetching, no service calls.

---

## 9. Storage Layer (Current — localStorage)

`StorageService` stores data in localStorage with **partitioned keys** for the two high-growth entities:

### Static keys (single JSON blob)

| Key                              | Contents                                 |
| -------------------------------- | ---------------------------------------- |
| `moneyflow_accounts`             | `StorageContainer<Account>`              |
| `moneyflow_recurring`            | `StorageContainer<RecurringTransaction>` |
| `moneyflow_investment_snapshots` | `StorageContainer<InvestmentSnapshot>`   |

### Partitioned keys (one key per time period)

| Pattern                          | Contents                             | Example key                      |
| -------------------------------- | ------------------------------------ | -------------------------------- |
| `moneyflow_transactions_YYYY_MM` | `StorageContainer<Transaction>`      | `moneyflow_transactions_2026_03` |
| `moneyflow_networth_YYYY`        | `StorageContainer<NetWorthSnapshot>` | `moneyflow_networth_2026`        |

**Why partitioned:**

- Transactions grow indefinitely — monthly buckets keep each key small and make current-month reads fast
- Net worth snapshots grow slowly but yearly buckets keep the pattern consistent

**Cross-period reads** (e.g. "all transactions") scan all matching keys and merge in memory. The public API is unchanged — callers still call `getTransactions()`.

**Lazy migration** — on first read, if the old monolithic `moneyflow_transactions` or `moneyflow_networth` key exists, data is automatically split into partitions and the legacy key is removed. No manual migration step needed.

Each container is:

```typescript
interface StorageContainer<T> {
  version: string // '1.0.0'
  data: T[]
}
```

**Limitations:**

- 5MB browser cap (across all keys combined)
- Device/browser-locked (no cross-device access)
- No backup

> Planned migration: Google Drive (one JSON file per entity in a `MoneyFlow/` folder per user). The `StorageService` abstraction makes this a clean swap — no other code changes needed.

---

## 10. Theme

- MUI v5 theme via `MuiAppThemeProvider.tsx`
- Light/dark mode toggle via `ThemeContext.tsx`
- Custom palette tokens defined in `theme.d.ts`

---

## 11. Categories

Transaction categories are **static constants** defined in `src/constants/categories.ts`.

Groups:
`home` | `transportation` | `food` | `healthcare` | `entertainment` | `utilities` | `personal` | `income` | `other`

Each category has: `id`, `name`, `group`, `color`, `icon?`

---

## 12. Error Handling Pattern

```typescript
// Service call
const result = await accountService.createAccount(dto)
if (!result.success) {
  // result.error is typed — e.g. { type: 'ValidationError', message: string }
  showError(result.error.message)
  return
}
// result.data is the Account
```

No `try/catch` in components — errors surface through the `Result` type.

---

## 13. Testing

| Scope             | Location                           | Runner       |
| ----------------- | ---------------------------------- | ------------ |
| Unit — services   | `src/services/__tests__/`          | Vitest       |
| Unit — utils      | `src/utils/__tests__/`             | Vitest       |
| Unit — components | `src/components/common/__tests__/` | Vitest + RTL |
| Setup             | `src/test/setup.ts`                | —            |

Config: `vitest.config.ts`

---

## 14. Planned: Google Drive Storage Migration

The `StorageService` interface will be replaced by a `DriveStorageService` that:

- Uses Google OAuth2 (`drive.file` scope)
- Stores one JSON file per entity in `MoneyFlow/` folder in user's Drive
- Reads: fetch file → parse JSON → return array
- Writes: stringify → upload/update file via Drive API
- Each user's data lives in **their own Drive** — app stores nothing server-side

The `Result<T, E>` pattern and all method signatures remain identical — zero changes needed in services, hooks, or components.
