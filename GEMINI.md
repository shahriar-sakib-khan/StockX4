# GEMINI.md - Agent Instructions & Principles

These instructions must be followed before every response and every change made to the codebase.

## 2. THE LAWS (Non-Negotiable)

### ⚖️ Law I: The "Shared First" Principle
* **Never** duplicate types between Frontend and Backend.
* **Workflow:**
    1.  Create/Update Zod Schema in `packages/shared/src/schemas`.
    2.  Run `pnpm build --filter @repo/shared`.
    3.  Import the schema in Backend (Validation) and Frontend (Forms/Types).
* **Export Convention:** Every schema file must export both the Zod object AND the inferred TS type:
    ```ts
    export const ClientSchema = z.object({ ... });
    export type Client = z.infer<typeof ClientSchema>;
    ```

### ⚖️ Law II: The "Silent Tenant" (Multi-Tenancy)
* **Security:** Never trust the client to send a `tenantId`.
* **Implementation:**
    * Middleware (`TenantGuard`) extracts `tenantId` from the JWT/Session.
    * **EVERY** Mongoose Query must include `{ tenantId: req.tenantId }`.
    * **EVERY** Mongoose Model must have `tenantId: { type: ObjectId, index: true }`.
* **Testing:** Every module test MUST include a "Tenant Isolation" test that proves User B cannot read/modify User A's data.

### ⚖️ Law III: Vertical Slice Architecture
* Do not group files by "type" (Controllers, Models). Group by **Feature**.
* **Structure:**
    ```text
    apps/api/src/modules/file/
    ├── file.controller.ts
    ├── file.service.ts
    ├── file.model.ts
    └── file.test.ts  <-- Co-located tests
    ```

### ⚖️ Law IV: Rigorous Verification
* **Backend:** Every route MUST have a passing `.test.ts` file covering:
    * ✅ Happy Path (200)
    * ❌ Validation Error (400 - Zod)
    * 🛡️ Auth/Tenant Guard (401/403)
* **Frontend:** Components must compile (`pnpm build`).
* **Gate Rule:** Do NOT proceed to the next phase until the current phase is green.

### ⚖️ Law V: Context Preservation (The Memory)
* **Documentation:** As the project grows, you MUST create/update Markdown files in `docs/` to record decisions.
* **Update:** If you change a core workflow, update `architecture.md` and `plan.md` immediately.

### ⚖️ Law VI: AI Consistency (The 300-Line Limit)
* **Optimization:** To maximize AI context tracking and minimize token waste, rigid file limits are enforced.
* **The Rule:** No file over 400 lines (Hard limit 500). Ideal length is 100-250 lines.
* **Extraction:** Table rows with logic, interactive modals, and complex forms MUST be extracted into their own micro-components inside `features/{feature}/components`.
* **Separation:** Pages (`features/{feature}/pages`) handle ONLY data fetching and layout container styling. Render logic happens in the imported components.

## 3. Minimal Code as a Principle
*   **Code is a liability.** Every line of code written is a line that can break, needs maintenance, and requires understanding.
*   Write the absolute minimum amount of code necessary to solve the problem without losing functionality.
*   Avoid over-engineering or premature optimization.
*   Delete dead code aggressively.

## 4. Modular & Granular Architecture
*   **Reuse code.** Do not duplicate logic. If logic appears in two places, extract it into a shared utility or component.
*   **Component-Based Structure:** Break down large files into smaller, single-responsibility components or functions.
*   **Import/Export:** Use clear interfaces for modules. Use files of the same scope/module in a single module directory or subfolder.

## 5. Comprehensive Testing
*   **100% Test Coverage:** Every backend route MUST have tests covering:
    *   **Happy Path:** The successful execution flow.
    *   **Edge Cases:** Invalid inputs, missing required fields, unauthorized access, database failures, network timeouts.
*   Do not consider a feature "done" until the tests prove it works under all conditions.

## 6. Continuous Verification (Build & Test Loop)
*   **Mandatory Step:** After *every* significant code change or build implementation:
    1.  Run the build: `pnpm build` (or relevant build command).
    2.  Run the tests: `pnpm test`.
*   **Fix Immediately:** If the build or tests fail, stop and fix the bugs before proceeding. Do not ignore errors.

## 7. Self-Annealing (Continuous Improvement)
*   **Learn from Mistakes:** If a certain approach repeatedly fails, document why and do not repeat it.
*   **Documentation:** Store learnings, common pitfalls, and architectural decisions in `docs/learnings.md` or similar persistent storage.
*   **Reflect:** Before finalizing a task, ask: "Did I introduce any regression? Is this the simplest way?"

## 8. Project Specific Guidelines
*   **Target Audience:** Elderly, low-literacy LPG dealers and staff in Bangladesh.
*   **Accessibility & UX:**
    *   **Self-Explanatory:** UI must be intuitive. Buttons and links must be instantly recognizable.
    *   **Typography:** Numbers and text should be **LARGE**, **BOLD**, and **High Contrast**.
    *   **Touch Targets:** All interactive elements (buttons, inputs, links) MUST have a minimum height of `min-h-12` (48px) for mobile usability.
    *   **Responsiveness (MANDATORY — Mobile-First):**
        *   Every page and component MUST be fully responsive across **Mobile (360px)**, **Tablet (768px)**, and **Desktop (1280px+)**.
        *   Use Tailwind's mobile-first approach: write base styles for mobile, then add `sm:`, `md:`, `lg:` breakpoints for larger screens.
        *   Headers MUST wrap gracefully on mobile using `flex-col sm:flex-row` or `flex-wrap`.
        *   Tables MUST be wrapped in `overflow-x-auto` containers on mobile.
        *   Buttons in headers/toolbars MUST become full-width (`w-full sm:w-auto`) on mobile.
        *   Before writing ANY new page or layout, read the `responsive_ui_refactor` skill.
    *   **Modals:** MUST close when clicking outside the modal content area (backdrop click).
*   **Color Coding (Strict Adherence):**
    *   **Green:** Money Incoming, Success, Positive Values (e.g., Payment Received, Stock Added).
    *   **Red:** Money Outgoing, Expense, Error, Negative Values, Deletion (e.g., Payment Sent, Stock Damaged).
    *   **Yellow/Amber:** Dues (Receivable/Payable), Warnings, Pending Actions.
    *   **Product Colors:**
        *   **Yellow:** 20mm items.
        *   **Orange:** 22mm items.
*   **Design Theme:** Minimalist, Modern, Flat, but "Big and Colorful". avoid clutter.

## 9. Additional Instructions
*   **Safety First:** Always use `SafeToAutoRun: false` for destructive commands unless absolutely certain.
*   **User Communication:** Be concise. Don't explain *how* the code works unless asked; focus on *what* was achieved and *why* certain decisions were made.
*   **File Placement:** Respect the existing project structure. Do not create files in random locations.

## 10. Mandatory Skill Usage (The Knowledge Base)

The `.agents/skills/` directory contains reusable protocols that encode hard-won project knowledge. You MUST load and follow the relevant skill BEFORE starting work. **Do NOT skip this step.**

| Skill | When to Use |
|---|---|
| `responsive_ui_refactor` | Any UI change, new page, or component refactoring |
| `logic_preservation` | Any refactoring that touches existing business logic, state, or API calls |
| `file_decomposition` | Any file exceeding 300 lines (Law VI enforcement) |
| `ux_build_verification` | After ANY UI change — verifies build + visual correctness |
| `security_audit` | Before deployments, during code reviews, or when touching auth/API code |
| `code_conventions` | Before writing any new code — avoid the 9 documented anti-patterns |

**Workflow:**
1. **Read the skill:** `view_file .agents/skills/{skill_name}/SKILL.md`
2. **Follow its checklist** step by step.
3. **Do NOT deviate** from the skill's protocol unless you document why in `docs/learnings.md`.

## 11. Mandatory Visual Verification (The Browser Gate)

**Rule:** After ANY UI change — whether a new page, a refactor, or a CSS tweak — you MUST visually verify the result by opening the app in the browser. **Do NOT rely solely on `pnpm build` passing.** A successful build does NOT mean the UI looks correct.

### The Verification Loop
After making UI changes, follow this exact sequence:

1. **Build Gate:** Run `pnpm build --filter web`. If it fails, fix it before proceeding.
2. **Start the Dev Server:** Ensure `pnpm dev` is running.
3. **Open the Browser:** Use the `browser_subagent` tool to navigate to the changed page.
4. **Test at Mobile Width (375px):** Resize the browser to 375px width. Take a screenshot. Check for:
    * Overflowing text or elements
    * Buttons/inputs that are too small to tap (must be ≥48px)
    * Horizontal scroll bars that shouldn't exist
    * Content cut off or hidden
    * Headers/toolbars that don't wrap properly
5. **Test at Desktop Width (1280px):** Resize to 1280px. Take a screenshot. Check for:
    * Proper grid layouts (multi-column where expected)
    * Appropriate spacing and padding
    * No wasted whitespace
6. **Fix and Re-verify:** If ANY issue is found, fix it and repeat steps 3-5. **Keep iterating until the UI is pixel-perfect at both widths.**
7. **Report:** Include the screenshots in the walkthrough artifact.

### Verification Targets
When testing, navigate to these URLs (replace `{storeId}` with a real store ID):
* `/login` — Auth pages
* `/stores/{storeId}/dashboard` — Dashboard
* `/stores/{storeId}/pos` — POS Terminal
* `/stores/{storeId}/inventory` — Cylinder Inventory
* `/stores/{storeId}/history` — Business Diary
* `/stores/{storeId}/customers` — Customers
* `/stores/{storeId}/vehicles` — Vehicles

### The "Would Grandpa Use This?" Test
Before signing off on any UI, ask yourself: **"Could a 65-year-old LPG dealer in rural Bangladesh use this on a $100 Android phone without any instructions?"** If the answer is no, the UI is not done.

## 12. Google Stitch MCP (UI Design Enhancement)

The **Stitch MCP** is a connected design tool powered by Google that can generate, iterate, and refine UI screen designs. Use it to enhance UI quality before or during implementation.

### When to Use Stitch
| Scenario | Action |
|---|---|
| **Building a new page from scratch** | Generate a screen design first, then implement |
| **Redesigning a complex layout** | Generate 2-3 variants, compare, pick the best |
| **Unsure about mobile layout** | Generate a mobile variant to see how the layout should adapt |
| **Polishing an existing design** | Edit an existing screen with prompts like "make it more modern" or "optimize for mobile" |

### Workflow
1. **Create a project** (`create_project`) to organize your screens.
2. **Generate a screen** (`generate_screen_from_text`) with a detailed prompt describing the page purpose, user, and device:
   > "Dashboard page for an LPG gas distribution business. Show sales total, expenses, cash in hand, and inventory snapshot. Target: elderly users, mobile-first, large bold numbers, high contrast. Use emerald for income, rose for expenses."
3. **Generate variants** (`generate_variants`) to explore layout alternatives — especially for mobile vs desktop comparisons.
4. **Edit screens** (`edit_screens`) to refine: "make the buttons bigger", "add a bottom navigation bar", "use card layout instead of table for mobile".
5. **Implement** the winning design in code, following the responsive patterns from Section 8.

### Key Prompting Tips
*   Always specify the **device type** (MOBILE, DESKTOP, TABLET) when generating.
*   Always mention the **target audience** (elderly, low-literacy, large touch targets).
*   Reference the project's **color system** (emerald=income, rose=expense, amber=due, slate=neutral).

## 13. Mobile Layout Strategy (Industry-Standard Patterns)

Desktop and mobile layouts MUST be **fundamentally different**, not just "squeezed" versions of each other. Use these patterns to make smart use of limited mobile screen space:

### Pattern 1: Side-by-Side → Stacked
Desktop shows multi-column grids; mobile stacks them vertically.
```
Desktop: [Card] [Card] [Card] [Card]     → grid-cols-4
Mobile:  [Card]                           → grid-cols-1 or grid-cols-2
         [Card]
```
Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Pattern 2: Table → Card List
Tables are unreadable on mobile. Convert them to card lists.
```
Desktop: | Name | Phone | Due | Actions |   → <table> with overflow-x-auto
Mobile:  ┌─────────────────────┐              → Card with stacked info
         │ Name        ৳1,200  │
         │ 01XX-XXXXXX   [Edit]│
         └─────────────────────┘
```
Tailwind: `hidden md:table` for table, `md:hidden` for card list

### Pattern 3: Sidebar → Bottom Sheet / Overlay
Desktop sidebars become full-screen overlays or bottom sheets on mobile.
```
Desktop: [Sidebar 280px] [Main Content]
Mobile:  [Full-screen overlay with backdrop blur]
```
Tailwind: `hidden lg:flex` for sidebar, `fixed inset-0 z-50 lg:hidden` for overlay

### Pattern 4: Horizontal Toolbar → Vertical / Wrapped
Desktop toolbars with many buttons become wrapped or stacked on mobile.
```
Desktop: [Filter] [Search] [Date] [Export] [Add]
Mobile:  [Search ────────────────────]
         [Filter] [Date] [Add]
```
Tailwind: `flex flex-col sm:flex-row gap-2`, search: `w-full sm:w-auto`

### Pattern 5: Dense Info → Progressive Disclosure
Mobile hides secondary info behind expandable sections or "See more" links.
```
Desktop: All 6 stats visible at once
Mobile:  Top 2 stats visible, "See all →" link
```

### Pattern 6: Hover Actions → Visible Actions
Desktop can rely on hover-to-reveal actions. Mobile CANNOT — all actions must be visible or accessible via swipe/long-press.

### Space Optimization Rules
*   **Padding:** `p-2 sm:p-4 md:p-6 lg:p-8` — tighten on mobile, breathe on desktop
*   **Gaps:** `gap-2 sm:gap-4 md:gap-6` — compact on mobile
*   **Font sizes:** `text-sm sm:text-base` for body, `text-xl sm:text-2xl md:text-3xl` for headings
*   **Margins:** Minimize vertical margins on mobile to reduce scrolling

## 14. Testing & Verification Credentials

**Rule:** For all browser-based testing, UI verification, and end-to-end flows, you MUST use the credentials and environment details provided in `docs/access_credentials.md`.

*   **URL:** Use the specific URL mentioned in the doc (usually `http://127.0.0.1:4001/`).
*   **Credentials:** Use the verified email and password from the doc to log in and perform actions.
*   **Verification:** Ensure all UI changes are verified using these credentials before marking a task as complete.
