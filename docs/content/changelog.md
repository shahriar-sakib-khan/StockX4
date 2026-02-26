# Project Changelog

## Current Status
**Active Phase**: System Initiation & Verification Complete

---

## Architecture & Infrastructure
- [x] **Monorepo**: Setup with Turborepo, pnpm workspaces.
- [x] **Shared Package**: Established `@repo/shared` for Zod schemas and types (Auth, Store, Staff).
- [x] **Build System**: Configured `tsup` for backend and `vite` for frontend with `noExternal` bundling.
- [x] **Testing**: Configured `vitest` + `supertest` + `mongodb-memory-server` for integration testing.
- [x] **API Testing**: Standardized Bruno collection (`apps/api/bruno/AG-MERN`) with automated scripts.
- [x] **Core Entities**: Implemented Shop, Customer, Product, and Vehicle (Schema, Model, API).

## Frontend Logic
- **State**: Global User state via `zustand`. Server state via `tanstack-query`.
- **UI System**: TailwindCSS design system with `shadcn`-like components (`Button`, `Input`, `Modal`).
- **Routing**: Protected routes for Admin and Staff contexts.

## Core Features Implemented

### 1. Authentication & Security
- **Stateless Auth**: JWT Access Token + Refresh Tokens (HttpOnly Cookie).
- **Security**: Argon2 password hashing, Helmet headers, CORS.
- **Flows**: Register, Login, Logout, Refresh Token.

### 2. User Management (RBAC)
- **Roles**: Distinct `User` and `Admin` roles.
- **Profile**: Update profile, change password, upload avatar (Cloudinary).
- **Admin Dashboard**: List users, promote/demote, delete users, reset passwords.

### 3. Multi-Tenant Stores
- **Store CRUD**: Owners can Create, Read, Update, Delete stores.
- **Constraints**:
    - Slugs must be unique.
    - Strict ownership checks (User A cannot see User B's stores).
- **Verification**: 100% Test Coverage.

### 4. Staff System
- **Scoped Identity**: Staff are linked to specific Stores.
- **Management**: Owners can add/remove staff from their stores.
- **Dedicated Login**: Specialized flow (`Store ID` + `Staff ID` + `Password`) at `/staff/login`.
- **Dashboard**: POS-style interface for Staff at `/pos`.

### 5. Brand Management (Admin)
- **New Module**: `features/brand` with isolated API, hooks, and components.
- **Global Identity**: Admins create Global Brands with standardized colors (20mm/22mm) and variants.
- **Advanced Pricing**: Split pricing model (Full vs Gas Only).
- **Refinement**:
    - **Logo Upload**: Cloudinary integration for brand logos.
    - **Actions**: `Edit` and `Delete` brands with safety checks.
    - **UI**: Custom full-screen modal for brand creation/editing.
- **Backend**: Full CRUD API (`/brands`) with integration tests covering all methods (`GET`, `POST`, `PUT`, `DELETE`).

### 6. Cylinder Inventory (Batch & Removal)
- **Batch Selection**: Implemented multi-select in "Add Brand" modal.
- **Brand Removal**:
    - Added `DELETE /inventory/brands/:id` to remove brands from a store.
    - **UI**: Clicking an existing brand in the modal now marks it for **Removal** (Red/Strikethrough).
    - **Sync**: "Update Inventory" button handles both adding new brands and removing marked ones.
- **Verification**: Added `cylinder.batch.test.ts` and `cylinder.remove.test.ts` covering partial and full workflows.
- **Responsive UI & Dashboard**:
    - **Dashboard**: Redesigned Inventory page with Tabs (Cylinders/Stoves), Stats Cards (Filterable), and Filters (Regulator/Size/Search).
    - **Responsive**: Mobile Cards and Desktop Table.
    - **Data**: Seeded inventory prices from Global Brand defaults.
- **Seeding**: Created `seed-brands.ts` for populating 10 BD brands.

### 7. Maintenance & Stability
- **API Tests**: Resolved failure in `StoreService` (error message mismatch) and `Cylinder` tests (invalid role `store_owner` -> `user`). All API tests passing.
- **Build System**: Fixed `tsup` configuration to prevent server auto-start during build. Resolved `TS2742` in `app.ts` export.
