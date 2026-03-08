---
name: File Decomposition & Code Splitting Protocol
description: A strict protocol for breaking large React/TypeScript files into smaller, single-responsibility modules following industry-standard patterns for hooks, components, utilities, and types.
---

# ✂️ File Decomposition & Code Splitting Protocol

Large files are a liability. They are hard to read, hard to test, and hard to maintain. This skill enforces the project's **Law VI (300-Line Limit)** by providing exact rules for how to split files by responsibility.

## 1. The Single-Responsibility File Rule

Every file should do **ONE** thing. If you can describe a file's purpose with an "and" (e.g., "it fetches data AND renders the table AND handles the modal"), it needs to be split.

## 2. Standard Decomposition Patterns

When analyzing a large file, classify its code blocks into these categories and extract them accordingly:

### A. React Query Hooks → `hooks/use{Feature}.ts`
*   **What to extract:** `useQuery`, `useMutation`, `queryClient.invalidateQueries` wrappers, and any data-fetching/caching logic.
*   **Target:** `features/{feature}/hooks/use{Feature}.ts` (e.g., `useCustomers.ts`, `useInventory.ts`).
*   **Rule:** Each hook file exports ONE custom hook. If a feature has multiple query hooks (e.g., `useCustomerList` and `useCustomerDetails`), they can share ONE file if they are tightly related (under 150 lines). Otherwise, split them.

### B. Reusable UI Components → `components/{ComponentName}.tsx`
*   **What to extract:** Any JSX block that is self-contained (a card, a table row, a form section, a stat widget) and could theoretically be reused or tested in isolation.
*   **Target:** `features/{feature}/components/{ComponentName}.tsx`.
*   **Rule:** The parent page should only handle **data fetching and layout orchestration**. All rendering logic lives in the child components.

### C. Form Schemas & Validation → `schemas/` or `shared/`
*   **What to extract:** Zod schemas, TypeScript types derived from Zod (`z.infer<typeof Schema>`), and form default values.
*   **Target:** `packages/shared/src/schemas/{feature}.schema.ts` (as per Law I: Shared First Principle).

### D. Utility / Helper Functions → `utils/{utilName}.ts`
*   **What to extract:** Pure functions that transform data, format dates/currencies, or perform calculations.
*   **Target:** `features/{feature}/utils/{utilName}.ts` or `src/lib/utils.ts` if truly global.
*   **Rule:** Utility files MUST NOT import React or any component. They are pure TypeScript.

### E. TypeScript Types & Interfaces → `types/{feature}.types.ts`
*   **What to extract:** Component prop interfaces, API response shapes, and any non-Zod type definitions.
*   **Target:** `features/{feature}/types/{feature}.types.ts`.
*   **Rule:** If a type is shared between frontend and backend, it MUST live in `packages/shared/` (Law I).

### F. Constants & Configuration → `constants/{feature}.constants.ts`
*   **What to extract:** Static arrays (dropdown options, menu items, color maps, status labels), magic numbers, and configuration objects.
*   **Target:** `features/{feature}/constants/{feature}.constants.ts`.

## 3. The Execution Workflow

When splitting a file, follow these steps:

1.  **Inventory:** Read the file. Categorize every block of code into A-F above.
2.  **Extract Bottom-Up:** Start with the simplest, most independent pieces (constants, types, utils) and work up to hooks and components.
3.  **Import Chain:** After extraction, update the original file to import from the new modules. Verify no circular dependencies are introduced.
4.  **Preserve Logic:** Per the Logic Preservation Skill, do NOT alter any business logic, event handlers, or API call shapes during extraction. This is a **structural** change only.
5.  **Build Gate:** Run `pnpm build` after each extraction batch. Fix any broken imports immediately.

## 4. File Size Thresholds

| Lines    | Action                                   |
|----------|------------------------------------------|
| < 150    | ✅ Excellent. No action needed.           |
| 150-300  | ⚠️ Review for potential extraction.      |
| 300-400  | 🔴 Must extract. Find the seam and split.|
| 400+     | 🚨 HARD VIOLATION of Law VI. Immediate split required. |
