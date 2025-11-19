# Setup & Installation Guide

This guide will walk you through setting up the Next.js Supabase File AI Platform from scratch.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- Supabase account (free tier works)
- Google Cloud account (for Gemini API)
- GitHub account (for OAuth, optional)

## Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd next-supa-file-ai
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Client
- Vercel AI SDK
- MCP SDK
- shadcn/ui components
- And all other dependencies

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `file-ai-platform`
   - Database password: (generate strong password)
   - Region: (closest to you)
4. Wait for project to be created (2-3 minutes)

### 3.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy these values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3.3 Install Supabase CLI (Optional but Recommended)

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### 3.4 Link Local Project to Supabase

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

Get your project ref from Supabase dashboard URL: `https://app.supabase.com/project/<project-ref>`

### 3.5 Enable pgvector Extension

1. Go to Supabase Dashboard → Database → Extensions
2. Search for "vector"
3. Enable `vector` extension

Or via SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 4: Google Gemini API Setup

### 4.1 Create Google Cloud Project

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the API key → `GOOGLE_GENERATIVE_AI_API_KEY`

### 4.2 (Optional) Enable Additional Google APIs

For Google Workspace MCP integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Gmail API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
3. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID → `MCP_GOOGLE_CLIENT_ID`
   - Copy Client Secret → `MCP_GOOGLE_CLIENT_SECRET`

## Step 5: Environment Variables

Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# MCP - Google Workspace (Optional)
MCP_GOOGLE_CLIENT_ID=your-google-client-id
MCP_GOOGLE_CLIENT_SECRET=your-google-client-secret

# MCP - Notion (Optional)
MCP_NOTION_API_KEY=your-notion-api-key

# MCP - Jira (Optional)
MCP_JIRA_API_TOKEN=your-jira-api-token
MCP_JIRA_DOMAIN=your-domain.atlassian.net
MCP_JIRA_EMAIL=your-email@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 6: Database Schema Setup

### 6.1 Run Migrations

Option A: Using Supabase CLI (Recommended)

```bash
# Initialize Supabase in your project
npx supabase init

# Run migrations
npx supabase db push
```

Option B: Manual SQL Execution

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of each migration file from `supabase/migrations/`
3. Execute in order:
   - `001_initial_schema.sql`
   - `002_files_table.sql`
   - `003_analysis_table.sql`
   - `004_knowledge_base.sql`

### 6.2 Setup Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create a new bucket:
   - Name: `files`
   - Public: No
   - File size limit: 52428800 (50MB)
   - Allowed MIME types: (leave empty for all)

3. Add storage policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 7: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Select:
- TypeScript: Yes
- Style: Default
- Base color: Slate
- CSS variables: Yes
- React Server Components: Yes
- Tailwind config location: tailwind.config.ts
- Components location: src/components
- Utils location: src/lib/utils
- Use aliases: Yes (@/*)

Install initial components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add separator
```

## Step 8: MCP Servers Setup (Optional)

### 8.1 Build MCP Servers

```bash
cd mcp-servers
npm install
npm run build
```

### 8.2 Test MCP Servers

```bash
# Test Google MCP server
node dist/google/index.js

# Test Notion MCP server
node dist/notion/index.js

# Test Jira MCP server
node dist/jira/index.js
```

## Step 9: Run Development Server

```bash
# Return to root directory
cd ..

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 10: Verify Setup

### 10.1 Check Database Connection

Create a test file: `scripts/test-db.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('files')
    .select('count');

  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Database connection successful!');
  }
}

testConnection();
```

Run:
```bash
npx tsx scripts/test-db.ts
```

### 10.2 Check Gemini API

Create a test file: `scripts/test-gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

async function testGemini() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent('Say hello!');
  console.log('Gemini response:', result.response.text());
}

testGemini();
```

Run:
```bash
npx tsx scripts/test-gemini.ts
```

## Troubleshooting

### Issue: Supabase connection fails

**Solution:**
- Check `.env.local` has correct credentials
- Verify network connection
- Check Supabase project is active (not paused)

### Issue: pgvector extension not found

**Solution:**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Storage bucket access denied

**Solution:**
- Verify RLS policies are set up correctly
- Check user is authenticated
- Verify bucket name matches in code

### Issue: Gemini API key invalid

**Solution:**
- Generate new API key from Google AI Studio
- Check for extra spaces in `.env.local`
- Restart development server after changing env vars

### Issue: shadcn components not found

**Solution:**
```bash
# Reinstall components
npx shadcn@latest add <component-name>
```

### Issue: MCP servers won't start

**Solution:**
```bash
# Rebuild MCP servers
cd mcp-servers
rm -rf dist
npm run build

# Check for TypeScript errors
npm run type-check
```

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- Better Comments
- Import Cost
- Thunder Client (API testing)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
2. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for coding guidelines
3. Read [DATABASE.md](./DATABASE.md) for database schema details
4. Read [MCP-INTEGRATION.md](./MCP-INTEGRATION.md) for MCP setup
5. Start building! Begin with Phase 1 (Foundation)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [MCP Documentation](https://modelcontextprotocol.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Need help? Open an issue or check the discussions section.
