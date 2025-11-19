export async function extractText(blob: Blob): Promise<string> {
  return await blob.text()
}

