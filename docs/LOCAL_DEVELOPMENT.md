# 🛠️ Local Development Guide

## Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Supabase Account** - [Sign up](https://supabase.com)
- **Google Gemini API Key** - [Get one](https://ai.google.dev/)
- **Docker/OrbStack** (Optional, for Redis)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd next-supa-file-ai

# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# Required:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - GOOGLE_GENERATIVE_AI_API_KEY
```

### 3. Supabase Setup

#### Option A: Cloud Supabase (Recommended)

1. Create project at [supabase.com](https://supabase.com)
2. Run migrations:
   - Go to SQL Editor
   - Copy and execute files from `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_files_table.sql`
     - `003_analysis_table.sql`
     - `004_knowledge_base.sql`
     - `005_integrations.sql`
3. Enable pgvector extension:
   - Database → Extensions → Search "pgvector" → Enable
4. Create storage bucket:
   - Storage → Create bucket → Name: `user-files` → Private

#### Option B: Local Supabase (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push

# Get local credentials
supabase status
```

### 4. Redis Setup (Optional - for async jobs)

#### Option A: Docker/OrbStack

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Using OrbStack
# Same command, OrbStack will handle it
```

#### Option B: Local Redis

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Development with Docker/OrbStack

### Using Docker Compose

```bash
# Development mode
docker-compose -f docker-compose.dev.yml up

# Production mode
docker-compose up
```

### Using OrbStack

OrbStack is a Docker alternative for macOS with better performance:

```bash
# Install OrbStack from https://orbstack.dev

# Use same Docker commands
docker-compose -f docker-compose.dev.yml up
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── actions/           # Server actions
├── components/            # React components
├── lib/                   # Utilities and libraries
├── hooks/                 # React hooks
├── types/                 # TypeScript types
├── supabase/              # Supabase config and migrations
└── e2e/                   # E2E tests
```

## Common Tasks

### Run Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# All tests
pnpm run test:all
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push
```

### Type Generation

```bash
# Generate Supabase types
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Supabase Connection Issues

- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Verify network connectivity

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env.local`
- For Docker: `docker ps` to verify container is running

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Environment Variables Reference

See `.env.local.example` for all available variables.

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run Supabase migrations
3. ✅ Start development server
4. ✅ Upload a test file
5. ✅ Test knowledge base chat
6. ✅ Connect an integration (optional)

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OrbStack Docs](https://docs.orbstack.dev)

