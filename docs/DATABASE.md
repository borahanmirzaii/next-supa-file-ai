# Database Schema Documentation

This document describes the complete database schema for the Next.js Supabase File AI Platform.

## Overview

The database uses PostgreSQL (via Supabase) with the following key features:
- **pgvector extension** - Vector similarity search for knowledge base
- **Row Level Security (RLS)** - Data isolation per user
- **Timestamps** - Automatic created_at/updated_at tracking
- **UUIDs** - Primary keys for all tables
- **JSONB** - Flexible metadata storage

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Managed by Supabase Auth)
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       1:N      ┌─────────────────┐
│     files       │◄────────────────┤    analysis     │
└────────┬────────┘                 └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ knowledge_base  │
└─────────────────┘

┌─────────────────┐       1:N      ┌─────────────────┐
│ integrations    │◄────────────────┤   mcp_tools     │
└─────────────────┘                 └─────────────────┘
         ▲
         │ N:1
         │
┌─────────────────┐
│   auth.users    │
└─────────────────┘
```

## Tables

### 1. files

Stores metadata about uploaded files.

```sql
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_name text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_mime_type ON files(mime_type);

-- Triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Columns:**
- `id` - Unique identifier (UUID)
- `user_id` - Owner of the file (foreign key to auth.users)
- `name` - Display name of the file
- `original_name` - Original filename from upload
- `size` - File size in bytes
- `mime_type` - MIME type (e.g., 'application/pdf', 'image/jpeg')
- `storage_path` - Path in Supabase Storage (format: `{user_id}/{file_id}/{filename}`)
- `metadata` - Additional metadata (width/height for images, page count for PDFs, etc.)
- `status` - Processing status
- `created_at` - Upload timestamp
- `updated_at` - Last modification timestamp

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Project Proposal.pdf",
  "original_name": "proposal_final_v3.pdf",
  "size": 2457600,
  "mime_type": "application/pdf",
  "storage_path": "123e4567-e89b-12d3-a456-426614174000/550e8400-e29b-41d4-a716-446655440000/proposal.pdf",
  "metadata": {
    "pages": 15,
    "author": "John Doe",
    "created_date": "2024-01-15"
  },
  "status": "completed",
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T10:35:00Z"
}
```

### 2. analysis

Stores AI analysis results for files.

```sql
CREATE TABLE analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result jsonb,
  insights jsonb,
  error_message text,
  processing_time_ms integer,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Indexes
CREATE INDEX idx_analysis_file_id ON analysis(file_id);
CREATE INDEX idx_analysis_status ON analysis(status);
CREATE INDEX idx_analysis_created_at ON analysis(created_at DESC);

-- Unique constraint: one analysis per file
CREATE UNIQUE INDEX idx_analysis_file_id_unique ON analysis(file_id) WHERE status = 'completed';
```

**Columns:**
- `id` - Unique identifier
- `file_id` - Reference to analyzed file
- `agent_type` - Type of AI agent used ('document', 'image', 'code', 'data')
- `status` - Processing status
- `result` - Raw analysis results from AI
- `insights` - Extracted insights (summary, topics, entities, etc.)
- `error_message` - Error details if failed
- `processing_time_ms` - Analysis duration
- `tokens_used` - API tokens consumed
- `created_at` - Analysis start time
- `completed_at` - Analysis completion time

**Example Row:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "agent_type": "document",
  "status": "completed",
  "result": {
    "raw_text": "...",
    "structure": "..."
  },
  "insights": {
    "summary": "Project proposal for new mobile app development...",
    "topics": ["mobile development", "budget planning", "timeline"],
    "entities": {
      "people": ["John Doe", "Jane Smith"],
      "organizations": ["Acme Corp"],
      "dates": ["Q1 2024", "March 15"]
    },
    "sentiment": "positive",
    "key_points": [
      "Budget: $150,000",
      "Duration: 6 months",
      "Team size: 5 developers"
    ]
  },
  "processing_time_ms": 3450,
  "tokens_used": 12500,
  "created_at": "2024-01-20T10:30:05Z",
  "completed_at": "2024-01-20T10:30:08Z"
}
```

### 3. knowledge_base

Stores vector embeddings for semantic search and RAG.

```sql
CREATE TABLE knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(768), -- Gemini embedding dimension
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_kb_user_id ON knowledge_base(user_id);
CREATE INDEX idx_kb_file_id ON knowledge_base(file_id);
CREATE INDEX idx_kb_created_at ON knowledge_base(created_at DESC);

-- Vector similarity index (HNSW for fast approximate search)
CREATE INDEX idx_kb_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Unique constraint: prevent duplicate chunks
CREATE UNIQUE INDEX idx_kb_file_chunk ON knowledge_base(file_id, chunk_index);
```

**Columns:**
- `id` - Unique identifier
- `user_id` - Owner (for RLS)
- `file_id` - Source file reference
- `chunk_index` - Order of chunk within file (0-based)
- `content` - Text content of chunk
- `embedding` - Vector embedding (768 dimensions for Gemini)
- `metadata` - Additional context (page number, section, etc.)
- `created_at` - Index timestamp

**Example Row:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "chunk_index": 0,
  "content": "Executive Summary: This proposal outlines the development of a mobile application...",
  "embedding": [0.023, -0.145, 0.089, ...], // 768 floats
  "metadata": {
    "page": 1,
    "section": "Executive Summary",
    "word_count": 250
  },
  "created_at": "2024-01-20T10:30:10Z"
}
```

### 4. integrations

Stores external platform connections (Google, Notion, Jira, etc.).

```sql
CREATE TABLE integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('google', 'notion', 'jira', 'slack', 'github')),
  credentials jsonb NOT NULL, -- Encrypted in app layer
  settings jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_integrations_status ON integrations(status);

-- Unique constraint: one integration per platform per user
CREATE UNIQUE INDEX idx_integrations_user_platform ON integrations(user_id, platform);

-- Triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Columns:**
- `id` - Unique identifier
- `user_id` - Owner
- `platform` - Platform name
- `credentials` - Encrypted OAuth tokens/API keys
- `settings` - Platform-specific settings
- `status` - Connection status
- `last_sync_at` - Last successful sync
- `error_message` - Latest error if any
- `created_at` - Connection timestamp
- `updated_at` - Last modification

**Example Row:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "platform": "google",
  "credentials": {
    "access_token": "encrypted_token_here",
    "refresh_token": "encrypted_refresh_token_here",
    "expires_at": "2024-01-21T10:30:00Z"
  },
  "settings": {
    "enabled_services": ["gmail", "drive", "docs"],
    "auto_sync": true
  },
  "status": "active",
  "last_sync_at": "2024-01-20T09:00:00Z",
  "created_at": "2024-01-15T14:20:00Z",
  "updated_at": "2024-01-20T09:00:00Z"
}
```

### 5. mcp_tools

Stores available MCP tools from connected platforms.

```sql
CREATE TABLE mcp_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  description text,
  input_schema jsonb NOT NULL,
  category text,
  enabled boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mcp_tools_integration_id ON mcp_tools(integration_id);
CREATE INDEX idx_mcp_tools_enabled ON mcp_tools(enabled);
CREATE INDEX idx_mcp_tools_category ON mcp_tools(category);

-- Unique constraint
CREATE UNIQUE INDEX idx_mcp_tools_integration_name ON mcp_tools(integration_id, tool_name);

-- Triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON mcp_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Columns:**
- `id` - Unique identifier
- `integration_id` - Parent integration
- `tool_name` - MCP tool name
- `description` - Tool description
- `input_schema` - JSON Schema for tool inputs
- `category` - Tool category (email, document, calendar, etc.)
- `enabled` - Whether tool is active
- `usage_count` - Number of times used
- `last_used_at` - Last execution time
- `created_at` - Tool registration time
- `updated_at` - Last modification

**Example Row:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "integration_id": "880e8400-e29b-41d4-a716-446655440003",
  "tool_name": "gmail_send",
  "description": "Send an email via Gmail",
  "input_schema": {
    "type": "object",
    "properties": {
      "to": {"type": "string", "format": "email"},
      "subject": {"type": "string"},
      "body": {"type": "string"}
    },
    "required": ["to", "subject", "body"]
  },
  "category": "email",
  "enabled": true,
  "usage_count": 42,
  "last_used_at": "2024-01-20T08:15:00Z",
  "created_at": "2024-01-15T14:25:00Z",
  "updated_at": "2024-01-20T08:15:00Z"
}
```

### 6. tool_executions (Optional - for logging)

Logs MCP tool executions for audit trail.

```sql
CREATE TABLE tool_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES mcp_tools(id) ON DELETE CASCADE,
  input jsonb NOT NULL,
  output jsonb,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  error_message text,
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tool_executions_user_id ON tool_executions(user_id);
CREATE INDEX idx_tool_executions_tool_id ON tool_executions(tool_id);
CREATE INDEX idx_tool_executions_created_at ON tool_executions(created_at DESC);
CREATE INDEX idx_tool_executions_status ON tool_executions(status);
```

## Helper Functions

### update_updated_at()

Automatically updates the `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### files table

```sql
-- SELECT: Users can only see their own files
CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert files for themselves
CREATE POLICY "Users can insert own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own files
CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own files
CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);
```

#### analysis table

```sql
-- SELECT: Users can see analysis of their files
CREATE POLICY "Users can view analysis of own files"
  ON analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = analysis.file_id
      AND files.user_id = auth.uid()
    )
  );

-- INSERT: Service role only (handled by backend)
CREATE POLICY "Service role can insert analysis"
  ON analysis FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- UPDATE: Service role only
CREATE POLICY "Service role can update analysis"
  ON analysis FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');
```

#### knowledge_base table

```sql
-- SELECT: Users can only see their own knowledge base
CREATE POLICY "Users can view own knowledge base"
  ON knowledge_base FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Service role only
CREATE POLICY "Service role can insert knowledge base"
  ON knowledge_base FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- DELETE: Users can delete their knowledge base entries
CREATE POLICY "Users can delete own knowledge base"
  ON knowledge_base FOR DELETE
  USING (auth.uid() = user_id);
```

#### integrations table

```sql
-- SELECT: Users can only see their own integrations
CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create their own integrations
CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own integrations
CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can delete their own integrations
CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);
```

#### mcp_tools table

```sql
-- SELECT: Users can see tools from their integrations
CREATE POLICY "Users can view tools from own integrations"
  ON mcp_tools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integrations
      WHERE integrations.id = mcp_tools.integration_id
      AND integrations.user_id = auth.uid()
    )
  );

-- Other operations: Service role only
CREATE POLICY "Service role can manage mcp_tools"
  ON mcp_tools FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

## Vector Search Queries

### Semantic Search Example

```sql
-- Find similar content to a query
SELECT
  kb.id,
  kb.content,
  kb.metadata,
  f.name as file_name,
  1 - (kb.embedding <=> $1::vector) as similarity
FROM knowledge_base kb
JOIN files f ON f.id = kb.file_id
WHERE kb.user_id = $2
ORDER BY kb.embedding <=> $1::vector
LIMIT 10;
```

### RAG Context Retrieval

```sql
-- Get top 5 most relevant chunks for RAG
SELECT
  content,
  metadata,
  1 - (embedding <=> $1::vector) as similarity
FROM knowledge_base
WHERE user_id = $2
  AND 1 - (embedding <=> $1::vector) > 0.7 -- similarity threshold
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

## Database Migrations

### Migration File Structure

```
supabase/migrations/
├── 001_initial_schema.sql       # Enable extensions, create functions
├── 002_files_table.sql          # Files table and policies
├── 003_analysis_table.sql       # Analysis table and policies
├── 004_knowledge_base.sql       # Knowledge base table and policies
├── 005_integrations_tables.sql  # Integrations and MCP tools
└── 006_tool_executions.sql      # Tool execution logging
```

## Backup Strategy

### Automated Backups (Supabase)
- Daily automatic backups (included in Supabase)
- Point-in-time recovery available

### Manual Backup

```bash
# Dump entire database
pg_dump $DATABASE_URL > backup.sql

# Dump specific table
pg_dump $DATABASE_URL -t files > files_backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Performance Optimization

### Vacuum and Analyze

```sql
-- Regular maintenance
VACUUM ANALYZE files;
VACUUM ANALYZE analysis;
VACUUM ANALYZE knowledge_base;
```

### Index Monitoring

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

### Query Performance

```sql
-- Explain analyze for slow queries
EXPLAIN ANALYZE
SELECT * FROM knowledge_base
WHERE embedding <=> $1::vector < 0.5
LIMIT 10;
```

---

This database schema provides a solid foundation for file storage, AI analysis, vector search, and platform integrations while maintaining security and performance.
