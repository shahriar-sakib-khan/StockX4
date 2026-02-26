# Anti-Gravity MERN Starter 🚀

A high-performance, feature-rich **Modular Monolith MERN Stack Boilerplate** designed for scalability, security, and developer experience. Built with **Turborepo** for monorepo management.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)

## ✨ Features

- **🛡️ Advanced Authentication**: Secure JWT-based auth with HttpOnly cookies, refresh token rotation, and Argon2 password hashing.
- **bust Role-Based Access Control (RBAC)**: Built-in `admin` and `user` roles with middleware protection.
- **🏗️ Modular Monolith Architecture**: Clean separation of concerns with feature-based directory structure (`src/features/`).
- **📱 Modern UI/UX**: Built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. Includes a sleek Landing Page and Admin Dashboard.
- **📂 File Uploads**: Integrated **Cloudinary** support with `multer` for seamless profile picture uploads.
- **🔒 Security First**: Helmet, CORS, Rate Limiting, and Zod validation for all inputs.
- **🔎 Logging & Monitoring**: Structured logging with `Winston` and request logging with `Morgan`.
- **🧪 Testing Ready**: Configured with **Vitest** for backend testing and **Bruno** for API documentation.

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS + clsx + tailwind-merge
- **State Management**: Zustand (Global) + TanStack Query (Server)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM v7

### Backend (`apps/api`)
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Validation**: Zod
- **Auth**: JWT + Argon2

### DevOps & Tooling
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm (`npm i -g pnpm`)
- MongoDB (Local or Atlas)
- Cloudinary Account (for file uploads)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shahriar-sakib-khan/anti-gravity-mern-starter.git
    cd anti-gravity-mern-starter
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    - Copy `.env.example` to `.env` in `apps/api/`:
      ```bash
      cp apps/api/.env.example apps/api/.env
      ```
    - Fill in your secrets (MONGO_URI, JWT_SECRET, CLOUDINARY_URL, etc.).

4.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    - **Frontend**: http://localhost:5173
    - **Backend**: http://localhost:3001

## 🧪 Testing & API Docs

- **Run Tests**:
  ```bash
  pnpm test
  ```
- **API Documentation**:
  Import the `docs/bruno` folder into [Bruno](https://www.usebruno.com/) to explore and test all API endpoints interactively.

## 🧠 Documentation & Antigravity Workflow

This project is built with the **Antigravity Protocol**—an "Agent-First" development philosophy. The `docs/` directory acts as the **Context Window** for both human developers and AI Agents.

### 📂 Key Documentation
*   **[`docs/INITIATION.md`](docs/INITIATION.md)**: **START HERE**. Contains the "Perfect Prompt" to initialize your AI Agent.
*   **[`docs/rules/workflows.md`](docs/rules/workflows.md)**: Procedures for running, testing, and adding features.
*   **[`docs/content/architecture.md`](docs/content/architecture.md)**: The System Model (Multi-Tenancy, Auth, Data Flow).
*   **[`docs/rules/conventions.md`](docs/rules/conventions.md)**: Strict coding standards and patterns.

### 🤖 How to "Prime" Your AI Agent
To get the best results:
1.  Open `docs/INITIATION.md`.
2.  Copy the code block under **The "Initiation" Prompt**.
3.  Paste it into your AI chat (Cursor, Windsurf, ChatGPT).
4.  The agent will then read the necessary context files automatically.

## 📂 Project Structure

```
├── apps/
│   ├── api/          # Express Backend
│   └── web/          # React Frontend
├── packages/
│   ├── eslint-config # Shared ESLint Config
│   └── typescript-config # Shared TS Config
├── docs/             # Documentation & Protocols
└── package.json      # Root Dependencies
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Shahriar Khan Sakib**
- Email: shahriarsakib.khan@gmail.com
- GitHub: [@shahriar-sakib-khan](https://github.com/shahriar-sakib-khan)
