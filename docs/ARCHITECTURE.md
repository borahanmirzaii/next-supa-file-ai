# Architecture Documentation

## System Overview

This document describes the architecture of the Next.js Supabase File AI Platform, a comprehensive system for file upload, AI-powered analysis, knowledge base creation, and platform integration via MCP.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js 15 App                        │
│                    (App Router + RSC)                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Frontend   │    │  API Routes      │    │ Server       │
│   (React)    │───▶│  (Route          │───▶│ Actions      │
│              │    │   Handlers)      │    │ (RSC)        │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Supabase    │    │  Vercel AI SDK   │    │     MCP      │
│  Storage +   │    │  + Gemini API    │    │   Servers    │
│  Database    │    │                  │    │              │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        │                     ▼                     ▼
        │            ┌──────────────────┐    ┌──────────────┐
        │            │   Knowledge      │    │  External    │
        └───────────▶│   Base (Vector   │    │  Platforms   │
                     │   Embeddings)    │    │  (Google,    │
                     └──────────────────┘    │  Notion, etc)│
                                             └──────────────┘
```

## Core Architectural Layers

### 1. Presentation Layer (Frontend)

**Technology**: React 19 with Next.js 15 App Router

**Components**:
- UI Components (shadcn/ui)
- Feature Components (File Upload, Analysis, Knowledge Base, Integrations)
- Layout Components (Header, Sidebar, Navigation)

**Responsibilities**:
- User interface rendering
- User interaction handling
- Client-side state management (Zustand)
- Real-time UI updates (Supabase Realtime)

**Key Patterns**:
- Server Components by default (RSC)
- Client Components for interactivity
- Optimistic updates for better UX
- Streaming for AI responses

### 2. API Layer

**Technology**: Next.js API Routes + Server Actions

**Routes**:
- `/api/upload` - File upload handling
- `/api/analyze` - AI analysis triggering
- `/api/chat` - Knowledge base chat
- `/api/mcp/*` - MCP integration endpoints
- `/api/webhooks/*` - External webhooks

**Responsibilities**:
- Request validation
- Authentication/Authorization
- Business logic orchestration
- Response formatting

**Key Patterns**:
- Route handlers for public APIs
- Server Actions for mutations
- Middleware for auth checking
- Rate limiting

### 3. Service Layer

**Technology**: TypeScript classes with dependency injection

**Services**:
- `FileService` - File operations and management
- `AnalysisService` - AI analysis orchestration
- `KnowledgeBaseService` - Vector storage and retrieval
- `IntegrationService` - External platform connections

**Responsibilities**:
- Business logic implementation
- Cross-cutting concerns
- Service composition
- Transaction management

**Key Patterns**:
- Service Layer Pattern
- Dependency Injection
- Single Responsibility Principle
- Interface Segregation

### 4. Repository Layer

**Technology**: TypeScript with Supabase Client

**Repositories**:
- `FileRepository` - File CRUD operations
- `AnalysisRepository` - Analysis CRUD operations
- `KnowledgeBaseRepository` - Vector operations
- `IntegrationRepository` - Integration CRUD operations

**Responsibilities**:
- Data access abstraction
- Query building
- Database transactions
- Error handling

**Key Patterns**:
- Repository Pattern
- Query Object Pattern
- Unit of Work
- Data Mapper

### 5. Data Layer

**Technology**: PostgreSQL (Supabase) with pgvector

**Components**:
- PostgreSQL Database
- pgvector Extension (vector similarity)
- Supabase Storage (object storage)
- Supabase Realtime (pub/sub)

**Responsibilities**:
- Data persistence
- Data integrity
- Vector similarity search
- File storage

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access logic from business logic

**Implementation**:
```typescript
// src/repositories/file-repository.ts
export class FileRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(file: FileInsert): Promise<File> {
    const { data, error } = await this.supabase
      .from('files')
      .insert(file)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: string): Promise<File | null> {
    const { data } = await this.supabase
      .from('files')
      .select()
      .eq('id', id)
      .single();

    return data;
  }

  async findByUserId(userId: string): Promise<File[]> {
    const { data } = await this.supabase
      .from('files')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async update(id: string, updates: FileUpdate): Promise<File> {
    const { data, error } = await this.supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.supabase
      .from('files')
      .delete()
      .eq('id', id);
  }
}
```

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic separate from data access and presentation

**Implementation**:
```typescript
// src/services/analysis-service.ts
export class AnalysisService {
  constructor(
    private fileRepo: FileRepository,
    private analysisRepo: AnalysisRepository,
    private agentFactory: AgentFactory,
    private kbService: KnowledgeBaseService
  ) {}

  async analyzeFile(fileId: string): Promise<Analysis> {
    // 1. Get file from repository
    const file = await this.fileRepo.findById(fileId);
    if (!file) throw new Error('File not found');

    // 2. Create analysis record
    const analysis = await this.analysisRepo.create({
      file_id: fileId,
      status: 'processing',
      agent_type: this.determineAgentType(file.mime_type)
    });

    try {
      // 3. Get appropriate agent
      const agent = this.agentFactory.createAgent(file.mime_type);

      // 4. Download file content
      const content = await this.downloadFile(file.storage_path);

      // 5. Analyze with AI
      const result = await agent.analyze(content);

      // 6. Update analysis with results
      const completed = await this.analysisRepo.update(analysis.id, {
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
      });

      // 7. Build knowledge base
      await this.kbService.indexFile(fileId, result);

      return completed;
    } catch (error) {
      // Handle errors
      await this.analysisRepo.update(analysis.id, {
        status: 'failed',
        result: { error: error.message }
      });
      throw error;
    }
  }

  private determineAgentType(mimeType: string): string {
    // Logic to determine agent type
  }

  private async downloadFile(path: string): Promise<Buffer> {
    // Logic to download file from storage
  }
}
```

### 3. Factory Pattern

**Purpose**: Create AI agents based on file type

**Implementation**:
```typescript
// src/lib/ai/agents/factory.ts
export class AgentFactory {
  constructor(private geminiClient: GoogleGenerativeAI) {}

  createAgent(mimeType: string): BaseAgent {
    switch(this.categorizeFileType(mimeType)) {
      case 'document':
        return new DocumentAgent(this.geminiClient);

      case 'image':
        return new ImageAgent(this.geminiClient);

      case 'code':
        return new CodeAgent(this.geminiClient);

      case 'data':
        return new DataAgent(this.geminiClient);

      default:
        return new GenericAgent(this.geminiClient);
    }
  }

  private categorizeFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('javascript') || mimeType.includes('typescript')) return 'code';
    if (mimeType.includes('json') || mimeType.includes('csv')) return 'data';
    return 'generic';
  }
}

// Base agent interface
export abstract class BaseAgent {
  constructor(protected client: GoogleGenerativeAI) {}

  abstract analyze(content: Buffer): Promise<AnalysisResult>;

  protected async generateResponse(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

// Specialized agents
export class DocumentAgent extends BaseAgent {
  async analyze(content: Buffer): Promise<AnalysisResult> {
    // Extract text from document
    const text = await this.extractText(content);

    // Analyze with Gemini
    const prompt = `Analyze this document and provide:
    1. Summary
    2. Key topics
    3. Important entities
    4. Sentiment

    Document: ${text}`;

    const analysis = await this.generateResponse(prompt);

    return {
      type: 'document',
      summary: this.extractSummary(analysis),
      topics: this.extractTopics(analysis),
      entities: this.extractEntities(analysis),
      metadata: { /* ... */ }
    };
  }

  private async extractText(content: Buffer): Promise<string> {
    // Implementation for text extraction
  }
}

export class ImageAgent extends BaseAgent {
  async analyze(content: Buffer): Promise<AnalysisResult> {
    const model = this.client.getGenerativeModel({ model: 'gemini-pro-vision' });

    const result = await model.generateContent([
      'Analyze this image and describe: 1) Main content, 2) Objects, 3) Text if any, 4) Context',
      { inlineData: { data: content.toString('base64'), mimeType: 'image/jpeg' } }
    ]);

    return {
      type: 'image',
      description: result.response.text(),
      metadata: { /* ... */ }
    };
  }
}

export class CodeAgent extends BaseAgent {
  async analyze(content: Buffer): Promise<AnalysisResult> {
    const code = content.toString('utf-8');

    const prompt = `Analyze this code and provide:
    1. Language and framework
    2. Purpose/functionality
    3. Key functions and classes
    4. Dependencies
    5. Potential issues or improvements

    Code:
    ${code}`;

    const analysis = await this.generateResponse(prompt);

    return {
      type: 'code',
      language: this.detectLanguage(code),
      analysis: analysis,
      metadata: { /* ... */ }
    };
  }

  private detectLanguage(code: string): string {
    // Language detection logic
  }
}
```

### 4. Strategy Pattern

**Purpose**: Define different analysis strategies for different file types

**Implementation**:
```typescript
// src/lib/ai/strategies/analysis-strategy.ts
export interface AnalysisStrategy {
  analyze(content: Buffer, metadata: FileMetadata): Promise<AnalysisResult>;
}

export class TextAnalysisStrategy implements AnalysisStrategy {
  async analyze(content: Buffer, metadata: FileMetadata): Promise<AnalysisResult> {
    // Text-specific analysis
  }
}

export class ImageAnalysisStrategy implements AnalysisStrategy {
  async analyze(content: Buffer, metadata: FileMetadata): Promise<AnalysisResult> {
    // Image-specific analysis
  }
}

export class CodeAnalysisStrategy implements AnalysisStrategy {
  async analyze(content: Buffer, metadata: FileMetadata): Promise<AnalysisResult> {
    // Code-specific analysis
  }
}

// Context
export class AnalysisContext {
  private strategy: AnalysisStrategy;

  setStrategy(strategy: AnalysisStrategy) {
    this.strategy = strategy;
  }

  async executeAnalysis(content: Buffer, metadata: FileMetadata): Promise<AnalysisResult> {
    return this.strategy.analyze(content, metadata);
  }
}
```

### 5. Observer Pattern

**Purpose**: Real-time updates for upload/analysis progress

**Implementation**:
```typescript
// src/lib/observers/progress-observer.ts
export interface ProgressObserver {
  update(progress: ProgressUpdate): void;
}

export class UploadProgressSubject {
  private observers: ProgressObserver[] = [];

  attach(observer: ProgressObserver): void {
    this.observers.push(observer);
  }

  detach(observer: ProgressObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(progress: ProgressUpdate): void {
    for (const observer of this.observers) {
      observer.update(progress);
    }
  }
}

// Usage in upload service
export class FileUploadService {
  private progressSubject = new UploadProgressSubject();

  async uploadFile(file: File): Promise<UploadedFile> {
    // Notify observers of progress
    this.progressSubject.notify({ stage: 'uploading', percent: 0 });

    // Upload logic...
    this.progressSubject.notify({ stage: 'uploading', percent: 50 });

    // Complete
    this.progressSubject.notify({ stage: 'complete', percent: 100 });
  }
}
```

### 6. Adapter Pattern

**Purpose**: Adapt MCP server interfaces to unified platform interface

**Implementation**:
```typescript
// src/lib/mcp/adapters/platform-adapter.ts
export interface PlatformAdapter {
  connect(credentials: Credentials): Promise<void>;
  listTools(): Promise<Tool[]>;
  executeTool(toolName: string, args: any): Promise<any>;
  disconnect(): Promise<void>;
}

export class GoogleAdapter implements PlatformAdapter {
  private mcpClient: Client;

  async connect(credentials: Credentials): Promise<void> {
    // Connect to Google MCP server
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['./mcp-servers/dist/google/index.js']
    });

    this.mcpClient = new Client({ name: 'google-adapter', version: '1.0.0' }, {});
    await this.mcpClient.connect(transport);
  }

  async listTools(): Promise<Tool[]> {
    const response = await this.mcpClient.request({ method: 'tools/list' }, {});
    return response.tools;
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    return await this.mcpClient.request(
      { method: 'tools/call' },
      { name: toolName, arguments: args }
    );
  }

  async disconnect(): Promise<void> {
    await this.mcpClient.close();
  }
}

export class NotionAdapter implements PlatformAdapter {
  // Similar implementation for Notion
}

export class JiraAdapter implements PlatformAdapter {
  // Similar implementation for Jira
}
```

## Data Flow

### File Upload & Analysis Flow

```
┌─────────────┐
│    User     │
│ drops file  │
└─────┬───────┘
      │
      ▼
┌─────────────────────────┐
│  FileUpload Component   │
│  (Client Component)     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  useFileUpload Hook     │
│  - Validate file        │
│  - Create form data     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  POST /api/upload       │
│  (API Route)            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  FileService.upload()   │
│  - Upload to Storage    │
│  - Create DB record     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Trigger Analysis       │
│  (Server Action)        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  AnalysisService        │
│  .analyzeFile()         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  AgentFactory           │
│  .createAgent()         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Specialized Agent      │
│  .analyze()             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Gemini API             │
│  Processing             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Store Results          │
│  - Update analysis      │
│  - Generate embeddings  │
│  - Index in KB          │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Notify Client          │
│  (Supabase Realtime)    │
└─────────────────────────┘
```

### Knowledge Base Query Flow

```
┌─────────────┐
│    User     │
│ asks question│
└─────┬───────┘
      │
      ▼
┌─────────────────────────┐
│  Chat Component         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  POST /api/chat         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Generate Query         │
│  Embedding              │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Vector Similarity      │
│  Search (pgvector)      │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Retrieve Relevant      │
│  Chunks                 │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Build RAG Prompt       │
│  with Context           │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Gemini API             │
│  Generate Answer        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Stream Response        │
│  to Client              │
└─────────────────────────┘
```

### MCP Integration Flow

```
┌─────────────┐
│    User     │
│ connects    │
│  platform   │
└─────┬───────┘
      │
      ▼
┌─────────────────────────┐
│  OAuth Flow             │
│  (API Route)            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Store Credentials      │
│  (Encrypted)            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  IntegrationService     │
│  .connect()             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  PlatformAdapter        │
│  .connect()             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  MCP Server             │
│  Connection             │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Fetch Available        │
│  Tools                  │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Store Tools in DB      │
└─────────────────────────┘

--- Later: User executes tool ---

┌─────────────┐
│    User     │
│ executes    │
│    tool     │
└─────┬───────┘
      │
      ▼
┌─────────────────────────┐
│  POST /api/mcp/tools    │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Validate Input         │
│  (Zod Schema)           │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  PlatformAdapter        │
│  .executeTool()         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  MCP Server             │
│  Tool Execution         │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  External Platform      │
│  API Call               │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Return Result          │
│  to Client              │
└─────────────────────────┘
```

## Security Architecture

### Authentication & Authorization

```
Request → Middleware → Auth Check → RLS → Data
                 │           │
                 │           └─→ User ID from JWT
                 └─→ Redirect if not authenticated
```

**Key Security Measures**:
1. **Row Level Security (RLS)** - Database-level access control
2. **JWT Tokens** - Supabase auth tokens
3. **Service Role Key** - Server-side only, never exposed
4. **File Validation** - Type, size, content checks
5. **Input Sanitization** - All user inputs validated
6. **Rate Limiting** - API route protection
7. **Encrypted Credentials** - MCP platform credentials encrypted at rest

### RLS Policies

```sql
-- Files table
CREATE POLICY "Users can only see their own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Analysis table
CREATE POLICY "Users can only see analysis of their files"
  ON analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = analysis.file_id
      AND files.user_id = auth.uid()
    )
  );

-- Knowledge base table
CREATE POLICY "Users can only see their own knowledge base"
  ON knowledge_base FOR SELECT
  USING (auth.uid() = user_id);
```

## Scalability Considerations

### 1. File Processing
- Async processing with job queue
- Chunked file uploads for large files
- CDN for file delivery
- Background workers for analysis

### 2. Vector Search
- Index optimization for pgvector
- Caching frequent queries
- Partitioning for large datasets
- Read replicas for search

### 3. MCP Connections
- Connection pooling
- Retry mechanisms
- Circuit breakers
- Request queuing

### 4. API Performance
- Edge caching (Vercel)
- Database connection pooling
- Streaming responses for AI
- Optimistic UI updates

## Error Handling

### Strategy

```typescript
// Centralized error handling
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Error middleware
export function errorHandler(error: Error, req: Request, res: Response) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.code,
      message: error.message
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
}
```

## Monitoring & Observability

### Logging Strategy
- Structured logging (JSON)
- Log levels (debug, info, warn, error)
- Request ID tracking
- Performance metrics

### Metrics
- Upload success/failure rate
- Analysis processing time
- Vector search latency
- MCP tool execution time
- API response times

### Alerting
- Failed analysis jobs
- MCP connection failures
- Storage quota warnings
- API error rate spikes

---

This architecture provides a solid foundation for building a scalable, maintainable, and secure file analysis platform with AI capabilities and extensive platform integrations.
