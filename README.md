# Next.js Supabase File AI Platform

> AI-powered file analysis platform with drag-and-drop upload, knowledge base creation, and MCP integration for seamless platform connectivity.

## Overview

A comprehensive Next.js application that allows users to upload files, analyze them using AI agents (Google Gemini), build a searchable knowledge base with vector embeddings, and integrate with external platforms (Google Workspace, Notion, Jira) via MCP (Model Context Protocol).

## Key Features

- **Drag & Drop File Upload**: Intuitive file upload with real-time progress tracking
- **AI-Powered Analysis**: Automatic file analysis using Google Gemini API with specialized agents
- **Knowledge Base**: Vector-based knowledge base with RAG (Retrieval Augmented Generation)
- **Chat Interface**: Query your uploaded files using natural language
- **MCP Integration**: Connect to external platforms (Google, Notion, Jira) for extended functionality
- **Real-time Updates**: Live progress tracking using Supabase Realtime
- **Secure Storage**: Files stored securely in Supabase Storage
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend & Database
- **Supabase** - Authentication, Database, Storage
- **PostgreSQL** - Database with pgvector extension
- **Supabase Realtime** - Real-time subscriptions

### AI & Machine Learning
- **Vercel AI SDK** - AI integration framework
- **Google Gemini API** - Large language model
- **pgvector** - Vector similarity search
- **Embeddings** - Text vectorization for knowledge base

### Integration
- **MCP SDK** - Model Context Protocol for platform integration
- **Custom MCP Servers** - Google, Notion, Jira connectors

### State Management
- **Zustand** - Global state management
- **React Query** - Server state management

## Project Structure

```
next-supa-file-ai/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes with shared layout
│   ├── actions/             # Server Actions
│   └── api/                 # API routes
├── components/              # React components
│   ├── analysis/           # AI analysis components
│   ├── auth/               # Authentication components
│   ├── files/              # File management components
│   ├── integrations/       # Platform integration components
│   ├── knowledge-base/     # Knowledge base & RAG components
│   ├── layout/             # Layout components (Sidebar)
│   └── ui/                 # shadcn/ui components
├── lib/                     # Core libraries
│   ├── ai/                 # AI functionality (agents, extractors)
│   ├── knowledge-base/     # Knowledge base utilities
│   ├── mcp/                # Model Context Protocol
│   ├── queue/              # Job queue (BullMQ)
│   ├── repositories/       # Data access layer
│   ├── supabase/           # Supabase clients & storage
│   └── utils/              # Utility functions
├── services/                # Business logic layer
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript definitions
├── supabase/                # Database migrations & config
└── docs/                    # Documentation

```

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd next-supa-file-ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run Supabase locally (optional)
npx supabase start

# Run migrations
npx supabase db push

# Start development server
npm run dev
```

Visit http://localhost:3000

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Setup & Installation](./docs/SETUP.md)
- [Database Schema](./docs/DATABASE.md)
- [MCP Integration Guide](./docs/MCP-INTEGRATION.md)
- [Development Guidelines](./docs/DEVELOPMENT.md)
- [API Reference](./docs/API.md)

## Environment Variables

Required environment variables (see `.env.example` for full list):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# MCP Integration
MCP_GOOGLE_CLIENT_ID=your_google_client_id
MCP_GOOGLE_CLIENT_SECRET=your_google_client_secret
MCP_NOTION_API_KEY=your_notion_api_key
MCP_JIRA_API_TOKEN=your_jira_api_token
```

## Key Design Patterns

- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic separation
- **Factory Pattern** - AI agent creation
- **Strategy Pattern** - File analysis strategies
- **Observer Pattern** - Real-time updates
- **Adapter Pattern** - MCP platform adapters

## Development Workflow

1. **File Upload** → Supabase Storage
2. **Analysis Trigger** → AI Agent Factory
3. **Gemini Processing** → Analysis Results
4. **Embedding Generation** → Vector Storage
5. **Knowledge Base** → RAG-powered Chat
6. **MCP Tools** → Platform Integration

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Setup
1. Add all environment variables in Vercel dashboard
2. Connect Supabase project
3. Enable Vercel AI SDK
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [./docs](./docs)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

## Roadmap

- [x] Architecture design
- [ ] Phase 1: Foundation & Authentication
- [ ] Phase 2: File Upload & Management
- [ ] Phase 3: AI Analysis Pipeline
- [ ] Phase 4: Knowledge Base & RAG
- [ ] Phase 5: MCP Integration
- [ ] Phase 6: Production Deployment

---

Built with Next.js, Supabase, Google Gemini, and MCP
