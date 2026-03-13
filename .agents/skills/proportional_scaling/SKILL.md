# Proportional Scaling & Fluid Typography Protocol

This skill provides a strict protocol for ensuring that every UI element—fonts, cards, logos, and spacing—scales down aggressively and proportionally as the screen size decreases, especially for ultra-narrow viewports (320px - 375px).

## 1. The Core Philosophy
"Responsive" is not enough. We need **Fluidity**. On a 320px screen, a 16px font is "Large", not "Base". Every pixel counts. If the screen is 20% smaller, the elements should feel roughly 20% smaller, not just truncated.

## 2. Fluid Typography Scale
Avoid hardcoded `text-sm` or `text-base` if they don't adapt. Use Tailwind's responsive prefixes to aggressively drop weights.

| Element | Small Mobile (320px) | Standard Mobile (375px) | Tablet/Desktop (768px+) |
|---|---|---|---|
| Page Titles | `text-xl` | `text-2xl` | `text-4xl` |
| Section Headers | `text-base` | `text-lg` | `text-2xl` |
| Card Titles | `text-sm` | `text-base` | `text-xl` |
| Primary Buttons | `text-[10px]` | `text-xs` | `text-sm` |
| Labels / Metadata| `text-[8px]` | `text-[10px]` | `text-xs` |

## 3. Proportional Component Scaling
Component dimensions (height, width, icons) must shrink on small screens.

### Card & Image Sizes
- **Logos/Avatars**: `w-16 h-16` (320px) → `w-24 h-24` (375px) → `w-32 h-32` (Desktop).
- **Button Heights**: `h-10` (320px) → `h-12` (375px) → `h-14/16` (Desktop).
- **Input Heights**: `h-10` (320px) → `h-12` (375px) → `h-14` (Desktop).

### Iconography
- Always drop icon sizes by 1-2 steps on mobile.
- `w-4 h-4` (320px) → `w-5 h-5` (Desktop).

## 4. Spacing & Gaps
Gaps that look "premium" on desktop look "bloated" on mobile.
- **Outer Padding**: `p-2` (320px) → `p-4` (375px) → `p-8+` (Desktop).
- **Internal Gaps**: `gap-1` or `gap-2` (320px) → `gap-4` (375px) → `gap-6` (Desktop).

## 5. Mobile Scrollable Entities (Modal Logic)
In mobile modals, headers containing "Entity Information" (e.g., Vehicle Plate, Staff Photo) MUST NOT be fixed or sticky if they occupy more than 20% of the height. 
- **Rule**: Put the header inside the main scrollable container on mobile.
- **Desktop**: Headers can remain sticky for quick context.

## 6. Checklist for Implementation
- [ ] Check every `text-*` class and add a smaller mobile variant.
- [ ] Verify `h-*` and `w-*` on interactive elements at 320px.
- [ ] Ensure `gap-*` transitions from tiny to large.
- [ ] Move modal headers into the scrollable flow for mobile viewports.
- [ ] Use `clamp()` or relative units if Tailwind's standard scales feel too jumpy.
