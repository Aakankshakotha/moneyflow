# Storage Service Contract

## Overview

The StorageService provides a type-safe interface to browser localStorage for persisting application data.

## Interface

```typescript
interface StorageService {
  // Account Operations
  getAccounts(): Promise<Result<Account[], StorageError>>
  getAccount(id: string): Promise<Result<Account, NotFoundError>>
  saveAccount(account: Account): Promise<Result<Account, ValidationError>>
  deleteAccount(id: string): Promise<Result<void, NotFoundError>>

  // Transaction Operations
  getTransactions(): Promise<Result<Transaction[], StorageError>>
  getTransaction(id: string): Promise<Result<Transaction, NotFoundError>>
  saveTransaction(
    transaction: Transaction
  ): Promise<Result<Transaction, ValidationError>>
  deleteTransaction(id: string): Promise<Result<void, NotFoundError>>

  // Recurring Transaction Operations
  getRecurringTransactions(): Promise<
    Result<RecurringTransaction[], StorageError>
  >
  getRecurringTransaction(
    id: string
  ): Promise<Result<RecurringTransaction, NotFoundError>>
  saveRecurringTransaction(
    recurring: RecurringTransaction
  ): Promise<Result<RecurringTransaction, ValidationError>>
  deleteRecurringTransaction(id: string): Promise<Result<void, NotFoundError>>

  // Net Worth Snapshot Operations
  getNetWorthSnapshots(): Promise<Result<NetWorthSnapshot[], StorageError>>
  saveNetWorthSnapshot(
    snapshot: NetWorthSnapshot
  ): Promise<Result<NetWorthSnapshot, ValidationError>>

  // Bulk Operations
  exportData(): Promise<Result<ExportData, StorageError>>
  importData(data: ExportData): Promise<Result<void, ValidationError>>
  clearAllData(): Promise<Result<void, StorageError>>
}
```

## Storage Keys

```typescript
const STORAGE_KEYS = {
  ACCOUNTS: 'moneyflow_accounts',
  TRANSACTIONS: 'moneyflow_transactions',
  RECURRING: 'moneyflow_recurring',
  NET_WORTH: 'moneyflow_networth',
  VERSION: 'moneyflow_version',
}
```

## Data Format

All data stored as JSON strings in localStorage.

### Accounts Storage

```json
{
  "version": "1.0.0",
  "accounts": [
    {
      "id": "uuid-v4",
      "name": "Checking Account",
      "type": "asset",
      "balance": 150000,
      "status": "active",
      "createdAt": "2026-02-17T10:00:00Z",
      "updatedAt": "2026-02-17T15:30:00Z"
    }
  ]
}
```

### Transactions Storage

```json
{
  "version": "1.0.0",
  "transactions": [
    {
      "id": "uuid-v4",
      "fromAccountId": "account-uuid",
      "toAccountId": "account-uuid",
      "amount": 5000,
      "description": "Grocery shopping",
      "date": "2026-02-17",
      "createdAt": "2026-02-17T15:30:00Z"
    }
  ]
}
```

## Error Handling

### StorageError

- **Cause**: localStorage unavailable, quota exceeded, parse errors
- **HTTP Equivalent**: 500 Internal Server Error
- **User Message**: "Unable to save data. Storage may be full."

### NotFoundError

- **Cause**: Requested ID doesn't exist
- **HTTP Equivalent**: 404 Not Found
- **User Message**: "Item not found"

### ValidationError

- **Cause**: Invalid data structure, missing required fields
- **HTTP Equivalent**: 400 Bad Request
- **User Message**: "Invalid data: {specific error}"

## Constraints

- **Storage Limit**: ~5-10MB total across all keys (browser dependent)
- **Concurrent Access**: Single-tab assumption (no cross-tab sync)
- **Data Versioning**: Version field for future migration support
- **Atomic Operations**: Each save/delete is atomic per entity type

## Example Usage

```typescript
// Save an account
const result = await storageService.saveAccount({
  id: 'uuid-v4',
  name: 'Savings Account',
  type: 'asset',
  balance: 500000,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

if (result.success) {
  console.log('Account saved:', result.data)
} else {
  console.error('Error:', result.error)
}

// Export all data
const exportResult = await storageService.exportData()
if (exportResult.success) {
  const json = JSON.stringify(exportResult.data)
  // Download or save json
}
```

## Test Coverage Requirements

- ✅ Successfully save and retrieve each entity type
- ✅ Handle missing/corrupted localStorage data
- ✅ Validate data before saving
- ✅ Return NotFoundError for missing IDs
- ✅ Handle storage quota exceeded
- ✅ Export and import data successfully
- ✅ Clear all data safely

---

**Contract Version**: 1.0.0 | **Last Updated**: 2026-02-17
