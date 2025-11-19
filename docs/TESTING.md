# 🧪 Testing Guide

## Overview

This project uses a comprehensive testing strategy with unit tests, integration tests, and end-to-end tests.

## Test Structure

```
├── __tests__/           # Unit tests (Jest)
├── e2e/                 # End-to-end tests (Playwright)
└── mocks/               # API mocking (MSW)
```

## Running Tests

### Unit Tests (Jest)

```bash
# Watch mode (development)
pnpm test

# CI mode with coverage
pnpm test:ci

# Run specific test file
pnpm test -- file-parser.test.ts
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific browser
npx playwright test --project=chromium
```

### All Tests

```bash
npm run test:all
```

## Writing Tests

### Unit Tests

Example unit test:

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests

Example E2E test:

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to files page', async ({ page }) => {
  await page.goto('/files')
  await expect(page.locator('h1')).toBeVisible()
})
```

## Coverage

Coverage threshold is set to 70% for:
- Branches
- Functions
- Lines
- Statements

View coverage report:
```bash
npm run test:ci
# Open coverage/lcov-report/index.html
```

## Mocking

### API Mocking with MSW

MSW (Mock Service Worker) is used to mock API calls in tests:

```typescript
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Best Practices

1. **Test user behavior, not implementation**
2. **Use data-testid for stable selectors**
3. **Mock external dependencies**
4. **Keep tests isolated**
5. **Write descriptive test names**
6. **Test edge cases and error states**

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging.

