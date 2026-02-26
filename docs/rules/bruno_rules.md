# API Documentation Rules (Bruno)

**Scope**: `docs/bruno`

## 1. Single Source of Truth
*   The `docs/bruno` folder is the executable documentation for our API.
*   Every API endpoint in `apps/api` **MUST** have a corresponding `.bru` file.

## 2. Maintenance
*   **Update on Change**: If you modify `controller.ts` or `routes.ts`, you MUST update the corresponding Bruno request.
*   **Variables**: Use Bruno Environments for variables like `{{baseUrl}}` and `{{token}}`.

## 3. Organization
*   Mirror the `apps/api/src/features` structure folder-by-folder inside Bruno.
    *   `api/features/auth` -> `docs/bruno/Auth/`
