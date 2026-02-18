# MoneyFlow Quick Start Guide

**Version**: 1.0.0 | **Last Updated**: 2026-02-17

## Overview

MoneyFlow is a personal finance tracking application that helps you monitor your net worth over time. Built with React and TypeScript, all data is stored locally in your browser.

## Getting Started (5 minutes)

### 1. Start the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 2. Create Your First Accounts

**Try this workflow**:

1. Click "Accounts" in the navigation
2. Create an asset account: "Checking Account"
3. Create an expense account: "Groceries"
4. Create an income account: "Salary"

### 3. Record Your First Transaction

1. Click "Transactions" in the navigation
2. From: "Salary" → To: "Checking Account" → Amount: $5,000
3. From: "Checking Account" → To: "Groceries" → Amount: $150

### 4. View Your Net Worth

1. Click "Dashboard" in the navigation
2. See your current net worth displayed
3. View the trend chart showing your financial history

## Project Structure

```
src/
├── components/        # React components
│   ├── common/       # Reusable UI (Button, Input, Card, etc.)
│   └── features/     # Feature components (AccountForm, etc.)
├── pages/            # Page components (Dashboard, Accounts, etc.)
├── services/         # Business logic (accountService, etc.)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions (currency, dates, etc.)
└── hooks/            # Custom React hooks
```

## Development Workflow

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Coverage must be ≥90% to pass quality gates
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format

# Check formatting
npm run format:check
```

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Key Concepts

### Accounts

Four types of accounts:

- **Assets**: What you own (checking, savings, cash)
- **Liabilities**: What you owe (credit cards, loans)
- **Income**: Money coming in (salary, investments)
- **Expenses**: Money going out (groceries, rent, utilities)

### Transactions

All transactions are transfers between two accounts:

- **Income → Asset**: Receiving salary
- **Asset → Expense**: Spending money
- **Asset → Asset**: Moving money between accounts
- **Asset → Liability**: Paying off debt

### Net Worth

Calculated as: **Total Assets - Total Liabilities**

Snapshots are created daily when you view the dashboard.

## Common Tasks

### Add a New Service

```bash
# 1. Create types
touch src/types/myFeature.ts

# 2. Write tests first (TDD)
touch src/services/__tests__/myFeatureService.test.ts

# 3. Implement service
touch src/services/myFeatureService.ts

# 4. Run tests
npm test
```

### Add a New Component

```bash
# 1. Write component tests
touch src/components/features/__tests__/MyComponent.test.tsx

# 2. Implement component
touch src/components/features/MyComponent.tsx

# 3. Run tests
npm test
```

### Add a New Page

```bash
# 1. Create page component
touch src/pages/MyPage.tsx

# 2. Add route to App.tsx
# 3. Update navigation component
```

## Data Storage

All data is stored in browser localStorage:

```typescript
// Storage keys
'moneyflow_accounts' // Account data
'moneyflow_transactions' // Transaction data
'moneyflow_recurring' // Recurring transactions
'moneyflow_networth' // Net worth snapshots
'moneyflow_version' // Schema version
```

### Export Data

```typescript
// In browser console
const data = localStorage.getItem('moneyflow_accounts')
console.log(JSON.parse(data))
```

### Clear All Data

```typescript
// Warning: This deletes everything!
Object.keys(localStorage)
  .filter((key) => key.startsWith('moneyflow_'))
  .forEach((key) => localStorage.removeItem(key))
```

## Testing Guide

### Unit Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { dollarsToCents } from '../currencyUtils'

describe('dollarsToCents', () => {
  it('converts dollars to cents', () => {
    expect(dollarsToCents(10.5)).toBe(1050)
  })

  it('rounds half-cents up', () => {
    expect(dollarsToCents(10.555)).toBe(1056)
  })
})
```

### Component Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Troubleshooting

### Tests Failing

```bash
# Clear test cache
npm run test:coverage -- --clearCache

# Run specific test file
npm test -- src/utils/__tests__/currencyUtils.test.ts
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Common issues:
# - Missing return type annotations
# - Using 'any' instead of specific type
# - Importing from wrong path
```

### Build Errors

```bash
# Clear dist and node_modules
rm -rf dist node_modules
npm install
npm run build
```

### localStorage Full

```bash
# Check usage (browser console)
let total = 0
for (let key in localStorage) {
  if (key.startsWith('moneyflow_')) {
    total += localStorage[key].length
  }
}
console.log(`Using ${(total / 1024).toFixed(2)} KB`)

# Export data before clearing
# Use export feature in app
```

## Quality Gates Checklist

Before committing code, verify:

- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm run lint` passes (zero warnings)
- [ ] `npm run format:check` passes
- [ ] `npm run test:coverage` passes (≥90% coverage)
- [ ] `npm run build` succeeds
- [ ] No `any` types in code
- [ ] All functions have explicit return types
- [ ] Function complexity ≤ 10
- [ ] Files ≤ 300 lines

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests in watch mode
npm run type-check       # Check TypeScript

# Quality
npm run lint             # Check code quality
npm run format           # Format all files
npm run test:coverage    # Generate coverage report

# Production
npm run build            # Create production build
npm run preview          # Preview production build

# Cleanup
rm -rf dist              # Remove build output
rm -rf node_modules      # Remove dependencies
rm -rf coverage          # Remove coverage reports
```

## Resources

- **Constitution**: `.specify/memory/constitution.md` - Project principles
- **Plan**: `specs/001-moneyflow-personal-finance/plan.md` - Implementation plan
- **Tasks**: `specs/001-moneyflow-personal-finance/tasks.md` - Task breakdown
- **Data Model**: `specs/001-moneyflow-personal-finance/data-model.md` - Entity definitions
- **Contracts**: `specs/001-moneyflow-personal-finance/contracts/` - Service interfaces

## Getting Help

1. Check the spec files in `specs/001-moneyflow-personal-finance/`
2. Review the constitution in `.specify/memory/constitution.md`
3. Look at existing code patterns in similar components/services
4. Run tests to understand expected behavior

## Next Steps

After completing the quick start:

1. Review [spec.md](./spec.md) for user stories
2. Check [tasks.md](./tasks.md) for implementation tasks
3. Read [data-model.md](./data-model.md) for entity structure
4. Review [contracts/](./contracts/) for service interfaces
5. Start implementing Phase 2 tasks (types, utilities, services)

---

**Happy Coding!** 🚀

Remember: Follow TDD, maintain ≥90% coverage, and adhere to the constitution principles.
