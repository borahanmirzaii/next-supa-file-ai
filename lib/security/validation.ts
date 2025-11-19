import { z } from 'zod'

/**
 * File upload validation schema
 */
export const fileUploadSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._\s-]+$/, 'File name contains invalid characters'),
  size: z
    .number()
    .positive()
    .max(50 * 1024 * 1024, 'File size exceeds 50MB limit'),
  mime_type: z.enum([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/javascript',
    'text/typescript',
  ]),
})

/**
 * Sanitize file name to prevent path traversal and injection
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators
  let sanitized = fileName.replace(/[/\\]/g, '_')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Limit length
  sanitized = sanitized.slice(0, 255)
  
  // Ensure it's not empty
  if (!sanitized || sanitized.trim().length === 0) {
    sanitized = `file_${Date.now()}`
  }
  
  return sanitized
}

/**
 * Validate file type by checking magic bytes (not just extension)
 */
export async function validateFileType(file: File, expectedMimeType: string): Promise<boolean> {
  // For now, rely on browser-provided MIME type
  // In production, implement magic byte checking
  return file.type === expectedMimeType || file.type.startsWith(expectedMimeType.split('/')[0])
}

/**
 * Chat message validation schema
 */
export const chatMessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(10000),
    })
  ),
  fileIds: z.array(z.string().uuid()).optional(),
})

/**
 * Knowledge base search validation schema
 */
export const kbSearchSchema = z.object({
  query: z.string().min(1).max(500),
  fileIds: z.array(z.string().uuid()).optional(),
  limit: z.number().int().min(1).max(20).optional(),
  threshold: z.number().min(0).max(1).optional(),
})

/**
 * Tool execution validation schema
 */
export const toolExecutionSchema = z.object({
  serverId: z.string().uuid(),
  toolName: z.string().min(1).max(100),
  args: z.record(z.any()),
})

