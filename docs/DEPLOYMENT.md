# Deployment Guide

## Prerequisites

- Vercel account (or your hosting provider)
- Supabase production project
- Redis instance (Upstash, Redis Cloud, or self-hosted)
- Domain name (optional)

## Environment Variables

Create `.env.production` with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Redis
REDIS_URL=your_redis_url

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# OAuth (if using)
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
NOTION_OAUTH_CLIENT_ID=your_client_id
NOTION_OAUTH_CLIENT_SECRET=your_client_secret
GITHUB_OAUTH_CLIENT_ID=your_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_client_secret
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
vercel link
```

### 4. Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.production`
3. Set for Production environment

### 5. Deploy

```bash
vercel --prod
```

## Supabase Setup

### 1. Create Production Project

1. Go to https://supabase.com
2. Create new project
3. Note down URL and keys

### 2. Run Migrations

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create bucket: `user-files`
3. Set to private
4. Configure policies

### 4. Enable Extensions

In Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

## Redis Setup

### Option 1: Upstash (Recommended)

1. Create account at https://upstash.com
2. Create Redis database
3. Copy REST URL and token
4. Set `REDIS_URL` in environment variables

### Option 2: Redis Cloud

1. Create account at https://redis.com
2. Create database
3. Copy connection string
4. Set `REDIS_URL` in environment variables

## Post-Deployment

### 1. Verify Health

```bash
curl https://your-domain.com/api/health
```

### 2. Test Critical Flows

- User signup/login
- File upload
- AI analysis
- Knowledge base chat

### 3. Monitor

- Check Vercel logs
- Monitor Supabase dashboard
- Check error tracking (Sentry)
- Review performance metrics

## Troubleshooting

### Build Fails

- Check environment variables
- Verify Node.js version (18+)
- Check build logs

### Database Connection Issues

- Verify Supabase URL and keys
- Check network connectivity
- Review RLS policies

### Redis Connection Issues

- Verify Redis URL
- Check Redis instance status
- Review firewall rules

## Rollback

If deployment fails:

```bash
vercel rollback
```

Or revert to previous deployment in Vercel dashboard.

