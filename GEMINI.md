
# GEMINI.md - Agent Instructions & Principles

These instructions must be followed before every response and every change made to the codebase.

## 1. Minimal Code as a Principle
*   **Code is a liability.** Every line of code written is a line that can break, needs maintenance, and requires understanding.
*   Write the absolute minimum amount of code necessary to solve the problem without losing functionality.
*   Avoid over-engineering or premature optimization.
*   Delete dead code aggressively.

## 2. Modular & Granular Architecture
*   **Reuse code.** Do not duplicate logic. If logic appears in two places, extract it into a shared utility or component.
*   **Component-Based Structure:** Break down large files into smaller, single-responsibility components or functions.
*   **Import/Export:** Use clear interfaces for modules.

## 3. Comprehensive Testing
*   **100% Test Coverage:** Every backend route MUST have tests covering:
    *   **Happy Path:** The successful execution flow.
    *   **Edge Cases:** Invalid inputs, missing required fields, unauthorized access, database failures, network timeouts.
*   Do not consider a feature "done" until the tests prove it works under all conditions.

## 4. Continuous Verification (Build & Test Loop)
*   **Mandatory Step:** After *every* significant code change or build implementation:
    1.  Run the build: `pnpm build` (or relevant build command).
    2.  Run the tests: `pnpm test`.
*   **Fix Immediately:** If the build or tests fail, stop and fix the bugs before proceeding. Do not ignore errors.

## 5. Self-Annealing (Continuous Improvement)
*   **Learn from Mistakes:** If a certain approach repeatedly fails, document why and do not repeat it.
*   **Documentation:** Store learnings, common pitfalls, and architectural decisions in `docs/learnings.md` or similar persistent storage.
*   **Reflect:** Before finalizing a task, ask: "Did I introduce any regression? Is this the simplest way?"

## 6. Project Specific Guidelines
*   **Accessibility & UX for Low Literacy:**
    *   **Big & Colorful:** Fonts should be large and easy to read. Use distinct colors to separate sections.
    *   **Self-Explanatory Design:** The UI must be intuitive enough for older or low-literacy users to understand without instruction.
*   **Consistent Color Coding:**
    *   **Green:** Incomes, Success, Positive Values.
    *   **Red:** Expenses, Errors, Negative Values, Deletion.
    *   **Yellow/Amber:** Dues, Warnings, Pending Actions.
*   **Responsive Design:** The application must be fully responsive and functional across all screen sizes (Mobile, Tablet, Desktop).

## 7. Additional Instructions
*   **Safety First:** Always use `SafeToAutoRun: false` for destructive commands unless absolutely certain.
*   **User Communication:** Be concise. Don't explain *how* the code works unless asked; focus on *what* was achieved and *why* certain decisions were made.
*   **File Placement:** Respect the existing project structure. Do not create files in random locations.
