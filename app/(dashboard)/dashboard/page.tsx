import { Card } from '@/components/ui/card'
import { File, Database, Settings } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your AI-powered file platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/files">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <File className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Files</h3>
            <p className="text-sm text-muted-foreground">
              Upload and manage your files
            </p>
          </Card>
        </Link>

        <Link href="/knowledge-base">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <Database className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">
              Search and explore your documents
            </p>
          </Card>
        </Link>

        <Link href="/integrations">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <Settings className="h-8 w-8 mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Connect external platforms
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
