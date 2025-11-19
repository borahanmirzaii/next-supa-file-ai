import mammoth from 'mammoth'

export async function extractDocx(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

