---
name: MERN Security Audit Protocol
description: A comprehensive, industry-grade protocol for finding and fixing security vulnerabilities in a MERN/Turborepo monorepo. Covers backend secrets, auth, logging, input validation, frontend token handling, CORS, and more.
---

# 🔒 MERN Security Audit Protocol

This skill provides a systematic, checklist-driven approach to auditing the entire MERN stack for security flaws. It is tailored for this project's architecture (Express + Mongoose + React + Zustand + Ky + Turborepo) but applies broadly to any MERN application.

**Run this audit whenever:** A new feature is added, a deployment is planned, or a refactoring pass is underway.

---

## Phase 1: Secrets & Environment Configuration

### 1.1 No Hardcoded Secrets (CRITICAL)
**Rule:** NEVER use fallback strings for secrets in code. If a secret is missing, the app should CRASH at startup, not silently use a default.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```ts
// ❌ CRITICAL: Hardcoded fallback secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'superrefreshsecret';
```

**Fix:**
```ts
// ✅ Crash fast if secret is missing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET env var is required');

const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!REFRESH_SECRET) throw new Error('FATAL: REFRESH_SECRET env var is required');
```

**Files to check:** `auth.middleware.ts`, `auth.service.ts`, `server.ts`, any file importing `process.env`.

### 1.2 `.env.example` Must List ALL Required Vars
**Rule:** Every secret referenced in the codebase MUST be listed in `.env.example`.

**Checklist for this project:**
- [ ] `JWT_SECRET` — MUST be listed (currently missing!)
- [ ] `REFRESH_SECRET` — MUST be listed (currently missing!)
- [ ] `MONGO_URI`
- [ ] `PORT`
- [ ] `NODE_ENV`
- [ ] `CORS_ORIGIN`
- [ ] `CLOUDINARY_*` vars

### 1.3 `.env` Files Must Be Gitignored
- [ ] Verify `.gitignore` includes `.env` and `.env.local`
- [ ] Ensure no `.env` file has ever been committed (run `git log --all --name-only | grep .env`)

---

## Phase 2: Authentication & Authorization

### 2.1 No Console Logging of Sensitive Data (CRITICAL)
**Rule:** NEVER `console.log` tokens, passwords, decoded JWTs, auth headers, or request bodies containing credentials. Use a logger with log levels instead.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```ts
// ❌ CRITICAL: Logs the full Bearer token and decoded JWT payload to stdout
console.log('Auth Middleware: Header:', authHeader);
console.log('Auth Middleware: Decoded:', decoded);
console.log('Auth Middleware: Invalid token', error);
```

**Fix:** Remove ALL of these. If debug logging is needed, use a structured logger gated behind `NODE_ENV === 'development'` or a `LOG_LEVEL` check:
```ts
// ✅ Use the project's winston logger with appropriate level
import { logger } from '../../config/logger';
logger.debug('Auth: Token validated', { userId: decoded.userId }); // Never log the token itself
```

**Full audit checklist — search the entire codebase for:**
- [ ] `console.log` in `middleware/` directory
- [ ] `console.log` in `features/auth/` directory  
- [ ] `console.log` in controllers that log `req.body` (e.g., `store.controller.ts` logs raw setup payloads)
- [ ] `console.log` in frontend auth hooks (e.g., `useAuth.ts` has `console.log('Login successful:', res)` which exposes token data)

### 2.2 Token Storage Security
**Rule:** Understand the trade-offs of your chosen token storage.

| Storage | XSS Vulnerable? | CSRF Vulnerable? | Recommended? |
|---------|:---:|:---:|:---:|
| `localStorage` | ✅ YES | ❌ No | ⚠️ Acceptable with CSP |
| `httpOnly Cookie` | ❌ No | ✅ YES | ✅ Best (with CSRF token) |
| In-memory (Zustand) | ❌ No | ❌ No | ✅ Best (loses on refresh) |

**This project status:** Uses `localStorage` via Zustand `persist` for access tokens. The refresh token is in a cookie. This is acceptable but requires:
- [ ] Content-Security-Policy headers to mitigate XSS
- [ ] Sanitization of all user inputs displayed in HTML

### 2.3 Refresh Token Rotation
- [x] ✅ This project correctly deletes old refresh tokens before issuing new ones (`auth.service.ts:163`)
- [ ] Verify expired refresh tokens are cleaned up periodically (add a TTL index on `expiresAt` in MongoDB)

### 2.4 Authorization Bypass Checks
**Rule:** Every route must verify that the requesting user has access to the resource.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```ts
// ❌ This casts away type safety, hiding potential missing user checks
const store = await StoreService.update(req.params.id, (req as any).user!.userId, result.data);
```

**Fix:** Use the typed `AuthRequest` interface consistently:
```ts
// ✅ Type-safe: compiler verifies `user` exists
import { AuthRequest } from '../../middleware/auth.middleware';
static async update(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const store = await StoreService.update(req.params.id, req.user.userId, result.data);
}
```

---

## Phase 3: Input Validation & Injection Prevention

### 3.1 Zod Validation on ALL Routes
**Rule:** Every POST/PUT/PATCH route MUST have Zod schema validation before processing.
- [ ] Audit every controller for `safeParse` / `parse` calls
- [ ] Ensure error responses do NOT expose internal Zod error details in production

### 3.2 MongoDB Injection Prevention
- [x] ✅ `express-mongo-sanitize` is installed and applied globally (`app.ts:57`)
- [ ] Verify that no route manually constructs MongoDB queries from `req.query` without sanitization

### 3.3 Request Body Size Limit
- [ ] Ensure `express.json({ limit: '10mb' })` or similar is set (currently uses default which is 100kb — check if file uploads need larger)

### 3.4 File Upload Validation
- [ ] Verify `upload.middleware.ts` validates file type, size, and sanitizes filenames
- [ ] Ensure Cloudinary URLs are validated before storage

---

## Phase 4: Frontend Security

### 4.1 No Sensitive Data in Console
**Rule:** Remove all `console.log` calls that expose API responses containing tokens, user data, or business logic.

**Files with known violations in this project:**
| File | Line | Issue |
|------|------|-------|
| `useAuth.ts` | 45 | `console.log('Login successful:', res)` — exposes full auth response |
| `LoginForm.tsx` | varies | Debug logging |
| `StoreLayout.tsx` | varies | Layout debug logging |
| `CustomBrandForm.tsx` | varies | Form debug logging |

### 4.2 No `confirm()` for Destructive Actions
**Rule:** Never use `window.confirm()` for delete operations. It cannot be styled, is not accessible, bypasses the design system, and can be auto-dismissed by scripts.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```tsx
// ❌ Browser's native confirm — no undo, no styling, easily bypassed
onClick={() => { if (confirm('Delete?')) deleteCustomer(id); }}
```

**Fix:** Use a custom confirmation modal with the project's `<Modal>` component.

**Known violating files:**
- [ ] `CustomerPage.tsx` — uses `confirm()` for customer deletion
- [ ] `VehiclePage.tsx` — uses `confirm()` for vehicle deletion
- [ ] `ProductTable.tsx` — uses `confirm()` for product deletion

### 4.3 Don't Inspect Token Content on Frontend
**Rule:** Never parse or inspect JWT content on the frontend to determine roles or routing.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```ts
// ❌ Unreliable: base64 content could coincidentally contain 'staff'
if (user.storeId || accessToken.includes('staff')) { ... }
```

**Fix:** The server response should explicitly include a `type` field:
```ts
// ✅ Server returns explicit type
const { user, accessToken, redirect, type } = res; // type: 'user' | 'staff'
if (type === 'staff') { ... }
```

### 4.4 CORS Hardcoded Origins
**Rule:** Production CORS origins should come from environment variables, not hardcoded arrays.

**This project status:** `app.ts` has a hardcoded `allowedOrigins` array with localhost AND production domains. The env var `CORS_ORIGIN` is additive but the defaults are always included.

**Fix:** In production, ONLY use `CORS_ORIGIN` env var. Hardcoded localhost origins should be gated behind `NODE_ENV === 'development'`.

---

## Phase 5: Error Handling & Information Leakage

### 5.1 Don't Expose Error Stacks in Production
- [x] ✅ Global error handler only includes `stack` in development (`app.ts:107`)

### 5.2 Don't Expose Internal Error Messages
**Rule:** Catch blocks should return generic messages, not `error.message` which may expose DB structure or internal logic.

**Anti-Pattern (THIS PROJECT HAS THIS BUG):**
```ts
// ❌ Exposes internal error details (e.g., "Cast to ObjectId failed for value...")
return res.status(500).json({ error: error.message });
```

**Fix:**
```ts
// ✅ Generic message for clients, detailed log for operators
logger.error('Store update failed', { error, storeId: req.params.id });
return res.status(500).json({ error: 'An internal error occurred' });
```

### 5.3 Dynamic Logger Import Anti-Pattern
**Rule:** Never use dynamic `import()` inside middleware/error handlers.

**Anti-Pattern (THIS PROJECT HAS THIS BUG in `app.ts:97`):**
```ts
// ❌ Dynamic import in error handler — adds latency, may fail silently
import('./config/logger').then(({ logger }) => { logger.error(...) });
```

**Fix:** Import at the top of the file like every other import.

---

## Phase 6: Dependency & Infrastructure Security

### 6.1 Security Headers
- [x] ✅ `helmet()` is applied globally
- [ ] Consider adding explicit CSP policy for additional XSS protection
- [ ] Consider adding `X-Content-Type-Options: nosniff` (helmet does this by default)

### 6.2 Rate Limiting
- [x] ✅ Global rate limit is applied (1000 req/15min per IP)
- [ ] Consider adding stricter rate limits to auth routes (`/auth/login`, `/auth/register`) — e.g., 10 attempts/15min

### 6.3 Dependency Audit
- [ ] Run `pnpm audit` to check for known vulnerabilities
- [ ] Run `pnpm audit --fix` to apply patches where available

---

## Execution Checklist (Quick Run)

When running this audit, use this condensed checklist:

1. [ ] `grep -rn "console.log" apps/api/src/ --include="*.ts"` — Remove all non-test console.logs
2. [ ] `grep -rn "|| 'super" apps/api/src/` — Find hardcoded secret fallbacks
3. [ ] `grep -rn "(req as any)" apps/api/src/` — Find type-unsafe auth access
4. [ ] `grep -rn "error.message" apps/api/src/` — Find leaked error details
5. [ ] `grep -rn "confirm(" apps/web/src/` — Find native confirm() usage
6. [ ] `grep -rn "console.log" apps/web/src/ --include="*.ts" --include="*.tsx"` — Find frontend debug logs
7. [ ] Verify `.env.example` lists ALL env vars used in code
8. [ ] Run `pnpm audit`
9. [ ] Run `pnpm build` to verify no regressions
