# Technical Research: MoneyFlow Personal Finance

**Date**: 2026-02-17  
**Status**: Complete

## Research Questions

### 1. What is the best approach for client-side data persistence?

**Options Evaluated**:

1. **localStorage** (Selected)
2. IndexedDB
3. WebSQL (deprecated)
4. Cookies

**Decision: localStorage**

**Rationale**:

- **Simplicity**: Synchronous API, easy to use and test
- **Browser Support**: Universal support in modern browsers
- **Sufficient Capacity**: 5-10MB adequate for personal finance data
- **No Complex Queries**: Simple get/set operations sufficient
- **Type Safety**: Can wrap with TypeScript interfaces

**Trade-offs**:

- **Size Limits**: 5-10MB may limit very large datasets
- **Synchronous**: Could block UI if data is very large
- **No Transactions**: No ACID guarantees (mitigated by atomic operations)

**Alternative Considered - IndexedDB**:

- ✅ Larger storage (50MB+)
- ✅ Asynchronous operations
- ✅ Transactional support
- ❌ More complex API
- ❌ Asynchronous complicates testing
- ❌ Overkill for simple data access patterns

**Mitigation for localStorage limits**:

- Export/import functionality for backup
- Warning at 80% capacity
- Clear old net worth snapshots (keep last 365 days)

---

### 2. How should monetary values be stored to avoid floating-point errors?

**Options Evaluated**:

1. **Integer cents** (Selected)
2. Decimal.js library
3. BigInt
4. String representation

**Decision: Integer cents**

**Rationale**:

- **Precision**: Integer arithmetic is exact, no rounding errors
- **Performance**: Native integer operations are fast
- **Storage**: Smaller than string or decimal objects
- **Common Pattern**: Used by Stripe, PayPal, financial systems

**Implementation**:

```typescript
// Store $123.45 as 12345 cents
const dollarsToCents = (dollars: number): number => Math.round(dollars * 100)
const centsToDollars = (cents: number): number => cents / 100
const formatCurrency = (cents: number): string => {
  const dollars = centsToDollars(cents)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}
```

**Edge Cases Handled**:

- User enters $1.999 → rounds to $2.00 (200 cents)
- Floating point input → Math.round() ensures integer
- Very large amounts → JavaScript numbers safe up to 2^53 (~$90 trillion)

**Alternative Considered - Decimal.js**:

- ✅ Arbitrary precision
- ✅ Built-in rounding modes
- ❌ 12KB library overhead
- ❌ Slower than native integers
- ❌ More complex serialization
- **Verdict**: Overkill for consumer-level amounts

---

### 3. What charting library should be used for net worth visualization?

**Options Evaluated**:

1. **Recharts** (Selected)
2. Chart.js
3. Victory
4. D3.js

**Decision: Recharts**

**Rationale**:

- **React-First**: Declarative components, fits React paradigm
- **TypeScript Support**: Full type definitions included
- **Bundle Size**: ~95KB gzipped (reasonable)
- **Responsive**: Built-in responsive container
- **Customization**: Good balance of ease-of-use and flexibility
- **Active Maintenance**: Regular updates, good community

**Example Usage**:

```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={netWorthData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip formatter={formatCurrency} />
    <Line type="monotone" dataKey="netWorth" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

**Alternative Considered - Chart.js**:

- ✅ Smaller bundle (~60KB)
- ✅ Very popular
- ❌ Imperative API (less React-friendly)
- ❌ Requires wrapper library (react-chartjs-2)
- ❌ TypeScript support less robust

**Alternative Considered - D3.js**:

- ✅ Maximum flexibility
- ✅ Rich ecosystem
- ❌ Large bundle (~250KB)
- ❌ Steep learning curve
- ❌ Overkill for simple line chart
- **Verdict**: Over-engineering for our needs

---

### 4. What date library should be used for date manipulation?

**Options Evaluated**:

1. **date-fns** (Selected)
2. Day.js
3. Moment.js (deprecated)
4. Native Date API only

**Decision: date-fns**

**Rationale**:

- **Tree-Shakable**: Only import functions you use
- **Immutable**: No mutation of date objects
- **TypeScript**: Full type definitions
- **Modular**: ~25KB for typical usage (vs 70KB Moment.js)
- **Functional**: Pure functions, easy to test
- **Locale Support**: Available but optional

**Example Usage**:

```typescript
import { format, parseISO, isAfter, addMonths } from 'date-fns'

// Format for display
format(new Date(), 'MMM d, yyyy') // "Feb 17, 2026"

// Parse ISO strings
const date = parseISO('2026-02-17')

// Date arithmetic
const nextMonth = addMonths(date, 1)

// Comparisons
isAfter(new Date(), date)
```

**Functions Needed**:

- `format()` - Display formatting
- `parseISO()` - Parse stored dates
- `startOfDay()`, `endOfDay()` - Date ranges
- `isAfter()`, `isBefore()` - Date comparisons
- `addDays()`, `addMonths()` - Date arithmetic

**Alternative Considered - Day.js**:

- ✅ Smaller (2KB core)
- ✅ Moment.js compatible API
- ❌ Mutable by default
- ❌ Plugin system adds complexity
- **Verdict**: date-fns better for our functional style

---

### 5. How should form validation be handled?

**Options Evaluated**:

1. **Manual validation with TypeScript** (Selected)
2. Zod
3. Yup
4. React Hook Form + validation

**Decision: Manual validation with TypeScript**

**Rationale**:

- **Simplicity**: Forms are simple, don't need schema library
- **Type Safety**: TypeScript provides compile-time checks
- **No Dependencies**: Reduces bundle size
- **Constitution Compliance**: Follows YAGNI principle
- **Learning Curve**: No library-specific concepts

**Implementation Pattern**:

```typescript
interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

const validateAccount = (data: CreateAccountDto): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required'
  }
  if (data.name && data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less'
  }
  if (!['asset', 'liability', 'income', 'expense'].includes(data.type)) {
    errors.type = 'Invalid account type'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
```

**When to Reconsider**:

- If forms become complex (10+ fields)
- If nested validation needed
- If cross-field validation becomes complex

**Alternative Considered - Zod**:

- ✅ Runtime + compile-time validation
- ✅ Type inference
- ❌ 15KB bundle size
- ❌ Learning curve
- ❌ Overkill for simple forms
- **Verdict**: Wait until complexity justifies it

---

### 6. What state management approach should be used?

**Options Evaluated**:

1. **React Context API** (Selected)
2. Redux Toolkit
3. Zustand
4. Jotai

**Decision: React Context API + hooks**

**Rationale**:

- **Built-in**: No additional dependencies
- **Sufficient**: Application state is relatively simple
- **Constitution Compliance**: Simplest solution that works
- **Performance**: Adequate for expected data size
- **Hooks Integration**: Natural with custom hooks

**Architecture**:

```typescript
// Context for accounts
const AccountsContext = createContext<AccountsContextType>()

// Custom hook
const useAccounts = () => {
  const context = useContext(AccountsContext)
  if (!context) throw new Error('useAccounts must be within provider')
  return context
}

// Provider component
const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const accountService = useAccountService()

  const loadAccounts = useCallback(async () => {
    const result = await accountService.listAccounts()
    if (result.success) setAccounts(result.data)
  }, [accountService])

  return (
    <AccountsContext.Provider value={{ accounts, loadAccounts }}>
      {children}
    </AccountsContext.Provider>
  )
}
```

**Optimization Strategy**:

- `useMemo` for expensive calculations
- `useCallback` to prevent unnecessary re-renders
- Context split by domain (accounts, transactions, etc.)
- Local state when data not shared

**When to Reconsider Redux**:

- If performance issues with Context re-renders
- If time-travel debugging needed
- If middleware requirements (logging, persistence)

---

## Technology Stack Summary

| Category        | Technology            | Version  | Bundle Size | Justification                                    |
| --------------- | --------------------- | -------- | ----------- | ------------------------------------------------ |
| Framework       | React                 | 18.2+    | ~45KB       | Industry standard, excellent TypeScript support  |
| Language        | TypeScript            | 5.2+     | N/A         | Type safety, better DX, constitution requirement |
| Build Tool      | Vite                  | 5.0+     | N/A         | Fast, modern, great DX                           |
| Testing         | Vitest                | 4.0+     | N/A         | Fast, Vite-integrated, compatible with Jest      |
| Testing Library | React Testing Library | Latest   | N/A         | Best practices for React testing                 |
| Routing         | React Router DOM      | 6.x      | ~12KB       | Standard routing solution                        |
| Charts          | Recharts              | 2.x      | ~95KB       | React-first, TypeScript support                  |
| Dates           | date-fns              | 3.x      | ~25KB       | Tree-shakable, immutable, TypeScript             |
| Storage         | localStorage          | Native   | 0KB         | Simple, sufficient, universal support            |
| State           | React Context         | Built-in | 0KB         | Simplest solution for our needs                  |
| Styling         | CSS Modules           | Built-in | 0KB         | Scoped styles, no runtime overhead               |
| Linting         | ESLint                | 8.x      | N/A         | Code quality enforcement                         |
| Formatting      | Prettier              | 3.x      | N/A         | Consistent code formatting                       |

**Total Bundle Size Estimate**: ~180KB gzipped (within 200KB target)

---

## Performance Considerations

### localStorage Performance

- **Read/Write Speed**: ~1ms for typical operations
- **Parsing Overhead**: JSON.parse/stringify ~10ms for 10,000 transactions
- **Mitigation**: Cache parsed data in memory, only write on changes

### React Rendering

- **Net Worth Chart**: Use `React.memo` for chart component
- **Transaction List**: Implement virtual scrolling if >500 transactions
- **Account List**: Rarely exceeds 50 items, no optimization needed

### Bundle Optimization

- **Code Splitting**: Split routes with `React.lazy()`
- **Tree Shaking**: Import only needed date-fns functions
- **Minification**: Vite handles automatically

---

## Security Considerations

### Data Privacy

- ✅ All data stored locally (no server)
- ✅ No third-party analytics or tracking
- ✅ No network requests

### XSS Protection

- ✅ React escapes by default
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ Content Security Policy headers (if deployed)

### Storage Security

- ⚠️ localStorage not encrypted (browser limitation)
- ⚠️ Accessible to other scripts on same origin
- ✅ Acceptable for personal finance (not banking credentials)

---

## Accessibility Research

### WCAG 2.1 Level AA Targets

- **Keyboard Navigation**: All interactive elements focusable
- **Screen Reader**: Semantic HTML, ARIA labels where needed
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible focus states

### Implementation\*\*:

- Use `<button>` for clickable elements (not `<div>`)
- Associate labels with inputs (`htmlFor` attribute)
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Add `aria-label` to icon-only buttons
- Test with keyboard only (no mouse)

---

## Research Conclusions

All research questions answered. Technology stack finalized:

- ✅ localStorage for persistence
- ✅ Integer cents for monetary values
- ✅ Recharts for visualization
- ✅ date-fns for date manipulation
- ✅ Manual validation with TypeScript
- ✅ React Context for state management

**Next Steps**: Proceed with implementation according to plan.md and tasks.md

---

**Research Version**: 1.0.0 | **Completed**: 2026-02-17
