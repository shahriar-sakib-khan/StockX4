# Technology Stack

## Frontend (`apps/web`)
*   **Core**: React 18, TypeScript, Vite.
*   **State**: Zustand (Global), TanStack Query (Server).
*   **Network**: Ky (HTTP Client).
*   **Routing**: React Router DOM (v6+).
*   **Styling**: TailwindCSS, PostCSS, Autoprefixer, clsx, tailwind-merge.
*   **UI Components**: Lucide React (Icons), Sonner (Toasts), @radix-ui/react-slot, react-qr-code.
*   **Forms**: React Hook Form, @hookform/resolvers, Zod.

## Backend (`apps/api`)
*   **Core**: Node.js, Express.js.
*   **Database**: MongoDB, Mongoose ODM.
*   **Build/Dev**: tsup (Bundler), ts-node-dev (Hot Reload), ts-node.
*   **Auth**: JSON Web Tokens (JWT), Argon2, Cookie-Parser, Helmet, Cors.
*   **File Storage**: Cloudinary, Multer.
*   **Data Validation**: Zod.
*   **Logging**: Winston (Logger), Morgan (HTTP).
*   **Utils**: Dotenv.

## Infrastructure & Testing
*   **Monorepo**: Turborepo, pnpm workspaces.
*   **Shared**: `@repo/shared` (TypeScript/Zod schemas).
*   **Code Quality**: ESLint, Prettier.
*   **Testing**: Vitest (Runner), Supertest (HTTP), MongoDB Memory Server.
*   **API Client**: Bruno (Collection in `apps/api/bruno/AG-MERN`).
