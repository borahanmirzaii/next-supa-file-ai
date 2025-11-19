# MCP Integration Guide

This guide explains how to build and integrate Model Context Protocol (MCP) servers for connecting to external platforms.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. It enables:
- Standardized tool/resource exposure
- Bidirectional communication
- Platform-agnostic integrations
- Secure credential handling

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          Your Next.js Application               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         MCP Client Manager              │  │
│  │  (src/lib/mcp/client.ts)               │  │
│  └──────────────────────────────────────────┘  │
│           │          │          │              │
└───────────┼──────────┼──────────┼──────────────┘
            │          │          │
    ┌───────┘          │          └───────┐
    ▼                  ▼                  ▼
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Google  │      │  Notion  │      │  Jira   │
│   MCP   │      │   MCP    │      │   MCP   │
│ Server  │      │  Server  │      │ Server  │
│(Node.js)│      │ (Node.js)│      │(Node.js)│
└─────────┘      └──────────┘      └─────────┘
    │                  │                  │
    ▼                  ▼                  ▼
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Google  │      │  Notion  │      │  Jira   │
│   API   │      │   API    │      │   API   │
└─────────┘      └──────────┘      └─────────┘
```

## MCP Server Structure

### Directory Layout

```
mcp-servers/
├── package.json
├── tsconfig.json
├── src/
│   ├── shared/
│   │   ├── base-server.ts      # Shared server utilities
│   │   ├── auth.ts             # OAuth helpers
│   │   └── types.ts            # Common types
│   ├── google/
│   │   ├── index.ts            # Google MCP server
│   │   ├── tools/
│   │   │   ├── gmail.ts        # Gmail tools
│   │   │   ├── drive.ts        # Drive tools
│   │   │   └── docs.ts         # Docs tools
│   │   └── auth.ts             # Google OAuth
│   ├── notion/
│   │   ├── index.ts            # Notion MCP server
│   │   ├── tools/
│   │   │   ├── pages.ts        # Page operations
│   │   │   ├── databases.ts    # Database operations
│   │   │   └── blocks.ts       # Block operations
│   │   └── client.ts           # Notion API client
│   └── jira/
│       ├── index.ts            # Jira MCP server
│       ├── tools/
│       │   ├── issues.ts       # Issue operations
│       │   ├── projects.ts     # Project operations
│       │   └── search.ts       # Search operations
│       └── client.ts           # Jira API client
└── dist/                        # Compiled JavaScript
```

## Building an MCP Server

### Step 1: Setup MCP Server Package

```bash
cd mcp-servers
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
```

**package.json:**
```json
{
  "name": "mcp-servers",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start:google": "node dist/google/index.js",
    "start:notion": "node dist/notion/index.js",
    "start:jira": "node dist/jira/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "googleapis": "^128.0.0",
    "@notionhq/client": "^2.2.14",
    "jira-client": "^8.2.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 2: Create Google MCP Server

**src/google/index.ts:**
```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'gmail_send',
    description: 'Send an email via Gmail',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address',
        },
        subject: {
          type: 'string',
          description: 'Email subject',
        },
        body: {
          type: 'string',
          description: 'Email body (plain text)',
        },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'gmail_search',
    description: 'Search Gmail messages',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Gmail search query (e.g., "from:user@example.com")',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'drive_upload',
    description: 'Upload a file to Google Drive',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'File name',
        },
        content: {
          type: 'string',
          description: 'File content (base64 encoded)',
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the file',
        },
        folderId: {
          type: 'string',
          description: 'Optional folder ID',
        },
      },
      required: ['name', 'content', 'mimeType'],
    },
  },
  {
    name: 'docs_create',
    description: 'Create a new Google Doc',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Document title',
        },
        content: {
          type: 'string',
          description: 'Document content',
        },
      },
      required: ['title'],
    },
  },
];

// Initialize OAuth2 client
function getOAuth2Client(credentials: any) {
  const { client_id, client_secret, redirect_uri } = credentials;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  if (credentials.access_token) {
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
    });
  }

  return oauth2Client;
}

// Tool handlers
async function handleGmailSend(auth: any, args: any) {
  const gmail = google.gmail({ version: 'v1', auth });

  const message = [
    `To: ${args.to}`,
    `Subject: ${args.subject}`,
    '',
    args.body,
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    success: true,
    messageId: response.data.id,
  };
}

async function handleGmailSearch(auth: any, args: any) {
  const gmail = google.gmail({ version: 'v1', auth });

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: args.query,
    maxResults: args.maxResults || 10,
  });

  const messages = response.data.messages || [];

  // Fetch message details
  const detailedMessages = await Promise.all(
    messages.slice(0, 5).map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const headers = detail.data.payload?.headers || [];
      return {
        id: msg.id,
        subject: headers.find((h) => h.name === 'Subject')?.value,
        from: headers.find((h) => h.name === 'From')?.value,
        date: headers.find((h) => h.name === 'Date')?.value,
      };
    })
  );

  return {
    total: response.data.resultSizeEstimate,
    messages: detailedMessages,
  };
}

async function handleDriveUpload(auth: any, args: any) {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata: any = {
    name: args.name,
  };

  if (args.folderId) {
    fileMetadata.parents = [args.folderId];
  }

  const media = {
    mimeType: args.mimeType,
    body: Buffer.from(args.content, 'base64'),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  return {
    success: true,
    fileId: response.data.id,
    name: response.data.name,
    webViewLink: response.data.webViewLink,
  };
}

async function handleDocsCreate(auth: any, args: any) {
  const docs = google.docs({ version: 'v1', auth });

  // Create document
  const createResponse = await docs.documents.create({
    requestBody: {
      title: args.title,
    },
  });

  const documentId = createResponse.data.documentId!;

  // Add content if provided
  if (args.content) {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: args.content,
            },
          },
        ],
      },
    });
  }

  return {
    success: true,
    documentId,
    title: args.title,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// Main server setup
async function main() {
  const server = new Server(
    {
      name: 'google-workspace-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Get credentials from environment
  const credentials = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  };

  const auth = getOAuth2Client(credentials);

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case 'gmail_send':
          result = await handleGmailSend(auth, args);
          break;

        case 'gmail_search':
          result = await handleGmailSearch(auth, args);
          break;

        case 'drive_upload':
          result = await handleDriveUpload(auth, args);
          break;

        case 'docs_create':
          result = await handleDocsCreate(auth, args);
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Google MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### Step 3: Create Notion MCP Server

**src/notion/index.ts:**
```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';

const TOOLS: Tool[] = [
  {
    name: 'notion_create_page',
    description: 'Create a new page in Notion',
    inputSchema: {
      type: 'object',
      properties: {
        parent_id: {
          type: 'string',
          description: 'Parent page or database ID',
        },
        title: {
          type: 'string',
          description: 'Page title',
        },
        content: {
          type: 'string',
          description: 'Page content (markdown)',
        },
      },
      required: ['parent_id', 'title'],
    },
  },
  {
    name: 'notion_search',
    description: 'Search Notion pages and databases',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'notion_add_to_database',
    description: 'Add a row to a Notion database',
    inputSchema: {
      type: 'object',
      properties: {
        database_id: {
          type: 'string',
          description: 'Database ID',
        },
        properties: {
          type: 'object',
          description: 'Row properties (key-value pairs)',
        },
      },
      required: ['database_id', 'properties'],
    },
  },
];

async function main() {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const server = new Server(
    {
      name: 'notion-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case 'notion_create_page':
          result = await notion.pages.create({
            parent: { page_id: args.parent_id },
            properties: {
              title: {
                title: [{ text: { content: args.title } }],
              },
            },
            children: args.content
              ? [
                  {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                      rich_text: [{ text: { content: args.content } }],
                    },
                  },
                ]
              : [],
          });
          break;

        case 'notion_search':
          result = await notion.search({
            query: args.query,
          });
          break;

        case 'notion_add_to_database':
          result = await notion.pages.create({
            parent: { database_id: args.database_id },
            properties: args.properties,
          });
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Notion MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### Step 4: Build MCP Servers

```bash
cd mcp-servers
npm run build
```

## Next.js Integration

### MCP Client Manager

**src/lib/mcp/client.ts:**
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private processes: Map<string, any> = new Map();

  async connect(platform: string, credentials: any): Promise<void> {
    // Determine server command
    const serverPath = this.getServerPath(platform);

    // Set environment variables
    const env = this.getEnvironment(platform, credentials);

    // Spawn MCP server process
    const serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Create transport
    const transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });

    // Create client
    const client = new Client(
      {
        name: 'next-app',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect
    await client.connect(transport);

    // Store client and process
    this.clients.set(platform, client);
    this.processes.set(platform, serverProcess);
  }

  async listTools(platform: string): Promise<any> {
    const client = this.clients.get(platform);
    if (!client) throw new Error(`Not connected to ${platform}`);

    const response = await client.request(
      { method: 'tools/list' },
      {}
    );

    return response.tools;
  }

  async executeTool(
    platform: string,
    toolName: string,
    args: any
  ): Promise<any> {
    const client = this.clients.get(platform);
    if (!client) throw new Error(`Not connected to ${platform}`);

    const response = await client.request(
      { method: 'tools/call' },
      { name: toolName, arguments: args }
    );

    return response;
  }

  async disconnect(platform: string): Promise<void> {
    const client = this.clients.get(platform);
    const process = this.processes.get(platform);

    if (client) {
      await client.close();
      this.clients.delete(platform);
    }

    if (process) {
      process.kill();
      this.processes.delete(platform);
    }
  }

  private getServerPath(platform: string): string {
    const base = process.cwd();
    switch (platform) {
      case 'google':
        return `${base}/mcp-servers/dist/google/index.js`;
      case 'notion':
        return `${base}/mcp-servers/dist/notion/index.js`;
      case 'jira':
        return `${base}/mcp-servers/dist/jira/index.js`;
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  private getEnvironment(platform: string, credentials: any): any {
    switch (platform) {
      case 'google':
        return {
          GOOGLE_CLIENT_ID: credentials.client_id,
          GOOGLE_CLIENT_SECRET: credentials.client_secret,
          GOOGLE_ACCESS_TOKEN: credentials.access_token,
          GOOGLE_REFRESH_TOKEN: credentials.refresh_token,
        };
      case 'notion':
        return {
          NOTION_API_KEY: credentials.api_key,
        };
      case 'jira':
        return {
          JIRA_API_TOKEN: credentials.api_token,
          JIRA_DOMAIN: credentials.domain,
          JIRA_EMAIL: credentials.email,
        };
      default:
        return {};
    }
  }
}

// Singleton instance
export const mcpManager = new MCPClientManager();
```

### API Route for Tool Execution

**app/api/mcp/execute/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mcpManager } from '@/lib/mcp/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const executeSchema = z.object({
  platform: z.enum(['google', 'notion', 'jira']),
  tool_name: z.string(),
  arguments: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    // Get user
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { platform, tool_name, arguments: args } = executeSchema.parse(body);

    // Get integration credentials
    const { data: integration } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('status', 'active')
      .single();

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found or inactive' },
        { status: 404 }
      );
    }

    // Connect if not already connected
    if (!mcpManager.clients.has(platform)) {
      await mcpManager.connect(platform, integration.credentials);
    }

    // Execute tool
    const result = await mcpManager.executeTool(platform, tool_name, args);

    // Log execution
    await supabase.from('tool_executions').insert({
      user_id: user.id,
      tool_id: body.tool_id,
      input: args,
      output: result,
      status: 'success',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Tool execution error:', error);

    return NextResponse.json(
      { error: error.message || 'Tool execution failed' },
      { status: 500 }
    );
  }
}
```

## OAuth Setup

### Google OAuth Flow

**app/api/auth/google/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.MCP_GOOGLE_CLIENT_ID,
  process.env.MCP_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
);

export async function GET(request: NextRequest) {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return NextResponse.redirect(url);
}
```

**app/api/auth/callback/google/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.MCP_GOOGLE_CLIENT_ID,
  process.env.MCP_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=no_code`
    );
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Get user
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    // Store integration
    await supabase.from('integrations').upsert({
      user_id: user.id,
      platform: 'google',
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      },
      status: 'active',
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=google`
    );
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=oauth_failed`
    );
  }
}
```

## Testing MCP Servers

### Manual Testing

```bash
# Test Google MCP server
cd mcp-servers
GOOGLE_ACCESS_TOKEN=your_token node dist/google/index.js

# In another terminal, test with stdio
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/google/index.js
```

### Integration Testing

**tests/mcp/google.test.ts:**
```typescript
import { MCPClientManager } from '@/lib/mcp/client';

describe('Google MCP Integration', () => {
  const manager = new MCPClientManager();

  beforeAll(async () => {
    await manager.connect('google', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  });

  afterAll(async () => {
    await manager.disconnect('google');
  });

  it('should list tools', async () => {
    const tools = await manager.listTools('google');
    expect(tools).toHaveLength(4);
    expect(tools[0].name).toBe('gmail_send');
  });

  it('should send email', async () => {
    const result = await manager.executeTool('google', 'gmail_send', {
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
```

## Best Practices

### Security
- Never expose credentials in client-side code
- Encrypt credentials at rest in database
- Use environment variables for server configuration
- Implement token refresh logic
- Add rate limiting to prevent abuse

### Error Handling
- Wrap all MCP calls in try-catch
- Log errors for debugging
- Provide user-friendly error messages
- Implement retry logic for transient failures
- Handle token expiration gracefully

### Performance
- Cache MCP client connections
- Implement connection pooling
- Use async/await for non-blocking operations
- Add timeouts to prevent hanging requests
- Monitor MCP server performance

### Monitoring
- Log all tool executions
- Track success/failure rates
- Monitor response times
- Alert on connection failures
- Track API quota usage

---

This guide provides everything needed to build and integrate MCP servers for external platform connectivity.
