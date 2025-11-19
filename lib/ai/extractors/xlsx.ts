import * as XLSX from 'xlsx'

export async function extractXlsx(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const text = workbook.SheetNames.map((name: string) => {
    const sheet = workbook.Sheets[name]
    return XLSX.utils.sheet_to_txt(sheet)
  }).join('\n\n')
  return text
}

