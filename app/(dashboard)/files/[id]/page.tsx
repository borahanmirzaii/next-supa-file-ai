import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StreamingAnalysis } from '@/components/analysis/StreamingAnalysis'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

export default async function FileAnalysisPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: file } = await supabase
    .from('files')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!file) {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <Link href="/files">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Files
        </Button>
      </Link>

      <StreamingAnalysis fileId={file.id} fileName={file.name} />
    </div>
  )
}

