# Data Model: MoneyFlow Personal Finance

## Entity Relationship Diagram

```
┌─────────────────┐
│    Account      │
│─────────────────│
│ id: UUID        │─┐
│ name: string    │ │
│ type: enum      │ │
│ balance: cents  │ │
│ status: enum    │ │
│ createdAt       │ │
│ updatedAt       │ │
└─────────────────┘ │
                    │
        ┌───────────┼───────────┐
        │                       │
        │                       │
┌───────▼────────┐      ┌──────▼─────────┐
│  Transaction   │      │   NetWorth     │
│────────────────│      │   Snapshot     │
│ id: UUID       │      │────────────────│
│ fromAccountId ─┤      │ date: date     │
│ toAccountId ───┤      │ assets: cents  │
│ amount: cents  │      │ liabilities    │
│ description    │      │ netWorth       │
│ date: date     │      │ createdAt      │
│ createdAt      │      └────────────────┘
└────────▲───────┘
         │
         │
┌────────┴───────────┐
│ RecurringTxn       │
│────────────────────│
│ id: UUID           │
│ fromAccountId ─────┤
│ toAccountId ───────┤
│ amount: cents      │
│ description        │
│ frequency: enum    │
│ status: enum       │
│ createdAt          │
└────────────────────┘
```

## Core Entities

### Account

Represents a financial account or category for tracking money.

```typescript
interface Account {
  id: string // UUID v4
  name: string // "Checking Account", "Groceries", etc.
  type: AccountType // asset | liability | income | expense
  balance: number // Current balance in cents
  status: AccountStatus // active | archived
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

type AccountType = 'asset' | 'liability' | 'income' | 'expense'
type AccountStatus = 'active' | 'archived'
```

**Business Rules**:

- Balance is calculated from transactions, not directly editable
- Assets and income have positive balances
- Liabilities and expenses track outflows
- Archived accounts cannot be used in new transactions

**Examples**:

```typescript
// Asset account
{
  id: "a1b2c3d4-...",
  name: "Checking Account",
  type: "asset",
  balance: 150000,  // $1,500.00
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-02-17T10:00:00Z"
}

// Expense category
{
  id: "e5f6g7h8-...",
  name: "Groceries",
  type: "expense",
  balance: 45000,  // $450.00 spent
  status: "active",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-02-17T10:00:00Z"
}
```

### Transaction

Records a transfer of money between two accounts.

```typescript
interface Transaction {
  id: string // UUID v4
  fromAccountId: string // Source account UUID
  toAccountId: string // Destination account UUID
  amount: number // Transfer amount in cents (always positive)
  description: string // Optional description
  date: string // Transaction date (YYYY-MM-DD)
  createdAt: string // ISO 8601 timestamp
}

interface TransactionWithAccounts extends Transaction {
  fromAccount: Account
  toAccount: Account
}
```

**Business Rules**:

- Amount is always positive
- Updates balances of both fromAccount and toAccount
- fromAccount balance decreases, toAccount balance increases
- Cannot reference archived accounts
- Date cannot be in the future

**Common Transaction Patterns**:

```typescript
// Income: Bank account receives salary
{
  fromAccountId: "income-salary-account",  // Income type
  toAccountId: "checking-account",         // Asset type
  amount: 500000,  // $5,000.00
  description: "Monthly salary",
  date: "2026-02-15"
}

// Expense: Pay for groceries from checking
{
  fromAccountId: "checking-account",       // Asset type
  toAccountId: "groceries-expense",        // Expense type
  amount: 12500,  // $125.00
  description: "Weekly groceries",
  date: "2026-02-17"
}

// Transfer: Move money between accounts
{
  fromAccountId: "checking-account",       // Asset type
  toAccountId: "savings-account",          // Asset type
  amount: 100000,  // $1,000.00
  description: "Monthly savings",
  date: "2026-02-17"
}
```

### NetWorthSnapshot

Point-in-time calculation of total net worth.

```typescript
interface NetWorthSnapshot {
  id: string // UUID v4
  date: string // Snapshot date (YYYY-MM-DD)
  totalAssets: number // Sum of all asset balances in cents
  totalLiabilities: number // Sum of all liability balances in cents
  netWorth: number // totalAssets - totalLiabilities
  createdAt: string // ISO 8601 timestamp
}
```

**Business Rules**:

- Calculated from account balances at snapshot time
- One snapshot per day maximum
- netWorth = totalAssets - totalLiabilities
- Automatically created on dashboard view

**Example**:

```typescript
{
  id: "n1w2o3r4-...",
  date: "2026-02-17",
  totalAssets: 250000,      // $2,500.00
  totalLiabilities: 50000,  // $500.00
  netWorth: 200000,         // $2,000.00
  createdAt: "2026-02-17T10:00:00Z"
}
```

### RecurringTransaction

Template for recurring transactions that can be processed manually.

```typescript
interface RecurringTransaction {
  id: string // UUID v4
  fromAccountId: string // Source account UUID
  toAccountId: string // Destination account UUID
  amount: number // Transfer amount in cents
  description: string // Description template
  frequency: RecurrenceFrequency
  status: RecurringStatus // active | paused
  lastProcessedDate?: string // Last date processed (YYYY-MM-DD)
  createdAt: string // ISO 8601 timestamp
  updatedAt: string // ISO 8601 timestamp
}

type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
type RecurringStatus = 'active' | 'paused'
```

**Business Rules**:

- Does not automatically create transactions (manual processing only)
- Can be paused/resumed
- Tracks last processed date to prevent duplicates
- Cannot reference archived accounts

**Example**:

```typescript
{
  id: "r5t6y7u8-...",
  fromAccountId: "checking-account",
  toAccountId: "rent-expense",
  amount: 150000,  // $1,500.00
  description: "Monthly rent payment",
  frequency: "monthly",
  status: "active",
  lastProcessedDate: "2026-02-01",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-02-01T10:00:00Z"
}
```

## Data Types

### Common Types

```typescript
// Result pattern for error handling
type Result<T, E> = { success: true; data: T } | { success: false; error: E }

// Error types
interface ValidationError {
  field: string
  message: string
  code: string
}

interface NotFoundError {
  message: string
  code: 'NOT_FOUND'
}

interface BusinessRuleError {
  message: string
  code: string
  details?: Record<string, unknown>
}

interface StorageError {
  message: string
  code: 'STORAGE_ERROR' | 'QUOTA_EXCEEDED' | 'PARSE_ERROR'
}
```

### Currency Format

All monetary amounts stored as **integer cents** internally:

- $1.00 = 100 cents
- $1,234.56 = 123456 cents
- $0.01 = 1 cent

**Rationale**: Avoids floating-point precision issues

### Date Format

- **Dates**: `YYYY-MM-DD` (string, ISO 8601 date only)
- **Timestamps**: `YYYY-MM-DDTHH:mm:ssZ` (string, ISO 8601 with timezone)

## Storage Schema

All entities stored in localStorage as JSON with version tracking:

```typescript
interface LocalStorageSchema {
  version: string // "1.0.0" for future migrations
  accounts: Account[]
  transactions: Transaction[]
  recurring: RecurringTransaction[]
  netWorthSnapshots: NetWorthSnapshot[]
}
```

**Storage Keys**:

- `moneyflow_accounts` - Account array
- `moneyflow_transactions` - Transaction array
- `moneyflow_recurring` - RecurringTransaction array
- `moneyflow_networth` - NetWorthSnapshot array
- `moneyflow_version` - Schema version

## Indexes and Lookups

For efficient queries, services should maintain in-memory indexes:

```typescript
// By account type
Map<AccountType, Account[]>

// Transactions by account
Map<AccountId, Transaction[]>

// Transactions by date range
SortedArray<Transaction> // sorted by date

// Net worth by date
Map<DateString, NetWorthSnapshot>
```

## Data Integrity Rules

1. **Referential Integrity**: All account IDs in transactions must exist
2. **Balance Consistency**: Account balance must equal sum of transactions
3. **Date Constraints**: Transaction dates ≤ current date
4. **Amount Constraints**: All amounts must be positive integers (cents)
5. **UUID Format**: All IDs must be valid UUID v4

## Migration Strategy

For future schema changes:

1. Check `moneyflow_version` in localStorage
2. Apply migrations sequentially
3. Update version after successful migration
4. Keep migrations in `src/migrations/` directory

---

**Schema Version**: 1.0.0 | **Last Updated**: 2026-02-17
