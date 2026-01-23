# Architecture & Design

## System Model
**Modular Monolith**: A unified repository (`turborepo`) containing distinct, loosely coupled applications and shared packages.

### Boundaries
*   **Strict Separation**: The Frontend (`apps/web`) composes the UI but contains ZERO business logic. It communicates with the Backend (`apps/api`) exclusively via JSON REST API.
*   **Shared Kernel**: The `packages/shared` workspace acts as the Single Source of Truth for types and Zod schemas. Both Frontend and Backend import from here to ensure contract consistency.

## Data Flow
1.  **Client Action**: User submits a form (e.g., "Create Store").
2.  **Validation (Client)**: `zod` schema from `@repo/shared` validates input immediately.
3.  **Transport**: `ky` sends HTTP POST with JSON payload.
4.  **Entry Point (API)**: `index.ts` routes request to `StoreRoutes`.
5.  **Validation (Server)**: Controller validates body again using the *same* `zod` schema.
6.  **Service Layer**: Business logic executes (e.g., Check ownership, create DB record).
7.  **Persistence**: Mongoose writes to MongoDB.
8.  **Response**: JSON data returned to Client.

## Multi-Tenancy Model
*   **Owner-Centric**: A `User` (Owner) is the root entity. They can create infinite `Stores`.
*   **Store Isolation**: Each `Store` is a logical boundary. Data (Products, Orders) is linked to `storeId`.
*   **Staff Isolation**: `Staff` accounts are scoped strictly to a single `Store`. A staff member is NOT a global User.

## Authentication Model
The system uses a **Dual-Strategy** authentication mechanism:

| Actor | Strategy | Token Type | Persistence | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Owner (User)** | Standard JWT | Access + Refresh | HttpOnly Cookie | Global Dashboard, Billing, Profile |
| **Staff** | Ephemeral | Access Token (Scoped) | LocalStorage (POS) | Store-Specific POS Access only |

*   **Access Token**: Short-lived (15m), sent in Authorization Header `Bearer <token>`.
*   **POS Context**: The Frontend intelligently switches the Auth Header based on the route (Owner Token vs Staff Token).

## Directory Structure
### Backend (`apps/api`)
*   `src/features/<feature>/`: Vertical Slices containing Controller, Service, and Routes.
*   `src/models/`: Mongoose Schemas (Data Layer).
*   `src/middleware/`: cross-cutting concerns (Auth, Error Handling).

### Frontend (`apps/web`)
*   `src/features/<feature>/`: Hooks (Logic), Components (UI), and Stores (State).
*   `src/pages/`: Route-level composition.
*   `src/lib/`: Core utilities (API client).

## UI/UX Pattern
*   **Design System**: TailwindCSS with `shadcn`-inspired utility components.
*   **Feedback**: Optimistic updates via TanStack Query + Toast notifications (Sonner).
*   **Responsive**: Mobile-first approach (`sm:`, `md:` breakpoints).
