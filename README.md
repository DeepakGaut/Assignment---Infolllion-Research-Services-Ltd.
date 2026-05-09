# Assignment — Infolllion Research Services Ltd.

A modern, full-stack web application built as an assignment for **Infolllion Research Services Ltd.** The project is built with [TanStack Start](https://tanstack.com/start), React 19, TypeScript, and Tailwind CSS v4, and is designed for deployment on Cloudflare Workers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Component Library | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Data Fetching | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod |
| Data Visualisation | Recharts, ReactFlow |
| Build Tool | Vite 7 |
| Deployment | Cloudflare Workers (via Wrangler) |
| Package Manager | Bun |

---

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (if not using Bun exclusively)
- A [Cloudflare](https://cloudflare.com/) account (for deployment)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DeepakGaut/Assignment---Infolllion-Research-Services-Ltd.
cd Assignment---Infolllion-Research-Services-Ltd.
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the development server

```bash
bun run dev
```

The app will be available at `http://localhost:5173` by default.

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the local development server |
| `bun run build` | Build the app for production |
| `bun run build:dev` | Build in development mode |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint across the project |
| `bun run format` | Format all files with Prettier |

---

## Project Structure

```
├── src/                  # Application source code
│   ├── routes/           # File-based routes (TanStack Router)
│   ├── components/       # Reusable UI components
│   └── ...
├── components.json       # shadcn/ui configuration
├── vite.config.ts        # Vite configuration
├── wrangler.jsonc        # Cloudflare Workers configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

---

## Deployment

This project is configured for deployment to **Cloudflare Workers** using [Wrangler](https://developers.cloudflare.com/workers/wrangler/).

### Build and deploy

```bash
bun run build
bunx wrangler deploy
```

Make sure you are logged in to Cloudflare CLI before deploying:

```bash
bunx wrangler login
```

---

## Key Dependencies

- **TanStack Router** — type-safe, file-based routing for React
- **TanStack Query** — powerful async state management and data fetching
- **Radix UI** — accessible, unstyled primitive components
- **React Hook Form + Zod** — performant form handling with schema validation
- **ReactFlow** — interactive node-based graph/flow diagrams
- **Recharts** — composable charting library built on D3
- **Lucide React** — consistent icon set
- **Sonner** — toast notifications
- **date-fns** — modern date utility library

---

## Author

**Deepak Gaut**
[GitHub Profile](https://github.com/DeepakGaut)

---

## License

This project was created as an assignment submission for Infolllion Research Services Ltd. and is not intended for commercial use.
