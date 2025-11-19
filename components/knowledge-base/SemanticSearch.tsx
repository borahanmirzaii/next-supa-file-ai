'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Loader2, 
  FileText, 
  Sparkles,
  Filter,
  X 
} from 'lucide-react'
import type { KBSearchResult } from '@/services/kb-service'

interface SemanticSearchProps {
  files: Array<{ id: string; name: string }>
  onSearch: (query: string, fileIds?: string[]) => Promise<KBSearchResult[]>
  onResultClick?: (result: KBSearchResult) => void
}

export function SemanticSearch({ files, onSearch, onResultClick }: SemanticSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KBSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await onSearch(
        query,
        selectedFiles.length > 0 ? selectedFiles : undefined
      )
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFileFilter = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const clearFilters = () => {
    setSelectedFiles([])
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your files..."
              className="pl-10"
              disabled={isSearching}
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* File Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Filter by files:</p>
              {selectedFiles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <Badge
                  key={file.id}
                  variant={selectedFiles.includes(file.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFileFilter(file.id)}
                >
                  {file.name}
                  {selectedFiles.includes(file.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Search Results ({results.length})
            </h3>
            <Badge variant="outline">
              Semantic Search
            </Badge>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onResultClick?.(result)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium truncate">
                          {result.fileName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(result.similarity * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.content}
                      </p>
                      {result.metadata && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Chunk {result.chunkIndex + 1} of {result.metadata.totalChunks}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Empty State */}
      {!isSearching && query && results.length === 0 && (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try different keywords or adjust your filters
          </p>
        </Card>
      )}
    </div>
  )
}

