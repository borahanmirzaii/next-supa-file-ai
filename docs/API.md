# API Reference

Complete API documentation for the Next.js Supabase File AI Platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-app.vercel.app/api
```

## Authentication

All API endpoints (except auth endpoints) require authentication via Supabase JWT token.

```bash
Authorization: Bearer <supabase-access-token>
```

## Endpoints

### Files

#### Upload File Metadata

Create a file record and get upload URL.

```http
POST /api/upload
```

**Request Body:**
```json
{
  "name": "document.pdf",
  "size": 2457600,
  "mime_type": "application/pdf"
}
```

**Response (201):**
```json
{
  "file": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "document.pdf",
    "size": 2457600,
    "mime_type": "application/pdf",
    "storage_path": "123e.../550e.../document.pdf",
    "status": "uploaded",
    "created_at": "2024-01-20T10:30:00Z"
  },
  "upload_url": "https://..."
}
```

#### List Files

Get user's files with pagination.

```http
GET /api/files?page=1&per_page=20
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (uploaded|processing|completed|failed)
- `mime_type` (optional): Filter by MIME type

**Response (200):**
```json
{
  "files": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "document.pdf",
      "size": 2457600,
      "mime_type": "application/pdf",
      "status": "completed",
      "created_at": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 20,
  "total_pages": 3
}
```

#### Get File Details

```http
GET /api/files/:id
```

**Response (200):**
```json
{
  "file": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "document.pdf",
    "size": 2457600,
    "mime_type": "application/pdf",
    "metadata": {
      "pages": 15
    },
    "status": "completed",
    "created_at": "2024-01-20T10:30:00Z",
    "updated_at": "2024-01-20T10:35:00Z"
  },
  "analysis": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "insights": {
      "summary": "...",
      "topics": ["..."]
    }
  }
}
```

#### Delete File

```http
DELETE /api/files/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Analysis

#### Trigger Analysis

Start AI analysis for a file.

```http
POST /api/analyze
```

**Request Body:**
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (202):**
```json
{
  "analysis_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "processing",
  "message": "Analysis started"
}
```

#### Get Analysis Status

```http
GET /api/analyze/:id
```

**Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "agent_type": "document",
  "insights": {
    "summary": "Project proposal for mobile app...",
    "topics": ["mobile development", "budget", "timeline"],
    "entities": {
      "people": ["John Doe"],
      "organizations": ["Acme Corp"]
    }
  },
  "processing_time_ms": 3450,
  "completed_at": "2024-01-20T10:30:08Z"
}
```

### Knowledge Base

#### Chat with Knowledge Base

Query the knowledge base using natural language.

```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "What are the key points from my project proposals?",
  "file_ids": ["550e8400-..."], // Optional: limit to specific files
  "max_results": 5
}
```

**Response (200) - Streaming:**
```
data: {"type":"start","message":"Searching knowledge base..."}
data: {"type":"context","chunks":3}
data: {"type":"token","content":"Based"}
data: {"type":"token","content":" on"}
data: {"type":"token","content":" your"}
data: {"type":"done","sources":[...]}
```

#### Search Knowledge Base

Semantic search in knowledge base.

```http
GET /api/knowledge-base/search?q=mobile+app&limit=10
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "770e8400-...",
      "content": "Executive Summary: Mobile app development...",
      "file_id": "550e8400-...",
      "file_name": "proposal.pdf",
      "similarity": 0.89,
      "metadata": {
        "page": 1,
        "section": "Executive Summary"
      }
    }
  ],
  "total": 42
}
```

### Integrations

#### Connect Platform

Initiate OAuth flow for platform integration.

```http
GET /api/integrations/:platform/connect
```

**Platforms:**
- `google` - Google Workspace
- `notion` - Notion
- `jira` - Jira
- `slack` - Slack
- `github` - GitHub

**Response:** Redirects to OAuth provider

#### List Integrations

```http
GET /api/integrations
```

**Response (200):**
```json
{
  "integrations": [
    {
      "id": "880e8400-...",
      "platform": "google",
      "status": "active",
      "settings": {
        "enabled_services": ["gmail", "drive"]
      },
      "last_sync_at": "2024-01-20T09:00:00Z",
      "created_at": "2024-01-15T14:20:00Z"
    }
  ]
}
```

#### Disconnect Platform

```http
DELETE /api/integrations/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Integration disconnected"
}
```

### MCP Tools

#### List Available Tools

```http
GET /api/mcp/:platform/tools
```

**Response (200):**
```json
{
  "platform": "google",
  "tools": [
    {
      "id": "990e8400-...",
      "name": "gmail_send",
      "description": "Send an email via Gmail",
      "category": "email",
      "input_schema": {
        "type": "object",
        "properties": {
          "to": {"type": "string"},
          "subject": {"type": "string"},
          "body": {"type": "string"}
        }
      },
      "enabled": true
    }
  ]
}
```

#### Execute Tool

```http
POST /api/mcp/execute
```

**Request Body:**
```json
{
  "platform": "google",
  "tool_name": "gmail_send",
  "arguments": {
    "to": "user@example.com",
    "subject": "Test Email",
    "body": "This is a test"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "result": {
    "messageId": "18d1a2b3c4d5e6f7"
  }
}
```

#### Tool Execution History

```http
GET /api/mcp/executions?page=1&per_page=20
```

**Response (200):**
```json
{
  "executions": [
    {
      "id": "aa0e8400-...",
      "tool_name": "gmail_send",
      "platform": "google",
      "status": "success",
      "execution_time_ms": 1250,
      "created_at": "2024-01-20T08:15:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "per_page": 20
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "size",
      "message": "File size exceeds maximum allowed"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Valid authentication token required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in 10 seconds"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/upload | 10 requests | 60 seconds |
| /api/analyze | 5 requests | 60 seconds |
| /api/chat | 20 requests | 60 seconds |
| /api/mcp/execute | 30 requests | 60 seconds |
| Other endpoints | 100 requests | 60 seconds |

## Webhooks

### Supabase Realtime

Subscribe to real-time updates:

```typescript
const supabase = createClient();

// Subscribe to file updates
const channel = supabase
  .channel('file-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'files',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('File updated:', payload.new);
    }
  )
  .subscribe();

// Subscribe to analysis completion
const analysisChannel = supabase
  .channel('analysis-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'analysis',
    },
    (payload) => {
      if (payload.new.status === 'completed') {
        console.log('Analysis completed:', payload.new);
      }
    }
  )
  .subscribe();
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload file
async function uploadFile(file: File) {
  // 1. Create file record
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      mime_type: file.type,
    }),
  });

  const { file: fileRecord, upload_url } = await response.json();

  // 2. Upload file to storage
  const { error } = await supabase.storage
    .from('files')
    .upload(fileRecord.storage_path, file);

  if (error) throw error;

  return fileRecord;
}

// Trigger analysis
async function analyzeFile(fileId: string) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ file_id: fileId }),
  });

  return response.json();
}

// Chat with knowledge base
async function chatWithKB(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ message }),
  });

  const reader = response.body?.getReader();
  // Handle streaming response...
}
```

---

For more examples and detailed usage, see the [Development Guide](./DEVELOPMENT.md).
