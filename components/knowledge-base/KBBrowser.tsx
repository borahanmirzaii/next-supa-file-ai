'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  MessageSquare, 
  Search,
  FileText,
  TrendingUp 
} from 'lucide-react'
import { SemanticSearch } from './SemanticSearch'
import { RAGChat } from './RAGChat'
import type { KBSearchResult } from '@/services/kb-service'

interface KBBrowserProps {
  files: Array<{
    id: string
    name: string
    mime_type: string
    created_at: string
    status: string
  }>
  stats: {
    totalFiles: number
    totalChunks: number
  }
  onSearch: (query: string, fileIds?: string[]) => Promise<KBSearchResult[]>
}

export function KBBrowser({ files, stats, onSearch }: KBBrowserProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState('chat')

  const handleResultClick = (result: KBSearchResult) => {
    console.log('Result clicked:', result)
    // Could open file detail view or jump to specific chunk
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalFiles}</p>
              <p className="text-sm text-muted-foreground">Files Indexed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalChunks}</p>
              <p className="text-sm text-muted-foreground">Knowledge Chunks</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalFiles > 0 ? Math.round(stats.totalChunks / stats.totalFiles) : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Chunks/File</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            Semantic Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <RAGChat
            fileIds={selectedFiles.length > 0 ? selectedFiles : undefined}
            placeholder="Ask anything about your files..."
          />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <SemanticSearch
            files={files}
            onSearch={onSearch}
            onResultClick={handleResultClick}
          />
        </TabsContent>
      </Tabs>

      {/* File Selection */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Filter by Files</h3>
            {selectedFiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
              >
                Clear Selection
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <Badge
                key={file.id}
                variant={selectedFiles.includes(file.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedFiles(prev =>
                    prev.includes(file.id)
                      ? prev.filter(id => id !== file.id)
                      : [...prev, file.id]
                  )
                }}
              >
                {file.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

