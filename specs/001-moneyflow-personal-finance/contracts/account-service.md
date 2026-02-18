# Account Service Contract

## Overview

The AccountService provides business logic for managing accounts (assets, liabilities, income, expenses).

## Interface

```typescript
interface AccountService {
  createAccount(
    data: CreateAccountDto
  ): Promise<Result<Account, ValidationError>>
  updateAccount(
    id: string,
    data: UpdateAccountDto
  ): Promise<Result<Account, NotFoundError | ValidationError>>
  deleteAccount(
    id: string
  ): Promise<Result<void, NotFoundError | BusinessRuleError>>
  getAccount(id: string): Promise<Result<Account, NotFoundError>>
  listAccounts(filter?: AccountFilter): Promise<Result<Account[], StorageError>>
  getAccountWithBalance(
    id: string
  ): Promise<Result<AccountWithBalance, NotFoundError>>
}
```

## Data Transfer Objects

### CreateAccountDto

```typescript
interface CreateAccountDto {
  name: string // Required, 1-100 characters
  type: AccountType // Required: 'asset' | 'liability' | 'income' | 'expense'
  balance?: number // Optional, defaults to 0, stored as cents
}
```

### UpdateAccountDto

```typescript
interface UpdateAccountDto {
  name?: string // Optional, 1-100 characters
  status?: AccountStatus // Optional: 'active' | 'archived'
}
```

### AccountFilter

```typescript
interface AccountFilter {
  type?: AccountType
  status?: AccountStatus
  searchTerm?: string
}
```

## Business Rules

### Account Creation

1. Name must be unique within account type
2. Initial balance defaults to 0 cents
3. Status defaults to 'active'
4. createdAt and updatedAt set to current timestamp

### Account Update

1. Name must remain unique if changed
2. Cannot change account type after creation
3. Cannot change balance directly (use transactions)
4. updatedAt updated to current timestamp

### Account Deletion

1. Cannot delete account with transactions
2. Can only delete 'archived' accounts
3. Must set status to 'archived' first
4. Returns BusinessRuleError if has transactions

## Validation Rules

### Name

- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 100 characters
- **Unique**: Within account type
- **Pattern**: Any printable characters

### Type

- **Required**: Yes
- **Values**: 'asset', 'liability', 'income', 'expense'
- **Immutable**: Cannot change after creation

### Balance

- **Type**: Integer (cents)
- **Min**: Can be negative for liability accounts
- **Direct Modification**: Not allowed (use transactions)

## Error Handling

### ValidationError Examples

```typescript
// Invalid name
{
  field: 'name',
  message: 'Name is required',
  code: 'REQUIRED_FIELD'
}

// Duplicate name
{
  field: 'name',
  message: 'Account name already exists for this type',
  code: 'DUPLICATE_NAME'
}
```

### BusinessRuleError Examples

```typescript
// Cannot delete account with transactions
{
  message: 'Cannot delete account with existing transactions',
  code: 'HAS_TRANSACTIONS',
  details: { transactionCount: 5 }
}

// Cannot delete active account
{
  message: 'Account must be archived before deletion',
  code: 'ACCOUNT_ACTIVE'
}
```

## Example Usage

```typescript
// Create an asset account
const result = await accountService.createAccount({
  name: 'Checking Account',
  type: 'asset',
  balance: 100000, // $1,000.00 in cents
})

if (result.success) {
  console.log('Created account:', result.data.id)
}

// List all active asset accounts
const accounts = await accountService.listAccounts({
  type: 'asset',
  status: 'active',
})

// Archive before delete
await accountService.updateAccount(id, { status: 'archived' })
await accountService.deleteAccount(id)
```

## Test Coverage Requirements

- ✅ Create account with valid data
- ✅ Reject invalid account names (empty, too long)
- ✅ Reject duplicate account names within type
- ✅ Allow same name across different types
- ✅ Update account name successfully
- ✅ Prevent account type changes
- ✅ Archive and delete account without transactions
- ✅ Prevent deletion of account with transactions
- ✅ Filter accounts by type and status
- ✅ Calculate account balance from transactions

---

**Contract Version**: 1.0.0 | **Last Updated**: 2026-02-17
