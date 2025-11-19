# 🏠 Local Development - Quick Start

## One-Command Setup

```bash
pnpm local:setup
```

This will:
- ✅ Install all dependencies
- ✅ Start Supabase locally
- ✅ Apply database migrations
- ✅ Start Redis via OrbStack
- ✅ Create `.env.local` with Gemini API key

## Manual Steps After Setup

### 1. Create Storage Bucket

Open **Supabase Studio**: http://127.0.0.1:54323

1. Go to **Storage** → **Buckets**
2. Click **New bucket**
3. Name: `user-files`
4. Public: **No** (unchecked)
5. Click **Create**

### 2. Start Development Server

```bash
pnpm dev
```

Visit: **http://localhost:3000**

## Service Management

```bash
# Start all services (Supabase + Redis)
pnpm local:start

# Stop all services
pnpm local:stop

# Check status
supabase status
docker ps | grep redis
```

## Your Local Stack

- **Next.js**: http://localhost:3000
- **Supabase API**: http://127.0.0.1:54321
- **Supabase Studio**: http://127.0.0.1:54323
- **Redis**: localhost:6379

## Environment Variables

Your `.env.local` is configured with:
- ✅ Local Supabase credentials
- ✅ Google Gemini API key
- ✅ Redis URL

## Troubleshooting

**Port conflicts?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Supabase not starting?**
```bash
supabase stop
supabase start
```

**Redis not running?**
```bash
docker-compose -f docker-compose.local.yml up -d redis
```

## Next Steps

1. ✅ Run `pnpm local:setup`
2. ✅ Create storage bucket
3. ✅ Run `pnpm dev`
4. ✅ Test file upload
5. ✅ Test AI analysis
6. ✅ Test knowledge base chat

**You're ready to develop!** 🚀

