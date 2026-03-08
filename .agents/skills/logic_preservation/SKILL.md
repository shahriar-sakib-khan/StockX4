---
name: Logic & Integration Preservation Protocol
description: A strict protocol to ensure that while ripping apart and rebuilding complex UI layouts, NO underlying business logic, state management, or API integrations are broken.
---

# 🛡️ Logic & Integration Preservation Protocol

Massive UI refactoring is dangerous because structural HTML/JSX changes can easily sever the connection between the UI and the underlying business logic, breaking React state, form submissions, or API calls.

When refactoring a component for responsiveness, you MUST follow these critical rules to guarantee functional parity.

## 1. The "State Isolation" Rule
*   **Identify First:** Before touching a single `className`, visually separate the component's *Logic Block* (hooks, state, API calls, event handlers) from its *View Block* (the returned JSX).
*   **Never Touch Logic:** Unless a logic change is explicitly requested by the user to fix a bug, you are FORBIDDEN from altering any `useEffect`, `useState`, `react-query` hooks, or form submission handlers (`handleSubmit`).
*   **Dependency Preservation:** If you extract a chunk of JSX into a new responsive sub-component (per the 300-Line Limit law), you MUST strictly explicitly pass down exactly the props it requires. Do not move the state into the child unless strictly necessary for UI interactions (e.g., local state for a dropdown toggle).

## 2. The "Form Binding" Rule
React Hook Form and standard controlled inputs are extremely sensitive to DOM changes.
*   **Props Intact:** When moving `<input>`, `<select>`, or custom UI components around to fit a new layout, you MUST ensure that `...register("fieldName")`, `value={val}`, `onChange={fn}`, and `id` tags remain completely untouched.
*   **Form Structure:** Do not break forms by moving inputs outside of the parent `<form>` tag.

## 3. The Backend Integration Verification (Law II & IV adherence)
*   **Payload Accuracy:** UI refactors must not alter the shape of the data being sent to the backend. The backend APIs rely strictly on Zod schemas (as per Law I). Before finishing a refactored form, verify that the input names match the expected Shared Schema.
*   **Tenant ID:** Ensure that UI changes do not accidentally introduce hardcoded `tenantId` assumptions. The backend remains the sole authority on multi-tenancy (Law II).

## 4. How to Verify Code After Refactoring (Execution Steps)
After you finish reshaping the Tailwind classes for a component, execute this sequence:

1.  **Diff Review:** Run a quick semantic review of your git diff or file changes. Confirm that ONLY `className` attributes, wrapper `div`s, and layout elements were changed.
2.  **Prop Check:** Have `onClick`, `onSubmit`, or `onChange` handlers been dropped? If yes, restore them immediately.
3.  **Compile Check:** If you extracted components, verify that TypeScript is satisfied with the new prop interfaces.
4.  **Integration Test (The Final Gate):** Ask the user to manually test the core interaction of the component (e.g., "Please submit a test invoice to ensure the API still receives the payload correctly").
