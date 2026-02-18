# Tasks: MoneyFlow Personal Finance System

**Input**: Design documents from `/specs/001-moneyflow-personal-finance/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD workflow is REQUIRED per constitution - tests are included for all phases

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root:

- Source: `src/`
- Tests: `src/__tests__/` or colocated with source files

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [x] T001 Create project with Vite + React + TypeScript template
- [x] T002 Install core dependencies: react-router-dom, date-fns, recharts
- [x] T003 [P] Install dev dependencies: vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- [x] T004 [P] Configure TypeScript strict mode in tsconfig.json with path aliases (@/\*)
- [x] T005 [P] Configure Vitest in vitest.config.ts with jsdom environment and coverage settings
- [x] T006 [P] Configure ESLint with TypeScript rules and React hooks plugin in .eslintrc.cjs
- [x] T007 [P] Configure Prettier in .prettierrc with project standards
- [x] T008 [P] Add npm scripts: dev, build, test, test:coverage, lint, format, type-check
- [x] T009 [P] Create test setup file in src/test/setup.ts with @testing-library/jest-dom
- [x] T010 Create project directory structure: components/, pages/, services/, types/, utils/, hooks/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [x] T011 [P] Create common types in src/types/common.ts (Result, ValidationError, NotFoundError, BusinessRuleError)
- [x] T012 [P] Create Account types in src/types/account.ts (Account, AccountType, AccountStatus, AccountWithBalance)
- [x] T013 [P] Create Transaction types in src/types/transaction.ts (Transaction, TransactionWithAccounts, TransactionFilter)
- [x] T014 [P] Create NetWorth types in src/types/netWorth.ts (NetWorthSnapshot, NetWorthCalculation, NetWorthTrend)
- [x] T015 [P] Create RecurringTransaction types in src/types/recurring.ts (RecurringTransaction, RecurrenceFrequency, RecurringStatus)

### Utility Functions (TDD)

- [x] T016 [P] Write tests for currency utilities in src/utils/**tests**/currencyUtils.test.ts
- [x] T017 [P] Implement currency utilities in src/utils/currencyUtils.ts (dollarsToCents, centsToDollars, formatCurrency)
- [x] T018 [P] Write tests for date utilities in src/utils/**tests**/dateUtils.test.ts
- [x] T019 [P] Implement date utilities in src/utils/dateUtils.ts (formatDate, parseDate, getDateRange, isValidDate)
- [x] T020 [P] Write tests for validation utilities in src/utils/**tests**/validationUtils.test.ts
- [x] T021 [P] Implement validation utilities in src/utils/validationUtils.ts (validateUUID, validateDate, validateAmount, etc.)

### Core Services (TDD)

- [x] T022 Write tests for StorageService in src/services/**tests**/storageService.test.ts
- [x] T023 Implement StorageService in src/services/storageService.ts (get, set, remove, clear, export, import)
- [x] T024 Write tests for ValidationService in src/services/**tests**/validationService.test.ts
- [x] T025 Implement ValidationService in src/services/validationService.ts (all validation methods)

### Common UI Components (TDD)

- [x] T026 [P] Write tests for Button component in src/components/common/**tests**/Button.test.tsx
- [x] T027 [P] Implement Button component in src/components/common/Button.tsx
- [x] T028 [P] Write tests for Input component in src/components/common/**tests**/Input.test.tsx
- [x] T029 [P] Implement Input component in src/components/common/Input.tsx
- [x] T030 [P] Write tests for Card component in src/components/common/**tests**/Card.test.tsx
- [x] T031 [P] Implement Card component in src/components/common/Card.tsx
- [x] T032 [P] Write tests for Modal component in src/components/common/**tests**/Modal.test.tsx
- [x] T033 [P] Implement Modal component in src/components/common/Modal.tsx
- [x] T034 [P] Write tests for Select component in src/components/common/**tests**/Select.test.tsx
- [x] T035 [P] Implement Select component in src/components/common/Select.tsx

### Routing Setup

- [x] T036 Setup React Router in src/App.tsx with routes for Dashboard, Accounts, Transactions, Recurring
- [x] T037 Create Navigation component in src/components/Navigation.tsx
- [x] T038 Create placeholder pages: Dashboard, Accounts, Transactions, Recurring in src/pages/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - Account Management (Priority: P1) 🎯 MVP Component

**Goal**: Enable users to create and manage different account types (Assets, Liabilities, Income, Expense)

**Independent Test**: Create accounts of each type and verify they appear in the accounts overview grouped by type

### Tests for Account Management (TDD)

- [x] T039 [P] Write tests for AccountService in src/services/**tests**/accountService.test.ts
- [ ] T040 [P] Write tests for AccountForm component in src/components/features/**tests**/AccountForm.test.tsx
- [ ] T041 [P] Write tests for AccountList component in src/components/features/**tests**/AccountList.test.tsx
- [ ] T042 [P] Write integration tests for account CRUD in src/services/**tests**/accountService.integration.test.ts

### Implementation for Account Management

- [x] T043 Implement AccountService in src/services/accountService.ts (createAccount, updateAccount, deleteAccount, listAccounts, getAccount)
- [x] T044 [P] Implement AccountForm component in src/components/features/AccountForm.tsx
- [x] T045 [P] Implement AccountList component in src/components/features/AccountList.tsx
- [x] T046 [P] Implement AccountCard component in src/components/features/AccountCard.tsx
- [x] T047 Implement Accounts page in src/pages/Accounts.tsx integrating AccountForm and AccountList
- [x] T048 Add account management routes to src/App.tsx
- [x] T049 Verify all tests pass and coverage ≥90%

**Checkpoint**: Users can create, view, edit, and delete accounts ✅

---

## Phase 4: User Story 1 - Net Worth Tracking (Priority: P1) 🎯 MVP Core

**Goal**: Display current net worth calculation (assets - liabilities) and trend over time

**Independent Test**: Create accounts with balances and verify net worth displays correctly on dashboard

### Tests for Net Worth (TDD)

- [ ] T050 [P] Write tests for NetWorthService in src/services/**tests**/netWorthService.test.ts
- [ ] T051 [P] Write tests for NetWorthDisplay component in src/components/features/**tests**/NetWorthDisplay.test.tsx
- [ ] T052 [P] Write tests for NetWorthChart component in src/components/features/**tests**/NetWorthChart.test.tsx

### Implementation for Net Worth

- [ ] T053 Implement NetWorthService in src/services/netWorthService.ts (calculateNetWorth, getNetWorthHistory, createSnapshot)
- [ ] T054 [P] Implement NetWorthDisplay component in src/components/features/NetWorthDisplay.tsx
- [ ] T055 [P] Implement NetWorthChart component in src/components/features/NetWorthChart.tsx (using recharts)
- [ ] T056 Implement Dashboard page in src/pages/Dashboard.tsx with NetWorthDisplay and NetWorthChart
- [ ] T057 Create useNetWorth custom hook in src/hooks/useNetWorth.ts
- [ ] T058 Verify all tests pass and coverage ≥90%

**Checkpoint**: Users can view current net worth and historical trends on dashboard

---

## Phase 5: User Story 3 - Transaction Recording (Priority: P2)

**Goal**: Record financial transactions as transfers between accounts

**Independent Test**: Create a transaction between two accounts and verify balances update correctly

### Tests for Transactions (TDD)

- [ ] T059 [P] Write tests for TransactionService in src/services/**tests**/transactionService.test.ts
- [ ] T060 [P] Write tests for TransactionForm component in src/components/features/**tests**/TransactionForm.test.tsx
- [ ] T061 [P] Write tests for TransactionList component in src/components/features/**tests**/TransactionList.test.tsx
- [ ] T062 [P] Write integration tests for transaction recording in src/services/**tests**/transactionService.integration.test.ts

### Implementation for Transactions

- [ ] T063 Implement TransactionService in src/services/transactionService.ts (recordTransaction, listTransactions, getTransaction, deleteTransaction, filterTransactions)
- [ ] T064 [P] Implement TransactionForm component in src/components/features/TransactionForm.tsx
- [ ] T065 [P] Implement TransactionList component in src/components/features/TransactionList.tsx
- [ ] T066 [P] Implement TransactionCard component in src/components/features/TransactionCard.tsx
- [ ] T067 Implement Transactions page in src/pages/Transactions.tsx
- [ ] T068 Create useTransactions custom hook in src/hooks/useTransactions.ts
- [ ] T069 Verify all tests pass and coverage ≥90%

**Checkpoint**: Users can record and view transactions between accounts

---

## Phase 6: User Story 4 - Recurring Transactions (Priority: P3)

**Goal**: Set up recurring transactions that automatically record based on frequency

**Independent Test**: Create a recurring transaction and verify it can be processed manually

### Tests for Recurring Transactions (TDD)

- [ ] T070 [P] Write tests for RecurringService in src/services/**tests**/recurringService.test.ts
- [ ] T071 [P] Write tests for RecurringForm component in src/components/features/**tests**/RecurringForm.test.tsx
- [ ] T072 [P] Write tests for RecurringList component in src/components/features/**tests**/RecurringList.test.tsx

### Implementation for Recurring Transactions

- [ ] T073 Implement RecurringService in src/services/recurringService.ts (createRecurring, updateRecurring, deleteRecurring, listRecurring, processRecurring)
- [ ] T074 [P] Implement RecurringForm component in src/components/features/RecurringForm.tsx
- [ ] T075 [P] Implement RecurringList component in src/components/features/RecurringList.tsx
- [ ] T076 [P] Implement RecurringCard component in src/components/features/RecurringCard.tsx
- [ ] T077 Implement Recurring page in src/pages/Recurring.tsx
- [ ] T078 Create useRecurring custom hook in src/hooks/useRecurring.ts
- [ ] T079 Verify all tests pass and coverage ≥90%

**Checkpoint**: Users can set up and manage recurring transactions

---

## Phase 7: Polish & Deployment

**Purpose**: Final touches and deployment preparation

- [ ] T080 [P] Add loading states and error handling to all pages
- [ ] T081 [P] Implement responsive design for mobile devices
- [ ] T082 [P] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] T083 [P] Optimize bundle size and implement code splitting
- [ ] T084 Add data export/import functionality using StorageService
- [ ] T085 Write end-to-end tests for critical user journeys
- [ ] T086 Create user documentation in docs/ directory
- [ ] T087 Run final security audit: npm audit fix
- [ ] T088 Run final quality gate checks (all gates must pass)
- [ ] T089 Create production build and deployment instructions
- [ ] T090 Final code review and merge to main branch

**Final Checkpoint**: Application is production-ready with all quality gates passing

---

## Summary

- **Total Tasks**: 90
- **Phase 1 (Setup)**: 10 tasks ✅ COMPLETED
- **Phase 2 (Foundation)**: 28 tasks (Types, Utils, Services, UI Components, Routing)
- **Phase 3 (Account Management)**: 11 tasks
- **Phase 4 (Net Worth)**: 9 tasks
- **Phase 5 (Transactions)**: 11 tasks
- **Phase 6 (Recurring)**: 10 tasks
- **Phase 7 (Polish)**: 11 tasks

**Constitution Compliance**: All tasks follow TDD workflow, TypeScript strict mode, and 90% test coverage requirement.
