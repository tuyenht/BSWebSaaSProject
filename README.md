# BSWeb SaaS

Unified Next.js application with public website and admin panel.

## Requirements

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Docker** and **Docker Compose** (optional, for PostgreSQL infrastructure if preferred)

## Development

### Local DB (SQLite, no Docker)

For local development, we use **SQLite** which requires no Docker or external database:

```bash
# 1. Copy .env.example to .env.local
cp .env.example .env.local

# 2. Verify database configuration
npm run env:check

# The default configuration uses SQLite:
# DB_PROVIDER=sqlite
# DATABASE_URL=file:./data/dev.sqlite

# 3. Database file will be created automatically in ./data/dev.sqlite
```

### Production DB (PostgreSQL on Linux)

For production deployment on Linux, we will use PostgreSQL. Configuration will be handled in a future step:

```bash
# Example production configuration (to be enabled later):
# DB_PROVIDER=postgres
# DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
```

Database migration from SQLite to PostgreSQL will be handled by Payload CMS integration.

### Optional: Docker Infrastructure (PostgreSQL + Redis)

If you prefer using Docker for local development:

```bash
# Start infrastructure services (PostgreSQL + Redis)
npm run infra:up

# Check logs
npm run infra:logs

# Stop infrastructure services
npm run infra:down
```

### Run Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Development server will start at `http://localhost:3000`

Routes:
- `/` - Public homepage
- `/admin/login` - Admin login (public)
- `/admin` - Admin dashboard (protected later)

## Production

```bash
# Build Next.js app and compile server
npm run build:all

# Start production server
npm run start
```

The server will start at `http://localhost:3000` (or the PORT specified in environment variables).

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `DB_PROVIDER` - Database provider: `sqlite` (local) or `postgres` (production)
- `DATABASE_URL` - Database connection string
  - SQLite: `file:./data/dev.sqlite`
  - PostgreSQL: `postgresql://USER:PASSWORD@HOST:5432/DBNAME`
- `SESSION_SECRET` - Session encryption secret
- `TENANT_DEFAULT_ID` - Default tenant ID (Phase 1)
- `SITE_DEFAULT_ID` - Default site ID (Phase 1)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Scripts

### Application
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run build:server` - Compile TypeScript server to JavaScript
- `npm run build:all` - Build both Next.js app and server
- `npm run start` - Start production server (requires build first)
- `npm run lint` - Run ESLint
- `npm run type-check` - Type-check TypeScript without emitting files

### Infrastructure (Optional - Docker)
- `npm run infra:up` - Start PostgreSQL and Redis (Docker Compose)
- `npm run infra:down` - Stop infrastructure services
- `npm run infra:logs` - View infrastructure logs

### Utilities
- `npm run env:check` - Print current DB_PROVIDER and DATABASE_URL from environment

## Architecture

- Single Next.js app (App Router)
- Custom Node server for production deployment (Linux/Docker ready)
- Public routes at `/`
- Admin routes at `/admin/*`
- Payload CMS integration (coming soon)

