# StockX – System Architecture

> **StockX** is a multi-tenant ERP / POS for LPG dealers in Bangladesh. It manages gas cylinder lifecycle, inventory (cylinders, stoves, regulators), B2B/B2C sales, staff, vehicles, and financials — all under strict per-store data isolation.

---

## 1. System Model

**Monorepo** via Turborepo + pnpm workspaces. Three workspaces:

| Workspace | Purpose |
|---|---|
| `apps/api` | Express + Mongoose REST API (Node.js) |
| `apps/web` | React + Vite SPA (TanStack Query, Zustand, Shadcn-style UI) |
| `packages/shared` | Single Source of Truth — Zod schemas + TypeScript types consumed by both api and web |

**Architecture Pattern:** Modular Monolith. The frontend contains **zero business logic** — all logic lives in the API Service layer.

---

## 2. Data Flow

```
User Action → Zod validation (client, using @repo/shared schema)
           → ky HTTP request (JSON)
           → Express route → Controller → Service Layer
           → Mongoose → MongoDB
           → JSON response → TanStack Query cache → UI re-render
```

Server validates again with the **same** Zod schema from `@repo/shared`. One schema, two validation points.

---

## 3. Multi-Tenancy

- A **User** (owner) can own multiple **Stores**.
- All data is scoped to `storeId`. Cross-store access is impossible by design.
- The current store context is passed via the `x-store-id` request header.
- **Staff** accounts are not global Users — they belong to one specific Store.

---

## 4. Authentication (Dual Strategy)

| Actor | Token | Storage | Scope |
|---|---|---|---|
| Store Owner | JWT Access (15m) + Refresh (HttpOnly Cookie) | Cookie | Full dashboard |
| Staff | Ephemeral JWT (scoped) | LocalStorage (POS) | Store POS only |

- Passwords: Argon2 hashing.
- Security: Helmet headers, strict CORS.
- Frontend switches Auth header based on route context (owner token vs. staff token).

### Auth Routes
- `POST /auth/register` — owner registration (name, email, password)
- `POST /auth/login` — owner login
- `POST /auth/logout` — clear refresh token
- `POST /auth/refresh` — issue new access token
- `POST /staff/login` — staff login (storeId + contact + password)

---

## 5. Directory Structure

### Backend (`apps/api`)
```
src/
  features/<feature>/    # Vertical slices: controller + service + routes
    auth/
    brand/               # GlobalBrand, StoreBrand
    customer/            # B2C retail customers
    cylinder/            # StoreInventory (cylinders, stoves, regulators)
    dashboard/           # Aggregate analytics
    product/             # GlobalProduct (stove/regulator image catalog)
    staff/
    store/
    transaction/         # Sales, receipts
    upload/              # Cloudinary upload
    user/
    vehicle/
  scripts/               # Seeding and DB management scripts
  middleware/            # Auth guards, error handling
```

### Frontend (`apps/web`)
```
src/
  features/<feature>/    # hooks (TanStack Query) + components (UI)
  pages/                 # Route-level composition
  lib/                   # API client (ky), utilities
  components/ui/         # Shared design system components
  store/                 # Zustand stores (POS cart, auth)
```

---

## 6. Core Data Models

### 6.1 User
Owner account. One user can own multiple stores.
```ts
{ name, email, passwordHash, role: 'user' | 'admin', avatar? }
```

### 6.2 Store
Logical isolation boundary for all business data.
```ts
{ ownerId, name, slug, settings: { currency, timezone } }
```

### 6.3 Staff
Scoped to one store. Not a global User.
```ts
{ storeId, name, contact, passwordHash, role: 'owner'|'manager'|'staff'|'driver', salary, salaryDue, isActive }
```

### 6.4 Customer
```ts
// B2C Retail
{ storeId, name, phone, address?, image?, totalDue }

// B2B Shop
{ storeId, name, ownerName?, phone, address, district?, totalDue }
```

### 6.5 Vehicle
```ts
{ storeId, licensePlate, vehicleModel, driverName, driverPhone }
// Expenses: tracked separately via vehicle expense records (fuel, repair)
```

### 6.6 Transaction (Sale/Purchase)
Records all buy/sell events with customer, items, payment, and due updates.

---

## 7. Brand & Inventory Architecture

> Detailed documentation in [`docs/architecture.md`](./docs/architecture.md).

### Global Catalog (Admin/Script Only — Rarely Changes)

| Collection | What it stores |
|---|---|
| `GlobalBrand` | **Cylinder brands only** (Bashundhara, Omera, G-Gas, etc. — 21 brands). Has name, logo, cylinderImage, color. |
| `GlobalProduct` | **Stove/regulator image catalog only**. 4 stove records (1–4 burner) + 2 regulator records (20mm, 22mm). Maps type → Cloudinary image. No brand concept. |

### Per-Store Data

#### `StoreBrand` — Cylinder Brand Registry (per store)
Implements **Reference + Override** pattern:

| Field | Purpose |
|---|---|
| `storeId` | Which store |
| `globalBrandId?` | Ref to GlobalBrand (null for custom brands) |
| `isActive` | Enabled/disabled in this store |
| `isCustom` | false = global-linked, true = store-created |
| `customName/Logo/Color/CylinderImage?` | Set only for custom brands |

- **Global-linked brands**: name/logo/color/cylinderImage are read via `populate('globalBrandId')` at query time. No duplication. No cascade updates needed.
- **Custom brands**: all fields stored locally. Visible only in their own store.
- **On store creation**: ALL `GlobalBrand` records are copied as `StoreBrand` entries. Selected brands → `isActive: true`, all others → `isActive: false`.

#### `StoreProduct` (SKU / Catalog Registry per store)
Records the canonical definition of "what" an item is. Holds no quantities.

```ts
{
  storeId, category: 'cylinder' | 'stove' | 'regulator'

  // Common Fields
  name: string, // Friendly name computed from details (e.g. "Bashundhara LPG 12kg (22mm)")
  isActive: boolean,
  isArchived: boolean, // Safe delete: Hides from UI but preserves ledger history

  // Category-specific details (Dynamic schema sub-document)
  details: {
    // Cylinder
    brandId?: StoreBrand, size?: string, regulatorType?: '20mm'|'22mm'

    // Stove
    brandName?: string, model?: string, burners?: 1|2|3|4

    // Regulator
    brandName?: string, model?: string, type?: '20mm'|'22mm'
  }
}
```

#### `StoreInventory` (The Ledger)
Strictly handles "how many" and "how much". Points to `StoreProduct` (SKU). All matrix and free-text noise is removed from this ledger.

```ts
{
  storeId,
  productId: StoreProduct, // The SKU reference

  counts: { full, empty, defected }
  prices: { buyingPriceFull, retailPriceFull, wholesalePriceFull,
            buyingPriceGas, retailPriceGas, wholesalePriceGas }
}
```

**Workflow Distinction:**
- Cylinders: **Matrix Generation**. Driven by `Store.cylinderSizes` array. Active `StoreBrands` × `Store.cylinderSizes` = auto-generated `StoreProduct` SKUs. If a product doesn't have stock, its virtual representation handles mapping zeroes.
- Stoves / Regulators: **Explicit Addition**. Manual free-text UI inputs create distinct `StoreProduct` SKUs instantly alongside an initial `StoreInventory` record.

**Image resolution:**
- Cylinder → `StoreProduct.details.brandId` (populated `StoreBrand`)
- Stove → `GlobalProduct` by `type='stove', burnerCount=N`
- Regulator → `GlobalProduct` by `type='regulator', regulatorType=T`

---

## 8. Seeding Strategy

### Type 1: Global Catalog Scripts (Rarely Run — Not Part of `db:reset`)

| Command | Script | What it does |
|---|---|---|
| `pnpm upload:assets` | `upload-assets.ts` | Uploads local product images to Cloudinary. Writes `cloudinary-urls.json`. |
| `pnpm db:catalog` | `db-catalog.ts` | Clears + re-seeds `GlobalBrand` (21 cylinder brands) and `GlobalProduct` (6 image records). Clears `StoreBrand` (must be re-linked after). |

> Only re-run when adding new global brands or replacing Cloudinary images.

### Type 2: Demo Data Scripts (Run on every `pnpm db:reset`)

Order: `db:drop` → `db:catalog` → then all seeds below:

| Script | Seeds |
|---|---|
| `seed-users.ts` | `sakib@gmail.com` owner account |
| `seed-stores.ts` | Demo store + StoreBrand copies for ALL GlobalBrands (Bashundhara/Omera/G-Gas = active, rest = inactive) + staff + vehicles |
| `seed-customers.ts` | Demo B2C customers + B2B shops |
| `seed-inventory-cylinders.ts` | Wipe + seed cylinder StoreInventory for 3 active brands × 2 regulator types |
| `seed-inventory-stoves.ts` | Wipe + seed stove inventory: 5 brands × 4 burner types (counts: 4/3/1/1 per burner) |
| `seed-inventory-regulators.ts` | Wipe + seed regulator inventory: 3 brands × 2 types (20mm/22mm) |
| `seed-expenses.ts` | Demo expense records |

> All inventory seed scripts **wipe their category first** before inserting — idempotent on re-run.

---

## 9. Feature Modules

### 9.1 Inventory (Cylinders, Stoves, Regulators)
- **Three tabs** on the inventory page: Cylinders | Stoves | Regulators.
- **Card View** per item: image, stock counts (Full/Empty/Defected), prices, Restock + Sell buttons.
- **Restock Sidebar** (slides in from right): direct stock entry without cart. For cylinders — brand dropdown (all active StoreBrands incl. custom). For stoves/regulators — free-text brand + model fields.
- **Sell** button redirects to the POS page.
- **Manage Brands** button (cylinder tab only): opens a 3-tab modal:
  1. **All Brands** — toggle GlobalBrands on/off for this store
  2. **Custom** — view/delete store-created custom brands
  3. **+ Create Custom** — create a new custom cylinder brand (name, color, logo, cylinder image)

### 9.2 POS (Point of Sale)
- 3-section layout: Cart window (top), controls/filters (middle), product catalog grid (bottom).
- Modes: **Packaged** (cylinder + gas charge) and **Refill** (gas-only swap).
- Cart state persisted in Zustand + LocalStorage.
- Checkout: customer selection (B2C/B2B/Vehicle), discount, paid amount, due auto-calculation.

### 9.3 Customer Management (B2C + B2B)
- Separate views for retail customers and shops.
- Tracks `totalDue` per customer.
- On-the-fly customer creation from the checkout page.

### 9.4 Vehicle Management
- Per-store fleet. Each vehicle has driver info and expense tracking (fuel, repair).

### 9.5 Staff Management
- Owner-managed. Each staff member belongs to one store.
- Staff login: storeId + contact + password (at `/staff/login`).
- Roles: owner, manager, staff, driver.
- Salary tracking field per staff member.

### 9.6 Dashboard
- Aggregate stats: total sales, expenses, net profit, total dues.
- Cash box: current cash-in-hand.
- Sales vs Expense chart.
- Inventory snapshot (low stock alerts).

### 9.7 History / Reporting
- **Daily Diary view**: every transaction for a selected date.
- **Stats view**: time-range filters (7d, 30d, this year, custom). Comprehensive financial breakdown.

### 9.8 Store Settings
- Update store name, currency, timezone.
- Danger zone: delete store.

---

## 10. UI/UX Conventions

| Rule | Standard |
|---|---|
| **Color coding** | Green = incoming money / success. Red = outgoing / error / delete. Yellow/Amber = dues / warnings. |
| **Product colors** | Yellow = 20mm regulator items. Orange = 22mm regulator items. |
| **Typography** | Large, bold, high-contrast numbers — accessible to low-literacy users. |
| **Modals** | Must close on backdrop click. |
| **Responsiveness** | Mobile-first. Works on mobile, tablet, and desktop. |
| **State** | Server state via TanStack Query. UI/POS state via Zustand. |
| **Feedback** | Toast notifications via Sonner. Optimistic updates where appropriate. |
