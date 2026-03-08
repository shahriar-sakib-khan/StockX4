---
name: UX & Build Verification Protocol
description: The mandatory post-refactoring sequence to guarantee that the new responsive design is accessible, buildable, and aesthetically pleasing on all devices.
---

# 📐 UX & Build Verification Protocol

UI refactoring is not complete just because the code looks clean. It is only complete when it visually functions correctly across all target devices and passes compiling gates.

## 1. Automated Build Verification (The Mandatory Gate)
As per the user's GEMINI.md (Law IV: Rigorous Verification):
*   **Action:** Immediately after completing a component refactor, you MUST run the frontend build command.
*   **Command:** `npm run build` or `pnpm build` in the root or `apps/web` directory.
*   **Resolution:** If the build fails due to a TypeScript error or broken import caused by component extraction, you MUST fix it immediately. You cannot proceed to the next refactoring task while the build is failing.

## 2. Accessibility & Usability (UX) Audit Checklist
Before declaring a responsive refactor "complete", audit the code against the project's specific target audience (Elderly, low-literacy users).

*   [ ] **The "Fat Finger" Test:** Are all actionable elements (buttons, links, dropdowns, table rows) easy to tap? Minimum height constraints (`h-12` or `min-h-[48px]`) must be present.
*   [ ] **The Contrast Test:** Is the text readable? Avoid faint grays. Ensure primary transaction values use bold typography (`font-bold`, `text-lg` or `text-xl`).
*   [ ] **The Color Meaning Test:** Verify strict color adherence:
    *   Green for Incoming/Success.
    *   Red for Outgoing/Error.
    *   Amber/Yellow for Dues/Warnings.
*   [ ] **The Modal Backdrop Test:** Confirm that any newly created or refactored modals close automatically when clicking the backdrop, and that they do not exceed the viewport size on mobile devices (`max-w-[95vw]`, `max-h-[90vh]`, `overflow-y-auto`).

## 3. Visual Verification Steps (For the AI and the User)
Because an AI cannot truly "see" the rendered browser output without a tool, we rely on a strict workflow:

1.  **AI Code Review:** The AI must double-check that standard breakpoint stacks exist for the main layouts (e.g., base classes for mobile, `md:` for tablet, `lg:` for desktop).
2.  **Stitch Vibe Check:** If Google Stitch MCP was used to generate the UI code, the AI must verify that the generated code aligns with the project's brand design tokens.
3.  **User Manual Request:** The AI MUST prompt the user to perform a manual visual check using specific instructions:
    *   *Prompt to User:* "Please open `/url` in your browser. Use the Device Toolbar (F12) to test at 360px (Mobile) and 1024px (Desktop). Confirm the UI doesn't break horizontally."
