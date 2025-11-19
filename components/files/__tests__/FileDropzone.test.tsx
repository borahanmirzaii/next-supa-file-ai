import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileDropzone } from '../FileDropzone'

describe('FileDropzone', () => {
  const mockOnFilesAccepted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dropzone', () => {
    render(<FileDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument()
  })

  it('should accept file selection', async () => {
    render(<FileDropzone onFilesAccepted={mockOnFilesAccepted} />)
    
    const fileInput = screen.getByLabelText(/file input/i).or(
      document.querySelector('input[type="file"]')
    ) as HTMLInputElement
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockOnFilesAccepted).toHaveBeenCalled()
    })
  })

  it('should reject files exceeding size limit', async () => {
    render(
      <FileDropzone 
        onFilesAccepted={mockOnFilesAccepted}
        maxSize={1000} // 1KB
      />
    )
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const largeFile = new File(['x'.repeat(2000)], 'large.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } })
    
    await waitFor(() => {
      // Should show error or not call callback
      expect(mockOnFilesAccepted).not.toHaveBeenCalled()
    })
  })

  it('should reject invalid file types', async () => {
    render(
      <FileDropzone 
        onFilesAccepted={mockOnFilesAccepted}
        acceptedFileTypes={['text/plain']}
      />
    )
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' })
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })
    
    await waitFor(() => {
      expect(mockOnFilesAccepted).not.toHaveBeenCalled()
    })
  })

  it('should handle multiple files', async () => {
    render(<FileDropzone onFilesAccepted={mockOnFilesAccepted} maxFiles={5} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(['test1'], 'test1.txt', { type: 'text/plain' }),
      new File(['test2'], 'test2.txt', { type: 'text/plain' }),
    ]
    
    fireEvent.change(fileInput, { target: { files } })
    
    await waitFor(() => {
      expect(mockOnFilesAccepted).toHaveBeenCalledWith(
        expect.arrayContaining(files)
      )
    })
  })
})

