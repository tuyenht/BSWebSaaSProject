# BSWeb SaaS

Unified Next.js application with public website and admin panel.

## Requirements

- **Node.js** >= 18.x
- **npm** or **yarn**

## Development

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

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `TENANT_DEFAULT_ID` - Default tenant ID (Phase 1)
- `SITE_DEFAULT_ID` - Default site ID (Phase 1)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run build:server` - Compile TypeScript server to JavaScript
- `npm run build:all` - Build both Next.js app and server
- `npm run start` - Start production server (requires build first)
- `npm run lint` - Run ESLint
- `npm run type-check` - Type-check TypeScript without emitting files

## Architecture

- Single Next.js app (App Router)
- Custom Node server for production deployment (Linux/Docker ready)
- Public routes at `/`
- Admin routes at `/admin/*`
- Payload CMS integration (coming soon)

