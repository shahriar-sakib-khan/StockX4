---
name: StockX4 Code Conventions & Anti-Pattern Guide
description: A custom skill documenting recurring code anti-patterns, type-safety violations, and errorful conventions specific to this codebase. Ensures future agents can quickly identify and avoid common pitfalls.
---

# ⚠️ StockX4 Code Conventions & Anti-Pattern Guide

This skill documents **real, observed anti-patterns** from this codebase. Every item listed here has been found in production code during audits. Future agents MUST check for these patterns when modifying or reviewing code.

---

## 1. The `(req as any).user!` Anti-Pattern (Backend)

### Problem
Controllers bypass TypeScript's type system by casting `req` to `any` to access the authenticated user object. This silences the compiler and hides potential null-pointer bugs.

### Where It Exists
Almost every controller file: `store.controller.ts`, `customer.controller.ts`, `vehicle.controller.ts`, `inventory.controller.ts`, `brand.controller.ts`, `product.controller.ts`.

### Example (BAD)
```ts
const store = await StoreService.create((req as any).user!.userId, result.data);
//                                      ^^^^^^^^^^^^^ type-unsafe, compiler can't verify .user exists
```

### Correct Pattern
```ts
import { AuthRequest } from '../../middleware/auth.middleware';

static async create(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const store = await StoreService.create(req.user.userId, result.data);
}
```

### Detection
```bash
grep -rn "(req as any)" apps/api/src/ --include="*.ts"
```

---

## 2. The `error: any` Catch-All (Backend)

### Problem
Every controller's catch block types the error as `any` and directly exposes `error.message` to the client. This leaks internal details (Mongoose cast errors, validation internals, stack traces).

### Where It Exists
Every controller that has a `try/catch`.

### Example (BAD)
```ts
} catch (error: any) {
    return res.status(500).json({ error: error.message });
    //                                   ^^^^^^^^^^^^^ may contain internal DB/Mongoose error messages
}
```

### Correct Pattern
```ts
import { logger } from '../../config/logger';

} catch (error) {
    logger.error('Store creation failed', { error, userId: req.user?.userId });
    return res.status(500).json({ error: 'An internal error occurred' });
}
```

### Detection
```bash
grep -rn "error.message" apps/api/src/ --include="*.ts"
```

---

## 3. The `console.log` Debug Trail (Full Stack)

### Problem
Debug `console.log` statements are left in production code. In the backend, this is a **security vulnerability** (logging tokens, payloads). In the frontend, it's a professionalism/performance issue.

### Known Violations (Backend — CRITICAL)
| File | Content | Risk |
|------|---------|------|
| `auth.middleware.ts` | Logs JWT tokens and auth headers | 🔴 CRITICAL |
| `store.controller.ts` | Logs raw request payloads (`JSON.stringify(req.body)`) | 🔴 HIGH |

### Known Violations (Frontend — Medium)
| File | Content | Risk |
|------|---------|------|
| `useAuth.ts` | `console.log('Login successful:', res)` — full auth response | 🟡 MEDIUM |
| `LoginForm.tsx` | Debug logging | 🟢 LOW |
| `StoreLayout.tsx` | Layout debug logging | 🟢 LOW |
| `CustomBrandForm.tsx` | Form submission debug | 🟢 LOW |

### Rule
- **Backend:** Use the project's `winston` logger (`config/logger.ts`) with appropriate levels
- **Frontend:** `console.error` is acceptable for genuine errors. `console.log` should NEVER be committed

### Detection
```bash
grep -rn "console.log" apps/api/src/ --include="*.ts" | grep -v ".test.ts"
grep -rn "console.log" apps/web/src/ --include="*.ts" --include="*.tsx"
```

---

## 4. The `window.confirm()` Anti-Pattern (Frontend)

### Problem
Destructive actions (delete customer, delete vehicle, delete product) use the browser's native `confirm()` dialog. This is:
- Not styleable (violates the design system)
- Not accessible (no screen reader support)
- Auto-dismissable (scripts can bypass it)
- Inconsistent UX (every browser renders it differently)

### Where It Exists
`CustomerPage.tsx`, `VehiclePage.tsx`, `ProductTable.tsx`

### Example (BAD)
```tsx
onClick={() => { if (confirm('Are you sure?')) deleteCustomer(customer._id); }}
```

### Correct Pattern
Use the project's `<Modal>` component with a confirmation flow:
```tsx
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

// In JSX:
<Button onClick={() => setDeleteTarget(customer._id)}>Delete</Button>

<Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Deletion">
    <p>Are you sure you want to delete this customer?</p>
    <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        <Button variant="destructive" onClick={() => { deleteCustomer(deleteTarget!); setDeleteTarget(null); }}>
            Delete
        </Button>
    </div>
</Modal>
```

### Detection
```bash
grep -rn "confirm(" apps/web/src/ --include="*.tsx"
```

---

## 5. The Dead Comment / Stale TODO Problem

### Problem
Large blocks of commented-out code and TODO comments accumulate, adding noise and wasting context window for AI agents.

### Where It Has Been Found
`DashboardPage.tsx` had ~80 lines of commented-out code before cleanup. `auth.service.ts` has inline comments explaining decisions that belong in docs.

### Rule
- Commented-out code MUST be deleted, not left "for reference" (that's what git history is for)
- TODOs MUST either be resolved or tracked in `docs/TODO.md`

### Detection
```bash
grep -rn "// TODO" apps/ --include="*.ts" --include="*.tsx"
grep -c "^//" apps/api/src/**/*.ts  # Count comment-only lines
```

---

## 6. The Excessive `any` Typing Problem (Full Stack)

### Problem
Both frontend and backend use `any` extensively instead of proper TypeScript types, especially in:
- API response handlers
- Zustand store actions
- Mongoose document references
- Component props

### Common Patterns
```ts
// ❌ Backend: generateTokens takes `any` instead of IUser
private static async generateTokens(user: any) { ... }

// ❌ Frontend: Transaction objects are all `any`
const filteredTransactions = transactions.filter((tx: any) => tx.type === 'SALE');

// ❌ Frontend: Inventory items are all `any`
{inventory.map((item: any) => ( ... ))}
```

### Correct Pattern
Define types in `packages/shared/` or in feature-local `types/` files:
```ts
// ✅ Shared type
import { Transaction } from '@repo/shared';
const filteredTransactions = transactions.filter((tx: Transaction) => tx.type === 'SALE');
```

### Detection
```bash
grep -rn ": any" apps/ --include="*.ts" --include="*.tsx" | wc -l
```

---

## 7. The Non-DRY Controller Pattern (Backend)

### Problem
Every controller has identical boilerplate: try/catch wrapping, Zod safeParse, error message extraction. This is repeated in every single controller method.

### Example (Repeated Everywhere)
```ts
static async create(req: Request, res: Response) {
    try {
        const result = schema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: result.error.errors });
        const data = await Service.method(userId, result.data);
        return res.status(201).json({ data });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
```

### Better Pattern
Create a utility wrapper:
```ts
// src/lib/asyncHandler.ts
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Errors go to global handler
};

// In controller:
static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors });
    const data = await Service.method(req.user!.userId, result.data);
    return res.status(201).json({ data });
});
```

---

## 8. The `accessToken.includes('staff')` Anti-Pattern (Frontend)

### Problem
The frontend login flow inspects the raw JWT string content to determine if the user is a staff member. JWTs are base64-encoded, and the string `'staff'` could appear in any token by coincidence.

### Where It Exists
`useAuth.ts:58`

### Example (BAD)
```ts
if (user.storeId || accessToken.includes('staff')) { ... }
```

### Correct Pattern
The server should return an explicit `type` field in the login response:
```ts
// Server response
{ user, accessToken, redirect, type: 'staff' | 'user' }

// Frontend
if (type === 'staff') { /* use staff store */ }
```

---

## 9. The Missing Tenant Isolation in Some Queries

### Problem
Per Law II (The Silent Tenant), every Mongoose query must filter by `tenantId` (or `storeId`/`ownerId`). Some paths may skip this check, especially in admin or legacy routes.

### How to Verify
For every service method that queries the database, ensure:
1. The method receives `userId`/`storeId` as a parameter
2. The Mongoose query includes `{ storeId }` or `{ ownerId: userId }` in the filter
3. A test exists that verifies User B cannot access User A's data

### Detection
```bash
# Find all .find() and .findOne() calls and verify they include tenant filters
grep -rn "\.find(" apps/api/src/features/ --include="*.ts" | grep -v ".test.ts"
grep -rn "\.findOne(" apps/api/src/features/ --include="*.ts" | grep -v ".test.ts"
```

---

## Quick Reference: Detection Commands

| Anti-Pattern | Command |
|---|---|
| `(req as any)` | `grep -rn "(req as any)" apps/api/src/` |
| `error.message` leaked | `grep -rn "error.message" apps/api/src/` |
| `console.log` (backend) | `grep -rn "console.log" apps/api/src/ \| grep -v .test.` |
| `console.log` (frontend) | `grep -rn "console.log" apps/web/src/` |
| `confirm()` | `grep -rn "confirm(" apps/web/src/` |
| `: any` count | `grep -rn ": any" apps/ \| wc -l` |
| Hardcoded secrets | `grep -rn "\|\| '" apps/api/src/ \| grep -i secret` |
| Dead TODOs | `grep -rn "// TODO" apps/` |
