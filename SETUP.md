# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Gemini API key
- Redis (for BullMQ queue processing - optional for development)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_files_table.sql`
   - `supabase/migrations/003_analysis_table.sql`
   - `supabase/migrations/004_knowledge_base.sql`
   - `supabase/migrations/005_integrations.sql`

3. Create a storage bucket:
   - Go to Storage in Supabase dashboard
   - Create a bucket named `user-files`
   - Set it to private
   - Enable RLS policies

4. Get your Supabase credentials:
   - Project URL
   - Anon key
   - Service role key

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Your Google Gemini API key
- `REDIS_URL` - Redis connection string (optional, defaults to localhost)
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for dev)

## Step 4: Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Set Up Redis (Optional)

For production or async processing, set up Redis:

```bash
# Using Docker
docker run -d -p 6379:6379 redis

# Or use a cloud Redis service
```

Update `REDIS_URL` in `.env.local`

## Features

- ✅ File upload with drag & drop
- ✅ AI-powered file analysis using Gemini
- ✅ Knowledge base with vector search
- ✅ Chat interface with RAG
- ✅ MCP integrations (Notion, Jira, Google)
- ✅ Real-time file processing
- ✅ Secure authentication

## Next Steps

1. Sign up for an account
2. Upload your first file
3. Explore the knowledge base
4. Connect integrations

