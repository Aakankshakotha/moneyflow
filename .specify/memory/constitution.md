<!--
SYNC IMPACT REPORT:
Version: INITIAL → 1.0.0
Changes: Initial constitution creation
Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Quality Gates
  - Governance
Templates Status:
  ✅ plan-template.md - Aligned with constitution gates and complexity tracking
  ✅ spec-template.md - Aligned with requirements structure and testing approach
  ✅ tasks-template.md - Aligned with TDD workflow and task categorization
Follow-up TODOs: None
-->

# Expenses Constitution

## Core Principles

### I. Component-First Development

Every feature begins as a standalone, reusable component. Components MUST be:

- Self-contained with clear, single responsibility
- Independently testable in isolation
- Documented with TypeScript interfaces and JSDoc comments
- Composable and follow React best practices

**Rationale**: Component-first architecture ensures modularity, reusability, and maintainability. It prevents tight coupling and enables parallel development and testing.

### II. Type Safety (NON-NEGOTIABLE)

TypeScript MUST be used with strict mode enabled. All code MUST:

- Have explicit type annotations for function parameters and return types
- Use interfaces or types for all data structures and props
- Eliminate any use of `any` type (use `unknown` if truly dynamic)
- Pass TypeScript compiler with zero errors and zero warnings
- Utilize generics where appropriate for reusable logic

**Rationale**: Type safety catches errors at compile time, improves IDE support, enables safe refactoring, and serves as living documentation. This is non-negotiable to ensure code quality and developer productivity.

### III. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is MANDATORY. The workflow MUST be:

1. Write test cases based on requirements
2. Get user/stakeholder approval on test scenarios
3. Verify tests fail (Red)
4. Implement minimal code to pass tests (Green)
5. Refactor while keeping tests green (Refactor)

Test coverage requirements:

- Unit tests for all business logic and utilities (minimum 90% coverage)
- Component tests for all React components using React Testing Library
- Integration tests for critical user flows
- No code merged without corresponding tests

**Rationale**: TDD ensures requirements are clearly understood before implementation, prevents regressions, documents expected behavior, and enables confident refactoring. The red-green-refactor cycle is proven to reduce bugs and improve design.

### IV. Code Quality Standards (NON-NEGOTIABLE)

All code MUST meet these quality gates before merge:

- ESLint with strict rules: zero errors, zero warnings
- Prettier for consistent formatting
- No code complexity violations (cyclomatic complexity ≤ 10 per function)
- No code duplication (DRY principle strictly enforced)
- SonarQube or equivalent static analysis: Quality Gate MUST pass
- All imports organized and unused imports removed
- Meaningful variable and function names (no abbreviations unless industry-standard)

**Rationale**: Automated code quality standards ensure consistent, maintainable code across the team. They catch common pitfalls, enforce best practices, and reduce technical debt.

### V. Simplicity & YAGNI Principle

Simplicity is paramount. Every implementation MUST:

- Start with the simplest solution that meets requirements
- Follow YAGNI (You Aren't Gonna Need It) - no speculative features
- Prefer composition over inheritance
- Avoid premature optimization
- Justify any added complexity in the Complexity Tracking section of plan.md
- Use standard React patterns; custom patterns require explicit approval

**Rationale**: Simple code is easier to understand, test, maintain, and debug. Complexity must be earned through demonstrated need, not assumed future requirements. Every line of code is a liability.

## Technology Stack

### Required Technologies

- **Language**: TypeScript 5.0+ (strict mode enabled)
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite or Create React App (determined by project needs)
- **Package Manager**: npm or yarn (consistent within project)
- **Testing**:
  - Jest for unit and integration tests
  - React Testing Library for component tests
  - Vitest as alternative to Jest (if using Vite)
- **Linting**: ESLint with TypeScript rules and React hooks plugin
- **Formatting**: Prettier with team configuration
- **State Management**: React Context API or Redux Toolkit (only if complexity justified)
- **Styling**: CSS Modules, Styled Components, or Tailwind CSS (one choice per project)
- **HTTP Client**: Fetch API or Axios (consistent within project)

### Prohibited Patterns

- Class components (use functional components with hooks)
- Prop drilling beyond 2 levels (use Context or state management)
- Inline styles for complex styling (use established styling solution)
- Direct DOM manipulation (use React refs only when necessary)
- Type assertions (`as`) except for truly unavoidable cases
- Any third-party library without security audit and bundle size consideration

## Quality Gates

All code MUST pass these gates before merge:

### 1. Type Safety Gate

- `npm run type-check` (or `tsc --noEmit`) passes with zero errors
- No `@ts-ignore` or `@ts-expect-error` comments without justification

### 2. Test Gate

- All tests pass: `npm test -- --coverage`
- Code coverage ≥ 90% for statements, branches, functions, lines
- No skipped tests in production code

### 3. Linting Gate

- `npm run lint` passes with zero errors and zero warnings
- `npm run format:check` confirms all files are formatted

### 4. Complexity Gate

- Cyclomatic complexity ≤ 10 for all functions
- No files exceeding 300 lines (split into smaller modules)
- Component prop count ≤ 10 (consider composition if exceeded)

### 5. Build Gate

- `npm run build` completes successfully
- Bundle size analyzed and documented
- No console warnings or errors in browser

### 6. Security Gate

- `npm audit` shows zero high or critical vulnerabilities
- All dependencies reviewed for security and licensing

## Governance

This constitution supersedes all other development practices and guidelines.

### Amendment Process

1. Proposed amendments MUST be documented with:
   - Rationale for change
   - Impact analysis on existing codebase
   - Migration plan if breaking changes introduced
2. Amendments require approval from project stakeholders
3. Version bumping follows semantic versioning:
   - **MAJOR**: Breaking changes to core principles or removal of principles
   - **MINOR**: Addition of new principles or significant expansion of sections
   - **PATCH**: Clarifications, wording improvements, or minor updates

### Compliance Review

- All pull requests MUST verify compliance with this constitution
- Plan documents (`plan.md`) MUST include Constitution Check section
- Any complexity that violates principles MUST be justified in Complexity Tracking table
- Regular quarterly reviews of constitution effectiveness

### Development Guidance

- Runtime development guidance located in project README.md and docs/
- Agent-specific guidance in `.github/agents/` directory
- This constitution is the source of truth for all architectural decisions

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
