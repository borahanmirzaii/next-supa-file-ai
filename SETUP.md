# 🚀 Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Google AI (Gemini) API key
- OAuth credentials for platforms you want to integrate (optional)

## Step 1: Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

## Step 2: Setup Supabase

1. Create a new project at https://supabase.com

2. Run migrations:
   - Go to SQL Editor in Supabase Dashboard
   - Copy SQL files from `supabase/migrations/` 
   - Execute them in order: 001, 002, 003, 004, 005

3. Enable pgvector extension:
   - Go to Database → Extensions
   - Search for "pgvector" and enable it

4. Create storage bucket named `user-files`:
   - Go to Storage → Create bucket
   - Name: `user-files`
   - Public: No
   - Enable RLS policies

5. Get your Supabase credentials:
   - Project URL: Settings → API → Project URL
   - Anon key: Settings → API → Project API keys → anon/public
   - Service role key: Settings → API → Project API keys → service_role

## Step 3: Configure Environment

```bash
cp .env.example .env.local
```

Fill in all required values in `.env.local`:

### Required Variables

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### Optional: OAuth for MCP Integrations

```bash
# Google Workspace OAuth
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret

# Notion OAuth
NOTION_OAUTH_CLIENT_ID=your_notion_client_id
NOTION_OAUTH_CLIENT_SECRET=your_notion_client_secret

# GitHub OAuth
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
```

## Step 4: Setup OAuth (Optional)

### Google Workspace

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Add authorized redirect URI: `http://localhost:3000/api/oauth/callback/google`
5. Enable APIs:
   - Gmail API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
6. Copy Client ID and Client Secret to `.env.local`

### Notion

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Choose "Public integration" or "Internal integration"
4. Copy OAuth Client ID and Client Secret
5. Add redirect URI: `http://localhost:3000/api/oauth/callback/notion`
6. Add credentials to `.env.local`

### GitHub

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Application name: Your app name
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/oauth/callback/github`
6. Copy Client ID and Client Secret to `.env.local`

## Step 5: Run Development Server

```bash
pnpm run dev
```

Visit http://localhost:3000

## Step 6: First-Time Usage

1. **Sign up / Sign in**
   - Create an account or sign in with email

2. **Upload Files**
   - Go to Files → Upload a document
   - Drag and drop files or click to browse
   - Wait for analysis to complete

3. **Knowledge Base**
   - Go to Knowledge Base → Chat with your files
   - Ask questions about your uploaded documents
   - Use semantic search to find specific information

4. **Integrations** (Optional)
   - Go to Integrations → Connect platforms
   - Click "Connect" on a platform
   - Authorize the OAuth flow
   - Browse and execute available tools

## Troubleshooting

### Database errors
- Verify migrations ran successfully in Supabase SQL Editor
- Check that pgvector extension is enabled
- Ensure RLS policies are set up correctly

### Upload fails
- Check Supabase storage bucket configuration
- Verify bucket name is exactly `user-files`
- Check RLS policies allow user uploads

### OAuth errors
- Verify redirect URIs match exactly (including http/https)
- Check OAuth credentials are correct
- Ensure OAuth apps are configured with correct scopes

### MCP connection fails
- Verify integration credentials are saved correctly
- Check MCP server implementations are available
- Review error messages in integration status

### AI analysis fails
- Verify Google Gemini API key is valid
- Check API quota limits
- Review file size limits (some files may be too large)

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - Copy all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production domain
   - Update OAuth redirect URIs to production URLs
4. Deploy

### Environment Variables for Production

Update OAuth redirect URIs:
- Google: `https://yourdomain.com/api/oauth/callback/google`
- Notion: `https://yourdomain.com/api/oauth/callback/notion`
- GitHub: `https://yourdomain.com/api/oauth/callback/github`

### Supabase Production Setup

1. Create production Supabase project
2. Run all migrations
3. Update environment variables
4. Configure production storage bucket
5. Set up production RLS policies

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review error logs in browser console
3. Check Supabase logs in dashboard
4. Verify all environment variables are set correctly
