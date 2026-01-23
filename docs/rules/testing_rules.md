# Testing Rules

**Scope**: `apps/api` (Backend Integration) & `apps/web` (E2E/Unit).

## 1. Backend Testing Protocol (Mandatory)
*   **Tool**: Vitest + Supertest.
*   **Strategy**: **TDD (Test Driven Development)**.
    1.  Write a failing test case in `feature.controller.test.ts`.
    2.  Implement the feature to pass the test.
    3.  Refactor.
*   **Coverage**: Focus on **Integration Tests**. Mock external services (Email, S3), but use a real (in-memory or Docker) database for data integrity.

## 2. Test File Location
*   Co-locate tests with the source file: `src/features/auth/auth.controller.test.ts`.

## 3. Running Tests
*   **Single File**: `pnpm test apps/api/src/path/to/test.ts`
*   **Filter**: `pnpm test filter=auth`
*   **All**: `pnpm test`
