# Development Guidelines

This document provides coding standards, best practices, and guidelines for contributing to the Next.js Supabase File AI Platform.

## Table of Contents

1. [Code Style](#code-style)
2. [Project Structure](#project-structure)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [React Best Practices](#react-best-practices)
5. [API Development](#api-development)
6. [Database Operations](#database-operations)
7. [Testing](#testing)
8. [Git Workflow](#git-workflow)
9. [Performance](#performance)
10. [Security](#security)

## Code Style

### General Principles

- **DRY (Don't Repeat Yourself)**: Extract reusable logic into functions/components
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones
- **SOLID Principles**: Especially Single Responsibility and Dependency Inversion
- **Separation of Concerns**: UI, business logic, and data access should be separate

### Formatting

Use Prettier for consistent formatting:

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 80,
  "arrowParens": "always"
}
```

### Naming Conventions

```typescript
// Components: PascalCase
export function FileUpload() {}
export const AnalysisViewer = () => {};

// Functions: camelCase
function handleFileUpload() {}
const processAnalysis = async () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 52428800;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'application/pdf'];

// Types/Interfaces: PascalCase
interface FileMetadata {}
type AnalysisResult = {};

// Files: kebab-case
// file-upload.tsx
// analysis-service.ts
// use-file-upload.ts
```

### File Organization

```typescript
// 1. Imports (grouped and sorted)
// External libraries
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Internal utilities
import { cn } from '@/lib/utils';

// Components
import { Button } from '@/components/ui/button';

// Types
import type { File } from '@/types/file';

// 2. Types/Interfaces
interface Props {
  onUpload: (file: File) => void;
}

// 3. Constants
const MAX_SIZE = 50 * 1024 * 1024;

// 4. Component/Function
export function FileUpload({ onUpload }: Props) {
  // ...
}
```

## Project Structure

### Directory Rules

```
src/
├── components/          # React components only
│   ├── ui/             # shadcn components (don't modify directly)
│   └── [feature]/      # Feature-specific components
├── lib/                # Core libraries and utilities
│   ├── supabase/       # Supabase clients
│   ├── ai/             # AI-related code
│   └── utils/          # Utility functions
├── services/           # Business logic layer
├── repositories/       # Data access layer
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

### Component Structure

```typescript
// src/components/file-upload/dropzone.tsx

'use client'; // Only if needed

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
}

/**
 * File dropzone component for drag-and-drop uploads
 *
 * @param onFilesAccepted - Callback when files are accepted
 * @param maxSize - Maximum file size in bytes (default: 50MB)
 * @param accept - Accepted MIME types
 */
export function Dropzone({
  onFilesAccepted,
  maxSize = 52428800,
  accept,
  className,
}: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-medium">
        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        or click to browse
      </p>
    </div>
  );
}
```

## TypeScript Guidelines

### Type Definitions

```typescript
// src/types/file.ts

// Base types
export interface File {
  id: string;
  user_id: string;
  name: string;
  original_name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  metadata: FileMetadata;
  status: FileStatus;
  created_at: string;
  updated_at: string;
}

export type FileStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface FileMetadata {
  width?: number;
  height?: number;
  pages?: number;
  author?: string;
  [key: string]: any; // Allow additional properties
}

// Insert/Update types
export type FileInsert = Omit<File, 'id' | 'created_at' | 'updated_at'>;
export type FileUpdate = Partial<Omit<File, 'id' | 'user_id'>>;

// Response types
export interface FileUploadResponse {
  file: File;
  upload_url: string;
}

export interface FileListResponse {
  files: File[];
  total: number;
  page: number;
  per_page: number;
}
```

### Avoid `any`

```typescript
// Bad
function processData(data: any) {
  return data.map((item: any) => item.value);
}

// Good
interface DataItem {
  value: string;
}

function processData(data: DataItem[]) {
  return data.map((item) => item.value);
}

// If type is truly unknown, use `unknown`
function processUnknown(data: unknown) {
  if (Array.isArray(data)) {
    // Type guard
    return data.length;
  }
  return 0;
}
```

### Use Type Inference

```typescript
// Bad - redundant type annotation
const name: string = 'John';
const count: number = 42;

// Good - let TypeScript infer
const name = 'John';
const count = 42;

// Good - explicit when needed
const config: AppConfig = {
  apiKey: process.env.API_KEY!,
  timeout: 5000,
};
```

## React Best Practices

### Server vs Client Components

```typescript
// Default to Server Components
// app/dashboard/page.tsx
import { FileList } from '@/components/file-list';

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const files = await getFiles();

  return (
    <div>
      <h1>Dashboard</h1>
      <FileList files={files} />
    </div>
  );
}

// Use Client Components only when needed
// src/components/file-upload.tsx
'use client';

import { useState } from 'react';

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  // Interactive functionality requires client component
  return <div onClick={() => {}}></div>;
}
```

### Custom Hooks

```typescript
// src/hooks/use-file-upload.ts
import { useState, useCallback } from 'react';
import { uploadFile } from '@/services/file-service';
import type { File } from '@/types/file';

interface UseFileUploadResult {
  upload: (file: File) => Promise<void>;
  progress: number;
  isUploading: boolean;
  error: Error | null;
}

export function useFileUpload(): UseFileUploadResult {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      await uploadFile(file, (progress) => {
        setProgress(progress);
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, progress, isUploading, error };
}
```

### Error Boundaries

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-500 rounded">
            <h2 className="text-lg font-semibold text-red-600">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## API Development

### API Route Structure

```typescript
// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { FileService } from '@/services/file-service';

// Input validation schema
const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().positive().max(52428800),
  mime_type: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validation
    const body = await request.json();
    const validated = uploadSchema.parse(body);

    // 3. Business logic (via service layer)
    const fileService = new FileService(supabase);
    const result = await fileService.createUploadUrl(user.id, validated);

    // 4. Response
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const fileService = new FileService(supabase);
    const result = await fileService.listFiles(user.id, { page, perPage });

    return NextResponse.json(result);
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Server Actions

```typescript
// src/actions/file-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { FileService } from '@/services/file-service';

export async function deleteFile(fileId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const fileService = new FileService(supabase);
  await fileService.deleteFile(fileId, user.id);

  revalidatePath('/dashboard/files');

  return { success: true };
}

export async function triggerAnalysis(fileId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const analysisService = new AnalysisService();
  await analysisService.analyzeFile(fileId);

  revalidatePath(`/dashboard/files/${fileId}`);

  return { success: true };
}
```

## Database Operations

### Repository Pattern

```typescript
// src/repositories/file-repository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import type { File, FileInsert, FileUpdate } from '@/types/file';

export class FileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<File | null> {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<File[]> {
    let query = this.supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  async create(file: FileInsert): Promise<File> {
    const { data, error } = await this.supabase
      .from('files')
      .insert(file)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async update(id: string, updates: FileUpdate): Promise<File> {
    const { data, error } = await this.supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async count(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    return count || 0;
  }
}
```

### Transactions

```typescript
// For operations requiring multiple steps
async function transferFile(fileId: string, fromUserId: string, toUserId: string) {
  const supabase = createClient();

  // Supabase doesn't support traditional transactions in client library
  // Use database functions for complex transactions

  const { data, error } = await supabase.rpc('transfer_file', {
    file_id: fileId,
    from_user_id: fromUserId,
    to_user_id: toUserId,
  });

  if (error) throw error;

  return data;
}

// SQL function (in migration)
/*
CREATE OR REPLACE FUNCTION transfer_file(
  file_id uuid,
  from_user_id uuid,
  to_user_id uuid
)
RETURNS void AS $$
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM files WHERE id = file_id AND user_id = from_user_id
  ) THEN
    RAISE EXCEPTION 'File not found or access denied';
  END IF;

  -- Transfer file
  UPDATE files SET user_id = to_user_id WHERE id = file_id;

  -- Transfer related records
  UPDATE knowledge_base SET user_id = to_user_id WHERE file_id = file_id;
END;
$$ LANGUAGE plpgsql;
*/
```

## Testing

### Unit Tests (Vitest)

```typescript
// src/lib/utils/file-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseFileName, validateMimeType } from './file-parser';

describe('file-parser', () => {
  describe('parseFileName', () => {
    it('should extract file name and extension', () => {
      const result = parseFileName('document.pdf');
      expect(result).toEqual({
        name: 'document',
        extension: 'pdf',
      });
    });

    it('should handle files without extension', () => {
      const result = parseFileName('README');
      expect(result).toEqual({
        name: 'README',
        extension: '',
      });
    });
  });

  describe('validateMimeType', () => {
    it('should accept allowed MIME types', () => {
      expect(validateMimeType('application/pdf')).toBe(true);
      expect(validateMimeType('image/jpeg')).toBe(true);
    });

    it('should reject disallowed MIME types', () => {
      expect(validateMimeType('application/x-msdownload')).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
// tests/api/files.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Files API', () => {
  let supabase: any;
  let authToken: string;

  beforeAll(async () => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test user
    const { data } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
    });

    authToken = data.session?.access_token!;
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('should upload a file', async () => {
    const response = await fetch('http://localhost:3000/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'test.pdf',
        size: 1024,
        mime_type: 'application/pdf',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.file).toBeDefined();
    expect(data.upload_url).toBeDefined();
  });
});
```

## Git Workflow

### Branch Naming

```
main                    # Production-ready code
develop                 # Development branch

feature/add-oauth       # New features
fix/upload-bug          # Bug fixes
refactor/api-layer      # Refactoring
docs/update-readme      # Documentation
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add Google OAuth integration
fix: resolve file upload timeout issue
docs: update API documentation
refactor: extract upload logic to service layer
test: add unit tests for file parser
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Write/update tests
4. Update documentation if needed
5. Create PR with description
6. Request review
7. Address feedback
8. Merge when approved

## Performance

### Optimization Checklist

- [ ] Use Server Components by default
- [ ] Lazy load heavy components
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize images with next/image
- [ ] Use React.memo for expensive renders
- [ ] Implement proper caching strategies
- [ ] Add database indexes for frequent queries
- [ ] Use streaming for large AI responses
- [ ] Implement pagination for large datasets

### Example: Virtual Scrolling

```typescript
// src/components/file-list/virtualized-list.tsx
'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { File } from '@/types/file';

interface Props {
  files: File[];
  onFileClick: (file: File) => void;
}

export function VirtualizedFileList({ files, onFileClick }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const file = files[item.index];
          return (
            <div
              key={file.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`,
              }}
              onClick={() => onFileClick(file)}
            >
              {/* File item content */}
              <div className="p-4 border-b">{file.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Security

### Security Checklist

- [ ] Never expose service role key on client
- [ ] Validate all user inputs (use Zod)
- [ ] Sanitize file names before storage
- [ ] Check file types (not just extensions)
- [ ] Implement rate limiting
- [ ] Use RLS policies in database
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS in production
- [ ] Implement CSRF protection
- [ ] Add security headers

### Input Validation

```typescript
import { z } from 'zod';

// Define schemas
const fileUploadSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9-_. ]+$/), // Safe characters only
  size: z.number().positive().max(52428800), // 50MB max
  mime_type: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
    // ... other allowed types
  ]),
});

// Validate
try {
  const validated = fileUploadSchema.parse(userInput);
  // Safe to use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    console.error(error.errors);
  }
}
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Handle request...
}
```

---

Following these guidelines ensures code quality, maintainability, and security across the project.
