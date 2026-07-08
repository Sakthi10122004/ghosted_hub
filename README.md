# Ghosted Hub

Ghosted Hub is the operating system for the Ghosted Program (Tech4Good Community). It serves as a centralized Project Lifecycle Management Platform for non-profits, student teams, and program organizers.

## Architecture

This project is a monorepo managed by [Turborepo](https://turbo.build/repo), consisting of the following core applications and packages:

### Apps
- **`web`**: The Next.js frontend application (React, TailwindCSS, React Query).
- **`api`**: The NestJS backend application providing REST endpoints.

### Packages
- **`database`**: The Prisma ORM schema and client.
- **`shared`**: Shared TypeScript types, constants, and validation schemas (Zod) used by both the API and Web.
- **`ui`**: Shared UI components.
- **`config`**: Shared configurations for ESLint, TypeScript, etc.

## Getting Started

### Prerequisites
- Node.js (v24+)
- pnpm (v9+)
- PostgreSQL

### Installation

1. Install dependencies at the root of the repository:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` in the root and fill in the necessary values (like `DATABASE_URL`).

3. Run database migrations:
   ```bash
   cd packages/database
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

### Running Development Server

To run the frontend and backend concurrently, run from the root:
```bash
pnpm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
