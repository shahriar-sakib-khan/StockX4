# Frontend Rules

**Scope**: `apps/web`
**Tech**: React, Vite, TailwindCSS, Zustand, TanStack Query.

## 1. Component Design
*   **Atomic Design**: Use `components/ui/` for generic Shadcn-like components. Use `features/<name>/components` for domain logic.
*   **No Logic**: Components should be visual. Logic belongs in Custom Hooks (`useMyFeature.ts`).
*   **Props**: Always define strict `interface Props` using TypeScript. Avoid `any`.

## 2. State Management
*   **Server State**: Use `useQuery` from TanStack Query. **NEVER** use `useEffect` + `fetch` for data fetching.
*   **Global State**: Use `Zustand` (`stores/`). Only for truly global data (Auth, Theme).
*   **Local State**: Use `useState` or `useReducer`.

## 3. Styling
*   **Tailwind**: Use utility classes.
*   **CN Utility**: Use `cn()` for conditional class merging.
*   **Responsiveness**: Mobile-first (`className="w-full md:w-1/2"`).

## 4. API Integration
*   **Client**: Always use `lib/api.ts` (Ky instance).
*   **Hooks**: Wrap all API calls in Query/Mutation hooks (e.g., `useUpdateProfile`).
