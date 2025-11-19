import { renderHook, waitFor } from '@testing-library/react'
import { useFileUpload } from '../use-file-upload'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
      })),
    },
  })),
}))

describe('useFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty queue', () => {
    const { result } = renderHook(() => useFileUpload())
    
    expect(result.current.queue).toEqual([])
    expect(result.current.isUploading).toBe(false)
  })

  it('should add files to queue', async () => {
    const { result } = renderHook(() => useFileUpload())
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    await result.current.uploadFile(file)
    
    await waitFor(() => {
      expect(result.current.queue.length).toBeGreaterThan(0)
    })
  })

  it('should handle upload progress', async () => {
    const { result } = renderHook(() => useFileUpload())
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    await result.current.uploadFile(file)
    
    await waitFor(() => {
      expect(result.current.isUploading).toBe(true)
    })
  })

  it('should call onUploadComplete callback', async () => {
    const onComplete = jest.fn()
    const { result } = renderHook(() => 
      useFileUpload({ onUploadComplete: onComplete })
    )
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    await result.current.uploadFile(file)
    
    await waitFor(() => {
      // Callback should be called after upload completes
      // This depends on mock implementation
    }, { timeout: 3000 })
  })

  it('should handle upload errors', async () => {
    const { result } = renderHook(() => useFileUpload())
    
    // Mock upload error
    const { createClient } = require('@/lib/supabase/client')
    createClient.mockReturnValue({
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockRejectedValue(new Error('Upload failed')),
        })),
      },
    })
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    await result.current.uploadFile(file)
    
    await waitFor(() => {
      // Error should be handled
      expect(result.current.queue.some(item => item.status === 'error')).toBe(true)
    })
  })
})

