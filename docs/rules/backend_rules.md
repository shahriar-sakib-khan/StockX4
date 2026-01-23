# Backend Rules

**Scope**: `apps/api`
**Tech**: Node.js, Express, Mongoose, Zod.

## 1. Vertical Slices
*   **Structure**: Feature code lives in `src/features/<feature-name>/`.
*   **Components**:
    *   `controller.ts`: HTTP Layer. Validate input -> Call Service -> Send Response. **NO Business Logic**.
    *   `service.ts`: Domain Logic. Database calls -> Calculations -> Transformations.
    *   `routes.ts`: Route definitions.
*   **Shared Schema**: Always import Zod schemas from `@repo/shared`.

## 2. Database (Mongoose)
*   **Services**: Only the Service layer should import/access Mongoose Models.
*   **Validation**: Mongoose Schemas must match Zod Schemas.
*   **Performance**: Use `.lean()` for read-only queries. Index foreign keys.

## 3. Error Handling
*   **Async/Await**: Use `try/catch` in Controllers.
*   **Standard Errors**: Return `{ error: message }` JSON. Use standard HTTP codes (400, 401, 403, 404, 500).

## 4. Testing
*   **TDD**: Write the test *before* the implementation.
*   **Type**: Integration tests (Controller -> Service -> DB) are preferred over pure unit tests.
