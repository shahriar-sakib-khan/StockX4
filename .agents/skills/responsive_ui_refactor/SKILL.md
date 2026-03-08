---
name: Massive Responsive UI Refactoring (MERN/Tailwind)
description: The ultimate industry-standard protocol for transforming a desktop-first React/Tailwind codebase into a fully responsive, mobile-first, component-driven architecture.
---

# 🚀 Massive Responsive UI Refactoring Protocol

This skill provides the strict guidelines and execution steps for refactoring large-scale React applications into fully responsive layouts using Tailwind CSS. It combines industry best practices with the project's native laws (see `GEMINI.md`).

## 1. Core Industry Best Practices

### A. Mobile-First Execution
Tailwind CSS uses a mobile-first breakpoint system. 
*   **Rule:** The unwrapped (base) utility classes MUST define the layout for the absolute smallest screen (e.g., mobile phones).
*   **Pattern:** `flex-col md:flex-row`, `w-full lg:w-1/2`, `p-2 sm:p-4`.
*   **Anti-Pattern:** Designing for desktop first and trying to use `max-w-` or custom breakpoints to shrink it down.

### B. Component-Driven Styling (Preventing "Class Soup")
When a combination of Tailwind classes (like buttons, standard cards, or form inputs) is repeated across multiple files, it violates the DRY principle and hurts maintainability.
*   **Rule:** Extract heavily repeated UI elements into their own React components in the `components/ui/` or `features/{feature}/components/` directories.
*   **Rule:** DO NOT use `@apply` in CSS files unless absolutely necessary for external library overrides. Keep Tailwind in the TSX files.

### C. Fluidity over Fixed Dimensions
*   **Rule:** Avoid hardcoded heights (`h-[500px]`) and widths (`w-[800px]`).
*   **Pattern:** Use `min-h-screen`, `h-full`, `w-full`, and `max-w-7xl` to allow containers to fluidly adapt to the viewport.

### D. Managing Complex Data (Tables & Grids)
Massive refactors often fail on complex data tables. 
*   **Pattern (Mobile):** Convert row-based tables into stackable "Card Views" on mobile (`hidden md:table` for the table, `block md:hidden` for the card list).
*   **Pattern (Fallback):** If card conversion is impossible, wrap the table in `w-full overflow-x-auto` to allow horizontal scrolling without breaking the page layout.

## 2. Project-Specific Requirements (From GEMINI.md)

You must merge the generic best practices with the user's specific project laws:
*   **Target Audience:** Elderly, low-literacy users.
*   **Accessibility:** UI must use LARGE touch targets. Minimum button/input heights must be `h-12` or `min-h-12`. Use highly contrasting text (`text-slate-900` over `text-gray-500`).
*   **Color Palette Rule:**
    *   `bg-green-100 text-green-800` : Incoming money, success.
    *   `bg-red-100 text-red-800` : Outgoing money, deletions.
    *   `bg-amber-100 text-amber-800` : Dues, warnings.
*   **Law VI (300-Line Limit):** Refactoring often adds JSX bulk. If a file exceeds 400 lines during refactoring, aggressively extract the new responsive sub-sections into separate components.

## 3. The Execution Workflow

When the user commands you to refactor a component using this skill, execute the following steps precisely:

1.  **Analyze Current State:** Use `view_file` to read the component. Identify the desktop-biased rigid classes (`w-96`, `flex-row` without breakpoints).
2.  **Stitch Initialization (Optional):** If the Google Stitch MCP is active, query it for a mobile layout recommendation for this specific type of component (e.g., "Generate a responsive mobile layout for an inventory matrix").
3.  **Refactor & Restructure:** 
    *   Apply the mobile-first baseline classes.
    *   Add `sm:`, `md:`, and `lg:` modifiers to rebuild the desktop view progressively.
    *   Ensure all touch targets are `h-12`.
    *   Check for the Project Color Coding rules and fix any violations.
4.  **Extract:** If the file is getting close to 300 lines, stop, abstract the newly responsive JSX into a child component, and import it.
5.  **Build Verification:** Run `pnpm build` (or similar configured build command) to guarantee no React/TS compilation errors were introduced.
6.  **Report:** Present a concise summary to the user outlining the specific breakpoints added and components extracted.
