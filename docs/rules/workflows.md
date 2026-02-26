# Development Workflows

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
2.  **Environment Setup**:
    -   Copy `.env.example` to `.env` in `apps/api` and `apps/web`.
3.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
    -   Web: `http://localhost:5173`
    -   API: `http://localhost:3001`

---

## 🛠️ How to Add a New Feature (Vertical Slice)

We follow a **Vertical Slice Architecture**. A feature (e.g., "Inventory") should be self-contained.

### Step 1: Shared Contract (`packages/shared`)
Define the Zod Schema and Types first. This is the contract between FE and BE.
1.  Create `src/schemas/inventory.schema.ts`.
2.  Export it in `src/index.ts`.
3.  Run `pnpm build` in `packages/shared`.

### Step 2: Backend Implementation (`apps/api`)
1.  Create folder `src/features/inventory`.
2.  **Model**: `inventory.model.ts` (Mongoose).
3.  **Service**: `inventory.service.ts` (Business Logic).
4.  **Controller**: `inventory.controller.ts` (HTTP Layer, uses Shared Schema).
5.  **Routes**: `inventory.routes.ts`.
6.  **Register**: Add route to `src/index.ts` (or `store.routes.ts` if sub-resource).

### Step 3: Frontend Implementation (`apps/web`)
1.  **API**: Add methods to `src/features/inventory/api/inventory.api.ts`.
2.  **Store (State)**: Create `inventory.store.ts` (Zustand) if needed.
3.  **Components**: Build UI in `src/features/inventory/components`.
4.  **Page**: Compose in `src/features/inventory/pages`.
5.  **Route**: Add to `App.tsx`.

---

## ✅ Testing

*   **Backend Integration Tests**:
    ```bash
    pnpm test filter=inventory
    ```
*   **Manual Verification**:
    -   Use `StaffProtectedRoute` for POS features.
    -   Use `AdminLayout` for Back-office features.
