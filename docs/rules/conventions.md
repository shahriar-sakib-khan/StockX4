# Coding Conventions

## 📁 File & Folder Structure
*   **Feature-First**: `src/features/<feature-name>` is the home for everything related to a domain.
    *   ❌ `src/components/CreateProductModal.tsx`
    *   ✅ `src/features/products/components/CreateProductModal.tsx`
*   **Naming**:
    *   Files: `camelCase` (e.g., `staffLogin.tsx`) or `PascalCase` for Components/Classes.
    *   Folders: `kebab-case` (e.g., `staff-management`).

## 🧱 Code patterns
*   **API Calls**:
    *   Always use `api` from `@/lib/api`.
    *   Never write `fetch` manually.
*   **State**:
    *   Use **Zustand** for global auth/user state.
    *   Use **TanStack Query** for server state (data).
    *   Avoid complex `useEffect` chains.
*   **Styling**:
    *   Use Tailwind utility classes.
    *   Use `cn()` for class merging.

## 🛡️ "The Contract"
*   All DTOs (Data Transfer Objects) must be defined in `packages/shared`.
*   Both Frontend and Backend **must** import the same zod schema.
