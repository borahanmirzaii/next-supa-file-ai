# 🚀 Quick Start Guide

## ✅ Current Status

Your Supabase is running locally! Here's what you need to do next:

### 1. Apply Database Migrations

Open Supabase Studio: **http://127.0.0.1:54323**

1. Go to **SQL Editor**
2. Copy and paste each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_files_table.sql`
   - `supabase/migrations/003_analysis_table.sql`
   - `supabase/migrations/004_knowledge_base.sql`
   - `supabase/migrations/005_integrations.sql`
3. Click **Run** for each one

**OR** use command line:

```bash
# Apply all migrations
for file in supabase/migrations/*.sql; do
  psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f "$file"
done
```

### 2. Create Storage Bucket

In Supabase Studio (http://127.0.0.1:54323):

1. Go to **Storage** → **Buckets**
2. Click **New bucket**
3. Name: `user-files`
4. Public: **No** (unchecked)
5. Click **Create**

**OR** run SQL in Studio:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('user-files', 'user-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;
```

### 3. Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 4. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### 5. Start Development Server

```bash
pnpm run dev
```

Visit: **http://localhost:3000**

## 🎯 Verify Setup

1. **Check Database**: http://127.0.0.1:54323 → Tables should show: `files`, `analysis`, `knowledge_base`, `integrations`
2. **Check Storage**: http://127.0.0.1:54323 → Storage → Buckets → Should see `user-files`
3. **Test App**: http://localhost:3000 → Sign up → Upload a file

## 📝 Your Local Credentials

```
API URL: http://127.0.0.1:54321
Studio: http://127.0.0.1:54323
Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 🐛 Troubleshooting

**Migrations failed?**
- Check Supabase Studio → SQL Editor → View errors
- Ensure pgvector extension is enabled

**Storage bucket not found?**
- Create manually via Studio UI
- Or run the SQL INSERT statement above

**pnpm install errors?**
- Try: `pnpm install --no-frozen-lockfile`
- Or: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

## ✨ You're Ready!

Once migrations are applied and storage bucket is created, you can start developing! 🎉

