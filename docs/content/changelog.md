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
